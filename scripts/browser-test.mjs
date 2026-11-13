import fs from "node:fs/promises";
import path from "node:path";

const CDP_URL = process.env.CDP_URL ?? "http://127.0.0.1:9222";
const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:5173/";
const outputDir = path.resolve("test-output");
await fs.mkdir(outputDir, { recursive: true });

const targets = await (await fetch(`${CDP_URL}/json/list`)).json();
const pageTarget = targets.find((target) => target.type === "page" && target.url.includes("5173"));
if (!pageTarget) throw new Error("没有找到应用页面");

let commandId = 0;
const pending = new Map();
const consoleErrors = [];
const runtimeErrors = [];
let socket;

function attachSocket(nextSocket) {
  nextSocket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const task = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) task.reject(new Error(JSON.stringify(message.error)));
      else task.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(
        message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "),
      );
    }
    if (message.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(message.params.exceptionDetails.text);
    }
  });
}

async function connectToAppPage() {
  const currentTargets = await (await fetch(`${CDP_URL}/json/list`)).json();
  const currentPage = currentTargets.find(
    (target) => target.type === "page" && target.url.includes("5173"),
  );
  if (!currentPage) throw new Error("找不到应用页面用于重新连接");
  if (socket) socket.close();
  pending.clear();
  socket = new WebSocket(currentPage.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  attachSocket(socket);
  await send("Runtime.enable");
  await send("Page.enable");
  await send("DOM.enable");
}

await connectToAppPage();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitFor(expression, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  const diagnostics = await evaluate(`JSON.stringify({
    body: document.body.innerText.slice(0, 1000),
    html: document.body.innerHTML.slice(0, 500),
    indexedDB: typeof indexedDB,
    visibility: document.visibilityState
  })`);
  throw new Error(
    `等待超时: ${expression}\n${diagnostics}\n控制台错误: ${consoleErrors.join(" | ")}\n运行错误: ${runtimeErrors.join(" | ")}`,
  );
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await fs.writeFile(path.join(outputDir, name), Buffer.from(result.data, "base64"));
}

async function clickByText(text, selector = "button") {
  const clicked = await evaluate(`(() => {
    const node = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((item) => item.textContent?.trim().includes(${JSON.stringify(text)}));
    if (!node) return false;
    node.scrollIntoView({block: "center"});
    node.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`找不到按钮: ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 260));
}

async function setNativeValue(selector, value, index = 0) {
  const changed = await evaluate(`(() => {
    const element = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
    if (!element) return false;
    const proto = element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event("input", {bubbles: true}));
    element.dispatchEvent(new Event("change", {bubbles: true}));
    return true;
  })()`);
  if (!changed) throw new Error(`找不到输入框: ${selector}[${index}]`);
}

async function mouse(type, x, y, extra = {}) {
  await send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    clickCount: 1,
    ...extra,
  });
}

async function drag(x1, y1, x2, y2) {
  await mouse("mouseMoved", x1, y1, { button: "none" });
  await mouse("mousePressed", x1, y1, { buttons: 1 });
  for (let step = 1; step <= 8; step += 1) {
    await mouse(
      "mouseMoved",
      x1 + ((x2 - x1) * step) / 8,
      y1 + ((y2 - y1) * step) / 8,
      { buttons: 1 },
    );
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  await mouse("mouseReleased", x2, y2, { buttons: 0 });
  await new Promise((resolve) => setTimeout(resolve, 220));
}

await send("Runtime.enable");
await send("Page.enable");
await send("DOM.enable");
await send("Browser.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: outputDir,
  eventsEnabled: true,
});

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: APP_URL });
await waitFor(`document.body.innerText.includes("打开手帖")`, 15000);
await screenshot("01-cover.png");

await clickByText("打开手帖");
await waitFor(`document.body.innerText.includes("回忆日历")`);
await screenshot("02-reader.png");

await clickByText("新建日记");
await waitFor(`document.body.innerText.includes("正在编辑")`);
await screenshot("03-editor-empty.png");

await clickByText("照片拼贴", ".template-grid button");
await new Promise((resolve) => setTimeout(resolve, 350));

const documentResult = await send("DOM.getDocument", { depth: -1, pierce: true });
const fileInput = await send("DOM.querySelector", {
  nodeId: documentResult.root.nodeId,
  selector: 'input[type="file"]',
});
const fixtureDirectory = path.resolve("test-fixtures");
await fs.mkdir(fixtureDirectory, { recursive: true });
const photoOne = path.join(fixtureDirectory, "lake.svg");
const photoTwo = path.join(fixtureDirectory, "tea.svg");
await send("DOM.setFileInputFiles", {
  nodeId: fileInput.nodeId,
  files: [photoOne, photoTwo],
});
await waitFor(`document.body.innerText.includes("2 张照片已经放进手帖")`, 10000);

await clickByText("页面与主题", ".properties-tabs button");
await setNativeValue(".stacked-field input", "验收中的小日子");
await setNativeValue(".stacked-field textarea", "风吹过窗边，今天也有小小的好事发生。");
const templateCount = await evaluate(`document.querySelectorAll('.template-grid button').length`);
await evaluate(`document.querySelector('.template-grid')?.scrollIntoView({block: "center"})`);
await new Promise((resolve) => setTimeout(resolve, 220));
await screenshot("17-template-gallery.png");

