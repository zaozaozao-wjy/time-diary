(function () {
  "use strict";

  const iconPaths = {
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/>',
    pen: '<path d="m4 20 4.3-1 11-11a2.4 2.4 0 0 0-3.4-3.4l-11 11L4 20Z"/><path d="m14.5 6.2 3.3 3.3"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    sparkle: '<path d="M12 2c.8 5.2 2.8 7.2 8 8-5.2.8-7.2 2.8-8 8-.8-5.2-2.8-7.2-8-8 5.2-.8 7.2-2.8 8-8Z"/><path d="M19 16c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    sliders: '<path d="M4 7h7m4 0h5M4 17h2m4 0h10M11 4v6m-5 4v6"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M4 8h15m-5 4h5v4h-5a2 2 0 1 1 0-4Z"/>',
    shield: '<path d="M12 3 20 6v6c0 4.7-3.2 7.8-8 9-4.8-1.2-8-4.3-8-9V6l8-3Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/>',
    truck: '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9L6.4 20l1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="m4 20 3.8-.8L19 8a2.1 2.1 0 0 0-3-3L4.8 16.2 4 20Z"/><path d="m14.5 6.5 3 3"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8.2A7 7 0 0 1 18.7 7L20 12M4 12l1.3 5a7 7 0 0 0 12.6-1.2"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 19h16"/>',
    box: '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="m4 8 8 4 8-4v9l-8 4-8-4V8Z"/>',
    tag: '<path d="M4 5v6.5L12.5 20 20 12.5 11.5 4H5a1 1 0 0 0-1 1Z"/><circle cx="8" cy="8" r="1"/>',
    alert: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3v.2"/>',
    message: '<path d="M4 5h16v12H9l-5 4V5Z"/><path d="M8 9h8m-8 4h5"/>',
  };

  const icon = (name, className = "") =>
    `<span class="i ${className}" data-icon="${name}" aria-hidden="true"><svg viewBox="0 0 24 24">${iconPaths[name] || iconPaths.info}</svg></span>`;

  function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      const name = node.dataset.icon;
      node.setAttribute("aria-hidden", "true");
      if (!node.querySelector("svg") && iconPaths[name]) {
        node.innerHTML = `<svg viewBox="0 0 24 24">${iconPaths[name]}</svg>`;
      }
    });
  }

  const productVisuals = {
    "headphones-a": `
      <path d="M28 61V45c0-22 15-34 42-34s42 12 42 34v16"/>
      <rect x="18" y="54" width="21" height="35" rx="9" class="fill"/>
      <rect x="101" y="54" width="21" height="35" rx="9" class="fill"/>
      <path d="M35 65v15m70-15v15M112 72c9 0 14 5 14 12s-5 11-13 11"/>
      <path d="M49 49c9-9 23-13 40-13" class="accent"/>
    `,
    "headphones-b": `
      <path d="M25 65V47c0-20 17-32 45-32s45 12 45 32v18"/>
      <path d="M20 54c-9 2-13 10-10 20 2 9 10 15 19 15h5V55H20Z" class="fill"/>
      <path d="M120 54c9 2 13 10 10 20-2 9-10 15-19 15h-5V55h14Z" class="fill"/>
      <path d="M32 65c8 0 12 3 12 9s-4 10-12 10m96-19c-8 0-12 3-12 9s4 10 12 10" class="accent"/>
    `,
    earbuds: `
      <path d="M54 31c0-10 8-17 18-17s18 7 18 17c0 11-8 18-18 29-10-11-18-18-18-29Z" class="fill"/>
      <path d="M98 31c0-10 8-17 18-17s18 7 18 17c0 11-8 18-18 29-10-11-18-18-18-29Z" class="fill"/>
      <path d="M65 50c-1 26 3 44 14 51m53-51c1 26-3 44-14 51" class="accent"/>
      <path d="M53 61v26c0 10 8 17 18 17s18-7 18-17V65m20-4v26c0 10 8 17 18 17s18-7 18-17V65" class="fill"/>
    `,
    camera: `
      <rect x="20" y="32" width="120" height="78" rx="14" class="fill"/>
      <path d="m43 32 11-15h50l12 15"/>
      <circle cx="80" cy="71" r="29"/>
      <circle cx="80" cy="71" r="17" class="accent"/>
      <path d="M119 45h8M32 42h13"/>
    `,
    phone: `
      <rect x="48" y="13" width="64" height="114" rx="12" class="fill"/>
      <path d="M69 20h22m-31 0h4M59 109h42"/>
      <circle cx="80" cy="69" r="25"/>
      <circle cx="80" cy="69" r="13" class="accent"/>
    `,
    glasses: `
      <ellipse cx="80" cy="83" rx="57" ry="7" fill="rgba(91,70,54,.08)" stroke="none"/>
      <path d="M18 67c5-17 19-25 37-23l17 15c6 5 10 5 16 0l17-15c18-2 32 6 37 23l-5 27c-4 17-16 25-31 22-17-3-26-14-27-30-6-5-10-5-16 0-1 16-10 27-27 30-15 3-27-5-31-22l-5-27Z" class="fill"/>
      <path d="M28 65c7-10 16-13 27-10l11 12c5 6 9 7 14 0L91 55c11-3 20 0 27 10M17 55 4 45m142 10 13-10" class="accent"/>
      <path d="M31 69c5-7 12-9 20-7m37 0c8-2 15 0 20 7" stroke="rgba(255,255,255,.55)"/>
    `,
    shoe: `
      <path d="M21 92c15-4 31-14 41-33 5-10 17-10 22-1 7 13 16 21 34 26 17 4 24 10 25 20H22c-5-4-5-8-1-12Z" class="fill"/>
      <path d="M20 99h123M53 77l18 4m-10-17 20 6M77 59l13 12"/>
      <path d="M23 104h116" class="accent"/>
    `,
  };

  function productArt(product) {
    const art = productVisuals[product.art] || productVisuals["headphones-a"];
    return `<svg viewBox="0 0 160 140" aria-hidden="true"><style>.fill{fill:var(--product-bg, #e5eedc)}.accent{stroke:var(--sage-deep)}</style>${art}</svg>`;
  }

  const sampleProducts = [
    {
      id: "sample-sony-taobao",
      name: "Sony WH-1000XM5 无线降噪耳机",
      platform: "淘宝",
      price: 1899,
      finalPrice: 1849,
      version: "国行 · 标准版",
      condition: "全新未拆",
      shipping: "次日达",
      warranty: "官方 1 年",
      afterSales: "7 天无理由",
      rating: 4.9,
      reviewCount: "3200+",
      productBg: "#e2eadc",
      art: "headphones-a",
      source: "模拟识别 · 百亿补贴商品",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample-bose-jd",
      name: "Bose QuietComfort Ultra 头戴式耳机",
      platform: "京东",
      price: 2199,
      finalPrice: 2149,
      version: "国行 · 标准版",
      condition: "全新",
      shipping: "次日达",
      warranty: "官方 2 年",
      afterSales: "15 天无理由 · 自营",
      rating: 4.8,
      reviewCount: "1500+",
      productBg: "#f2dfd1",
      art: "headphones-b",
      source: "模拟识别 · 京东自营商品",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample-sony-idle",
      name: "Sony WH-1000XM5 · 个人闲置",
      platform: "闲鱼",
      price: 1499,
      finalPrice: 1539,
      version: "国行 · 无外盒",
      condition: "9 成新",
      shipping: "3–5 天 · 顺丰",
      warranty: "未知",
      afterSales: "个人卖家，不支持无理由",
      rating: 4.7,
      reviewCount: "86",
      productBg: "#f6e8bd",
      art: "headphones-a",
      source: "模拟识别 · 个人闲置商品",
      updatedAt: new Date().toISOString(),
    },
  ];

  const alternativeProducts = [
    {
      id: "alt-soundcore",
      name: "声阔 Space Q45 降噪耳机",
      platform: "京东",
      price: 799,
      finalPrice: 799,
      version: "国行 · 全新",
      condition: "全新",
      shipping: "次日达",
      warranty: "官方 18 个月",
      afterSales: "7 天无理由",
      rating: 4.7,
      reviewCount: "5000+",
      productBg: "#eadfd2",
      art: "headphones-b",
      source: "替代款示例 · 模拟数据",
    },
    {
      id: "alt-oppo",
      name: "OPPO Enco X3 真无线耳机",
      platform: "拼多多",
      price: 699,
      finalPrice: 679,
      version: "国行 · 标准版",
      condition: "全新",
      shipping: "2–3 天",
      warranty: "官方 1 年",
      afterSales: "7 天无理由",
      rating: 4.8,
      reviewCount: "800+",
      productBg: "#dce8dc",
      art: "earbuds",
      source: "替代款示例 · 模拟数据",
    },
  ];

  const preferencePresets = {
    saving: { price: 5, quality: 2, logistics: 2, afterSales: 2, budget: 2000, preset: "saving" },
    balanced: { price: 3, quality: 3, logistics: 3, afterSales: 3, budget: 2500, preset: "balanced" },
    secure: { price: 1, quality: 2, logistics: 3, afterSales: 5, budget: 2600, preset: "secure" },
  };

  const presetMeta = {
    saving: { label: "省钱优先", summary: "省钱型" },
    balanced: { label: "均衡考虑", summary: "均衡型" },
    secure: { label: "保障优先", summary: "保障型" },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "未知";
    return "¥" + Number(value).toLocaleString("zh-CN");
  }

  function formatDate(value, withTime = true) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "刚刚";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
  }

  function uid(prefix = "product") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function normalizeUnknown(value) {
    if (value === null || value === undefined) return "未知";
    const text = String(value).trim();
    return !text || /^(未知|不清楚|暂无|无)$/.test(text) ? "未知" : text;
  }

  function normalizeProduct(product) {
    return {
      id: product.id || uid(),
      name: String(product.name || "未命名商品").trim(),
      platform: product.platform || "手动录入",
      price: product.price === "" ? null : Number(product.price),
      finalPrice: product.finalPrice === "" || product.finalPrice == null ? null : Number(product.finalPrice),
      version: normalizeUnknown(product.version),
      condition: normalizeUnknown(product.condition),
      shipping: normalizeUnknown(product.shipping),
      warranty: normalizeUnknown(product.warranty),
      afterSales: normalizeUnknown(product.afterSales),
      rating: product.rating === "" || product.rating == null ? null : Number(product.rating),
      reviewCount: normalizeUnknown(product.reviewCount),
      productBg: product.productBg || paletteForPlatform(product.platform),
      art: product.art || artForProduct(product.name),
      source: product.source || "用户手动填写",
      updatedAt: new Date().toISOString(),
    };
  }

  function paletteForPlatform(platform) {
    return {
      淘宝: "#f4dfcf",
      京东: "#eadbd5",
      闲鱼: "#f6e8bd",
      拼多多: "#f1dbd1",
      手动录入: "#e2eadc",
    }[platform] || "#e2eadc";
  }

  function artForProduct(name = "") {
    if (/眼镜|太阳镜|墨镜|eyewear|sunglass|glasses/i.test(name)) return "glasses";
    if (/耳机|headphone|airpods/i.test(name)) return /真无线|耳塞/.test(name) ? "earbuds" : "headphones-a";
    if (/手机|phone|iphone/i.test(name)) return "phone";
    if (/相机|camera|镜头/i.test(name)) return "camera";
    if (/鞋|sneaker|boot/i.test(name)) return "shoe";
    return "headphones-a";
  }

  function detectPlatform(link = "") {
    if (/taobao|tmall|淘宝|天猫/i.test(link)) return "淘宝";
    if (/jd\.com|京东/i.test(link)) return "京东";
    if (/goofish|闲鱼/i.test(link)) return "闲鱼";
    if (/pinduoduo|yangkeduo|拼多多/i.test(link)) return "拼多多";
    return "手动录入";
  }

  function detectProductFromLink(link = "") {
    let readable = String(link);
    try {
      readable = decodeURIComponent(readable);
    } catch {
      // Keep the original URL when it contains malformed escape sequences.
    }
    const platform = detectPlatform(readable);
    const titleMatch = readable.match(/[?&](?:title|name|productName|q)=([^&#]+)/i);
    const urlTitle = titleMatch?.[1]?.replace(/\+/g, " ").trim() || "";
    const clue = `${readable} ${urlTitle}`;

    if (/眼镜|太阳镜|墨镜|目镜|eyewear|sunglass|glasses|ray-?ban|gentle\s*monster|oakley|暴龙|雷朋/i.test(clue)) {
      let glassesName = "待确认的眼镜商品";
      if (urlTitle && /镜|eyewear|sunglass|glasses/i.test(urlTitle)) glassesName = urlTitle;
      else if (/ray-?ban|雷朋/i.test(clue)) glassesName = "Ray-Ban 太阳眼镜";
      else if (/gentle\s*monster/i.test(clue)) glassesName = "Gentle Monster 太阳眼镜";
      else if (/oakley/i.test(clue)) glassesName = "Oakley 运动太阳镜";
      else if (/暴龙/i.test(clue)) glassesName = "暴龙太阳镜";
      return normalizeProduct({
        name: glassesName,
        platform,
        price: 1399,
        finalPrice: 1299,
        version: "国行 · 标准款",
        condition: "全新未拆",
        shipping: "次日达",
        warranty: "官方 1 年",
        afterSales: "7 天无理由",
        rating: 4.8,
        reviewCount: "模拟数据",
        productBg: "#ebe1d2",
        art: "glasses",
        source: "眼镜链接识别 · 模拟结果",
      });
    }
    if (/bose|qc-ultra/i.test(clue)) return normalizeProduct({ ...sampleProducts[1], id: uid(), platform });
    if (/idle|used|二手|闲置/i.test(clue)) return normalizeProduct({ ...sampleProducts[2], id: uid(), platform });
    if (/soundcore|space-q45|声阔/i.test(clue)) return normalizeProduct({ ...alternativeProducts[0], id: uid(), platform });
    if (/耳机|headphone|earbud|airpods/i.test(clue)) {
      return normalizeProduct({ ...sampleProducts[0], id: uid(), platform, source: `耳机链接识别 · 模拟结果` });
    }
    if (/iphone|手机/i.test(clue)) {
      return normalizeProduct({
        name: "Apple iPhone 16 128GB",
        platform,
        price: 5499,
        finalPrice: 5299,
        version: "国行 · 标准版",
        condition: "全新未激活",
        shipping: "次日达",
        warranty: "官方 1 年",
        afterSales: "7 天无理由",
        rating: 4.9,
        reviewCount: "1万+",
        productBg: "#e7e2d5",
        art: "phone",
        source: `模拟识别 · ${platform}商品链接`,
      });
    }
    if (urlTitle) {
      return normalizeProduct({
        name: urlTitle,
        platform,
        price: "",
        finalPrice: "",
        version: "",
        condition: "",
        shipping: "",
        warranty: "",
        afterSales: "",
        rating: "",
        reviewCount: "",
        productBg: paletteForPlatform(platform),
        art: artForProduct(urlTitle),
        source: "链接文字已读取 · 其余信息待确认",
      });
    }
    const unknown = normalizeProduct({
      name: "待确认商品",
      platform,
      source: "链接已收录 · 商品信息待填写",
    });
    unknown.name = "";
    return unknown;
  }

  function detectProductFromScreenshot(fileName = "") {
    const clueText = String(fileName).replace(/\.[^.]+$/, "");
    if (!/眼镜|太阳镜|墨镜|耳机|headphone|earbud|airpods|手机|iphone|bose|sony|soundcore|声阔|ray-?ban|gentle\s*monster|oakley|暴龙|雷朋/i.test(clueText)) {
      const unknown = blankProduct();
      unknown.source = "截图已上传 · 商品信息待确认";
      return unknown;
    }
    const detected = detectProductFromLink(
      `https://screenshot.local/?title=${encodeURIComponent(clueText)}`
    );
    if (detected.name) {
      return normalizeProduct({
        ...detected,
        id: uid(),
        source: "截图识别 · 模拟结果",
        updatedAt: new Date().toISOString(),
      });
    }
    const unknown = blankProduct();
    unknown.source = "截图已上传 · 商品信息待确认";
    return unknown;
  }

  function blankProduct() {
    return {
      id: uid(),
      name: "",
      platform: "手动录入",
      price: "",
      finalPrice: "",
      version: "",
      condition: "",
      shipping: "",
      warranty: "",
      afterSales: "",
      rating: "",
      reviewCount: "",
      productBg: "#e2eadc",
      art: "headphones-a",
      source: "用户手动填写",
      updatedAt: new Date().toISOString(),
    };
  }

  function minMaxValues(products, field) {
    const nums = products.map((p) => p[field]).filter((v) => typeof v === "number" && !Number.isNaN(v));
    if (!nums.length) return { min: null, max: null };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }

  function priceScore(value, products, budget) {
    const finalPrices = products.map((p) => p.finalPrice ?? p.price).filter((v) => typeof v === "number");
    if (!finalPrices.length || typeof value !== "number") return 42;
    const minPrice = Math.min(...finalPrices);
    const maxPrice = Math.max(...finalPrices);
    if (maxPrice === minPrice) return budget && value > budget ? 60 : 100;
    let score = 100 - ((value - minPrice) / (maxPrice - minPrice)) * 58;
    if (budget && value > budget) {
      const overshoot = Math.min(1, (value - budget) / budget);
      score -= 12 + overshoot * 35;
    }
    return clamp(score, 0, 100);
  }

  function shippingScore(value) {
    const text = normalizeUnknown(value);
    if (text === "未知") return 35;
    if (/当日|当天|半日|小时/.test(text)) return 100;
    if (/次日|隔日|1.?天/.test(text)) return 92;
    if (/2.?[–-]?3.?天|两.?三天/.test(text)) return 72;
    if (/3.?[–-]?5.?天|三.?五天/.test(text)) return 51;
    if (/5.?天|一周|7.?天/.test(text)) return 30;
    return 65;
  }

  function qualityScore(product) {
    const condition = normalizeUnknown(product.condition);
    let score = 55;
    if (/全新未拆|全新.*未/.test(condition)) score = 100;
    else if (/全新/.test(condition)) score = 94;
    else if (/准新|99新/.test(condition)) score = 84;
    else if (/95新/.test(condition)) score = 76;
    else if (/9成新/.test(condition)) score = 65;
    else if (/8成新/.test(condition)) score = 52;
    else if (condition === "未知") score = 42;
    if (typeof product.rating === "number") score = score * 0.68 + clamp(product.rating * 20, 0, 100) * 0.32;
    return score;
  }

  function afterSalesScore(product) {
    const warranty = normalizeUnknown(product.warranty);
    const policy = normalizeUnknown(product.afterSales);
    let score = 35;
    if (/官方.*2\s*年|两年|24\s*个/.test(warranty)) score = 100;
    else if (/官方.*18\s*个|1\.5\s*年/.test(warranty)) score = 90;
    else if (/官方.*1\s*年|一年|12\s*个/.test(warranty)) score = 78;
    else if (/店保|店铺/.test(warranty)) score = 57;
    else if (/剩|剩余/.test(warranty)) score = 45;
    else if (warranty === "未知") score = 22;
    if (/15\s*天.*(无理由|退)/.test(policy) || /自营/.test(policy)) score += 10;
    else if (/7\s*天.*(无理由|退)/.test(policy)) score += 7;
    else if (/不支持.*无理由|个人卖家/.test(policy)) score -= 15;
    return clamp(score, 0, 100);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function weightProfile(prefs, perspective) {
    if (perspective === "lowest") {
      return { price: 20, quality: 1, logistics: 0.5, afterSales: 0.5 };
    }
    if (perspective === "secure") {
      return { price: 0.25, quality: 2, logistics: 2, afterSales: 6 };
    }
    return {
      price: Number(prefs?.price ?? 3),
      quality: Number(prefs?.quality ?? 3),
      logistics: Number(prefs?.logistics ?? 3),
      afterSales: Number(prefs?.afterSales ?? 3),
    };
  }

  function scoreProduct(product, products, prefs, perspective = "comprehensive") {
    const weight = weightProfile(prefs, perspective);
    const finalPrice = product.finalPrice ?? product.price;
    const scores = {
      price: priceScore(finalPrice, products, Number(prefs?.budget || 0)),
      quality: qualityScore(product),
      logistics: shippingScore(product.shipping),
      afterSales: afterSalesScore(product),
    };
    const totalWeight = Object.values(weight).reduce((sum, n) => sum + n, 0);
    const score = Object.keys(weight).reduce((sum, key) => sum + scores[key] * weight[key], 0) / totalWeight;
    return { total: Math.round(score), breakdown: scores };
  }

  function rank(products, prefs, perspective = "comprehensive") {
    return products
      .map((product) => ({ ...scoreProduct(product, products, prefs, perspective), product }))
      .sort((a, b) => b.total - a.total);
  }

  function identifyLeaders(products) {
    const finalPrices = products.map((p) => ({ p, v: p.finalPrice ?? p.price })).filter((x) => typeof x.v === "number");
    const cheapest = finalPrices.sort((a, b) => a.v - b.v)[0]?.p;
    const rankedShipping = [...products].sort((a, b) => shippingScore(b.shipping) - shippingScore(a.shipping));
    const rankedQuality = [...products].sort((a, b) => qualityScore(b) - qualityScore(a));
    const rankedSupport = [...products].sort((a, b) => afterSalesScore(b) - afterSalesScore(a));
    return {
      cheapest,
      fastest: rankedShipping[0],
      bestCondition: rankedQuality[0],
      bestSupport: rankedSupport[0],
    };
  }

  function buildReasons(winner, products, prefs) {
    const leaders = identifyLeaders(products);
    const reasons = [];
    if (leaders.cheapest?.id === winner.id) {
      reasons.push(`最终到手价最低，为 ${formatPrice(winner.finalPrice ?? winner.price)}，在当前候选中少花 ${formatPrice(Math.max(...products.map((p) => p.finalPrice ?? p.price)) - (winner.finalPrice ?? winner.price))}。`);
    } else if (typeof (winner.finalPrice ?? winner.price) === "number" && prefs.budget) {
      const over = (winner.finalPrice ?? winner.price) - prefs.budget;
      reasons.push(over <= 0 ? "最终到手价在你的预算范围内。" : `最终到手价超出预算 ${formatPrice(over)}，需要你判断是否接受。`);
    }
    if (leaders.bestSupport?.id === winner.id) reasons.push("售后信息相对完整，保障条件在当前候选中更明确。");
    if (leaders.fastest?.id === winner.id) reasons.push(`物流信息明确，预计${winner.shipping}。`);
    if (leaders.bestCondition?.id === winner.id) reasons.push(`成色与评分综合表现更好，描述为“${winner.condition}”。`);
    if (reasons.length < 2) reasons.push(`在“${presetMeta[prefs.preset]?.label || "自定义偏好"}”的权重下，价格、品质、物流与售后的综合得分更高。`);
    return reasons.slice(0, 3);
  }

  function buildRisks(winner, products, prefs) {
    const risks = [];
    const finalPrice = winner.finalPrice ?? winner.price;
    const leaders = identifyLeaders(products);
    if (typeof finalPrice === "number" && prefs.budget && finalPrice > Number(prefs.budget)) {
      risks.push(`超出预算 ${formatPrice(finalPrice - Number(prefs.budget))}。`);
    }
    if (normalizeUnknown(winner.condition) !== "全新" && normalizeUnknown(winner.condition) !== "全新未拆") {
      risks.push(`商品成色为“${winner.condition}”，购买前应确认划痕、配件和功能状态。`);
    }
    if (leaders.cheapest?.id !== winner.id && leaders.cheapest) {
      risks.push(`并非最低价；${leaders.cheapest.platform} 的同类候选可省 ${formatPrice((winner.finalPrice ?? winner.price) - (leaders.cheapest.finalPrice ?? leaders.cheapest.price))}。`);
    }
    if (normalizeUnknown(winner.warranty) === "未知" || /个人卖家/.test(normalizeUnknown(winner.afterSales))) {
      risks.push("售后保障不够明确，需要向卖家确认保修与退换条件。");
    }
    if (!risks.length) risks.push("模拟商品信息可能滞后，下单前请核实价格、库存与售后政策。");
    return risks.slice(0, 3);
  }

  function buildUnknowns(winner) {
    const labels = { warranty: "保修", afterSales: "售后", shipping: "物流", condition: "成色", version: "版本" };
    const unknowns = Object.entries(labels)
      .filter(([key]) => normalizeUnknown(winner[key]) === "未知")
      .map(([, label]) => label);
    if (!unknowns.length) return ["关键商品字段已填写；平台页面信息仍需以购买时为准。"];
    return [`${unknowns.join("、")}信息为未知，没有被纳入充分判断。`, "可与卖家或平台客服确认后再下单。"];
  }

  function analyze(products, prefs, perspective = "comprehensive") {
    const safePrefs = { ...preferencePresets.balanced, ...(prefs || {}) };
    const leaderboard = rank(products, safePrefs, perspective);
    const winner = leaderboard[0]?.product;
    const margin = leaderboard.length > 1 ? leaderboard[0].total - leaderboard[1].total : 100;
    const hasTradeoff = leaderboard.length > 1 && margin <= 2;
    const leaders = identifyLeaders(products);
    return {
      perspective,
      winner,
      leaderboard,
      winnerScore: leaderboard[0]?.total ?? 0,
      secondScore: leaderboard[1]?.total ?? 0,
      margin,
      hasTradeoff,
      reasons: winner ? buildReasons(winner, products, safePrefs) : [],
      risks: winner ? buildRisks(winner, products, safePrefs) : [],
      unknowns: winner ? buildUnknowns(winner) : [],
      leaders,
      prefs: safePrefs,
      analyzedAt: new Date().toISOString(),
    };
  }

  function explainChange(oldAnalysis, newAnalysis, currentPrefs, previousPrefs) {
    if (!oldAnalysis || !newAnalysis?.winner) return "";
    const oldWinner = oldAnalysis.winner;
    const newWinner = newAnalysis.winner;
    const changed = Object.keys(preferencePresets.balanced)
      .filter((key) => key !== "preset" && Number(currentPrefs[key]) !== Number(previousPrefs?.[key]));
    const labels = { budget: "预算", price: "价格重视度", quality: "品质重视度", logistics: "物流重视度", afterSales: "售后重视度" };
    const changeText = changed.length
      ? changed.map((key) => `${labels[key]}${key === "budget" ? `调整为 ${formatPrice(currentPrefs[key])}` : `从 ${previousPrefs?.[key] ?? "未设置"} 调到 ${currentPrefs[key]}`}`).join("，")
      : "偏好权重被重新计算";
    if (oldWinner?.id !== newWinner?.id) {
      return `推荐发生变化：${changeText}后，${newWinner.name}的 ${newAnalysis.winnerScore} 分反超了 ${oldWinner.name}（${newAnalysis.secondScore} 分）。`;
    }
    return `推荐对象未变化：${changeText}后，${newWinner.name}仍以 ${newAnalysis.winnerScore} 分保持领先。`;
  }

  function perspectiveExplanation(analysis, perspective) {
    if (!analysis) return "";
    if (perspective === "lowest") {
      return `只看已确认的最终购买成本，${analysis.winner?.name} 的 ${formatPrice(analysis.winner?.finalPrice ?? analysis.winner?.price)} 最低。这里不把成色、保修和物流纳入价格排序。`;
    }
    if (perspective === "secure") {
      return `把售后与保修放在首位，同时参考成色和物流。${analysis.winner?.name} 的保障信息更完整，但价格不是主要排序依据。`;
    }
    return `按你设置的预算与四项重视程度综合计算。${analysis.hasTradeoff ? "前两名差距很小，商品各有优势，建议结合风险提醒判断。" : "当前首选与第二名的差异足以形成清晰倾向。"}`;
  }

  function summaryText(products, prefs, analysis, perspective = "comprehensive") {
    if (!analysis?.winner) return "PickWise · 尚未生成购买建议";
    const winner = analysis.winner;
    const rankItems = analysis.leaderboard.map((entry, index) => `${index + 1}. ${entry.product.name}（${entry.total}分）`).join("\n");
    return [
      "PickWise｜我的购物比较小结",
      `偏好：${presetMeta[prefs?.preset]?.label || "自定义"} · 预算 ${formatPrice(prefs?.budget)}`,
      `分析视角：${perspective === "lowest" ? "最低成本" : perspective === "secure" ? "保障优先" : "综合推荐"}`,
      "",
      `建议关注：${winner.name}`,
      `最终到手价：${formatPrice(winner.finalPrice ?? winner.price)} ｜ 平台：${winner.platform}`,
      `综合分：${analysis.winnerScore}/100`,
      "",
      "主要依据：",
      ...analysis.reasons.map((reason) => `· ${reason}`),
      "",
      "风险提醒：",
      ...analysis.risks.map((risk) => `· ${risk}`),
      "",
      "完整排序：",
      rankItems,
      "",
      `分析时间：${formatDate(analysis.analyzedAt)}`,
      "商品信息为 Demo 模拟数据，不代表实时全网价格；购买前请核实最新信息。",
    ].join("\n");
  }

  function inferNaturalPreference(text, current) {
    const next = { ...current };
    const notes = [];
    const currentBudget = next.budget;
    const wantsSaving = /省钱|便宜|划算|价格/.test(text);
    const wantsSecure = /保障|售后|保修|安心|放心/.test(text);
    const wantsLogistics = /快|物流|着急|今天|明天/.test(text);
    const wantsQuality = /品质|质量|成色|评分|音质/.test(text);
    const wantsBalanced = /均衡|都看看|综合/.test(text);

    if (wantsSaving && wantsSecure) {
      next.price = 5;
      next.afterSales = 5;
      next.preset = "custom";
      notes.push("同时提高价格与售后权重");
    } else if (wantsSecure) {
      Object.assign(next, preferencePresets.secure);
      notes.push("切换为保障优先");
    } else if (wantsSaving) {
      Object.assign(next, preferencePresets.saving);
      notes.push("切换为省钱优先");
    } else if (wantsBalanced) {
      Object.assign(next, preferencePresets.balanced);
      notes.push("切换为均衡考虑");
    }

    if (wantsLogistics && !wantsSecure && !wantsSaving && !wantsBalanced) {
      next.logistics = 5;
      next.preset = "custom";
      notes.push("更重视物流速度");
    }
    if (wantsQuality && !wantsSecure && !wantsSaving && !wantsBalanced) {
      next.quality = 5;
      next.preset = "custom";
      notes.push("提高品质权重");
    }
    next.budget = currentBudget;
    const money = text.match(/(?:预算|不超过|最多|低于|控制在)?\s*(\d{3,5})\s*(?:元|块)?/);
    if (money && /预算|不超过|最多|低于|控制/.test(text)) {
      next.budget = clamp(Number(money[1]), 200, 10000);
      notes.push(`预算设为 ${formatPrice(next.budget)}`);
    }
    if (!notes.length) notes.push("没有识别到明确偏好，请用“省钱”“售后优先”“预算 2000”等表达");
    return { prefs: next, notes };
  }

  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function restore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  window.PickWiseCore = {
    icons: iconPaths,
    icon,
    hydrateIcons,
    productArt,
    sampleProducts,
    alternativeProducts,
    preferencePresets,
    presetMeta,
    clone,
    formatPrice,
    formatDate,
    uid,
    normalizeUnknown,
    normalizeProduct,
    blankProduct,
    detectPlatform,
    paletteForPlatform,
    artForProduct,
    detectProductFromLink,
    detectProductFromScreenshot,
    scoreProduct,
    identifyLeaders,
    analyze,
    explainChange,
    perspectiveExplanation,
    summaryText,
    inferNaturalPreference,
    persist,
    restore,
  };
})();
