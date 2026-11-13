(function () {
  "use strict";

  const C = window.PickWiseCore;
  const KEYS = {
    products: "pickwise_products_v1",
    prefs: "pickwise_preferences_v1",
    history: "pickwise_history_v1",
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let hasStoredProducts = false;
  try {
    hasStoredProducts = localStorage.getItem(KEYS.products) !== null;
  } catch {
    hasStoredProducts = false;
  }
  const restoredProducts = hasStoredProducts
    ? C.restore(KEYS.products, [])
    : C.sampleProducts.map((product) => C.normalizeProduct(C.clone(product)));
  const state = {
    products: Array.isArray(restoredProducts) ? restoredProducts.map(C.normalizeProduct) : [],
    preferences: { ...C.preferencePresets.balanced, ...C.restore(KEYS.prefs, {}) },
    history: C.restore(KEYS.history, []),
    analysis: null,
    previousAnalysis: null,
    previousPrefs: null,
    changeExplanation: "",
    preferencePanelOpen: true,
    perspective: "comprehensive",
    currentComparisonId: null,
    currentPage: "home",
    comparisonView: "key",
    screenshotObjectUrl: null,
    lastSavedAt: null,
  };

  function persistProducts() {
    C.persist(KEYS.products, state.products);
  }

  function persistPrefs() {
    C.persist(KEYS.prefs, state.preferences);
  }

  function persistHistory() {
    C.persist(KEYS.history, state.history);
  }

  function showToast(message, type = "check") {
    const region = $("#toast-region");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `${C.icon(type)}<span>${escapeHtml(message)}</span>`;
    region.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "opacity 180ms ease, transform 180ms ease";
      window.setTimeout(() => toast.remove(), 200);
    }, 2600);
  }

  function platformBadge(product) {
    return `<span class="platform-badge platform-${escapeHtml(product.platform)}"><i class="platform-dot"></i>${escapeHtml(product.platform)}</span>`;
  }

  function unknownTag(value, fallback) {
    return C.normalizeUnknown(value) === "未知" ? `<span class="tag warning">${escapeHtml(fallback)}未知</span>` : `<span class="tag safe">${escapeHtml(fallback)}已知</span>`;
  }

  function renderHome() {
    const grid = $("#candidate-grid");
    const empty = $("#empty-shelf");
    const count = state.products.length;
    $("#candidate-count").textContent = `${count} / 5`;
    $("#clear-candidates").style.visibility = count ? "visible" : "hidden";
    const cta = $("#compare-cta");
    cta.classList.toggle("is-disabled", count < 1);
    cta.setAttribute("aria-disabled", count < 1 ? "true" : "false");
    cta.innerHTML = count < 2 ? `查看候选信息 ${C.icon("arrow")}` : `开始比较 ${C.icon("arrow")}`;

    if (!count) {
      grid.innerHTML = "";
      empty.style.display = "flex";
      return;
    }

    empty.style.display = "none";
    const cards = state.products
      .map(
        (product, index) => `
        <article class="product-card" style="--product-bg:${escapeHtml(product.productBg)}">
          <div class="product-card-visual">
            ${platformBadge(product)}
            <button class="card-menu" data-action="remove-product" data-id="${escapeHtml(product.id)}" aria-label="移除 ${escapeHtml(product.name)}">
              ${C.icon("trash")}
            </button>
            ${C.productArt(product)}
          </div>
          <div class="product-card-body">
            <h3>${escapeHtml(product.name)}</h3>
            <div class="price-row">
              <span class="price-currency">¥</span>
              <span class="price-main">${typeof (product.finalPrice ?? product.price) === "number" ? Number(product.finalPrice ?? product.price).toLocaleString("zh-CN") : "未知"}</span>
              <span class="price-label">最终到手</span>
            </div>
            <div class="product-tags">
              <span class="tag">${escapeHtml(product.condition)}</span>
              <span class="tag">${escapeHtml(product.shipping)}</span>
              ${unknownTag(product.warranty, "保修")}
            </div>
            <div class="card-footer">
              <span>候选 ${index + 1} · ${escapeHtml(product.source)}</span>
              <div>
                <button data-action="edit-product" data-id="${escapeHtml(product.id)}">修改</button>
              </div>
            </div>
          </div>
        </article>`
      )
      .join("");

    const addCard =
      count < 5
        ? `<button class="add-candidate-card" data-action="scroll-to-add">
            <span class="plus-circle">${C.icon("plus")}</span>
            <b>再加一件商品</b>
            <small>还可在清单中放入 ${5 - count} 件</small>
          </button>`
        : "";
    grid.innerHTML = cards + addCard;
    C.hydrateIcons(grid);
  }

  function titleForProducts(products) {
    const joined = products.map((p) => p.name).join(" ");
    if (/耳机|降噪/.test(joined)) return "降噪耳机 · 对比决策";
    if (/手机|iphone/i.test(joined)) return "手机 · 对比决策";
    if (/相机/.test(joined)) return "相机 · 对比决策";
    return "候选商品 · 对比决策";
  }

  function compareCell({ value, unknown = false, attention = false, best = false, extra = "" }) {
    const cls = ["comparison-value"];
    if (unknown) cls.push("unknown");
    if (attention) cls.push("attention");
    if (best) cls.push("best");
    return `<td><div class="${cls.join(" ")}"><span>${escapeHtml(value)}</span>${extra}</div></td>`;
  }

  function renderWorkspace() {
    const products = state.products;
    if (!products.length) return;
    const analysis = state.analysis;
    const title = titleForProducts(products);
    $("#workspace-title").textContent = products.length < 2 ? "1 件候选 · 对比工作台" : title;
    $("#workspace-analysis-time").textContent = analysis ? `分析于 ${C.formatDate(analysis.analyzedAt)}` : "尚未生成建议";
    $("#workspace-product-count").textContent = String(products.length);
    $("#share-top-button").disabled = !analysis;
    $("#share-top-button").style.opacity = analysis ? "1" : "0.55";

    const strip = $("#workspace-product-strip");
    strip.style.setProperty("--product-columns", Math.min(products.length, 3));
    strip.innerHTML = products
      .map(
        (product) => `
        <article class="compare-product-card ${analysis?.winner?.id === product.id ? "is-winner" : ""}" style="--product-bg:${escapeHtml(product.productBg)}">
          ${analysis?.winner?.id === product.id ? `<span class="winner-flag">${C.icon("sparkle")}当前建议</span>` : ""}
          <div class="compare-product-visual">${C.productArt(product)}</div>
          <div class="compare-product-body">
            ${platformBadge(product)}
            <h3>${escapeHtml(product.name)}</h3>
            <div class="price-row"><span class="price-currency">¥</span><span class="price-main">${typeof (product.finalPrice ?? product.price) === "number" ? Number(product.finalPrice ?? product.price).toLocaleString("zh-CN") : "未知"}</span><span class="price-label">到手</span></div>
            <p class="product-caveat">${escapeHtml(product.condition)} · ${escapeHtml(product.shipping)}</p>
          </div>
        </article>`
      )
      .join("");
    C.hydrateIcons(strip);

    const leaders = C.identifyLeaders(products);
    const finalPrices = products.map((p) => p.finalPrice ?? p.price).filter((v) => typeof v === "number");
    const minFinal = finalPrices.length ? Math.min(...finalPrices) : null;
    const maxFinal = finalPrices.length ? Math.max(...finalPrices) : null;
    const priceGap = maxFinal !== null && minFinal !== null ? maxFinal - minFinal : null;

    const rows = [
      {
        key: "finalPrice",
        label: "最终到手",
        icon: "wallet",
        values: products.map((p) => {
          const value = p.finalPrice ?? p.price;
          return compareCell({
            value: C.formatPrice(value),
            best: value === minFinal && priceGap > 0,
            extra: value === minFinal && priceGap > 0 ? `<span class="min-price-chip">最低</span>` : "",
          });
        }),
      },
      {
        key: "price",
        label: "商品标价",
        icon: "tag",
        values: products.map((p) => compareCell({ value: C.formatPrice(p.price), unknown: typeof p.price !== "number" })),
      },
      {
        key: "version",
        label: "版本",
        icon: "box",
        values: products.map((p) => compareCell({ value: p.version, unknown: C.normalizeUnknown(p.version) === "未知" })),
      },
      {
        key: "condition",
        label: "成色",
        icon: "star",
        values: products.map((p) =>
          compareCell({
            value: p.condition,
            attention: C.normalizeUnknown(p.condition) !== "未知" && !/全新/.test(p.condition),
            best: leaders.bestCondition?.id === p.id,
          })
        ),
      },
      {
        key: "shipping",
        label: "物流",
        icon: "truck",
        values: products.map((p) =>
          compareCell({
            value: p.shipping,
            unknown: C.normalizeUnknown(p.shipping) === "未知",
            best: leaders.fastest?.id === p.id,
          })
        ),
      },
      {
        key: "warranty",
        label: "保修",
        icon: "shield",
        values: products.map((p) =>
          compareCell({
            value: p.warranty,
            unknown: C.normalizeUnknown(p.warranty) === "未知",
            attention: C.normalizeUnknown(p.warranty) !== "未知" && !/官方/.test(p.warranty),
            best: leaders.bestSupport?.id === p.id,
          })
        ),
      },
      {
        key: "afterSales",
        label: "售后服务",
        icon: "message",
        values: products.map((p) =>
          compareCell({
            value: p.afterSales,
            unknown: C.normalizeUnknown(p.afterSales) === "未知",
            attention: /个人卖家|不支持/.test(C.normalizeUnknown(p.afterSales)),
          })
        ),
      },
      {
        key: "rating",
        label: "商品评分",
        icon: "sparkle",
        values: products.map((p) =>
          compareCell({ value: typeof p.rating === "number" ? `${p.rating.toFixed(1)} / 5` : "未知", unknown: typeof p.rating !== "number" })
        ),
      },
    ];

    const keyRows = new Set(["finalPrice", "version", "condition", "shipping", "warranty", "afterSales"]);
    const visibleRows = state.comparisonView === "key" ? rows.filter((row) => keyRows.has(row.key)) : rows;
    $$(".comparison-tab").forEach((tab) => {
      const active = tab.dataset.view === state.comparisonView;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    $("#comparison-table").innerHTML = visibleRows
      .map((row) => `<tr><th><span>${C.icon(row.icon)}${escapeHtml(row.label)}</span></th>${row.values.join("")}</tr>`)
      .join("");
    C.hydrateIcons($("#comparison-table"));

    const unknownCount = products.reduce(
      (sum, p) => sum + ["warranty", "afterSales", "shipping", "condition"].filter((key) => C.normalizeUnknown(p[key]) === "未知").length,
      0
    );
    const cheapest = leaders.cheapest;
    const bestSupport = leaders.bestSupport;
    const notes = products.length < 2 ? [
      {
        icon: "plus",
        title: "还差一件，才能比较",
        text: "当前信息已整理完成。再加入一件商品，就能看到价格、成色、物流与售后的逐项差异。",
      },
      {
        icon: "shield",
        title: unknownCount ? `${unknownCount} 项关键信息未知` : "关键信息较完整",
        text: unknownCount ? "未知项已经明确标出；后续比较不会把空白数据当成优势。" : "当前商品的保修、物流与售后信息均已确认。",
      },
      {
        icon: "box",
        title: "信息确认比推荐更重要",
        text: "只有一件商品时，PickWise 不生成跨商品推荐，也不会虚构“全网最低价”。",
      },
    ] : [
      {
        icon: "wallet",
        title: priceGap ? `到手价相差 ${C.formatPrice(priceGap)}` : "到手价接近",
        text: priceGap
          ? `最低为 ${cheapest?.name || "未识别"}（${cheapest?.platform || "未知平台"}），但价格更低不等于整体更适合。`
          : "已确认商品的最终成本接近，品质与售后更值得重点比较。",
      },
      {
        icon: "shield",
        title: unknownCount ? `${unknownCount} 项关键信息未知` : "关键信息较完整",
        text: unknownCount
          ? "未知项已明确标出，推荐不会把空白数据当成“好”或“坏”。"
          : "保修、物流与售后均有信息，但仍需以购买时平台页面为准。",
      },
      {
        icon: "box",
        title: "成色与售后互为代价",
        text: `${bestSupport?.name || "保障较完整商品"}的保障更明确；价格更低的候选通常在成色或退换条件上需要让步。`,
      },
    ];
    $("#difference-notes").innerHTML = notes
      .map(
        (note) => `<div class="difference-note"><span class="difference-note-icon">${C.icon(note.icon)}</span><b>${escapeHtml(note.title)}</b><p>${escapeHtml(note.text)}</p></div>`
      )
      .join("");
    C.hydrateIcons($("#difference-notes"));
    renderAI();
  }

  function singleProductAiHtml() {
    return `
      <div class="ai-heading">
        <div><div class="ai-label"><span>${C.icon("sparkle")}</span>PICKWISE AI · 等待比较</div><h2>再放一件，就能比较</h2></div>
        <button class="mobile-pref-close" data-action="close-mobile-prefs" aria-label="关闭">${C.icon("close")}</button>
      </div>
      <div class="preference-intro">商品信息已经收好。跨商品推荐至少需要 2 件商品，这样每条建议才能对应真实差异。</div>
      <div style="background:rgba(255,253,248,.62);border:1px dashed rgba(107,143,113,.32);border-radius:14px;padding:20px 16px;text-align:center">
        <span style="width:48px;height:48px;border-radius:50%;background:var(--paper);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;color:var(--sage-deep)">${C.icon("plus")}</span>
        <b style="font-family:var(--font-display);font-size:18px">${escapeHtml(state.products[0]?.name || "已添加 1 件商品")}</b>
        <p style="color:var(--ink-soft);font-size:10px;line-height:1.7;margin:7px 0 14px">当前只有这一件候选。继续添加第二件商品后，预算、偏好与 AI 推荐才会启用。</p>
        <button class="generate-button" data-action="add-from-workspace">添加第二件商品</button>
      </div>
      <div class="policy-note">${C.icon("info")}<span>一件商品不能形成比较，也不会生成唯一最优结论。</span></div>
    `;
  }

  function preferenceFormHtml() {
    const prefs = state.preferences;
    const presetCards = [
      { key: "saving", label: "省钱优先", caption: "先看到手价", icon: "wallet" },
      { key: "balanced", label: "均衡考虑", caption: "四项兼顾", icon: "sliders" },
      { key: "secure", label: "保障优先", caption: "售后更安心", icon: "shield" },
    ]
      .map(
        (item) => `
        <button class="preset-card ${prefs.preset === item.key ? "is-active" : ""}" data-action="set-preset" data-preset="${item.key}">
          <span class="preset-icon">${C.icon(item.icon)}</span>
          <b>${item.label}</b><small>${item.caption}</small>
        </button>`
      )
      .join("");
    const weights = [
      { key: "price", label: "价格", icon: "wallet" },
      { key: "quality", label: "品质", icon: "star" },
      { key: "logistics", label: "物流", icon: "truck" },
      { key: "afterSales", label: "售后", icon: "shield" },
    ]
      .map(
        (item) => `
        <div class="weight-item">
          <label for="weight-${item.key}">${C.icon(item.icon)}${item.label}</label>
          <input class="weight-slider" id="weight-${item.key}" type="range" min="1" max="5" step="1" value="${prefs[item.key]}" data-pref="${item.key}" aria-label="${item.label}重视程度" />
          <span class="weight-value js-weight-value" data-value-for="${item.key}">${weightLabel(prefs[item.key])}</span>
        </div>`
      )
      .join("");
    return `
      <div class="ai-heading">
        <div><div class="ai-label"><span>${C.icon("sparkle")}</span>PICKWISE AI · 偏好分析</div><h2>${state.analysis ? "调整你的取舍" : "你更在意什么？"}</h2></div>
        <button class="mobile-pref-close" data-action="close-mobile-prefs" aria-label="关闭偏好设置">${C.icon("close")}</button>
      </div>
      <div class="preference-intro">先告诉我你的预算与重视程度。PickWise 会把已知事实和你的偏好分开说明，不会替你编造信息。</div>
      <div class="pref-label"><b>选择一种偏好</b><small>之后仍可微调</small></div>
      <div class="preset-row">${presetCards}</div>
      <div class="pref-label"><b>预算范围</b><small>用于提示，不强制过滤</small></div>
      <div class="budget-card">
        <div class="budget-head">
          <span>${C.icon("wallet")}最多愿意花</span>
          <div class="budget-display">¥<input type="number" min="200" max="10000" step="50" value="${prefs.budget}" data-pref="budget" aria-label="预算" /></div>
        </div>
        <input class="budget-range" type="range" min="500" max="5000" step="50" value="${prefs.budget}" data-pref="budget-range" aria-label="预算范围快捷选择" />
      </div>
      <div class="pref-label"><b>四项重视程度</b><small>1 不重要 · 5 非常在意</small></div>
      <div class="weight-list">${weights}</div>
      <div class="natural-input">
        <input id="natural-preference" type="text" placeholder="也可以说：预算 2000，售后更重要" aria-label="用自然语言表达偏好" />
        <button data-action="apply-natural-pref">理解偏好</button>
      </div>
      <p class="natural-hint">试试“想省钱”“物流要快”“音质和成色更重要”。</p>
      <button class="generate-button" data-action="generate-analysis">
        ${state.analysis ? "更新购买建议" : "生成购买建议"}
        <span>基于已确认的 ${state.products.length} 件商品 · 可解释规则分析</span>
      </button>
      <div class="policy-note">${C.icon("info")}<span>无 API Key 时使用明确标注的模拟商品与规则推荐，不宣称实时全网搜索。</span></div>
    `;
  }

  function weightLabel(value) {
    if (Number(value) >= 5) return "很高";
    if (Number(value) === 4) return "较高";
    if (Number(value) === 3) return "适中";
    if (Number(value) === 2) return "较低";
    return "很低";
  }

  function resultHtml() {
    const analysis = state.analysis;
    if (!analysis?.winner) return "";
    const winner = analysis.winner;
    const isTradeoff = analysis.hasTradeoff;
    const reasonItems = isTradeoff
      ? [
          `${analysis.leaderboard[0].product.name} 与 ${analysis.leaderboard[1].product.name} 仅相差 ${analysis.margin} 分。`,
          ...analysis.reasons,
        ]
      : analysis.reasons;
    return `
      <div class="result-topline">
        <div class="ai-label"><span>${C.icon("sparkle")}</span>PICKWISE AI · 可解释建议</div>
        <span class="mock-badge">模拟规则分析</span>
      </div>
      <div class="result-hero">
        <div class="result-hero-main">
          <div class="result-product-mini" style="--product-bg:${escapeHtml(winner.productBg)}">${C.productArt(winner)}</div>
          <div>
            <div class="result-kicker">${isTradeoff ? "各有优势 · 建议再权衡" : "综合最优选择"}</div>
            <h3>${escapeHtml(winner.name)}</h3>
            <div class="result-price">${escapeHtml(winner.platform)} · 到手 <b>${C.formatPrice(winner.finalPrice ?? winner.price)}</b></div>
          </div>
          <div class="ai-score"><b>${analysis.winnerScore}</b><small>/ 100</small></div>
        </div>
        <div class="result-hero-note"><b>${isTradeoff ? "为什么不是唯一答案：" : "为什么是它："}</b> ${escapeHtml(isTradeoff ? "前两名差距很小，最终选择取决于你更愿意接受哪一项风险。" : analysis.reasons[0])}</div>
      </div>
      <div class="perspective-tabs" role="tablist" aria-label="分析视角">
        <button class="perspective-tab ${state.perspective === "comprehensive" ? "is-active" : ""}" data-action="set-perspective" data-perspective="comprehensive">综合推荐</button>
        <button class="perspective-tab ${state.perspective === "lowest" ? "is-active" : ""}" data-action="set-perspective" data-perspective="lowest">最低成本</button>
        <button class="perspective-tab ${state.perspective === "secure" ? "is-active" : ""}" data-action="set-perspective" data-perspective="secure">保障优先</button>
      </div>
      ${state.changeExplanation ? `<div class="change-note">${C.icon("refresh")}<span><b>偏好变化已重新分析。</b>${escapeHtml(state.changeExplanation)}</span></div>` : ""}
      <div class="result-insight">
        <div class="insight-title">${C.icon("check")}主要依据</div>
        <ul>${reasonItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="result-insight risk-box">
        <div class="insight-title">${C.icon("alert")}风险提醒</div>
        <ul>${analysis.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="result-insight unknown-box">
        <div class="insight-title">${C.icon("info")}仍待确认</div>
        <ul>${analysis.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <button class="text-button subtle" data-action="open-alternatives" style="font-size:9px;margin:2px auto 4px;display:flex">看看模拟替代款 →</button>
      <div class="result-actions">
        <button class="btn btn-secondary" data-action="save-comparison">${C.icon("download")}保存比较</button>
        <button class="btn btn-primary" data-action="open-share">${C.icon("share")}分享结果</button>
      </div>
      <p class="result-policy">依据当前商品信息与偏好规则生成 · ${C.formatDate(analysis.analyzedAt)}</p>
      <button class="generate-button" data-action="open-preference-panel" style="box-shadow:none;background:rgba(255,253,248,.75);color:var(--sage-deep);border:1px solid rgba(107,143,113,.22)">${C.icon("sliders")}调整偏好，实时重新分析</button>
    `;
  }

  function renderAI() {
    const panel = $("#ai-panel");
    if (!panel) return;
    if (!state.products.length) return;
    if (state.products.length < 2) {
      panel.innerHTML = singleProductAiHtml();
      $("#pref-summary-mini").textContent = "待比较";
      $("#mobile-preference-bar")?.classList.add("is-hidden");
      C.hydrateIcons(panel);
      return;
    }
    $("#mobile-preference-bar")?.classList.remove("is-hidden");
    if (state.preferencePanelOpen || !state.analysis) {
      panel.innerHTML = preferenceFormHtml();
    } else {
      panel.innerHTML = resultHtml();
    }
    $("#pref-summary-mini").textContent = C.presetMeta[state.preferences.preset]?.summary || "自定义";
    C.hydrateIcons(panel);
    if (state.preferencePanelOpen && state.analysis) {
      const intro = $(".preference-intro", panel);
      if (intro) intro.innerHTML += `<div id="auto-result-status" style="margin-top:6px;color:var(--sage-deep);font-size:9px">建议已自动更新：${escapeHtml(state.analysis.winner?.name || "")} · ${state.analysis.winnerScore} 分</div>`;
    }
  }

  function openModal(content, className = "") {
    const layer = $("#modal-layer");
    const modal = $("#modal");
    modal.className = `modal ${className}`.trim();
    modal.innerHTML = content;
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    C.hydrateIcons(modal);
    window.setTimeout(() => {
      const focusTarget = $("input:not([type=hidden]), select, textarea, button", modal);
      focusTarget?.focus({ preventScroll: true });
    }, 60);
  }

  function closeModal() {
    const layer = $("#modal-layer");
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    if (!$("#drawer-layer").classList.contains("is-open")) document.body.classList.remove("is-locked");
    if (state.screenshotObjectUrl) {
      URL.revokeObjectURL(state.screenshotObjectUrl);
      state.screenshotObjectUrl = null;
    }
  }

  function openDrawer(content) {
    const layer = $("#drawer-layer");
    $("#drawer").innerHTML = content;
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    C.hydrateIcons($("#drawer"));
  }

  function closeDrawer() {
    const layer = $("#drawer-layer");
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    if (!$("#modal-layer").classList.contains("is-open")) document.body.classList.remove("is-locked");
  }

  function modalHeader(kicker, title) {
    return `<div class="modal-header">
      <div class="modal-title-wrap"><span class="section-kicker">${escapeHtml(kicker)}</span><h2 id="modal-title">${escapeHtml(title)}</h2></div>
      <button class="modal-close" data-action="close-modal" aria-label="关闭">${C.icon("close")}</button>
    </div>`;
  }

  function productFormHtml(product, preview = {}) {
    const editing = state.products.some((p) => p.id === product.id);
    const previewContent = preview.screenshotUrl
      ? `<img class="screenshot-preview" src="${escapeHtml(preview.screenshotUrl)}" alt="上传截图预览" />`
      : `<span class="import-preview-icon">${C.icon(preview.icon || "pen")}</span>`;
    return `
      ${modalHeader(editing ? "CONFIRM INFORMATION" : preview.kicker || "CONFIRM INFORMATION", editing ? "修改商品信息" : preview.modalTitle || "确认识别结果")}
      <form id="product-form" data-id="${escapeHtml(product.id)}" data-editing="${editing ? "true" : "false"}">
        <div class="modal-body">
          <div class="import-preview">
            ${previewContent}
            <div><b>${escapeHtml(preview.title || (editing ? "核对并更新已知信息" : "请核对模拟识别的信息"))}</b><p>${escapeHtml(preview.description || "未知字段会明确显示为“未知”，不会自动推测。所有信息保存前都可修改。")}</p></div>
          </div>
          <div class="form-grid">
            <div class="form-field full">
              <label for="product-name">商品名称 <small>必填</small></label>
              <input id="product-name" name="name" required maxlength="80" value="${escapeHtml(product.name)}" placeholder="例如：Sony WH-1000XM5 降噪耳机" />
            </div>
            <div class="form-field">
              <label for="product-platform">平台</label>
              <select id="product-platform" name="platform">
                ${["淘宝", "京东", "拼多多", "闲鱼", "手动录入"].map((platform) => `<option ${product.platform === platform ? "selected" : ""}>${platform}</option>`).join("")}
              </select>
            </div>
            <div class="form-field">
              <label for="product-price">商品标价</label>
              <input id="product-price" name="price" type="number" min="0" step="0.01" value="${product.price ?? ""}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-finalPrice">最终到手价 <small>含运费/优惠</small></label>
              <input id="product-finalPrice" name="finalPrice" type="number" min="0" step="0.01" value="${product.finalPrice ?? ""}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-version">版本</label>
              <input id="product-version" name="version" value="${escapeHtml(C.normalizeUnknown(product.version) === "未知" ? "" : product.version)}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-condition">成色</label>
              <input id="product-condition" name="condition" value="${escapeHtml(C.normalizeUnknown(product.condition) === "未知" ? "" : product.condition)}" placeholder="未知" list="condition-list" />
              <datalist id="condition-list"><option value="全新未拆"><option value="全新"><option value="99新"><option value="95新"><option value="9成新"><option value="8成新"></datalist>
            </div>
            <div class="form-field">
              <label for="product-shipping">物流</label>
              <input id="product-shipping" name="shipping" value="${escapeHtml(C.normalizeUnknown(product.shipping) === "未知" ? "" : product.shipping)}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-warranty">保修</label>
              <input id="product-warranty" name="warranty" value="${escapeHtml(C.normalizeUnknown(product.warranty) === "未知" ? "" : product.warranty)}" placeholder="未知" />
            </div>
            <div class="form-field full">
              <label for="product-afterSales">售后服务</label>
              <input id="product-afterSales" name="afterSales" value="${escapeHtml(C.normalizeUnknown(product.afterSales) === "未知" ? "" : product.afterSales)}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-rating">商品评分 <small>0–5</small></label>
              <input id="product-rating" name="rating" type="number" min="0" max="5" step="0.1" value="${product.rating ?? ""}" placeholder="未知" />
            </div>
            <div class="form-field">
              <label for="product-reviewCount">评价数</label>
              <input id="product-reviewCount" name="reviewCount" value="${escapeHtml(C.normalizeUnknown(product.reviewCount) === "未知" ? "" : product.reviewCount)}" placeholder="未知" />
            </div>
          </div>
          <div class="form-note">${C.icon("info")}<span>留空的项目将保存为“未知”。标价与最终到手价会分开比较；请只填写你能够确认的信息。</span></div>
        </div>
        <div class="modal-footer">
          <span class="footer-hint">${state.products.length} / 5 件候选 · 可稍后继续添加</span>
          <button type="button" class="btn btn-secondary" data-action="close-modal">取消</button>
          <button type="submit" class="btn btn-primary">${editing ? "保存修改" : "确认并加入清单"} ${C.icon("check")}</button>
        </div>
      </form>`;
  }

  function openManualProduct(product = C.blankProduct(), preview = {}) {
    openModal(productFormHtml(product, preview), "modal-wide");
  }

  function openParsedProduct(link) {
    if (state.products.length >= 5) {
      showToast("候选清单最多放 5 件商品", "alert");
      return;
    }
    const product = C.detectProductFromLink(link);
    const hasProductName = Boolean(product.name);
    openModal(
      productFormHtml(product, {
        icon: "link",
        kicker: hasProductName ? "LINK IMPORT · SIMULATED" : "LINK IMPORT · NEEDS CONFIRMATION",
        modalTitle: hasProductName ? "确认识别结果" : "链接已收录",
        title: hasProductName ? `${product.platform}商品 · 模拟识别完成` : "未能从链接读取商品信息",
        description: hasProductName
          ? "Demo 未抓取真实平台页面。以下内容来自模拟候选数据，请逐项核对后再加入清单。"
          : "这个链接没有提供可读取的商品名称或类别。请手动填写，系统不会再默认填入耳机等无关商品。",
      }),
      "modal-wide"
    );
  }

  function handleScreenshot(file) {
    if (!file) return;
    if (state.products.length >= 5) {
      showToast("候选清单最多放 5 件商品", "alert");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("请选择图片文件", "alert");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("截图请小于 8MB", "alert");
      return;
    }
    if (state.screenshotObjectUrl) URL.revokeObjectURL(state.screenshotObjectUrl);
    state.screenshotObjectUrl = URL.createObjectURL(file);
    const product = C.detectProductFromScreenshot(file.name);
    const identified = Boolean(product.name);
    openModal(
      productFormHtml(product, {
        screenshotUrl: state.screenshotObjectUrl,
        kicker: identified ? "SCREENSHOT IMPORT · SIMULATED" : "SCREENSHOT IMPORT · NEEDS CONFIRMATION",
        modalTitle: identified ? "确认识别结果" : "截图已上传",
        title: identified ? "截图识别完成" : "需要你补充商品信息",
        description: identified
          ? "图片已在本地读取。当前 Demo 展示模拟识别结果，请在保存前逐项核对。"
          : "图片已在本地读取，但暂时无法判断商品信息。请补充名称、价格和已知条件，系统不会自动填入无关商品。",
      }),
      "modal-wide"
    );
  }

  function saveProductForm(form) {
    const formData = new FormData(form);
    const id = form.dataset.id || C.uid();
    const existing = state.products.find((p) => p.id === id);
    const draft = Object.fromEntries(formData.entries());
    if (!String(draft.name || "").trim()) {
      $("#product-name")?.focus();
      showToast("请填写商品名称", "alert");
      return;
    }
    const normalized = C.normalizeProduct({
      ...(existing || {}),
      ...draft,
      id,
      productBg: existing?.productBg || C.paletteForPlatform?.(draft.platform) || "#e2eadc",
      art: existing?.art || C.artForProduct?.(draft.name) || "headphones-a",
      source: existing?.source || (form.dataset.editing === "true" ? "用户修改并确认" : "用户确认的模拟识别结果"),
      updatedAt: new Date().toISOString(),
    });

    if (existing) {
      state.products = state.products.map((product) => (product.id === id ? normalized : product));
      state.analysis = null;
      state.changeExplanation = "";
      showToast("商品信息已更新");
    } else {
      if (state.products.length >= 5) {
        showToast("候选清单最多放 5 件商品", "alert");
        return;
      }
      normalized.source = state.products.length ? "用户确认的模拟识别结果" : normalized.source;
      state.products.push(normalized);
      showToast("已加入候选清单");
    }
    persistProducts();
    closeModal();
    renderHome();
    if (state.currentPage === "workspace") renderWorkspace();
  }

  function removeProduct(id) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
    openModal(
      `${modalHeader("SHORTLIST", "移出候选清单")}
      <div class="modal-body">
        <div class="confirm-icon">${C.icon("trash")}</div>
        <div class="confirm-copy"><p>要移除“${escapeHtml(product.name)}”吗？这不会删除浏览器中已保存的历史比较记录。</p></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="close-modal">先留着</button>
        <button class="btn btn-danger-ghost" data-action="confirm-remove-product" data-id="${escapeHtml(id)}">${C.icon("trash")}确认移除</button>
      </div>`,
      "modal-narrow"
    );
  }

  function confirmRemoveProduct(id) {
    state.products = state.products.filter((product) => product.id !== id);
    state.analysis = null;
    state.changeExplanation = "";
    state.currentComparisonId = null;
    persistProducts();
    closeModal();
    renderHome();
    if (!state.products.length || state.currentPage === "workspace") renderWorkspace();
    showToast("已从候选清单移除");
  }

  function confirmClearCandidates() {
    if (!state.products.length) return;
    openModal(
      `${modalHeader("SHORTLIST", "清空候选清单")}
      <div class="modal-body">
        <div class="confirm-icon">${C.icon("trash")}</div>
        <div class="confirm-copy"><p>这会清空当前 ${state.products.length} 件候选商品与本轮未保存的分析结果，历史比较记录不会受影响。</p></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="close-modal">取消</button>
        <button class="btn btn-danger-ghost" data-action="confirm-clear-candidates">确认清空</button>
      </div>`,
      "modal-narrow"
    );
  }

  function loadDemo() {
    state.products = C.sampleProducts.map((product) => C.normalizeProduct(C.clone(product)));
    state.analysis = null;
    state.previousAnalysis = null;
    state.preferencePanelOpen = true;
    state.currentComparisonId = null;
    state.changeExplanation = "";
    persistProducts();
    renderHome();
    showToast("已载入 3 件模拟商品");
    $("#candidate-grid")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function goHome(scrollTop = true) {
    state.currentPage = "home";
    $("#home-page").classList.add("is-active");
    $("#workspace-page").classList.remove("is-active");
    $$(".nav-link").forEach((link) => link.classList.toggle("is-active", link.dataset.action === "go-home"));
    renderHome();
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.hash === "#compare") history.replaceState(null, "", location.pathname + location.search);
  }

  function goCompare() {
    if (!state.products.length) {
      showToast("先添加一件商品，再打开对比工作台", "alert");
      $("#candidate-grid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    state.currentPage = "workspace";
    $("#home-page").classList.remove("is-active");
    $("#workspace-page").classList.add("is-active");
    $$(".nav-link").forEach((link) => link.classList.remove("is-active"));
    renderWorkspace();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setPreset(presetKey) {
    if (!C.preferencePresets[presetKey]) return;
    state.previousPrefs = { ...state.preferences };
    state.preferences = { ...C.preferencePresets[presetKey] };
    state.perspective = "comprehensive";
    persistPrefs();
    reanalyzeIfNeeded();
    renderAI();
  }

  function reanalyzeIfNeeded({ explain = true } = {}) {
    if (!state.analysis || state.products.length < 2) return;
    state.previousAnalysis = C.clone(state.analysis);
    const priorPrefs = state.previousPrefs || { ...state.preferences };
    const next = C.analyze(state.products, state.preferences, state.perspective);
    state.changeExplanation = explain ? C.explainChange(state.previousAnalysis, next, state.preferences, priorPrefs) : "";
    state.analysis = next;
  }

  function handlePreferenceInput(target) {
    const key = target.dataset.pref;
    if (!key) return;
    state.previousPrefs = { ...state.preferences };
    if (key === "budget-range") {
      state.preferences.budget = Number(target.value);
    } else if (key === "budget") {
      const value = Number(target.value);
      state.preferences.budget = Number.isFinite(value) ? C.clamp(value, 200, 10000) : 2500;
    } else {
      state.preferences[key] = Number(target.value);
    }
    state.preferences.preset = "custom";
    state.perspective = "comprehensive";
    persistPrefs();
    reanalyzeIfNeeded();

    const panel = $("#ai-panel");
    $$(".preset-card", panel).forEach((card) => card.classList.remove("is-active"));
    $$("[data-pref='budget-range']", panel).forEach((range) => {
      if (key !== "budget-range") range.value = state.preferences.budget;
    });
    $$("[data-pref='budget']", panel).forEach((input) => {
      if (key !== "budget") input.value = state.preferences.budget;
    });
    const valueNode = $(`[data-value-for="${key}"]`, panel);
    if (valueNode) valueNode.textContent = weightLabel(target.value);
    if (key === "budget" || key === "budget-range") {
      const budgetInput = $("[data-pref='budget']", panel);
      if (budgetInput) budgetInput.value = state.preferences.budget;
    }
    const autoStatus = $("#auto-result-status");
    if (autoStatus && state.analysis) {
      autoStatus.textContent = `建议已自动更新：${state.analysis.winner?.name || ""} · ${state.analysis.winnerScore} 分`;
    }
    $("#pref-summary-mini").textContent = "自定义";
  }

  function applyNaturalPreference() {
    const input = $("#natural-preference");
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      input.focus();
      showToast("先写一句你的购买偏好", "info");
      return;
    }
    state.previousPrefs = { ...state.preferences };
    const result = C.inferNaturalPreference(text, state.preferences);
    state.preferences = result.prefs;
    state.perspective = "comprehensive";
    persistPrefs();
    reanalyzeIfNeeded();
    renderAI();
    showToast(`已理解：${result.notes.join("，")}`);
  }

  function generateAnalysis() {
    if (state.products.length < 2) return;
    if (!state.analysis) {
      state.analysis = C.analyze(state.products, state.preferences, state.perspective);
      state.changeExplanation = "";
    }
    state.preferencePanelOpen = false;
    document.body.classList.remove("mobile-prefs-open");
    if (!state.currentComparisonId) state.currentComparisonId = C.uid("comparison");
    persistPrefs();
    renderAI();
    renderWorkspace();
    $("#ai-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast(state.previousAnalysis ? "购买建议已更新" : "购买建议已生成");
  }

  function openPreferencePanel() {
    state.preferencePanelOpen = true;
    renderAI();
  }

  function openMobilePrefs() {
    state.preferencePanelOpen = true;
    document.body.classList.add("mobile-prefs-open");
    renderAI();
  }

  function closeMobilePrefs() {
    state.preferencePanelOpen = false;
    document.body.classList.remove("mobile-prefs-open");
    renderAI();
  }

  function setPerspective(perspective) {
    if (!["comprehensive", "lowest", "secure"].includes(perspective)) return;
    state.perspective = perspective;
    state.analysis = C.analyze(state.products, state.preferences, perspective);
    state.changeExplanation = "";
    state.preferencePanelOpen = false;
    renderAI();
    renderWorkspace();
  }

  function saveCurrentComparison() {
    if (!state.analysis) {
      showToast("请先生成购买建议", "alert");
      return;
    }
    if (!state.currentComparisonId) state.currentComparisonId = C.uid("comparison");
    const snapshot = {
      id: state.currentComparisonId,
      title: titleForProducts(state.products),
      createdAt: new Date().toISOString(),
      products: C.clone(state.products),
      preferences: C.clone(state.preferences),
      analysis: C.clone(state.analysis),
      perspective: state.perspective,
    };
    const existingIndex = state.history.findIndex((item) => item.id === snapshot.id);
    if (existingIndex >= 0) state.history.splice(existingIndex, 1, snapshot);
    else state.history.unshift(snapshot);
    state.history = state.history.slice(0, 10);
    state.lastSavedAt = snapshot.createdAt;
    persistHistory();
    showToast("本次比较已保存到浏览器");
  }

  function openHistory() {
    const list = state.history.length
      ? `<div class="history-list">${state.history
          .map(
            (item) => `
            <div class="history-item">
              <div class="history-item-main">
                <b>${escapeHtml(item.title)}</b>
                <p>${C.formatDate(item.createdAt)} · ${item.products?.length || 0} 件商品 · ${escapeHtml(item.analysis?.winner?.name || "未生成建议")}</p>
              </div>
              <span class="history-item-tag">${escapeHtml(C.presetMeta[item.preferences?.preset]?.summary || "自定义")}</span>
              <div class="history-item-actions">
                <button class="icon-button" data-action="open-history-item" data-id="${escapeHtml(item.id)}" aria-label="打开记录">${C.icon("arrow")}</button>
                <button class="icon-button danger" data-action="delete-history-item" data-id="${escapeHtml(item.id)}" aria-label="删除记录">${C.icon("trash")}</button>
              </div>
            </div>`
          )
          .join("")}</div>`
      : `<div class="history-empty">${C.icon("clock")}<b>还没有保存过比较</b><span>生成建议后，点击“保存比较”即可在这里重新打开。</span></div>`;
    openDrawer(`
      <div class="drawer-header">
        <div><span class="section-kicker">LOCAL HISTORY</span><h2 id="drawer-title">比较记录</h2></div>
        <button class="drawer-close" data-action="close-drawer" aria-label="关闭">${C.icon("close")}</button>
      </div>
      <div class="drawer-body">
        <p style="color:var(--ink-faint);font-size:10px;line-height:1.65;margin:0 0 15px">记录保存在当前浏览器中，最多保留 10 次。历史价格与推荐带有分析时间，购买前请核实最新信息。</p>
        ${list}
      </div>
    `);
  }

  function openHistoryItem(id) {
    const item = state.history.find((entry) => entry.id === id);
    if (!item) return;
    state.products = C.clone(item.products || []).map(C.normalizeProduct);
    state.preferences = { ...C.preferencePresets.balanced, ...C.clone(item.preferences || {}) };
    state.perspective = item.perspective || "comprehensive";
    state.analysis = item.analysis ? C.clone(item.analysis) : C.analyze(state.products, state.preferences, state.perspective);
    state.currentComparisonId = item.id;
    state.changeExplanation = "";
    state.preferencePanelOpen = false;
    persistProducts();
    persistPrefs();
    closeDrawer();
    goCompare();
    showToast("已打开保存的比较");
  }

  function deleteHistoryItem(id) {
    state.history = state.history.filter((item) => item.id !== id);
    persistHistory();
    openHistory();
    showToast("历史记录已删除");
  }

  function openShare() {
    if (!state.analysis?.winner) {
      showToast("先生成购买建议，再分享决策总结", "alert");
      return;
    }
    const text = C.summaryText(state.products, state.preferences, state.analysis, state.perspective);
    openModal(
      `${modalHeader("SHARE THE DECISION", "分享这次选择")}
      <div class="modal-body">
        <div class="share-preview" id="share-preview"><div style="padding:60px 20px;color:var(--ink-faint)">正在生成总结图片…</div></div>
        <div class="share-copy">${escapeHtml(text)}</div>
        <div class="share-actions">
          <button class="btn btn-primary" data-action="download-share-image">${C.icon("download")}下载总结图片</button>
          <button class="btn btn-secondary" data-action="copy-summary">${C.icon("copy")}复制文字摘要</button>
        </div>
        <div class="form-note">${C.icon("info")}<span>分享内容会明确标记为 PickWise Demo 与模拟数据分析，不包含真实账户或跨设备同步信息。</span></div>
      </div>`,
      "modal-narrow"
    );
    const canvas = buildShareCanvas();
    const preview = $("#share-preview");
    if (preview) {
      preview.innerHTML = `<img src="${canvas.toDataURL("image/png")}" alt="PickWise 购物比较总结图" />`;
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const chars = Array.from(String(text || ""));
    const lines = [];
    let current = "";
    chars.forEach((char) => {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function drawLines(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const lines = wrapCanvasText(ctx, text, maxWidth);
    const visible = lines.slice(0, maxLines);
    visible.forEach((line, index) => {
      const finalLine = index === maxLines - 1 && lines.length > maxLines ? line.replace(/.$/, "…") : line;
      ctx.fillText(finalLine, x, y + index * lineHeight);
    });
    return y + visible.length * lineHeight;
  }

  function drawHeadphones(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#5b4636";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(75, 75, 55, Math.PI, Math.PI * 2);
    ctx.stroke();
    roundRect(ctx, 7, 65, 30, 48, 14);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, 113, 65, 30, 48, 14);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(139, 89, 17, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  }

  function buildShareCanvas() {
    const analysis = state.analysis;
    const winner = analysis.winner;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext("2d");
    const ink = "#5b4636";
    const soft = "#7c6857";
    const faint = "#a49483";
    const sage = "#6b8f71";
    const sageLight = "#e5eedc";
    const paper = "#fffdf8";
    const cream = "#f8f4e9";
    const line = "#ded3bd";
    const fontBody = '"Microsoft YaHei", "PingFang SC", sans-serif';
    const fontDisplay = '"KaiTi", "STKaiti", serif';

    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, 1200, 1500);
    ctx.fillStyle = "rgba(230,184,92,.08)";
    for (let x = 40; x < 1200; x += 44) {
      for (let y = 35; y < 1500; y += 44) {
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = sage;
    roundRect(ctx, 82, 70, 54, 54, 15);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(109, 97, 15, 11, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(105, 97, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = `bold 44px ${fontDisplay}`;
    ctx.fillText("PickWise", 154, 114);
    ctx.fillStyle = soft;
    ctx.font = `18px ${fontBody}`;
    ctx.fillText("买得明白，选得值得。", 83, 162);

    const now = C.formatDate(analysis.analyzedAt);
    ctx.fillStyle = faint;
    ctx.font = `16px ${fontBody}`;
    ctx.textAlign = "right";
    ctx.fillText(`${now} · DEMO 模拟分析`, 1118, 160);
    ctx.textAlign = "left";

    ctx.fillStyle = sage;
    ctx.font = `bold 17px ${fontBody}`;
    ctx.fillText("MY SHOPPING DECISION", 83, 225);
    ctx.fillStyle = ink;
    ctx.font = `bold 54px ${fontDisplay}`;
    ctx.fillText("这次，我准备选它。", 80, 288);

    roundRect(ctx, 78, 330, 1044, 420, 32);
    ctx.fillStyle = paper;
    ctx.fill();
    ctx.strokeStyle = "#cfddc6";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = sageLight;
    roundRect(ctx, 110, 365, 210, 300, 24);
    ctx.fill();
    drawHeadphones(ctx, 142, 446, 1.22);

    ctx.fillStyle = sage;
    roundRect(ctx, 355, 373, 112, 31, 15);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold 14px ${fontBody}`;
    ctx.fillText("当前建议", 379, 395);

    ctx.fillStyle = soft;
    ctx.font = `17px ${fontBody}`;
    ctx.fillText(`${winner.platform} · ${winner.condition}`, 355, 443);
    ctx.fillStyle = ink;
    ctx.font = `bold 31px ${fontBody}`;
    const nameEnd = drawLines(ctx, winner.name, 355, 490, 500, 43, 2);
    ctx.fillStyle = faint;
    ctx.font = `15px ${fontBody}`;
    ctx.fillText("最终到手价", 355, Math.max(nameEnd + 38, 580));
    ctx.fillStyle = ink;
    ctx.font = `bold 49px ${fontDisplay}`;
    ctx.fillText(C.formatPrice(winner.finalPrice ?? winner.price), 355, 662);

    ctx.fillStyle = sageLight;
    ctx.beginPath();
    ctx.arc(1000, 472, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sage;
    ctx.font = `bold 44px ${fontDisplay}`;
    ctx.textAlign = "center";
    ctx.fillText(String(analysis.winnerScore), 1000, 470);
    ctx.font = `14px ${fontBody}`;
    ctx.fillText("/ 100", 1000, 497);
    ctx.fillStyle = soft;
    ctx.font = `13px ${fontBody}`;
    ctx.fillText("综合匹配分", 1000, 526);
    ctx.textAlign = "left";

    const prefLabel = C.presetMeta[state.preferences.preset]?.label || "自定义偏好";
    ctx.fillStyle = "#f8f5ed";
    roundRect(ctx, 78, 785, 1044, 92, 22);
    ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = `15px ${fontBody}`;
    ctx.fillText("我的购买偏好", 110, 818);
    ctx.fillStyle = ink;
    ctx.font = `bold 22px ${fontBody}`;
    ctx.fillText(`${prefLabel}  ·  预算 ${C.formatPrice(state.preferences.budget)}`, 110, 850);
    ctx.fillStyle = sage;
    ctx.font = `15px ${fontBody}`;
    ctx.textAlign = "right";
    ctx.fillText("价格 / 品质 / 物流 / 售后", 1080, 843);
    ctx.textAlign = "left";

    ctx.fillStyle = ink;
    ctx.font = `bold 27px ${fontDisplay}`;
    ctx.fillText("为什么推荐它", 80, 940);
    ctx.fillStyle = soft;
    ctx.font = `18px ${fontBody}`;
    let y = 983;
    analysis.reasons.slice(0, 3).forEach((reason) => {
      ctx.fillStyle = sage;
      ctx.beginPath();
      ctx.arc(92, y - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = soft;
      const end = drawLines(ctx, reason, 110, y, 970, 28, 2);
      y = end + 24;
    });

    ctx.fillStyle = "#fff8e9";
    roundRect(ctx, 78, 1175, 1044, 144, 21);
    ctx.fill();
    ctx.strokeStyle = "#f0dfb8";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#956c2e";
    ctx.font = `bold 16px ${fontBody}`;
    ctx.fillText("购买前仍需确认", 105, 1210);
    ctx.fillStyle = soft;
    ctx.font = `16px ${fontBody}`;
    drawLines(ctx, analysis.risks[0], 105, 1242, 970, 25, 2);

    ctx.strokeStyle = line;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(80, 1370);
    ctx.lineTo(1120, 1370);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = faint;
    ctx.font = `14px ${fontBody}`;
    ctx.fillText("以上为 PickWise Demo 模拟数据与分析，不代表实时全网价格。", 80, 1413);
    ctx.fillStyle = sage;
    ctx.textAlign = "right";
    ctx.fillText("看清差异，再选值得。", 1120, 1413);
    ctx.textAlign = "left";

    return canvas;
  }

  function downloadShareImage() {
    const canvas = buildShareCanvas();
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast("图片生成失败，请重试", "alert");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `PickWise-购物比较-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast("总结图片已下载");
    }, "image/png");
  }

  async function copySummary() {
    if (!state.analysis) return;
    const text = C.summaryText(state.products, state.preferences, state.analysis, state.perspective);
    try {
      await navigator.clipboard.writeText(text);
      showToast("文字摘要已复制");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast("文字摘要已复制");
    }
  }

  function openAlternatives() {
    const alternatives = C.alternativeProducts;
    openModal(
      `${modalHeader("SIMULATED ALTERNATIVES", "看看替代款灵感")}
      <div class="modal-body">
        <div class="form-note" style="margin:0 0 15px">${C.icon("info")}<span>以下为模拟候选库示例，不是实时搜索结果，也没有与当前商品做全网价格匹配。</span></div>
        <div class="alternative-list">
          ${alternatives
            .map(
              (product) => `
              <div class="alternative-item">
                <span class="alt-art">${C.productArt(product)}</span>
                <div><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.platform)} · ${C.formatPrice(product.finalPrice)} · ${escapeHtml(product.condition)}</small></div>
                <button class="btn btn-secondary" data-action="add-alternative" data-id="${escapeHtml(product.id)}" ${state.products.length >= 5 || state.products.some((p) => p.id === product.id) ? "disabled" : ""}>${state.products.some((p) => p.id === product.id) ? "已在清单" : "加入"}</button>
              </div>`
            )
            .join("")}
        </div>
      </div>`,
      "modal-narrow"
    );
  }

  function addAlternative(id) {
    const alternative = C.alternativeProducts.find((product) => product.id === id);
    if (!alternative || state.products.length >= 5 || state.products.some((p) => p.id === id)) return;
    state.products.push(C.normalizeProduct(C.clone(alternative)));
    persistProducts();
    state.analysis = null;
    state.changeExplanation = "";
    state.preferencePanelOpen = true;
    closeModal();
    renderHome();
    goCompare();
    showToast("替代款已加入候选清单");
  }

  function handleAction(action, element) {
    switch (action) {
      case "go-home":
        goHome();
        break;
      case "go-compare":
        goCompare();
        break;
      case "scroll-to-add":
        if (state.currentPage !== "home") goHome(false);
        $("#add-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => $("#product-link")?.focus({ preventScroll: true }), 500);
        break;
      case "add-from-workspace":
        goHome(false);
        window.setTimeout(() => $("#add-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
        break;
      case "parse-link": {
        const value = $("#product-link")?.value.trim();
        if (!value) {
          $("#product-link")?.focus();
          showToast("先粘贴一个商品链接", "info");
          return;
        }
        openParsedProduct(value);
        break;
      }
      case "manual-add":
        if (state.products.length >= 5) {
          showToast("候选清单最多放 5 件商品", "alert");
          return;
        }
        openManualProduct(C.blankProduct(), {
          icon: "pen",
          kicker: "MANUAL ENTRY",
          title: "手动添加商品",
          description: "只填写你能确认的信息。留空的项目会明确标记为未知，推荐不会自行补齐。",
        });
        break;
      case "load-demo":
        loadDemo();
        break;
      case "clear-candidates":
        confirmClearCandidates();
        break;
      case "edit-product": {
        const product = state.products.find((p) => p.id === element.dataset.id);
        if (product) openManualProduct(product, {
          icon: "edit",
          kicker: "EDIT PRODUCT",
          title: "修改商品信息",
          description: "更新后会按新的已知信息重新计算；未知字段仍然保持未知。",
        });
        break;
      }
      case "remove-product":
        removeProduct(element.dataset.id);
        break;
      case "confirm-remove-product":
        confirmRemoveProduct(element.dataset.id);
        break;
      case "confirm-clear-candidates":
        state.products = [];
        state.analysis = null;
        state.previousAnalysis = null;
        state.currentComparisonId = null;
        state.changeExplanation = "";
        persistProducts();
        closeModal();
        renderHome();
        showToast("候选清单已清空");
        break;
      case "close-modal":
        closeModal();
        break;
      case "close-drawer":
        closeDrawer();
        break;
      case "set-preset":
        setPreset(element.dataset.preset);
        break;
      case "apply-natural-pref":
        applyNaturalPreference();
        break;
      case "generate-analysis":
        generateAnalysis();
        break;
      case "open-preference-panel":
        openPreferencePanel();
        break;
      case "open-mobile-prefs":
        openMobilePrefs();
        break;
      case "close-mobile-prefs":
        closeMobilePrefs();
        break;
      case "set-perspective":
        setPerspective(element.dataset.perspective);
        break;
      case "set-comparison-view":
        state.comparisonView = element.dataset.view === "full" ? "full" : "key";
        renderWorkspace();
        break;
      case "save-comparison":
        saveCurrentComparison();
        break;
      case "open-history":
        openHistory();
        break;
      case "open-history-item":
        openHistoryItem(element.dataset.id);
        break;
      case "delete-history-item":
        deleteHistoryItem(element.dataset.id);
        break;
      case "open-share":
        openShare();
        break;
      case "download-share-image":
        downloadShareImage();
        break;
      case "copy-summary":
        copySummary();
        break;
      case "open-alternatives":
        openAlternatives();
        break;
      case "add-alternative":
        addAlternative(element.dataset.id);
        break;
      default:
        break;
    }
  }

  document.addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-add-mode]");
    if (modeButton) {
      const mode = modeButton.dataset.addMode;
      $$(".add-tab").forEach((button) => {
        const active = button === modeButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      $$(".add-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.addPanel === mode));
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      if (event.target.classList.contains("ai-column") && document.body.classList.contains("mobile-prefs-open")) {
        closeMobilePrefs();
      }
      return;
    }
    if (actionElement.tagName === "A") event.preventDefault();
    handleAction(actionElement.dataset.action, actionElement);
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "product-form") return;
    event.preventDefault();
    saveProductForm(event.target);
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-pref]")) handlePreferenceInput(target);
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "screenshot-input") {
      handleScreenshot(event.target.files?.[0]);
      event.target.value = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.id === "natural-preference") {
      event.preventDefault();
      applyNaturalPreference();
      return;
    }
    if (event.key === "Enter" && event.target.id === "product-link") {
      event.preventDefault();
      handleAction("parse-link", event.target);
      return;
    }
    if (event.key !== "Escape") return;
    if ($("#modal-layer").classList.contains("is-open")) {
      closeModal();
    } else if ($("#drawer-layer").classList.contains("is-open")) {
      closeDrawer();
    } else if (document.body.classList.contains("mobile-prefs-open")) {
      closeMobilePrefs();
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#compare" && state.products.length >= 1) goCompare();
    else if (!location.hash || location.hash === "#home") goHome(false);
  });

  function init() {
    C.hydrateIcons(document);
    state.history = Array.isArray(state.history) ? state.history : [];
    renderHome();
    if (state.products.length >= 2) renderWorkspace();
    if (location.hash === "#compare" && state.products.length >= 1) {
      goCompare();
    }
  }

  init();
})();
