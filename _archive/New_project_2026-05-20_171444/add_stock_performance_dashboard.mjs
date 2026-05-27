import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "/Users/agao/Documents/New project/outputs/investment_review_tracker/investment_health_report.xlsx";
const symbols = ["NVDA", "TSLA", "GOOGL", "DIS", "SPGI", "RBLX", "VOO", "SPY", "QQQ"];

async function fetchYahooHistory(symbol) {
  const now = Math.floor(Date.now() / 1000);
  const start = now - 430 * 24 * 3600;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${start}&period2=${now}&interval=1d&events=history&includeAdjustedClose=true`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo history failed for ${symbol}: ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.adjclose?.[0]?.adjclose ?? result?.indicators?.quote?.[0]?.close ?? [];
  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000),
    close: closes[i],
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

const histories = new Map();
for (const symbol of symbols) histories.set(symbol, await fetchYahooHistory(symbol));
const allDates = [...new Set([...histories.values()].flatMap((rows) =>
  rows.map((r) => r.date.toISOString().slice(0, 10))
))].sort();
const summaryRows = symbols.map((symbol) => {
  const history = histories.get(symbol);
  const latest = history.at(-1);
  return [
    symbol,
    latest.date,
    latest.close,
    latest.close / priorClose(history, latest.date, 1).close - 1,
    latest.close / priorClose(history, latest.date, 3).close - 1,
    latest.close / priorClose(history, latest.date, 6).close - 1,
    latest.close / priorClose(history, latest.date, 12).close - 1,
  ];
});

const file = await FileBlob.load(workbookPath);
const wb = await SpreadsheetFile.importXlsx(file);
try {
  wb.worksheets.getItem("Stock Performance").delete();
} catch {}
const sheet = wb.worksheets.add("Stock Performance");
sheet.showGridLines = false;

const navy = "#12324A";
const pale = "#F5F7FA";
const paleBlue = "#EAF2FB";
const border = "#D8DEE9";

function title(range, value) {
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
function pct(range) { range.format.numberFormat = "0.0%;[Red](0.0%);-"; }

title("A1:H1", "Stock Performance");
sheet.getRange("A3:B6").values = [
  ["Select ticker", symbols[0]],
  ["Latest price", null],
  ["Latest date", null],
  ["Source", "Yahoo Finance chart data"],
];
sheet.getRange("B3").dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: symbols },
};
sheet.getRange("B4:B5").formulas = [
  ["=XLOOKUP(B3,J4:J12,L4:L12)"],
  ["=XLOOKUP(B3,J4:J12,K4:K12)"],
];
sheet.getRange("A3:A6").format.font.bold = true;
sheet.getRange("A3:B6").format.fill.color = pale;
sheet.getRange("A3:B6").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
sheet.getRange("B4").format.numberFormat = "$0.00";
sheet.getRange("B5").format.numberFormat = "yyyy-mm-dd";

sheet.getRange("D3:H4").values = [
  ["Performance window", "1M", "3M", "6M", "1Y"],
  ["Selected ticker return", null, null, null, null],
];
sheet.getRange("E4:H4").formulas = [[
  "=XLOOKUP($B$3,$J$4:$J$12,$M$4:$M$12)",
  "=XLOOKUP($B$3,$J$4:$J$12,$N$4:$N$12)",
  "=XLOOKUP($B$3,$J$4:$J$12,$O$4:$O$12)",
  "=XLOOKUP($B$3,$J$4:$J$12,$P$4:$P$12)",
]];
header(sheet.getRange("D3:H3"));
sheet.getRange("D4").format.font.bold = true;
pct(sheet.getRange("E4:H4"));
sheet.getRange("D3:H4").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

sheet.getRange("D7:H8").values = [
  ["How to use", "Use the dropdown in B3. The return cards and chart update to that ticker.", "", "", ""],
  ["Note", "This is price return from market data, not your personal gain/loss or tax-adjusted return.", "", "", ""],
];
sheet.getRange("D7:D8").format.font.bold = true;
sheet.getRange("D7:H8").format.fill.color = paleBlue;
sheet.getRange("D7:H8").format.wrapText = true;

sheet.getRange("A10:B10").values = [["Date", "Selected close"]];
header(sheet.getRange("A10:B10"));
sheet.getRange(`A11:A${10 + allDates.length}`).values = allDates.map((d) => [new Date(`${d}T00:00:00Z`)]);
sheet.getRange(`B11:B${10 + allDates.length}`).formulas = allDates.map((_, idx) => {
  const row = idx + 11;
  return [`=INDEX($T${row}:$AB${row},1,MATCH($B$3,$T$10:$AB$10,0))`];
});
sheet.getRange(`A11:A${10 + allDates.length}`).format.numberFormat = "yyyy-mm-dd";
sheet.getRange(`B11:B${10 + allDates.length}`).format.numberFormat = "$0.00";
sheet.getRange(`A10:B${10 + allDates.length}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

sheet.getRange("J3:P3").values = [["Ticker", "Latest date", "Latest price", "1M", "3M", "6M", "1Y"]];
header(sheet.getRange("J3:P3"));
sheet.getRange("J4:P12").values = summaryRows;
sheet.getRange("K4:K12").format.numberFormat = "yyyy-mm-dd";
sheet.getRange("L4:L12").format.numberFormat = "$0.00";
pct(sheet.getRange("M4:P12"));
sheet.getRange("J3:P12").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

sheet.getRange("T10:AB10").values = [symbols];
const historyMatrix = allDates.map((d) => {
  return symbols.map((symbol) => {
    const found = histories.get(symbol).find((x) => x.date.toISOString().slice(0, 10) === d);
    return found?.close ?? null;
  });
});
sheet.getRange(`T11:AB${10 + allDates.length}`).values = historyMatrix;
sheet.getRange("T1:AB1").format.columnWidthPx = 0;

try {
  const chart = sheet.charts.add("line", sheet.getRange(`A10:B${10 + allDates.length}`), "Auto");
  chart.title = "Selected Ticker Price";
  chart.setPosition(sheet.getRange("D11:H29"));
  chart.width = 620;
  chart.height = 340;
} catch {}

[120, 125, 24, 145, 95, 95, 95, 95, 30, 80, 105, 105, 80, 80, 80, 80].forEach((width, i) => {
  sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = width;
});

await wb.render({ sheetName: "Stock Performance", range: "A1:H29", scale: 1 });
const output = await SpreadsheetFile.exportXlsx(wb);
await fs.mkdir(path.dirname(workbookPath), { recursive: true });
await output.save(workbookPath);
console.log(JSON.stringify({ workbookPath, symbols, rows: allDates.length }, null, 2));
