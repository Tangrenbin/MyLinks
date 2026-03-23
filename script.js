const SEARCH_ENGINES = {
  google: {
    label: "Google",
    home: "https://www.google.com/",
    placeholder: "搜索技术文档、英文资料、全球信息……",
    url: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },
  baidu: {
    label: "百度",
    home: "https://www.baidu.com/",
    placeholder: "搜索中文资讯、教程、论坛内容……",
    url: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
  },
  bing: {
    label: "Bing",
    home: "https://www.bing.com/",
    placeholder: "搜索网页、图片和较干净的结果页……",
    url: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
};

const LINK_GROUPS = [
  {
    key: "ai",
    title: "AI 助手",
    links: [
      { name: "ChatGPT", meta: "chatgpt.com", href: "https://chatgpt.com/", logo: "https://images.ctfassets.net/j22is2dtoxu1/intercom-img-d177d076c9a5453052925143/49d5d812b0a6fcc20a14faa8c629d9fb/icon-ios-1024_401x.png" },
      { name: "DeepSeek", meta: "chat.deepseek.com", href: "https://chat.deepseek.com/", logo: "https://www.deepseek.com/favicon.ico" },
      { name: "CodexCN", meta: "codexcn.com", href: "https://codexcn.com/" },
      { name: "GLM", meta: "chatglm.cn", href: "https://chatglm.cn/", logo: "https://chatglm.cn/favicon.ico" },
    ],
  },
  {
    key: "news",
    title: "中国新闻",
    links: [
      { name: "新华网", meta: "news.cn", href: "https://www.news.cn/" },
      { name: "人民网", meta: "people.com.cn", href: "https://www.people.com.cn/" },
      { name: "央视网新闻", meta: "news.cctv.com", href: "https://news.cctv.com/" },
      { name: "中国新闻网", meta: "chinanews.com.cn", href: "https://www.chinanews.com.cn/" },
      { name: "澎湃新闻", meta: "thepaper.cn", href: "https://www.thepaper.cn/" },
      { name: "财新网", meta: "caixin.com", href: "https://www.caixin.com/" },
      { name: "第一财经", meta: "yicai.com", href: "https://www.yicai.com/" },
      { name: "界面新闻", meta: "jiemian.com", href: "https://www.jiemian.com/" },
    ],
  },
  {
    key: "us-news",
    title: "美国新闻",
    links: [
      { name: "Reuters", meta: "reuters.com", href: "https://www.reuters.com/" },
      { name: "Bloomberg", meta: "bloomberg.com", href: "https://www.bloomberg.com/" },
      { name: "AP News", meta: "apnews.com", href: "https://apnews.com/" },
      { name: "The New York Times", meta: "nytimes.com", href: "https://www.nytimes.com/" },
      { name: "The Wall Street Journal", meta: "wsj.com", href: "https://www.wsj.com/" },
      { name: "The Washington Post", meta: "washingtonpost.com", href: "https://www.washingtonpost.com/" },
      { name: "CNN", meta: "cnn.com", href: "https://www.cnn.com/" },
      { name: "Fox News", meta: "foxnews.com", href: "https://www.foxnews.com/" },
    ],
  },
  {
    key: "proxy",
    title: "代理机场",
    links: [
      { name: "Webshare", meta: "dashboard.webshare.io", href: "https://dashboard.webshare.io/" },
      { name: "69云", meta: "china.69yun69.com", href: "https://china.69yun69.com/" },
    ],
  },
  {
    key: "domain",
    title: "域名管理",
    links: [
      { name: "Spaceship", meta: "spaceship.com", href: "https://www.spaceship.com/" },
      { name: "Cloudflare", meta: "dash.cloudflare.com", href: "https://dash.cloudflare.com/" },
    ],
  },
  {
    key: "personal-site",
    title: "个人网站",
    links: [
      { name: "网站导航", meta: "my-links.990124.xyz", href: "https://my-links.990124.xyz/" },
      { name: "博客", meta: "blog.990124.xyz", href: "https://blog.990124.xyz/" },
      { name: "定投收益计算器", meta: "dca.990124.xyz", href: "https://dca.990124.xyz/" },
    ],
  },
];

const MARKET_REFRESH_MS = 60_000;
const EASTMONEY_HEADERS = {
  Accept: "application/json,text/plain,*/*",
};
const MARKET_YTD_BASELINES = {
  gold: {
    2026: 4331.505,
  },
  au9999: {
    2026: 993.57,
  },
};
const MARKET_CARD_CONFIG = [
  {
    key: "nas100",
    label: "NAS100",
    description: "纳斯达克 100 指数",
    unit: "指数点",
    badge: "100",
    variant: "nas100",
    source: "tencent-us",
    quoteSymbol: "usNDX",
    historySymbol: "usNDX",
    decimals: 2,
  },
  {
    key: "spx500",
    label: "SPX500",
    description: "标普 500 指数",
    unit: "指数点",
    badge: "500",
    variant: "spx500",
    source: "tencent-us",
    quoteSymbol: "usINX",
    historySymbol: "usINX",
    decimals: 2,
  },
  {
    key: "gold",
    label: "GOLD",
    description: "现货黄金",
    unit: "美元/盎司",
    badge: "Au",
    variant: "gold",
    source: "tencent-spot",
    quoteSymbol: "hf_XAU",
    decimals: 2,
  },
  {
    key: "au9999",
    label: "AU9999",
    description: "上海黄金交易所",
    unit: "人民币/克",
    badge: "克",
    variant: "au9999",
    source: "eastmoney-au",
    secid: "118.AU9999",
    decimals: 2,
  },
];

let activeEngine = "google";
let marketRefreshTimer = 0;
let marketRefreshInFlight = false;

function getLinkHostname(href) {
  try {
    return new URL(href).hostname;
  } catch (error) {
    return "";
  }
}

function getLinkLogoPrimarySrc(href) {
  const hostname = getLinkHostname(href);
  if (!hostname) return "";
  return `https://${hostname}/favicon.ico`;
}

function getLinkLogoFallbackSrc(href) {
  return "";
}

function getLinkLogoFallbackText(name) {
  const ascii = String(name || "").match(/[A-Za-z0-9]+/g)?.join("") ?? "";
  if (ascii) return ascii.slice(0, 2).toUpperCase();

  const compact = Array.from(String(name || "").replace(/\s+/g, ""));
  return compact.slice(0, 2).join("").toUpperCase() || "GO";
}

function bindLinkLogoFallbacks() {
  document.querySelectorAll(".link-logo").forEach((logo) => {
    const image = logo.querySelector(".link-logo-image");
    if (!image) return;

    image.addEventListener("load", () => {
      logo.classList.add("is-loaded");
    });

    image.addEventListener("error", () => {
      const fallbackSrc = image.dataset.fallbackSrc;

      if (fallbackSrc && image.src !== fallbackSrc) {
        image.src = fallbackSrc;
        return;
      }

      logo.classList.remove("is-loaded");
      image.removeAttribute("src");
    });

    if (image.complete && image.naturalWidth > 0) {
      logo.classList.add("is-loaded");
    }
  });
}

function bindEngineIconFallbacks() {
  document.querySelectorAll(".engine-icon").forEach((icon) => {
    const image = icon.querySelector(".engine-icon-image");
    if (!image) return;

    image.addEventListener("load", () => {
      icon.classList.add("is-loaded");
    });

    image.addEventListener("error", () => {
      icon.classList.remove("is-loaded");
      image.removeAttribute("src");
    });

    if (image.complete && image.naturalWidth > 0) {
      icon.classList.add("is-loaded");
    }
  });
}

function renderLinkItem(link) {
  const logoSrc = link.logo || getLinkLogoPrimarySrc(link.href);
  const fallbackLogo = getLinkLogoFallbackSrc(link.href);
  const fallbackText = getLinkLogoFallbackText(link.name);

  return `
    <a class="link-item" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">
      <div class="link-copy">
        <span class="link-title">${escapeHtml(link.name)}</span>
        <span class="link-meta">${escapeHtml(link.meta)}</span>
      </div>
      <span class="link-logo" aria-hidden="true">
        <img
          class="link-logo-image"
          src="${escapeHtml(logoSrc)}"
          data-fallback-src="${escapeHtml(fallbackLogo)}"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
        >
        <span class="link-logo-fallback">${escapeHtml(fallbackText)}</span>
      </span>
      <span class="link-arrow" aria-hidden="true">↗</span>
    </a>
  `;
}

function renderGroupHeader(group) {
  return `
    <header class="group-card-header">
      <h3>${escapeHtml(group.title)}</h3>
      <span class="group-count">${group.links.length} 个链接</span>
    </header>
  `;
}

function renderGroupCard(group) {
  return `
    <article class="group-card ${escapeHtml(group.key)}">
      ${renderGroupHeader(group)}
      <div class="group-list">${group.links.map((link) => renderLinkItem(link)).join("")}</div>
    </article>
  `;
}

function renderLinks() {
  const root = document.querySelector("#links-root");
  if (!root) return;

  root.innerHTML = LINK_GROUPS.map((group) => renderGroupCard(group)).join("");

  bindLinkLogoFallbacks();
}

function setActiveEngine(engine) {
  if (!SEARCH_ENGINES[engine]) return;
  activeEngine = engine;

  const input = document.querySelector("#search-input");
  const hint = document.querySelector("#search-hint");
  const submitButton = document.querySelector("#search-submit");
  const buttons = document.querySelectorAll(".engine-card");

  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.engine === engine);
  });

  if (input) input.placeholder = SEARCH_ENGINES[engine].placeholder;
  if (hint) hint.textContent = `当前默认引擎：${SEARCH_ENGINES[engine].label}。点击下方卡片切换，回车发起搜索。`;
  if (submitButton) submitButton.textContent = `用 ${SEARCH_ENGINES[engine].label} 搜索`;
}

