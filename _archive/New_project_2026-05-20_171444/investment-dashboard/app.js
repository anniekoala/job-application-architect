const portfolio = {
  total: 814968.79,
  history: [
    { month: "Jan", value: 525326.46 },
    { month: "Feb", value: 550894.93 },
    { month: "Mar", value: 731554.71 },
    { month: "Current", value: 814968.79 },
  ],
  types: [
    { label: "Stocks", value: 288103.2, color: "#2364aa" },
    { label: "ETFs & funds", value: 453518.03, color: "#4d8dd1" },
    { label: "Low-risk yield", value: 26792.21, color: "#2a9d8f" },
    { label: "IUL", value: 36206.51, color: "#8e6cbe" },
    { label: "Cash", value: 10348.84, color: "#d99018" },
  ],
  accountTypes: [
    {
      label: "Taxable / personal",
      detail: "Fidelity Individual + Robinhood Individual",
      value: 252369.76,
      color: "#2364aa",
    },
    {
      label: "Employer equity",
      detail: "Schwab One taxable account funded by RSU / ESPP",
      value: 196981.78,
      color: "#b07aa1",
    },
    {
      label: "Roth IRA",
      detail: "Fidelity Roth IRA",
      value: 81731.46,
      color: "#4d8dd1",
    },
    {
      label: "401(k) pre-tax",
      detail: "Roblox retirement plan · employee deferral + employer match",
      value: 84464.17,
      color: "#5e81c5",
    },
    {
      label: "401(k) Roth",
      detail: "Roblox retirement plan · Roth sources",
      value: 129486.72,
      color: "#77a9dc",
    },
    {
      label: "Traditional retirement",
      detail: "Traditional IRA + rollover IRA",
      value: 96.01,
      color: "#7b8794",
    },
    {
      label: "Insurance policy",
      detail: "Nationwide IUL",
      value: 36206.51,
      color: "#8e6cbe",
    },
    {
      label: "HSA",
      detail: "Fidelity Health Savings Account",
      value: 1374.19,
      color: "#d99018",
    },
    {
      label: "Checking",
      detail: "Chase",
      value: 6622.14,
      color: "#b8c0ca",
    },
    {
      label: "Bank savings",
      detail: "Amex high-yield savings",
      value: 25636.05,
      color: "#2a9d8f",
    },
  ],
  stocks: [
    { ticker: "NVDA", name: "NVIDIA", value: 59871 },
    { ticker: "SPGI", name: "S&P Global", value: 14230.59 },
    { ticker: "TSLA", name: "Tesla", value: 11448.9 },
    { ticker: "GOOGL", name: "Alphabet", value: 5753.91 },
    { ticker: "DIS", name: "Disney", value: 3112.5 },
    { ticker: "RBLX", name: "Roblox", value: 193686.3 },
  ],
  accountTypeMix: [
    { accountType: "Taxable / personal", stock: 88662.99, fund: 163153.55, lowRisk: 122, iul: 0, cash: 431.22 },
    { accountType: "Roth IRA", stock: 5139.77, fund: 76413.59, lowRisk: 178.1, iul: 0, cash: 0 },
    { accountType: "401(k) pre-tax", stock: 0, fund: 84464.17, lowRisk: 0, iul: 0, cash: 0 },
    { accountType: "401(k) Roth", stock: 0, fund: 129486.72, lowRisk: 0, iul: 0, cash: 0 },
    { accountType: "Bank savings", stock: 0, fund: 0, lowRisk: 25636.05, iul: 0, cash: 0 },
    { accountType: "Insurance policy", stock: 0, fund: 0, lowRisk: 0, iul: 36206.51, cash: 0 },
    { accountType: "HSA", stock: 614.14, fund: 0, lowRisk: 760.05, iul: 0, cash: 0 },
    { accountType: "Traditional retirement", stock: 0, fund: 0, lowRisk: 96.01, iul: 0, cash: 0 },
    { accountType: "Employer equity", stock: 193686.3, fund: 0, lowRisk: 0, iul: 0, cash: 3295.48 },
    { accountType: "Checking", stock: 0, fund: 0, lowRisk: 0, iul: 0, cash: 6622.14 },
  ],
  overlaps: [
    {
      label: "S&P 500 duplication",
      value: 85501.02,
      tone: "neutral",
      note: "VOO + SPY + FXAIX all target broad US large-cap exposure.",
    },
    {
      label: "Growth / tech stack",
      value: 200823.66,
      tone: "high",
      note: "QQQ, FBGRX, FDSVX, FNGS, NVDA, and GOOGL lean toward similar growth/tech risk.",
    },
    {
      label: "Individual stock sleeve",
      value: 94416.9,
      tone: "neutral",
      note: "Mostly concentrated in Robinhood single names.",
    },
    {
      label: "Employer equity concentration",
      value: 193686.3,
      tone: "high",
      note: "Current Schwab holdings confirm a large RBLX position tied to compensation income.",
    },
  ],
  funds: [
    ["FBGRX", "US large-cap growth", 77763.01, "Likely overlaps with QQQ, NVDA/GOOGL, and broad large-cap funds"],
    ["VOO", "US large-cap core", 65632.57, "High overlap with SPY and FXAIX"],
    ["QQQ", "US large-cap growth / tech tilt", 29129.48, "Overlaps with mega-cap growth stocks and growth funds"],
    ["FDSVX", "US growth", 24810.03, "Likely overlaps with large-cap growth exposure"],
    ["SPY", "US large-cap core", 17247.84, "High overlap with VOO and FXAIX"],
    ["VMACX", "US mid-cap core", 7842.14, "Diversifies size, but still US equity risk"],
    ["FNGS", "Mega-cap tech concentration", 3496.23, "Overlaps strongly with growth/tech names"],
    ["FXAIX", "US large-cap core", 2620.61, "High overlap with VOO and SPY"],
    ["VOOV", "US large-cap value tilt", 1689.59, "Partial S&P 500 overlap with value tilt"],
  ],
};

