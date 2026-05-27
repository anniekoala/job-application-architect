import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = "/Users/agao/Documents/New project/outputs/investment_review_tracker/investment_health_report.xlsx";
const equityCsv = "/Users/agao/Downloads/EquityAwardsCenter_Transactions_20260517165138.csv";
const fidelityFiles = [
  "/Users/agao/Downloads/Statement1312026.csv",
  "/Users/agao/Downloads/Statement2282026.csv",
  "/Users/agao/Downloads/Statement3312026.csv",
  "/Users/agao/Downloads/Statement4302026.csv",
];
const robinhoodExtract = "/Users/agao/Documents/New project/outputs/investment_review_tracker/robinhood_extract.json";
const rblxPrice = 42.85;
const performanceSymbols = ["NVDA", "TSLA", "GOOGL", "DIS", "SPGI", "RBLX", "VOO", "SPY", "QQQ"];

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function parseCsvObjects(text) {
  const rows = parseCsvRows(text).filter((r) => r.some(Boolean));
  const headers = rows.shift();
  return rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

function num(v) {
  if (v == null || v === "") return null;
  const s = String(v).replace(/[$,]/g, "").trim();
  if (!s || s === "unavailable" || s === "not applicable") return null;
  return Number(s);
}

function stmtDate(filePath) {
  const m = filePath.match(/Statement(\d{1,2})(\d{2})(\d{4})\.csv$/);
  return `${m[1].padStart(2, "0")}/${m[2]}/${m[3]}`;
}

function parseFidelity(filePath, text) {
  const rows = parseCsvRows(text);
  const date = stmtDate(filePath);
  const accountTypes = new Map();
  const summary = [];
  for (const row of rows) {
    if (row[0] === "Symbol/CUSIP") break;
    if (row[0] && row[1] && row[0] !== "Account Type") {
      accountTypes.set(row[1].trim(), row[0].trim());
      summary.push({
        date,
        channel: "Fidelity",
        accountType: row[0].trim(),
        account: row[1].trim(),
        value: num(row[4]) ?? 0,
      });
    }
  }
  const positions = [];
  let account = "";
  let category = "";
  let inPositions = false;
  for (const row of rows) {
    const first = (row[0] ?? "").trim();
    if (first === "Symbol/CUSIP") {
      inPositions = true;
      continue;
    }
    if (!inPositions || !first) continue;
    if (row.filter((x) => String(x ?? "").trim()).length === 1) {
      if (accountTypes.has(first)) account = first;
      else if (["Stocks", "Mutual Funds", "Core Account"].includes(first)) category = first;
      continue;
    }
    if (first.startsWith("Subtotal of")) continue;
    if (account && category && row.length >= 7) {
      const symbol = first;
      const product =
        category === "Core Account" ? "Cash / money market" :
        category === "Mutual Funds" ? "Mutual fund" :
        ["VOO", "QQQ", "VOOV"].includes(symbol) ? "ETF" :
        symbol === "FNGS" ? "ETN" : "Individual stock";
      const type =
        category === "Core Account" ? "Cash" :
        product === "Individual stock" ? "Stock" : "Other financial product";
      const liquidity =
        accountTypes.get(account) === "Individual - TOD" ? (category === "Core Account" ? "Cash available" : "Sellable") :
        accountTypes.get(account)?.includes("IRA") ? "Retirement restricted" :
        accountTypes.get(account)?.includes("Health") ? "HSA restricted" : "Restricted/unknown";
      positions.push({
        date,
        channel: "Fidelity",
        accountType: accountTypes.get(account),
        account,
        symbol,
        name: (row[1] ?? "").trim(),
        type,
        product,
        liquidity,
        quantity: num(row[2]) ?? 0,
        price: num(row[3]) ?? 0,
        value: num(row[5]) ?? 0,
        cost: num(row[6]),
      });
    }
  }
  return { date, summary, positions };
}

function combineEquityRows(rows) {
  const combined = [];
  for (let i = 0; i < rows.length; ) {
    if (!rows[i].Date) {
      i++;
      continue;
    }
    const rec = { ...rows[i] };
    if (i + 1 < rows.length && !rows[i + 1].Date) {
      for (const [k, v] of Object.entries(rows[i + 1])) if (v) rec[k] = v;
      i += 2;
    } else {
      i++;
    }
    combined.push(rec);
  }
  return combined;
}

const fidelity = [];
for (const file of fidelityFiles) fidelity.push(parseFidelity(file, await fs.readFile(file, "utf8")));
const latestFidelity = fidelity.at(-1);
const robinhood = JSON.parse(await fs.readFile(robinhoodExtract, "utf8")).sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
const latestRobinhood = robinhood.at(-1);

const holdings = [
  ...latestFidelity.positions,
  ...latestRobinhood.positions.map((p) => ({
    date: latestRobinhood.end_date,
    channel: "Robinhood",
    accountType: "Individual",
    account: latestRobinhood.account,
    symbol: p.symbol,
    name: p.name,
    type: p.symbol === "SPY" ? "Other financial product" : "Stock",
    product: p.symbol === "SPY" ? "ETF" : "Individual stock",
    liquidity: "Sellable",
    quantity: p.quantity,
    price: p.price,
    value: p.market_value,
    cost: null,
  })),
  {
    date: "03/17/2026",
    channel: "Robinhood",
    accountType: "Individual",
    account: latestRobinhood.account,
    symbol: "CASH",
    name: "Brokerage cash balance",
    type: "Cash",
    product: "Brokerage cash",
    liquidity: "Cash available",
    quantity: null,
    price: null,
    value: latestRobinhood.closing_cash,
    cost: null,
  },
  {
    date: "03/17/2026",
    channel: "Nationwide",
    accountType: "Insurance Policy",
    account: "8000416809",
    symbol: "IUL",
    name: "Indexed Universal Life Accumulator II",
    type: "Other financial product",
    product: "Indexed universal life",
    liquidity: "Insurance restricted",
    quantity: null,
    price: null,
    value: 36206.51,
    cost: 44000,
  },
];

const total = holdings.reduce((s, h) => s + h.value, 0);
const byType = ["Stock", "Other financial product", "Cash"].map((type) => {
  const value = holdings.filter((h) => h.type === type).reduce((s, h) => s + h.value, 0);
  return [type, value, value / total];
});
const channels = ["Fidelity", "Robinhood", "Nationwide"].map((ch) => {
  const value = holdings.filter((h) => h.channel === ch).reduce((s, h) => s + h.value, 0);
  return [ch, value, value / total];
});
const byLiquidity = ["Cash available", "Sellable", "Retirement restricted", "HSA restricted", "Insurance restricted"].map((liquidity) => {
  const value = holdings.filter((h) => h.liquidity === liquidity).reduce((s, h) => s + h.value, 0);
  return [liquidity, value, value / total];
});
const consolidated = [...holdings.reduce((map, h) => {
  const key = h.symbol;
  const cur = map.get(key) ?? { symbol: h.symbol, name: h.name, type: h.type, product: h.product, value: 0, channels: new Set() };
  cur.value += h.value;
  cur.channels.add(h.channel);
  map.set(key, cur);
  return map;
}, new Map()).values()]
  .map((h) => [h.symbol, h.name, h.type, h.product, h.value, h.value / total, [...h.channels].join(", ")])
  .sort((a, b) => b[4] - a[4]);

const monthly = ["01/31/2026", "02/28/2026", "03/31/2026", "04/30/2026"].map((date) => {
  const f = fidelity.find((x) => x.date === date)?.summary.reduce((s, a) => s + a.value, 0) ?? 0;
  const r = robinhood.find((x) => x.end_date === date)?.closing_portfolio ?? 0;
  return [date, f, r, f + r];
});

const equityTx = combineEquityRows(parseCsvObjects(await fs.readFile(equityCsv, "utf8")));
const rsu = equityTx.filter((r) => r.Action === "Lapse").map((r) => {
  const shares = num(r.Quantity) ?? 0;
  const fmv = num(r.FairMarketValuePrice) ?? 0;
  return {
    year: Number((r.Date ?? "").split("/")[2]),
    shares,
    netShares: num(r.NetSharesDeposited) ?? 0,
    taxes: num(r.Taxes) ?? 0,
    gross: shares * fmv,
  };
});
const espp = equityTx.filter((r) => r.Action === "Deposit").map((r) => {
  const shares = num(r.Quantity) ?? 0;
  const purchase = num(r.PurchasePrice) ?? 0;
  const fmv = num(r.PurchaseFairMarketValue) ?? 0;
  return {
    year: Number((r.PurchaseDate || r.Date).split("/")[2]),
    shares,
    cost: shares * purchase,
    discount: shares * (fmv - purchase),
  };
});
const equityYears = [...new Set([...rsu.map((x) => x.year), ...espp.map((x) => x.year)])].sort();
const equityByYear = equityYears.map((year) => {
  const rsuGross = rsu.filter((x) => x.year === year).reduce((s, x) => s + x.gross, 0);
  const esppDiscount = espp.filter((x) => x.year === year).reduce((s, x) => s + x.discount, 0);
  return [year, rsuGross, esppDiscount, rsuGross + esppDiscount];
});

const cashAvailable = byLiquidity.find((x) => x[0] === "Cash available")[1];
const sellable = byLiquidity.find((x) => x[0] === "Sellable")[1];
const nvda = consolidated.find((x) => x[0] === "NVDA")?.[4] ?? 0;
const iul = holdings.find((h) => h.symbol === "IUL");
const rsuNetShares = rsu.reduce((s, x) => s + x.netShares, 0);
const esppShares = espp.reduce((s, x) => s + x.shares, 0);
const companyShares = rsuNetShares + esppShares;
const individualStocks = consolidated
  .filter((x) => x[2] === "Stock")
  .sort((a, b) => b[4] - a[4])
  .map((x) => [x[0], x[1], x[4], x[5], x[6]]);
const platformContentRows = [];
for (const channel of ["Fidelity", "Robinhood", "Nationwide"]) {
  for (const type of ["Stock", "Other financial product", "Cash"]) {
    const value = holdings.filter((h) => h.channel === channel && h.type === type).reduce((s, h) => s + h.value, 0);
    platformContentRows.push([channel, type, value, value / total]);
  }
}
const coverageMap = {
  VOO: ["US large-cap core", "S&P 500 ETF", "High overlap with SPY and FXAIX; also overlaps with large holdings inside QQQ/growth funds"],
  SPY: ["US large-cap core", "S&P 500 ETF", "High overlap with VOO and FXAIX"],
  FXAIX: ["US large-cap core", "S&P 500 index mutual fund", "High overlap with VOO and SPY"],
  QQQ: ["US large-cap growth / tech tilt", "Nasdaq-100 ETF", "Overlaps with mega-cap growth stocks and growth funds"],
  VOOV: ["US large-cap value tilt", "S&P 500 Value ETF", "Partial S&P 500 overlap; value tilt differs from QQQ/growth funds"],
  FNGS: ["Mega-cap tech concentration", "FANG+ style ETN", "Overlaps strongly with growth/tech names and single-stock tech exposure"],
  FBGRX: ["US large-cap growth", "Active growth mutual fund", "Likely overlaps with QQQ, NVDA/GOOGL, and broad large-cap funds"],
  FDSVX: ["US growth", "Active growth mutual fund", "Likely overlaps with large-cap growth exposure"],
  JAENX: ["US small/mid growth", "Active enterprise/growth mutual fund", "Some growth overlap; less direct than S&P 500 funds"],
  OBSOX: ["US small-cap growth", "Active small-cap opportunities fund", "Diversifies size, but still equity/growth risk"],
  VLIFX: ["US mid-cap", "Active mid-cap fund", "Diversifies size, but still US equity risk"],
  VMACX: ["US mid-cap core", "Active mid-cap fund", "Diversifies size, but still US equity risk"],
};
const fundCoverage = consolidated
  .filter((x) => x[3] !== "Individual stock" && x[0] !== "CASH" && x[0] !== "IUL")
  .map((x) => {
    const info = coverageMap[x[0]] ?? ["Other fund exposure", x[3], "Review underlying holdings if this becomes a large position"];
    return [x[0], x[1], info[0], info[1], x[4], x[5], info[2]];
  })
  .sort((a, b) => b[4] - a[4]);
const sp500Overlap = consolidated.filter((x) => ["VOO", "SPY", "FXAIX"].includes(x[0])).reduce((s, x) => s + x[4], 0);
const growthTechOverlap = consolidated.filter((x) => ["QQQ", "FBGRX", "FDSVX", "FNGS", "NVDA", "GOOGL"].includes(x[0])).reduce((s, x) => s + x[4], 0);
const singleStocksValue = individualStocks.reduce((s, x) => s + x[2], 0);
const overlapSignals = [
  ["S&P 500 duplication", sp500Overlap, sp500Overlap / total, "VOO + SPY + FXAIX all target broad US large-cap/S&P 500-like exposure.", "Could consolidate to one core index vehicle per account strategy."],
  ["Growth / tech stack", growthTechOverlap, growthTechOverlap / total, "QQQ, FBGRX, FDSVX, FNGS, NVDA, and GOOGL all lean toward growth/tech risk.", "Decide whether this is intentional or too much hidden concentration."],
  ["Individual stock sleeve", singleStocksValue, singleStocksValue / total, "Robinhood is mostly concentrated individual stocks.", "Consider an explicit cap for all individual stocks and for each single name."],
  ["Company equity unknown", 0, 0, "RBLX shares received through work are known historically but current shares are not confirmed.", "Add current Schwab/equity-awards position/sale history before final decisions."],
];

async function fetchYahooHistory(symbol) {
  const now = Math.floor(Date.now() / 1000);
  const start = now - 430 * 24 * 3600;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${start}&period2=${now}&interval=1d&events=history&includeAdjustedClose=true`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo history failed for ${symbol}: ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const adjusted = result?.indicators?.adjclose?.[0]?.adjclose ?? closes;
  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000),
    close: adjusted[i] ?? closes[i],
  })).filter((x) => Number.isFinite(x.close));
}

function priorClose(history, latestDate, months) {
  const target = new Date(latestDate);
  target.setMonth(target.getMonth() - months);
  let candidate = history[0];
  for (const row of history) {
    if (row.date <= target) candidate = row;
    else break;
  }
  return candidate;
}

const historiesBySymbol = new Map();
for (const symbol of performanceSymbols) {
  historiesBySymbol.set(symbol, await fetchYahooHistory(symbol));
}
const allHistoryDates = [...new Set([...historiesBySymbol.values()].flatMap((rows) =>
  rows.map((r) => r.date.toISOString().slice(0, 10))
))].sort();
const latestBySymbol = performanceSymbols.map((symbol) => {
  const hist = historiesBySymbol.get(symbol);
  const latest = hist.at(-1);
  const p1 = priorClose(hist, latest.date, 1);
  const p3 = priorClose(hist, latest.date, 3);
  const p6 = priorClose(hist, latest.date, 6);
  const p12 = priorClose(hist, latest.date, 12);
  return [
    symbol,
    latest.date,
    latest.close,
    latest.close / p1.close - 1,
    latest.close / p3.close - 1,
    latest.close / p6.close - 1,
    latest.close / p12.close - 1,
  ];
});

const wb = Workbook.create();
const health = wb.worksheets.add("Investment Health");
const strategy = wb.worksheets.add("Strategy Dashboard");
const performance = wb.worksheets.add("Stock Performance");
const allocation = wb.worksheets.add("Allocation Analysis");
const history = wb.worksheets.add("History");
const company = wb.worksheets.add("Company Equity");
const raw = wb.worksheets.add("Current Holdings");
for (const s of [health, strategy, performance, allocation, history, company, raw]) s.showGridLines = false;

const navy = "#12324A";
const blue = "#2364AA";
const green = "#1F7A4D";
const amber = "#FFF0C2";
const red = "#F8D7DA";
const pale = "#F5F7FA";
const paleBlue = "#EAF2FB";
const border = "#D8DEE9";
const text = "#1F2937";

function setW(sheet, widths) {
  widths.forEach((w, i) => sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = w);
}
function title(sheet, range, value) {
  const r = sheet.getRange(range);
  r.values = [[value]];
  r.merge();
  r.format.fill.color = navy;
  r.format.font.color = "#FFFFFF";
  r.format.font.bold = true;
  r.format.font.size = 18;
  r.format.rowHeightPx = 36;
  r.format.horizontalAlignment = "center";
}
function header(range) {
  range.format.fill.color = navy;
  range.format.font.color = "#FFFFFF";
  range.format.font.bold = true;
}
function moneyFmt(range) { range.format.numberFormat = "$#,##0;[Red]($#,##0);-"; }
function pctFmt(range) { range.format.numberFormat = "0.0%;[Red](0.0%);-"; }
function numFmt(range) { range.format.numberFormat = "#,##0;[Red](#,##0);-"; }

title(health, "A1:H1", "Investment Health Dashboard");
health.getRange("A3:B8").values = [
  ["Tracked investments", total],
  ["Stock exposure", byType[0][1]],
  ["Other products", byType[1][1]],
  ["Cash / cash-like", byType[2][1]],
  ["Immediately available cash", cashAvailable],
  ["Sellable taxable assets", sellable],
];
health.getRange("A3:A8").format.font.bold = true;
health.getRange("A3:B8").format.fill.color = pale;
health.getRange("A3:B8").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
moneyFmt(health.getRange("B3:B8"));

health.getRange("D3:H8").values = [
  ["Signal", "Status", "What it means", "Suggested review", "Priority"],
  ["Cash visible in investment accounts", cashAvailable / total < 0.02 ? "Low" : "OK", "Only cash inside loaded investment accounts is visible here; bank cash may be missing.", "Add bank/HYSA balances before deciding whether emergency cash is actually low.", "High"],
  ["Single-stock concentration", nvda / total > 0.15 ? "Watch" : "OK", `NVDA is the largest individual-stock position at ${(nvda / total * 100).toFixed(1)}% of tracked assets.`, "Consider a target max % for any one stock.", "Medium"],
  ["Company equity trail", "Missing current position", "RSU/ESPP history shows shares received, but loaded current holdings do not show RBLX.", "Add current Schwab/equity-awards positions or sale/transfer history.", "High"],
  ["Insurance product liquidity", "Restricted", "Nationwide IUL accumulated value is not the same as cash value after surrender charges.", "Review net surrender value, fees, and purpose with an insurance/tax advisor.", "Medium"],
  ["Diversification", "Mixed", "A large share is in broad funds, but Robinhood is heavily concentrated in NVDA plus a few names.", "Decide whether single stocks are intentional or legacy holdings.", "Medium"],
];
header(health.getRange("D3:H3"));
health.getRange("D4:H8").format.wrapText = true;
health.getRange("D3:H8").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
health.getRange("E4:E8").format.font.bold = true;
health.getRange("E4").format.fill.color = red;
health.getRange("E6").format.fill.color = red;
health.getRange("E5:E8").format.fill.color = amber;

health.getRange("A11:C14").values = [["Investment type", "Value", "%"], ...byType];
header(health.getRange("A11:C11"));
moneyFmt(health.getRange("B12:B14"));
pctFmt(health.getRange("C12:C14"));
health.getRange("A11:C14").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

health.getRange("E11:G14").values = [["Channel", "Value", "%"], ...channels];
header(health.getRange("E11:G11"));
moneyFmt(health.getRange("F12:F14"));
pctFmt(health.getRange("G12:G14"));
health.getRange("E11:G14").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

health.getRange("A17:H18").values = [
  ["How to read this", "This is an investment health report based on loaded statements, not a complete net-worth statement. Bank accounts, mortgage/debt, and any missing brokerages are not included.", "", "", "", "", "", ""],
  ["Decision frame", "Use this to decide what to review: cash adequacy, concentration risk, RBLX share trail, and whether insurance/retirement/taxable channels match your goals.", "", "", "", "", "", ""],
];
health.getRange("A17:A18").format.font.bold = true;
health.getRange("A17:H18").format.fill.color = paleBlue;
health.getRange("A17:H18").format.wrapText = true;

try {
  const typeChart = health.charts.add("Pie", health.getRange("A11:B14"), "Auto");
  typeChart.title = "Investment Type Mix";
  typeChart.setPosition(health.getRange("A21:C34"));
  typeChart.width = 330;
  typeChart.height = 250;
  const channelChart = health.charts.add("ColumnClustered", health.getRange("E11:F14"), "Auto");
  channelChart.title = "Channel Distribution";
  channelChart.setPosition(health.getRange("D21:H34"));
  channelChart.width = 520;
  channelChart.height = 250;
} catch {}
setW(health, [210, 140, 90, 170, 120, 310, 190, 85]);

title(strategy, "A1:H1", "Strategy Dashboard");
strategy.getRange("A3:H4").values = [
  ["Current Strategy Read", "Your loaded accounts currently look like a mixed portfolio: Fidelity holds core funds plus active/growth funds, Robinhood is a concentrated individual-stock sleeve, Nationwide is an insurance-linked product, and RBLX company equity is historically large but current shares are unconfirmed.", "", "", "", "", "", ""],
  ["Design Question", "A cleaner strategy could be: use selected accounts for broad index/core exposure, use one account as a deliberate individual-stock sleeve, and keep company equity under a separate sell/hold policy.", "", "", "", "", "", ""],
];
strategy.getRange("A3:A4").format.font.bold = true;
strategy.getRange("A3:H4").format.fill.color = paleBlue;
strategy.getRange("A3:H4").format.wrapText = true;

strategy.getRange("A7:E7").values = [["Individual stock", "Company", "Value", "% of tracked assets", "Channel"]];
header(strategy.getRange("A7:E7"));
strategy.getRange(`A8:E${7 + individualStocks.length}`).values = individualStocks;
moneyFmt(strategy.getRange(`C8:C${7 + individualStocks.length}`));
pctFmt(strategy.getRange(`D8:D${7 + individualStocks.length}`));
strategy.getRange(`A7:E${7 + individualStocks.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

strategy.getRange("G7:H11").values = [
  ["Suggested guardrail", "Why"],
  ["Single stock max", "Pick a target such as 5-10% per company."],
  ["All single stocks max", "Keeps satellite risk from quietly becoming the whole portfolio."],
  ["Company stock policy", "Treat RSU/ESPP separately from normal stock picking."],
  ["Rebalance trigger", "Review when any sleeve exceeds its target by a set amount."],
];
header(strategy.getRange("G7:H7"));
strategy.getRange("G8:H11").format.wrapText = true;
strategy.getRange("G7:H11").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

strategy.getRange("A16:D16").values = [["Platform", "Content type", "Value", "% of tracked assets"]];
header(strategy.getRange("A16:D16"));
strategy.getRange("A17:D25").values = platformContentRows;
moneyFmt(strategy.getRange("C17:C25"));
pctFmt(strategy.getRange("D17:D25"));
strategy.getRange("A16:D25").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

strategy.getRange("F16:H20").values = [
  ["Possible account role", "Current fit", "Consideration"],
  ["Fidelity", "Core + active funds", "Could become the main index/core account, then reduce redundant active/growth overlap if desired."],
  ["Robinhood", "Individual stocks", "Could become the intentional satellite account with a clear risk budget."],
  ["Nationwide", "Insurance-linked product", "Evaluate separately from ETF/fund allocation because liquidity and fees are different."],
  ["Schwab / Equity Awards", "Missing current view", "Needed before deciding RBLX company-stock policy."],
];
header(strategy.getRange("F16:H16"));
strategy.getRange("F17:H20").format.wrapText = true;
strategy.getRange("F16:H20").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

strategy.getRange("A29:G29").values = [["Fund / ETF", "Name", "Coverage", "Vehicle", "Value", "%", "Overlap note"]];
header(strategy.getRange("A29:G29"));
strategy.getRange(`A30:G${29 + fundCoverage.length}`).values = fundCoverage;
moneyFmt(strategy.getRange(`E30:E${29 + fundCoverage.length}`));
pctFmt(strategy.getRange(`F30:F${29 + fundCoverage.length}`));
strategy.getRange(`G30:G${29 + fundCoverage.length}`).format.wrapText = true;
strategy.getRange(`A29:G${29 + fundCoverage.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

const overlapStart = 33 + fundCoverage.length;
strategy.getRange(`A${overlapStart}:E${overlapStart}`).values = [["Overlap signal", "Value", "%", "Why it matters", "Potential action"]];
header(strategy.getRange(`A${overlapStart}:E${overlapStart}`));
strategy.getRange(`A${overlapStart + 1}:E${overlapStart + overlapSignals.length}`).values = overlapSignals;
moneyFmt(strategy.getRange(`B${overlapStart + 1}:B${overlapStart + overlapSignals.length}`));
pctFmt(strategy.getRange(`C${overlapStart + 1}:C${overlapStart + overlapSignals.length}`));
strategy.getRange(`D${overlapStart + 1}:E${overlapStart + overlapSignals.length}`).format.wrapText = true;
strategy.getRange(`A${overlapStart}:E${overlapStart + overlapSignals.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

try {
  const stockChart = strategy.charts.add("ColumnClustered", strategy.getRange(`A7:C${7 + Math.min(individualStocks.length, 6)}`), "Auto");
  stockChart.title = "Individual Stock Concentration";
  stockChart.setPosition(strategy.getRange("A47:D60"));
  stockChart.width = 430;
  stockChart.height = 260;
  const platformChart = strategy.charts.add("ColumnStacked", strategy.getRange("A16:C25"), "Auto");
  platformChart.title = "Platform Content Mix";
  platformChart.setPosition(strategy.getRange("E47:H60"));
  platformChart.width = 430;
  platformChart.height = 260;
} catch {}
setW(strategy, [110, 250, 130, 120, 160, 150, 210, 250]);

title(performance, "A1:H1", "Stock Performance");
performance.getRange("A3:B6").values = [
  ["Select ticker", performanceSymbols[0]],
  ["Latest price", null],
  ["Latest date", null],
  ["Source", "Yahoo Finance chart data"],
];
performance.getRange("B3").dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: performanceSymbols },
};
performance.getRange("B4:B5").formulas = [
  ["=XLOOKUP(B3,J4:J12,L4:L12)"],
  ["=XLOOKUP(B3,J4:J12,K4:K12)"],
];
performance.getRange("A3:A6").format.font.bold = true;
performance.getRange("A3:B6").format.fill.color = pale;
performance.getRange("A3:B6").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
performance.getRange("B4").format.numberFormat = "$0.00";

performance.getRange("D3:H4").values = [
  ["Performance window", "1M", "3M", "6M", "1Y"],
  ["Selected ticker return", null, null, null, null],
];
performance.getRange("E4:H4").formulas = [
  ["=XLOOKUP($B$3,$J$4:$J$12,$M$4:$M$12)", "=XLOOKUP($B$3,$J$4:$J$12,$N$4:$N$12)", "=XLOOKUP($B$3,$J$4:$J$12,$O$4:$O$12)", "=XLOOKUP($B$3,$J$4:$J$12,$P$4:$P$12)"],
];
header(performance.getRange("D3:H3"));
performance.getRange("D4").format.font.bold = true;
pctFmt(performance.getRange("E4:H4"));
performance.getRange("D3:H4").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

performance.getRange("J3:P3").values = [["Ticker", "Latest date", "Latest price", "1M", "3M", "6M", "1Y"]];
header(performance.getRange("J3:P3"));
performance.getRange("J4:P12").values = latestBySymbol;
performance.getRange("L4:L12").format.numberFormat = "$0.00";
pctFmt(performance.getRange("M4:P12"));
performance.getRange("J3:P12").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

performance.getRange("A9:B9").values = [["Date", "Selected close"]];
header(performance.getRange("A9:B9"));
const selectedRows = allHistoryDates.map((d, idx) => {
  const row = idx + 10;
  return [new Date(`${d}T00:00:00Z`), `=INDEX($JX${row}:$KH${row},1,MATCH($B$3,$JX$9:$KH$9,0))`];
});
performance.getRange(`A10:B${9 + selectedRows.length}`).values = selectedRows.map((r) => [r[0], null]);
performance.getRange(`B10:B${9 + selectedRows.length}`).formulas = selectedRows.map((r) => [r[1]]);
performance.getRange(`A10:A${9 + selectedRows.length}`).format.numberFormat = "yyyy-mm-dd";
performance.getRange(`B10:B${9 + selectedRows.length}`).format.numberFormat = "$0.00";
performance.getRange(`A9:B${9 + selectedRows.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

performance.getRange("JX9:KH9").values = [performanceSymbols];
const historyMatrix = allHistoryDates.map((d) => {
  const values = [];
  for (const symbol of performanceSymbols) {
    const byDate = historiesBySymbol.get(symbol);
    const found = byDate.find((x) => x.date.toISOString().slice(0, 10) === d);
    values.push(found?.close ?? null);
  }
  return values;
});
performance.getRange(`JX10:KH${9 + allHistoryDates.length}`).values = historyMatrix;
performance.getRange("JX:KH").format.columnWidthPx = 0;

performance.getRange("D7:H8").values = [
  ["How to use", "Use the dropdown in B3. The return cards and chart update to that ticker.", "", "", ""],
  ["Note", "This is price return from market data, not your personal gain/loss or tax-adjusted return.", "", "", ""],
];
performance.getRange("D7:D8").format.font.bold = true;
performance.getRange("D7:H8").format.fill.color = paleBlue;
performance.getRange("D7:H8").format.wrapText = true;

try {
  const perfChart = performance.charts.add("line", performance.getRange(`A9:B${9 + allHistoryDates.length}`), "Auto");
  perfChart.title = "Selected Ticker Price";
  perfChart.setPosition(performance.getRange("D10:H28"));
  perfChart.width = 600;
  perfChart.height = 330;
} catch {}
setW(performance, [120, 125, 24, 145, 95, 95, 95, 95, 30, 80, 105, 105, 80, 80, 80, 80]);

title(allocation, "A1:H1", "Allocation Analysis");
allocation.getRange("A3:G3").values = [["Symbol", "Name", "Type", "Product", "Value", "% of Total", "Channels"]];
header(allocation.getRange("A3:G3"));
allocation.getRange(`A4:G${3 + consolidated.length}`).values = consolidated;
moneyFmt(allocation.getRange(`E4:E${3 + consolidated.length}`));
pctFmt(allocation.getRange(`F4:F${3 + consolidated.length}`));
allocation.getRange(`A3:G${3 + consolidated.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
allocation.freezePanes.freezeRows(3);
setW(allocation, [80, 270, 150, 150, 130, 100, 170]);

title(history, "A1:H1", "Historical View");
history.getRange("A3:D3").values = [["Month end", "Fidelity", "Robinhood", "Brokerage total"]];
header(history.getRange("A3:D3"));
history.getRange("A4:D7").values = monthly;
moneyFmt(history.getRange("B4:D7"));
history.getRange("A10:D13").values = [["Liquidity bucket", "Value", "%", "Meaning"], ...byLiquidity.map((x) => [x[0], x[1], x[2], x[0] === "Cash available" ? "Available inside loaded investment accounts" : x[0]])];
header(history.getRange("A10:D10"));
moneyFmt(history.getRange("B11:B15"));
pctFmt(history.getRange("C11:C15"));
history.getRange("A3:D7").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
history.getRange("A10:D15").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
try {
  const trend = history.charts.add("line", history.getRange("A3:D7"), "Auto");
  trend.title = "Brokerage Total Trend";
  trend.setPosition(history.getRange("F3:H16"));
  trend.width = 420;
  trend.height = 260;
} catch {}
setW(history, [120, 130, 130, 150, 30, 150, 150, 150]);

title(company, "A1:H1", "Company Equity: RSU / ESPP");
company.getRange("A3:B11").values = [
  ["RBLX price used", rblxPrice],
  ["RSU net shares received", rsuNetShares],
  ["ESPP shares purchased", esppShares],
  ["Total company-channel shares received", companyShares],
  ["Estimated value if all still held", companyShares * rblxPrice],
  ["Current RBLX shares confirmed in loaded holdings", 0],
  ["Current RBLX value confirmed in loaded holdings", 0],
  ["RSU taxes withheld", rsu.reduce((s, x) => s + x.taxes, 0)],
  ["RSU gross vest value", rsu.reduce((s, x) => s + x.gross, 0)],
];
company.getRange("A3:A11").format.font.bold = true;
company.getRange("A3:B11").format.fill.color = pale;
company.getRange("A3:B11").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
company.getRange("B3").format.numberFormat = "$0.00";
numFmt(company.getRange("B4:B6"));
moneyFmt(company.getRange("B7:B9"));
moneyFmt(company.getRange("B10:B11"));
company.getRange("D3:G3").values = [["Year", "RSU gross vest", "ESPP discount", "Work-equity value"]];
header(company.getRange("D3:G3"));
company.getRange(`D4:G${3 + equityByYear.length}`).values = equityByYear;
moneyFmt(company.getRange(`E4:G${3 + equityByYear.length}`));
company.getRange(`D3:G${3 + equityByYear.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
company.getRange("A14:H15").values = [
  ["Important", "This page measures compensation shares received through work. It does not prove current RBLX shares still held without Schwab/equity-awards current-position or sale/transfer data.", "", "", "", "", "", ""],
  ["Next data needed", "Latest equity-awards current holdings plus any sale/transfer activity after shares were deposited.", "", "", "", "", "", ""],
];
company.getRange("A14:A15").format.font.bold = true;
company.getRange("A14:H15").format.fill.color = amber;
company.getRange("A14:H15").format.wrapText = true;
try {
  const eqChart = company.charts.add("ColumnClustered", company.getRange(`D3:G${3 + equityByYear.length}`), "Auto");
  eqChart.title = "Company Equity Value by Year";
  eqChart.setPosition(company.getRange("D18:H31"));
  eqChart.width = 520;
  eqChart.height = 260;
} catch {}
setW(company, [260, 170, 30, 110, 150, 140, 160, 130]);

title(raw, "A1:M1", "Current Holdings Detail");
raw.getRange("A3:M3").values = [["Channel", "Account type", "Account", "Symbol", "Name", "Type", "Product", "Liquidity", "Quantity", "Price", "Value", "Cost", "% of Total"]];
header(raw.getRange("A3:M3"));
raw.getRange(`A4:M${3 + holdings.length}`).values = holdings.map((h) => [
  h.channel, h.accountType, h.account, h.symbol, h.name, h.type, h.product, h.liquidity, h.quantity, h.price, h.value, h.cost, h.value / total,
]);
numFmt(raw.getRange(`I4:I${3 + holdings.length}`));
raw.getRange(`J4:J${3 + holdings.length}`).format.numberFormat = "$0.00";
moneyFmt(raw.getRange(`K4:L${3 + holdings.length}`));
pctFmt(raw.getRange(`M4:M${3 + holdings.length}`));
raw.getRange(`A3:M${3 + holdings.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
raw.freezePanes.freezeRows(3);
setW(raw, [110, 150, 110, 80, 260, 150, 150, 150, 100, 90, 120, 110, 90]);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula scan",
});
if (errors.ndjson && !errors.ndjson.includes("matched 0")) console.log(errors.ndjson);
for (const [sheetName, range] of [
  ["Investment Health", "A1:H34"],
  ["Strategy Dashboard", "A1:H60"],
  ["Stock Performance", "A1:H28"],
  ["Allocation Analysis", "A1:G25"],
  ["History", "A1:H16"],
  ["Company Equity", "A1:H31"],
  ["Current Holdings", "A1:M28"],
]) {
  await wb.render({ sheetName, range, scale: 1 });
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, total, cashAvailable, nvda, companyShares }, null, 2));