function openSearch(engine) {
  const input = document.querySelector("#search-input");
  const currentEngine = SEARCH_ENGINES[engine];
  if (!input || !currentEngine) return;

  const query = input.value.trim();
  const targetUrl = query ? currentEngine.url(query) : currentEngine.home;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function bindSearch() {
  const form = document.querySelector("#search-form");
  const buttons = document.querySelectorAll(".engine-card");

  bindEngineIconFallbacks();
  setActiveEngine(activeEngine);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    openSearch(activeEngine);
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveEngine(button.dataset.engine);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "--";

  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatSignedNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value), decimals)}`;
}

function formatSignedPercent(value, decimals = 2) {
  if (!Number.isFinite(value)) return "--";
  return `${formatSignedNumber(value, decimals)}%`;
}

function getTrendClass(value) {
  if (!Number.isFinite(value) || value === 0) return "is-flat";
  return value > 0 ? "is-up" : "is-down";
}

function formatChangeLine(changePercent, changeValue, decimals = 2) {
  const percentText = formatSignedPercent(changePercent, 2);
  const valueText = formatSignedNumber(changeValue, decimals);

  if (percentText === "--" && valueText === "--") return "暂无数据";
  if (percentText === "--") return valueText;
  if (valueText === "--") return percentText;
  return `${percentText} (${valueText})`;
}

function formatShortTimestamp(rawValue) {
  if (!rawValue) return "等待更新";
  if (rawValue.startsWith("本地 ")) return rawValue;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(rawValue)) {
    return rawValue.slice(5, 16);
  }
  return rawValue;
}

function getLocalTimestamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

function computePercentChange(current, baseline) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline === 0) return null;
  return ((current - baseline) / baseline) * 100;
}

function getMarketYtdBaseline(key, year) {
  return MARKET_YTD_BASELINES[key]?.[year] ?? null;
}

function createMarketCardMarkup(config) {
  const currentYear = getCurrentYear();

  return `
    <article class="market-card is-loading" data-market-card="${escapeHtml(config.key)}">
      <div class="market-card-head">
        <div class="market-copy">
          <span class="market-badge ${escapeHtml(config.variant)}">${escapeHtml(config.badge)}</span>
          <div class="market-copy-text">
            <h3 class="market-name">${escapeHtml(config.label)}</h3>
            <p class="market-desc">${escapeHtml(config.description)}</p>
          </div>
        </div>
        <span class="market-unit">${escapeHtml(config.unit)}</span>
      </div>

      <div class="market-price-row">
        <div class="market-price is-flat">--</div>
        <div class="market-change is-flat">加载中</div>
      </div>

      <div class="market-foot">
        <span class="market-ytd is-flat">${currentYear}年：--</span>
        <span class="market-updated">等待更新</span>
      </div>
    </article>
  `;
}

function mountMarketWidget() {
  const host = document.querySelector("#market-widget");
  if (!host) return;

  host.innerHTML = MARKET_CARD_CONFIG.map((config) => createMarketCardMarkup(config)).join("");

  if (marketRefreshTimer) {
    window.clearInterval(marketRefreshTimer);
  }

  refreshMarketWidget();
  marketRefreshTimer = window.setInterval(refreshMarketWidget, MARKET_REFRESH_MS);
}

async function refreshMarketWidget() {
  if (marketRefreshInFlight) return;

  marketRefreshInFlight = true;

  try {
    await Promise.allSettled(MARKET_CARD_CONFIG.map((config) => updateMarketCard(config)));
  } finally {
    marketRefreshInFlight = false;
  }
}

async function updateMarketCard(config) {
  const card = document.querySelector(`[data-market-card="${config.key}"]`);
  if (!card) return;

  try {
    const snapshot = await loadMarketSnapshot(config);
    applyMarketSnapshot(card, config, snapshot);
  } catch (error) {
    applyMarketError(card);
  } finally {
    card.classList.remove("is-loading");
  }
}

function applyMarketSnapshot(card, config, snapshot) {
  const currentYear = getCurrentYear();
  const priceElement = card.querySelector(".market-price");
  const changeElement = card.querySelector(".market-change");
  const ytdElement = card.querySelector(".market-ytd");
  const updatedElement = card.querySelector(".market-updated");

  if (priceElement) {
    priceElement.textContent = formatNumber(snapshot.price, config.decimals);
    priceElement.className = `market-price ${getTrendClass(snapshot.changeValue)}`;
  }

  if (changeElement) {
    changeElement.textContent = formatChangeLine(snapshot.changePercent, snapshot.changeValue, config.decimals);
    changeElement.className = `market-change ${getTrendClass(snapshot.changeValue)}`;
  }

  if (ytdElement) {
    const ytdText = Number.isFinite(snapshot.ytdPercent)
      ? `${currentYear}年：${formatSignedPercent(snapshot.ytdPercent, 2)}`
      : `${currentYear}年：--`;
    ytdElement.textContent = ytdText;
    ytdElement.className = `market-ytd ${getTrendClass(snapshot.ytdPercent)}`;
  }

  if (updatedElement) {
    updatedElement.textContent = formatShortTimestamp(snapshot.updatedAt);
  }

  card.classList.remove("is-error");
}

function applyMarketError(card) {
  const currentYear = getCurrentYear();
  const priceElement = card.querySelector(".market-price");
  const changeElement = card.querySelector(".market-change");
  const ytdElement = card.querySelector(".market-ytd");
  const updatedElement = card.querySelector(".market-updated");

  if (priceElement) {
    priceElement.textContent = "--";
    priceElement.className = "market-price is-flat";
  }

  if (changeElement) {
    changeElement.textContent = "加载失败";
    changeElement.className = "market-change is-down";
  }

  if (ytdElement) {
    ytdElement.textContent = `${currentYear}年：--`;
    ytdElement.className = "market-ytd is-flat";
  }

  if (updatedElement) {
    updatedElement.textContent = "稍后重试";
  }

  card.classList.add("is-error");
}

async function loadMarketSnapshot(config) {
  switch (config.source) {
    case "tencent-us":
      return loadTencentUsSnapshot(config);
    case "tencent-spot":
      return loadTencentSpotSnapshot(config);
    case "eastmoney-au":
      return loadAu9999Snapshot(config);
    default:
      throw new Error(`Unsupported market source: ${config.source}`);
  }
}

async function fetchText(url, init = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.text();
}

async function fetchJson(url, init = {}) {
  const text = await fetchText(url, init);
  return JSON.parse(text);
}

function extractQuotedPayload(text) {
  const start = text.indexOf('"');
  const end = text.lastIndexOf('";');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Unexpected quote payload");
  }

  return text.slice(start + 1, end);
}

function parseTencentUsQuote(text) {
  const parts = extractQuotedPayload(text).split("~");
  const price = Number(parts[3]);
  const previousClose = Number(parts[4]);
  const changeValue = Number(parts[31]);
  const changePercent = Number(parts[32]);

  return {
    price,
    changeValue: Number.isFinite(changeValue) ? changeValue : price - previousClose,
    changePercent: Number.isFinite(changePercent)
      ? changePercent
      : computePercentChange(price, previousClose),
    ytdPercent: Number(parts[54]),
    updatedAt: parts[30] || "",
  };
}

function parseTencentSpotQuote(text) {
  const parts = extractQuotedPayload(text).split(",");
  const price = Number(parts[0]);
  const previousClose = Number(parts[7]);

  return {
    price,
    changeValue: price - previousClose,
    changePercent: Number(parts[1]),
    updatedAt: [parts[12], parts[6]].filter(Boolean).join(" "),
  };
}

function getTencentUsYearBaseline(historyJson, symbol, year) {
  const rows = historyJson?.data?.[symbol]?.day;
  if (!Array.isArray(rows) || rows.length === 0) return NaN;

  const yearStart = `${year}-01-01`;
  let previousClose = NaN;

  rows.forEach((row) => {
    if (row[0] < yearStart) {
      previousClose = Number(row[2]);
    }
  });

  if (Number.isFinite(previousClose)) return previousClose;

  const firstCurrentYearRow = rows.find((row) => row[0] >= yearStart);
  if (!firstCurrentYearRow) return NaN;

  return Number(firstCurrentYearRow[1]) || Number(firstCurrentYearRow[2]);
}

async function loadTencentUsSnapshot(config) {
  const year = getCurrentYear();
  const quoteUrl = `https://qt.gtimg.cn/q=${encodeURIComponent(config.quoteSymbol)}`;
  const historyUrl = `https://web.ifzq.gtimg.cn/appstock/app/usfqkline/get?param=${encodeURIComponent(config.historySymbol)},day,,,400,qfq`;

  const [quoteText, historyJson] = await Promise.all([
    fetchText(quoteUrl),
    fetchJson(historyUrl),
  ]);

  const quote = parseTencentUsQuote(quoteText);
  const baseline = getTencentUsYearBaseline(historyJson, config.historySymbol, year);
  const ytdPercent = Number.isFinite(baseline)
    ? computePercentChange(quote.price, baseline)
    : quote.ytdPercent;

  return {
    ...quote,
    ytdPercent,
  };
}