const performance = {
  NVDA: { returns: [0.133, 0.2326, 0.185, 0.6715], series: [198.48, 196.5, 207.83, 211.5, 215.2, 219.44, 220.78, 225.83, 235.74, 225.32] },
  SPGI: { returns: [-0.0637, -0.0133, -0.1802, -0.2175], series: [424.75, 423.87, 423.57, 428.68, 420.12, 421, 424.17, 406.55, 403.92, 403.15] },
  TSLA: { returns: [0.0773, 0.0115, 0.0442, 0.2317], series: [392.51, 389.37, 398.73, 411.79, 428.35, 445, 433.45, 445.27, 443.3, 422.24] },
  GOOGL: { returns: [0.177, 0.2988, 0.4374, 1.4284], series: [383.25, 388.43, 398.04, 397.99, 400.8, 388.64, 387.35, 402.62, 401.07, 396.78] },
  DIS: { returns: [-0.0031, -0.0259, -0.0225, -0.0745], series: [101.31, 100.48, 108.06, 108.66, 108.02, 104.72, 106.16, 104.9, 105.42, 102.72] },
  RBLX: { returns: [-0.2833, -0.3217, -0.5811, -0.4695], series: [47.57, 44.04, 43.76, 44.78, 41.91, 41.31, 41.54, 41.96, 43.72, 42.85] },
  FBGRX: { returns: [0.0801, 0.1735, 0.1681, 0.4068], series: [290.18, 292.71, 298.52, 297.02, 299.98, 300.82, 299.16, 303.17, 306.72, 301.75] },
  VOO: { returns: [0.0559, 0.0872, 0.1063, 0.2668], series: [660.12, 665.3, 674.66, 672.54, 678.04, 679.52, 678.67, 682.41, 687.73, 679.44] },
  QQQ: { returns: [0.1122, 0.1793, 0.1673, 0.3719], series: [672.88, 681.61, 695.77, 694.94, 711.23, 713.29, 707.24, 714.71, 719.79, 708.93] },
  FDSVX: { returns: [0.0596, 0.1308, 0.1252, 0.2808], series: [75.12, 75.57, 77.17, 76.73, 77.41, 77.74, 77.5, 78.54, 79.41, 77.82] },
  SPY: { returns: [0.056, 0.0872, 0.1063, 0.2662], series: [718.01, 723.77, 733.83, 731.58, 737.62, 739.3, 738.18, 742.31, 748.17, 739.17] },
  VMACX: { returns: [-0.0295, -0.0623, 0.0071, -0.0392], series: [55.31, 55.65, 56.3, 55.8, 55.54, 55.12, 54.67, 54.22, 54.3, 54.3] },
  FNGS: { returns: [0.0787, 0.2098, 0.0528, 0.2619], series: [71.12, 71.58, 72.67, 72.46, 74.35, 74.45, 73.92, 75.07, 75.45, 74.11] },
  FXAIX: { returns: [0.0557, 0.0869, 0.1067, 0.2673], series: [250.29, 252.33, 256.01, 255.04, 257.23, 257.73, 257.33, 258.84, 260.83, 257.65] },
  VOOV: { returns: [0.0252, 0.0183, 0.0754, 0.1955], series: [214.46, 216.09, 217.13, 215.95, 216.62, 216.84, 217.06, 216.93, 217.37, 215.85] },
};