await clickByText("贴纸", ".kind-filter-grid button");
const stickerLibraryCount = await evaluate(`document.querySelectorAll('.asset-card').length`);
await screenshot("15-sticker-library-all.png");
await evaluate(`(() => {
  const select = document.querySelector('.theme-filter-row select');
  if (!select) return false;
  select.value = "food";
  select.dispatchEvent(new Event("change", {bubbles: true}));
  return true;
})()`);
await new Promise((resolve) => setTimeout(resolve, 220));
await screenshot("16-sticker-food-pack.png");
await evaluate(`(() => {
  const select = document.querySelector('.theme-filter-row select');
  if (!select) return false;
  select.value = "all";
  select.dispatchEvent(new Event("change", {bubbles: true}));
  return true;
})()`);
await new Promise((resolve) => setTimeout(resolve, 220));
await clickByText("蕨叶轻语", ".asset-add-button");
await clickByText("胶带", ".kind-filter-grid button");
await clickByText("薄荷格纹", ".asset-add-button");

const stageRect = await evaluate(`(() => {
  const rect = document.querySelector('.diary-stage-shell canvas').getBoundingClientRect();
  return {left: rect.left, top: rect.top, width: rect.width, height: rect.height};
})()`);
const scale = stageRect.width / 720;
const stickerX = stageRect.left + (274 + 63) * scale;
const stickerY = stageRect.top + (236 + 63) * scale;
await drag(stickerX, stickerY, stickerX + 48, stickerY + 32);

await setNativeValue(".number-grid label:nth-child(5) input", "12");
await setNativeValue(".number-grid label:nth-child(3) input", "156");
await clickByText("页面与主题", ".properties-tabs button");
await clickByText("晴天", ".tag-option-grid button");
await clickByText("页面与主题", ".properties-tabs button");
await clickByText("开心", ".tag-option-grid button");
await clickByText("页面与主题", ".properties-tabs button");
await clickByText("瓦尔登湖", ".theme-grid button");
await waitFor(`document.querySelector('.save-status')?.textContent.includes("已自动保存")`, 10000);
await screenshot("04-editor-collage.png");

const savedBeforeReload = await evaluate(`(async () => {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open("little-moments-journal");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("diaries", "readonly");
      const getAll = tx.objectStore("diaries").getAll();
      getAll.onerror = () => reject(getAll.error);
      getAll.onsuccess = () => {
        const entry = getAll.result.find((item) => item.title === "验收中的小日子");
        resolve(entry ? {
          title: entry.title,
          body: entry.body,
          photos: entry.elements.filter((element) => element.type === "photo" && element.src).length,
          elements: entry.elements.length,
          themeId: entry.themeId,
          weather: entry.weather,
          mood: entry.mood
        } : null);
      };
    };
  });
})()`);

await send("Page.reload", { ignoreCache: true });
await waitFor(`document.body.innerText.includes("打开手帖")`, 15000);
await clickByText("打开手帖");
await waitFor(`document.body.innerText.includes("回忆日历")`);
await screenshot("05-reader-after-reload.png");

await clickByText("回忆日历");
await waitFor(`document.body.innerText.includes("把时间铺成一张纸")`);
await screenshot("06-calendar.png");
await evaluate(`(() => {
  const day = document.querySelector('.calendar-day.is-today.has-entry');
  if (!day) return false;
  day.click(); return true;
})()`);
await waitFor(`document.body.innerText.includes("验收中的小日子")`, 8000);
await screenshot("07-calendar-day.png");
await evaluate(`(() => {
  const button = document.querySelector(".edit-day-entry");
  if (!button) return false;
  button.click();
  return true;
})()`);
await waitFor(`document.body.innerText.includes("正在编辑")`);

await clickByText("完成日记");
await waitFor(`document.body.innerText.includes("今日份的小美好")`, 10000);
await screenshot("08-completion.png");
await waitFor(`document.body.innerText.includes("回忆日历") && !document.querySelector('.completion-overlay')`, 10000);
await screenshot("09-reader-finished.png");

await evaluate(`(() => {
  const page = document.querySelector('.reader-page-left');
  page?.querySelector('.reader-page-actions button')?.click();
})()`);
await waitFor(`document.body.innerText.includes("正在编辑")`);
await clickByText("导出图片");
await new Promise((resolve) => setTimeout(resolve, 1400));

await connectToAppPage();
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Page.reload", { ignoreCache: true });
await waitFor(`document.body.innerText.includes("打开手帖")`, 15000);
await new Promise((resolve) => setTimeout(resolve, 1200));
await screenshot("10-mobile-cover.png");
await clickByText("打开手帖");
await waitFor(`Boolean(document.querySelector('.reader-page-shell'))`);
await new Promise((resolve) => setTimeout(resolve, 700));
await screenshot("11-mobile-reader.png");
await clickByText("新建日记");
await waitFor(`Boolean(document.querySelector('.editor-page'))`);
await screenshot("12-mobile-editor.png");

const downloaded = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png"));
const report = {
  passed: true,
  savedBeforeReload,
  stickerLibraryCount,
  templateCount,
  photoUploadCount: 2,
  autoSaveVerified: true,
  completionVerified: true,
  calendarReopenVerified: true,
  exportFiles: downloaded,
  consoleErrors,
  runtimeErrors,
  screenshots: [
    "01-cover.png",
    "02-reader.png",
    "03-editor-empty.png",
    "04-editor-collage.png",
    "05-reader-after-reload.png",
    "06-calendar.png",
    "07-calendar-day.png",
    "08-completion.png",
    "09-reader-finished.png",
    "10-mobile-cover.png",
    "11-mobile-reader.png",
    "12-mobile-editor.png",
  ],
};
await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
socket.close();