async function loadTencentSpotSnapshot(config) {
  const year = getCurrentYear();
  const quoteUrl = `https://qt.gtimg.cn/q=${encodeURIComponent(config.quoteSymbol)}`;
  const quoteText = await fetchText(quoteUrl);
  const quote = parseTencentSpotQuote(quoteText);
  const baseline = getMarketYtdBaseline(config.key, year);

  return {
    ...quote,
    ytdPercent: computePercentChange(quote.price, baseline),
  };
}

function normalizeEastmoneyPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return NaN;
  return Math.abs(numeric) >= 10000 ? numeric / 100 : numeric;
}

function scaleEastmoneyQuoteValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return NaN;
  return numeric / 100;
}

function parseEastmoneyQuote(payload) {
  const data = payload?.data;
  if (!data) throw new Error("Missing Eastmoney payload");

  const price = scaleEastmoneyQuoteValue(data.f43);
  const previousClose = scaleEastmoneyQuoteValue(data.f60);
  const delta = scaleEastmoneyQuoteValue(data.f169);

  return {
    price,
    changeValue: Number.isFinite(delta) ? delta : price - previousClose,
    changePercent: scaleEastmoneyQuoteValue(data.f170),
    updatedAt: getLocalTimestamp(),
  };
}

function getEastmoneyYearBaseline(payload) {
  const directBaseline = normalizeEastmoneyPrice(payload?.data?.preKPrice);
  if (Number.isFinite(directBaseline)) return directBaseline;

  const firstKline = payload?.data?.klines?.[0];
  if (!firstKline) return NaN;

  const [, openPrice, closePrice] = String(firstKline).split(",");
  return Number(openPrice) || Number(closePrice);
}