const personalReturns = {
  NVDA: { basis: 21197.2, gain: 38673.8, returnPct: 1.8245, source: "Robinhood transaction history estimate" },
  SPGI: { basis: 13575.57, gain: 655.02, returnPct: 0.0483, source: "Robinhood transaction history estimate" },
  TSLA: { basis: 7783.55, gain: 3665.35, returnPct: 0.4709, source: "Robinhood transaction history estimate" },
  DIS: { basis: 5070.5, gain: -1958, returnPct: -0.3862, source: "Robinhood transaction history estimate" },
  FBGRX: { basis: 58185.54, gain: 22562.31, returnPct: 0.3878 },
  VOO: { basis: 53244.69, gain: 13772.9, returnPct: 0.2587 },
  QQQ: { basis: 24987.29, gain: 5556.7, returnPct: 0.2224 },
  FDSVX: { basis: 21048.24, gain: 4550.56, returnPct: 0.2162 },
  SPY: { basis: 10007.72, gain: 7240.12, returnPct: 0.7235, source: "Robinhood transaction history estimate" },
  VMACX: { basis: 7728.75, gain: -281.9, returnPct: -0.0365 },
  FNGS: { basis: 2510.39, gain: 1137.29, returnPct: 0.453 },
  GOOGL: { basis: 4789.89, gain: 1098.69, returnPct: 0.2294 },
  VOOV: { basis: 1499.82, gain: 196.42, returnPct: 0.131 },
  FXAIX: { basis: 55246.68, gain: 13969.86, returnPct: 0.2529 },
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const pct = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

const marketData = window.marketData ?? { generatedAt: null, symbols: {}, returns: {}, errors: [] };
const marketDataConnected = Boolean(marketData.generatedAt);
const marketWindows = ["1D", "1W", "1M", "3M", "6M", "1Y"];

const categorySeries = [
  { label: "Stocks", color: "#2364aa", values: [335380.81, 287131.52, 318653.3, 280742.8, 288103.2] },
  { label: "ETFs & funds", color: "#4d8dd1", values: [212104, 210402, 200977, 400740.33, 453518.03] },
  { label: "Low-risk yield", color: "#2a9d8f", values: [179.37, 439, 599.41, 1156.16, 26792.21] },
  { label: "IUL", color: "#8e6cbe", values: [17874.93, 17874.93, 17874.93, 36206.51, 36206.51] },
  { label: "Cash", color: "#d99018", values: [13438.87, 9479.01, 12790.29, 12708.91, 10348.84] },
];
const categoryPerformance = {
  Stocks: [-0.1594, -0.1624, -0.3508, -0.1499],
  "ETFs & funds": [0.0689, 0.129, 0.1325, 0.3178],
  "Low-risk yield": null,
  IUL: null,
  Cash: null,
};
const latestCategoryValues = Object.fromEntries(portfolio.types.map((type) => [type.label, type.value]));
const stackedWidth = 760;
const stackedHeight = 280;
const stackedPadding = 28;
const stackedMonths = ["Dec", "Jan", "Feb", "Mar", "Current"];
const totals = categorySeries[0].values.map((_, index) =>
  categorySeries.reduce((sum, series) => sum + series.values[index], 0),
);
const maxTotal = Math.max(...totals);
const xAt = (index) => stackedPadding + (index / (stackedMonths.length - 1)) * (stackedWidth - stackedPadding * 2);
const yAt = (value) => stackedHeight - stackedPadding - (value / maxTotal) * (stackedHeight - stackedPadding * 2);
let lower = new Array(stackedMonths.length).fill(0);
const stackedPaths = categorySeries.map((series) => {
  const upper = series.values.map((value, index) => value + lower[index]);
  const top = upper.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
  const bottom = lower
    .map((value, index) => `${xAt(index)},${yAt(value)}`)
    .reverse()
    .join(" ");
  lower = upper;
  return `<polygon points="${top} ${bottom}" fill="${series.color}" opacity="0.92" />`;
});
document.querySelector("#stackedAreaChart").innerHTML = `
  <line x1="${stackedPadding}" y1="${stackedHeight - stackedPadding}" x2="${stackedWidth - stackedPadding}" y2="${stackedHeight - stackedPadding}" stroke="#dbe2ea" />
  ${stackedPaths.join("")}
  ${stackedMonths.map((month, index) => `<rect class="hover-zone" data-index="${index}" x="${Math.max(0, xAt(index) - 52)}" y="0" width="104" height="${stackedHeight}" fill="transparent" />`).join("")}
  ${stackedMonths.map((month, index) => `<text x="${xAt(index)}" y="${stackedHeight - 6}" text-anchor="middle" fill="#657384" font-size="12">${month}</text>`).join("")}
  <text x="${stackedPadding}" y="${stackedPadding}" fill="#657384" font-size="12">${money(maxTotal)}</text>
`;
document.querySelector("#stackedLegend").innerHTML = categorySeries
  .map((series) => {
    const current = latestCategoryValues[series.label];
    const returns = categoryPerformance[series.label];
    return `
      <div class="stacked-legend-row" style="--dot:${series.color}">
        <div class="stacked-legend-main">
          <span>${series.label}</span>
          <strong>${money(current)}</strong>
        </div>
        <div class="stacked-return-grid">
          ${["1M", "3M", "6M", "1Y"]
            .map((window, index) => {
              const value = returns?.[index];
              return `
                <div>
                  <small>${window}</small>
                  <b class="${value == null ? "muted" : value >= 0 ? "positive" : "negative"}">${value == null ? "—" : pct(value)}</b>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  })
  .join("");

const stackedTooltip = document.createElement("div");
stackedTooltip.className = "stacked-tooltip";
document.querySelector(".hero-chart-wrap").appendChild(stackedTooltip);

function renderStackedTooltip(index, clientX = null, clientY = null) {
  const totalAtIndex = categorySeries.reduce((sum, series) => sum + series.values[index], 0);
  stackedTooltip.innerHTML = `
    <strong>${stackedMonths[index]} total · ${money(totalAtIndex)}</strong>
    ${categorySeries
      .map((series) => {
        const value = series.values[index];
        return `<div><span style="--dot:${series.color}">${series.label}</span><b>${money(value)} · ${pct(value / totalAtIndex)}</b></div>`;
      })
      .join("")}
  `;
  stackedTooltip.classList.add("visible");
  if (clientX != null && clientY != null) {
    stackedTooltip.style.left = `${clientX}px`;
    stackedTooltip.style.top = `${clientY}px`;
  }
}

document.querySelectorAll(".hover-zone").forEach((zone) => {
  zone.addEventListener("mousemove", (event) => renderStackedTooltip(Number(zone.dataset.index), event.offsetX + 14, event.offsetY + 14));
  zone.addEventListener("mouseenter", () => renderStackedTooltip(Number(zone.dataset.index)));
  zone.addEventListener("mouseleave", () => stackedTooltip.classList.remove("visible"));
});

document.querySelector("#heroTotal").textContent = money(portfolio.total);
const latestHistory = portfolio.history.at(-1);
const previousHistory = portfolio.history.at(-2);
const heroDelta = latestHistory.value - previousHistory.value;
document.querySelector("#heroChange").textContent = `${heroDelta >= 0 ? "+" : ""}${money(heroDelta)}`;
document.querySelector(".hero-change").classList.toggle("positive", heroDelta >= 0);
document.querySelector(".hero-change").classList.toggle("negative", heroDelta < 0);

const channelSegments = [
  { key: "stock", label: "Stocks", color: "#2364aa" },
  { key: "fund", label: "ETFs & funds", color: "#4d8dd1" },
  { key: "lowRisk", label: "Low-risk yield", color: "#2a9d8f" },
  { key: "iul", label: "IUL", color: "#8e6cbe" },
  { key: "cash", label: "Cash", color: "#d99018" },
];
const insuranceStrategies = [
  {
    label: "One-Year J.P. Morgan Mercury High Par",
    value: 23313.29,
    share: 0.6439,
    rate: 0,
    credit: 0,
    note: "Matured segments credited 0%",
  },
  {
    label: "One-Year BNP Paribas Global H-Factor High Par",
    value: 6754.06,
    share: 0.1865,
    rate: 1.52,
    credit: 46.67,
    note: "Matured segments generated credit",
  },
  {
    label: "Fixed",
    value: 2556.35,
    share: 0.0706,
    rate: 4.08,
    credit: 163.25,
    note: "Daily fixed interest credited",
  },
  {
    label: "One-Year Multi-Index Monthly Average",
    value: 1912.84,
    share: 0.0528,
    rate: null,
    credit: null,
    note: "No matured segment yet",
  },
  {
    label: "One-Year S&P 500 Point-to-Point",
    value: 956.42,
    share: 0.0264,
    rate: null,
    credit: null,
    note: "No matured segment yet",
  },
  {
    label: "One-Year High-Cap Multi-Index Monthly Average",
    value: 474.44,
    share: 0.0131,
    rate: null,
    credit: null,
    note: "No matured segment yet",
  },
  {
    label: "One-Year Uncapped S&P 500 Point-to-Point",
    value: 239.11,
    share: 0.0066,
    rate: null,
    credit: null,
    note: "No matured segment yet",
  },
];
const insuranceValueHistory = [
  { label: "2025", accumulated: 17874.93, surrender: 1074.93 },
  { label: "2026", accumulated: 36206.51, surrender: 19406.51 },
  { label: "2027 proj.", accumulated: 51019.01, surrender: 34219.01, projected: true },
];
const rsuEvents = [
  { date: "Feb 20, 2026", vested: 666, net: 378, withheld: 288, taxes: 17351.35 },
  { date: "Nov 20, 2025", vested: 647, net: 407, withheld: 240, taxes: 22608.6 },
  { date: "Aug 20, 2025", vested: 623, net: 397, withheld: 226, taxes: 26661.06 },
  { date: "May 20, 2025", vested: 613, net: 359, withheld: 254, taxes: 20527.35 },
  { date: "Feb 20, 2025", vested: 592, net: 295, withheld: 297, taxes: 15422.06 },
];
const esppEvents = [
  { date: "Feb 25, 2026", shares: 200, discount: 2042.1 },
  { date: "Aug 25, 2025", shares: 241, discount: 24587.18 },
  { date: "Feb 25, 2025", shares: 691, discount: 25298.55 },
];
const holdingAnalysis = [
  {
    ticker: "RBLX",
    label: "Employer equity concentration",
    value: 193686.3,
    type: "Stock",
    quality: "Compensation-linked risk",
    trend: "Weak",
    priority: "Action now",
    order: 1,
    action: "Review / trim plan",
    tone: "high",
    note: "Largest single-name exposure and tied to employment income; recent 1Y return is deeply negative.",
    details: [
      "Why it matters: this is both your largest single-stock holding and connected to your employment income, so one company affects salary, equity compensation, and portfolio value at the same time.",
      "Trend means: Weak here means the loaded return data shows large recent underperformance, especially over 6M and 1Y.",
      "Action now means this is not just something to observe. It deserves a written rule because the position is financially large and personally concentrated.",
      "Next step: define a staged trim rule, such as selling a fixed percentage after each vest or when the position exceeds a chosen portfolio cap.",
    ],
  },
  {
    ticker: "NVDA",
    label: "AI / semiconductor leader",
    value: 59871,
    type: "Stock",
    quality: "High quality growth",
    trend: "Strong",
    priority: "Healthy / hold",
    order: 6,
    action: "Keep, size-watch",
    tone: "positive",
    note: "Strong recent momentum, but it adds to existing growth/tech exposure through QQQ and growth funds.",
    details: [
      "Why it matters: NVDA is a high-quality AI/semiconductor leader, but it is also a high-expectation stock where valuation and momentum can both reverse quickly.",
      "Trend means: Strong means recent 1M, 3M, 6M, and 1Y return data are positive and materially better than many other holdings.",
      "Healthy / hold means the current trend is good and there is no obvious reason to sell, but it is not automatically a recommendation to buy more.",
      "Next step: keep only if the position size stays within your individual-stock risk budget, especially because QQQ, FBGRX, FDSVX, and FNGS already include similar themes.",
    ],
  },
  {
    ticker: "FBGRX",
    label: "Large-cap growth fund",
    value: 77763.01,
    type: "Fund",
    quality: "Growth core",
    trend: "Strong",
    priority: "Watch closely",
    order: 4,
    action: "Keep, overlap-watch",
    tone: "watch",
    note: "Useful growth sleeve, but overlaps with QQQ, FDSVX, FNGS, NVDA, and GOOGL.",
    details: [
      "Why it matters: FBGRX can be a strong growth fund, but it may duplicate the same mega-cap growth exposure you already hold elsewhere.",
      "Trend means: Strong means the fund has positive recent returns across the loaded windows, not that it is automatically better than a cheaper index fund.",
      "Watch closely means the asset itself may be fine, but its role in the portfolio needs review because it overlaps with other growth holdings.",
      "Next step: compare FBGRX against QQQ and your S&P 500 funds; if it does not add a distinct role, it may be a consolidation candidate.",
    ],
  },
  {
    ticker: "VOO / SPY / FXAIX",
    label: "S&P 500 duplicates",
    value: 85501.02,
    type: "ETF / fund",
    quality: "Broad market core",
    trend: "Healthy",
    priority: "Cleanup",
    order: 5,
    action: "Consolidate candidates",
    tone: "neutral",
    note: "All three provide similar S&P 500 exposure; keeping all may not add much strategy value.",
    details: [
      "Why it matters: these are all broad US large-cap core exposures, so multiple tickers can make the dashboard look diversified while the underlying exposure is almost the same.",
      "Trend means: Healthy means broad-market return data is positive and stable relative to your weaker individual positions.",
      "Cleanup means this is not urgent risk, but simplifying it could make the portfolio easier to manage.",
      "Next step: pick one primary S&P 500 vehicle per account type unless there is a tax, fee, or account-specific reason to keep more than one.",
    ],
  },
  {
    ticker: "QQQ / FNGS",
    label: "Mega-cap tech tilt",
    value: 32625.71,
    type: "ETF / ETN",
    quality: "High growth beta",
    trend: "Strong",
    priority: "Watch closely",
    order: 2,
    action: "Watch overlap",
    tone: "watch",
    note: "Adds growth upside, but also stacks with FBGRX, FDSVX, NVDA, and GOOGL.",
    details: [
      "Why it matters: QQQ and FNGS increase exposure to the same mega-cap tech and growth factor that already drives a large part of the portfolio.",
      "Trend means: Strong means the recent price trend is good; it does not mean risk is low.",
      "Watch closely means the recent trend is strong, but several holdings can fall together because they are driven by similar growth, AI, and mega-cap tech assumptions.",
      "Next step: decide a maximum combined growth/tech allocation, then judge QQQ/FNGS together with FBGRX, FDSVX, NVDA, and GOOGL rather than one by one.",
    ],
  },
  {
    ticker: "DIS / SPGI / VMACX",
    label: "Recent laggards",
    value: 25185.23,
    type: "Mixed",
    quality: "Needs review",
    trend: "Lagging",
    priority: "Watch closely",
    order: 3,
    action: "Review thesis",
    tone: "watch",
    note: "Recent 3M/6M performance trails the stronger growth and broad-market positions.",
    details: [
      "Why it matters: weaker holdings are not always bad, but each one should have a clear reason to remain in the portfolio.",
      "Trend means: Lagging means the loaded return windows trail the stronger core and growth positions, with some negative recent periods.",
      "Watch closely means these are not the largest dangers, but they still deserve a clear reason to stay in the portfolio.",
      "Next step: write a one-line thesis for each holding. If the thesis is vague or duplicated by an ETF, it becomes a sell-or-replace candidate.",
    ],
  },
  {
    ticker: "Market data",
    label: marketDataConnected ? "Daily price data connected" : "Daily trend setup",
    value: 0,
    type: "Setup",
    quality: "Data infrastructure",
    trend: marketDataConnected ? "Connected" : "Not connected",
    priority: marketDataConnected ? "Data ready" : "Setup",
    order: 7,
    action: marketDataConnected ? "Refresh regularly" : "Add price feed next",
    tone: marketDataConnected ? "positive" : "setup",
    note: marketDataConnected
      ? "The dashboard now has daily price history for the tracked stocks and funds."
      : "This dashboard currently uses loaded snapshot returns. Daily trend and sector movement need an external price data source.",
    details: marketDataConnected
      ? [
          "Data ready means the local market-data file has been generated and the performance tables can use 1D, 1W, 1M, 3M, 6M, and 1Y market returns.",
          "Why it matters: daily stock and ETF movement can help separate normal volatility from a real trend break.",
          "Next step: refresh this data before each review. The IUL section still needs monthly statements rather than daily price data.",
        ]
      : [
          "What Setup means: this is not an investment risk by itself. It is an infrastructure item needed before the dashboard can monitor daily moves reliably.",
          "Why it matters: daily stock and ETF movement can help separate normal volatility from a real trend break.",
          "Next step: add a price history feed, store it locally, and update the scorecard from real daily data instead of static return snapshots.",
        ],
  },
];
const iulMonitorItems = [
  {
    label: "J.P. Morgan Mercury High Par",
    status: "Review",
    tone: "high",
    rate: "0.00%",
    value: "$23,313 · 64.4%",
    credit: "$0 credited",
    detail: "Largest allocation, but matured segments credited 0%. This should be the first strategy to review at the next allocation window.",
  },
  {
    label: "BNP Paribas Global H-Factor High Par",
    status: "Watch",
    tone: "watch",
    rate: "1.52%",
    value: "$6,754 · 18.7%",
    credit: "$47 credited",
    detail: "Generated some credit, but the rate and credited dollars are still modest relative to the allocation.",
  },
  {
    label: "Fixed strategy",
    status: "Keep as stabilizer",
    tone: "positive",
    rate: "4.08%",
    value: "$2,556 · 7.1%",
    credit: "$163 credited",
    detail: "Small allocation, but it produced most of the current-year credited interest.",
  },
  {
    label: "New / not matured segments",
    status: "Monitor monthly",
    tone: "neutral",
    rate: "N/A",
    value: "$3,583 · 9.9%",
    credit: "Not matured",
    detail: "These cannot be judged yet from credited return. Track when each segment matures before reallocating based on headline index movement.",
  },
];
const loadedAccountTypes = portfolio.accountTypes.filter((accountType) => accountType.value != null);
const accountTypeSlices = loadedAccountTypes
  .reduce((parts, accountType) => {
    const previous = parts.at(-1)?.end ?? 0;
    const end = previous + (accountType.value / portfolio.total) * 100;
    parts.push({ ...accountType, start: previous, end });
    return parts;
  }, []);
const channelGradient = accountTypeSlices
  .map((part) => `${part.color} ${part.start}% ${part.end}%`)
  .join(", ");
const channelDonut = document.querySelector("#channelDonut");
channelDonut.style.background = `conic-gradient(${channelGradient})`;
const channelTooltip = document.createElement("div");
channelTooltip.className = "channel-tooltip";
document.querySelector(".channel-layout").appendChild(channelTooltip);

function accountTypeAtPoint(event) {
  const rect = channelDonut.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  const distance = Math.hypot(x, y);
  if (distance < 40 || distance > rect.width / 2) return null;
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  const normalized = (angle + 450) % 360;
  const pctAtPoint = (normalized / 360) * 100;
  return accountTypeSlices.find((slice) => pctAtPoint >= slice.start && pctAtPoint < slice.end) ?? null;
}

function renderChannelTooltip(accountType, event) {
  const mix = portfolio.accountTypeMix.find((item) => item.accountType === accountType.label);
  channelTooltip.innerHTML = `
    <strong>${accountType.label}</strong>
    <span>${money(accountType.value)} · ${pct(accountType.value / portfolio.total)}</span>
    <small>${accountType.detail}</small>
    ${
      mix
        ? channelSegments
            .filter((segment) => mix[segment.key] > 0)
            .map(
              (segment) =>
                `<div><i style="--dot:${segment.color}"></i>${segment.label}<b>${money(mix[segment.key])}</b></div>`,
            )
            .join("")
        : ""
    }
  `;
  channelTooltip.classList.add("visible");
  channelTooltip.style.left = `${event.offsetX + 18}px`;
  channelTooltip.style.top = `${event.offsetY + 18}px`;
}

channelDonut.addEventListener("mousemove", (event) => {
  const accountType = accountTypeAtPoint(event);
  if (!accountType) {
    channelTooltip.classList.remove("visible");
    return;
  }
  renderChannelTooltip(accountType, event);
});
channelDonut.addEventListener("mouseleave", () => channelTooltip.classList.remove("visible"));
document.querySelector("#channelChart").innerHTML = `
  ${portfolio.accountTypes
    .map((accountType) => {
      const item = portfolio.accountTypeMix.find((mix) => mix.accountType === accountType.label);
      const total = item ? channelSegments.reduce((sum, segment) => sum + item[segment.key], 0) : null;
      return `
        <div class="channel-row ${total == null ? "pending" : ""}">
          <div class="channel-list-main">
            <div class="channel-label">
              <strong><i style="--dot:${accountType.color}"></i>${accountType.label}</strong>
              <span>${total == null ? "Not loaded yet" : pct(total / portfolio.total)}</span>
            </div>
            <small class="channel-detail">${accountType.detail}</small>
            ${
              item
                ? `<div class="channel-stack">
                    ${channelSegments
                      .filter((segment) => item[segment.key] > 0)
                      .map(
                        (segment) =>
                          `<div class="channel-segment" title="${segment.label}: ${money(item[segment.key])}" style="width:${(item[segment.key] / total) * 100}%;--segment-color:${segment.color}"></div>`,
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>
          <span>${total == null ? "Awaiting statement" : money(total)}</span>
        </div>
      `;
    })
    .join("")}
  <div class="channel-key">
    ${channelSegments.map((segment) => `<span style="--dot:${segment.color}">${segment.label}</span>`).join("")}
  </div>
`;

function returnCells(ticker) {
  const values = marketDataConnected
    ? marketWindows.map((window) => marketData.returns?.[ticker]?.[window] ?? null)
    : [null, null, ...performance[ticker].returns];
  return values
    .map((value) => `<span class="${value == null ? "muted" : value >= 0 ? "positive" : "negative"}">${value == null ? "—" : pct(value)}</span>`)
    .join("");
}

function personalReturnCell(ticker) {
  const item = personalReturns[ticker];
  if (!item) return `<span class="personal-return muted">—</span>`;
  const title = item.source ? `${item.source}; basis ${money(item.basis)}; not official tax basis` : `Basis ${money(item.basis)}`;
  return `<span class="personal-return ${item.returnPct >= 0 ? "positive" : "negative"}" title="${title}">${pct(item.returnPct)}<small>${item.gain >= 0 ? "+" : ""}${money(item.gain)}</small></span>`;
}

function marketLatestLine(ticker) {
  const latest = marketData.symbols?.[ticker]?.latest;
  if (!latest) return "";
  return `<small class="market-latest">${latest.date} · close ${money(latest.close)}</small>`;
}

document.querySelector("#stockList").innerHTML = `
  <div class="holding-table-head">
    <span>Holding</span>
    <span>Value</span>
    ${marketWindows.map((window) => `<span>${window}</span>`).join("")}
    <span>Personal</span>
  </div>
  ${[...portfolio.stocks]
  .sort((a, b) => b.value - a.value)
  .map(
    (item) => `
      <div class="holding-row performance-row">
        <div>
          <strong>${item.ticker}</strong>
          <div>${item.name}</div>
          ${marketLatestLine(item.ticker)}
        </div>
        <span>${money(item.value)} · ${pct(item.value / portfolio.total)}</span>
        ${returnCells(item.ticker)}
        ${personalReturnCell(item.ticker)}
      </div>
    `,
  )
  .join("")}