async function loadAu9999Snapshot(config) {
  const currentYear = getCurrentYear();
  const quoteUrl = `https://push2delay.eastmoney.com/api/qt/stock/get?secid=${encodeURIComponent(config.secid)}&fields=f57,f58,f43,f44,f45,f46,f169,f170,f171,f60`;
  const quote = parseEastmoneyQuote(await fetchJson(quoteUrl, { headers: EASTMONEY_HEADERS }));
  const configuredBaseline = getMarketYtdBaseline(config.key, currentYear);

  if (Number.isFinite(configuredBaseline)) {
    return {
      ...quote,
      ytdPercent: computePercentChange(quote.price, configuredBaseline),
    };
  }

  const historyUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${encodeURIComponent(config.secid)}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&beg=${currentYear}0101&end=20500101`;
  let ytdPercent = null;

  try {
    const historyPayload = await fetchJson(historyUrl, { headers: EASTMONEY_HEADERS });
    const baseline = getEastmoneyYearBaseline(historyPayload);
    ytdPercent = computePercentChange(quote.price, baseline);
  } catch (error) {
    ytdPercent = null;
  }

  return {
    ...quote,
    ytdPercent,
  };
}

function initTheme() {
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  const syncTheme = () => {
    const theme = media?.matches ? "light" : "dark";
    applyTheme(theme);
  };

  syncTheme();

  if (media?.addEventListener) {
    media.addEventListener("change", syncTheme);
  } else if (media?.addListener) {
    media.addListener(syncTheme);
  }

  const themeToggle = document.querySelector("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderLinks();
  bindSearch();
  initTheme();
  mountMarketWidget();
});