`;

document.querySelector("#fundList").innerHTML = `
  <div class="holding-table-head">
    <span>Holding</span>
    <span>Value</span>
    ${marketWindows.map((window) => `<span>${window}</span>`).join("")}
    <span>Personal</span>
  </div>
  ${[...portfolio.funds]
  .sort((a, b) => b[2] - a[2])
  .map(
    ([ticker, coverage, value]) => `
      <div class="holding-row performance-row">
        <div>
          <strong>${ticker}</strong>
          <div>${coverage}</div>
          ${marketLatestLine(ticker)}
        </div>
        <span>${money(value)} · ${pct(value / portfolio.total)}</span>
        ${returnCells(ticker)}
        ${personalReturnCell(ticker)}
      </div>
    `,
  )
  .join("")}
`;

document.querySelector("#overlapSignals").innerHTML = portfolio.overlaps
  .map(
    (item) => `
      <article class="overlap-card ${item.tone}">
        <span>${item.label}</span>
        <strong>${item.value ? `${money(item.value)} · ${pct(item.value / portfolio.total)}` : "Missing data"}</strong>
        <p>${item.note}</p>
      </article>
    `,
  )
  .join("");

document.querySelector("#fundRows").innerHTML = portfolio.funds
  .map(
    ([ticker, coverage, value, note]) => `
      <tr>
        <td>${ticker}</td>
        <td>${coverage}</td>
        <td>${money(value)}</td>
        <td>${pct(value / portfolio.total)}</td>
        <td>${note}</td>
      </tr>
    `,
  )
  .join("");

document.querySelector("#holdingsScorecard").innerHTML = holdingAnalysis
  .sort((a, b) => a.order - b.order)
  .map(
    (item, index) => `
      <details class="analysis-row ${item.tone}" ${index === 0 ? "open" : ""}>
        <summary>
          <div class="analysis-title-group">
            <strong>${item.ticker}</strong>
            <span>${item.label}</span>
          </div>
          <span class="analysis-type">${item.type}</span>
          <b class="analysis-status">${item.priority}</b>
          <em class="analysis-action">${item.action}</em>
        </summary>
        <div class="analysis-row-body">
          <div class="analysis-meta-grid">
            <div><span>Value</span><b>${item.value ? money(item.value) : "—"}</b></div>
            <div><span>Trend</span><b>${item.trend}</b></div>
            <div><span>Risk level</span><b>${item.priority}</b></div>
          </div>
          <p>${item.note}</p>
          <ul>
            ${item.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      </details>
    `,
  )
  .join("");

document.querySelector("#iulMonitor").innerHTML = iulMonitorItems
  .map(
    (item) => `
      <article class="iul-monitor-card ${item.tone}">
        <div>
          <h4>${item.label}</h4>
          <span>${item.status}</span>
        </div>
        <strong>${item.rate}</strong>
        <small>${item.value} · ${item.credit}</small>
        <p>${item.detail}</p>
      </article>
    `,
  )
  .join("");

document.querySelector("#rsuEventList").innerHTML = `
  <div class="equity-event-head">
    <span>Vest date</span>
    <span>Vested</span>
    <span>Tax shares</span>
    <span>Net</span>
    <span>Tax $</span>
  </div>
  ${rsuEvents
    .map(
      (item) => `
        <div class="equity-event-row">
          <span>${item.date}</span>
          <span>${item.vested}</span>
          <span>${item.withheld}</span>
          <span>${item.net}</span>
          <span>${money(item.taxes)}</span>
        </div>
      `,
    )
    .join("")}
`;

document.querySelector("#esppEventList").innerHTML = `
  <div class="equity-event-head espp">
    <span>Purchase date</span>
    <span>Shares</span>
    <span>Discount value</span>
  </div>
  ${esppEvents
    .map(
      (item) => `
        <div class="equity-event-row espp">
          <span>${item.date}</span>
          <span>${item.shares}</span>
          <span>${money(item.discount)}</span>
        </div>
      `,
    )
    .join("")}
`;

document.querySelector("#insuranceStrategies").innerHTML = insuranceStrategies
  .map(
    (item) => `
      <div class="insurance-strategy-row">
        <div>
          <strong>${item.label}</strong>
          <span>${money(item.value)} · ${pct(item.share)} of account</span>
        </div>
        <div class="insurance-track">
          <span style="width:${item.share * 100}%"></span>
        </div>
        <div class="insurance-rate ${item.rate == null ? "na" : item.rate > 0 ? "positive" : "flat"}">
          <b>${item.rate == null ? "N/A" : `${item.rate.toFixed(2)}%`}</b>
          <small>${item.rate == null ? "not matured" : item.rate > 0 ? "up" : "flat"}</small>
        </div>
        <div class="insurance-credit ${item.credit == null ? "na" : item.credit > 0 ? "positive" : "flat"}">
          <b>${item.credit == null ? "N/A" : `${item.credit > 0 ? "+" : ""}${money(item.credit)}`}</b>
          <small>${item.note}</small>
        </div>
      </div>
    `,
  )
  .join("");

function drawInsuranceValueChart() {
  const svg = document.querySelector("#insuranceValueChart");
  const width = 640;
  const height = 260;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const maxValue = Math.max(...insuranceValueHistory.map((point) => point.accumulated));
  const x = (index) =>
    left + (index / (insuranceValueHistory.length - 1)) * (width - left - right);
  const y = (value) => top + (1 - value / maxValue) * (height - top - bottom);
  const linePath = (key) =>
    insuranceValueHistory
      .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point[key])}`)
      .join(" ");
  const areaPath = (key) =>
    `${linePath(key)} L ${x(insuranceValueHistory.length - 1)} ${height - bottom} L ${x(0)} ${height - bottom} Z`;

  svg.innerHTML = `
    <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" class="insurance-axis" />
    <path d="${areaPath("accumulated")}" class="insurance-area accumulated" />
    <path d="${areaPath("surrender")}" class="insurance-area surrender" />
    <path d="${linePath("accumulated")}" class="insurance-line accumulated" />
    <path d="${linePath("surrender")}" class="insurance-line surrender" />
    ${insuranceValueHistory
      .map(
        (point, index) => `
          <g class="${point.projected ? "projected" : ""}">
            <circle cx="${x(index)}" cy="${y(point.accumulated)}" r="4" class="insurance-dot accumulated" />
            <circle cx="${x(index)}" cy="${y(point.surrender)}" r="4" class="insurance-dot surrender" />
            <text x="${x(index)}" y="${height - 10}" text-anchor="middle">${point.label}</text>
          </g>
        `,
      )
      .join("")}
    <text x="${left}" y="${y(maxValue) - 6}">${money(maxValue)}</text>
  `;
}

drawInsuranceValueChart();
