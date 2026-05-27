import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const csvPath = "/Users/agao/Downloads/EquityAwardsCenter_Transactions_20260517165138.csv";
const fidelityStatementPaths = [
  "/Users/agao/Downloads/Statement1312026.csv",
  "/Users/agao/Downloads/Statement2282026.csv",
  "/Users/agao/Downloads/Statement3312026.csv",
  "/Users/agao/Downloads/Statement4302026.csv",
];
const robinhoodExtractPath = "/Users/agao/Documents/New project/outputs/investment_review_tracker/robinhood_extract.json";
const outputPath = "/Users/agao/Documents/New project/outputs/investment_review_tracker/investment_review_tracker.xlsx";
const rblxPrice = 42.85;
const rblxPriceAsOf = "2026-05-15 official close / after-hours quote, FinancialContent";
const rblxPriceSource = "https://markets.financialcontent.com/stocks.wzab/quote?Symbol=NY%3ARBLX";

function parseCsv(text) {
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
  const headers = rows.shift();
  return rows.filter((r) => r.length && r.some(Boolean)).map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]))
  );
}

function parseCsvMatrix(text) {
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

function money(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[$,]/g, "").trim();
  if (!cleaned || cleaned === "--") return null;
  return Number(cleaned);
}

function num(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[$,]/g, "").trim();
  if (!cleaned || cleaned === "--") return null;
  return Number(cleaned);
}

function yearFromDate(mmddyyyy) {
  if (!mmddyyyy) return "";
  const parts = mmddyyyy.split("/");
  return Number(parts[2]);
}

function statementDateFromPath(filePath) {
  const match = filePath.match(/Statement(\d{1,2})(\d{2})(\d{4})\.csv$/);
  if (!match) return "";
  const [, month, day, year] = match;
  return `${month.padStart(2, "0")}/${day}/${year}`;
}

function accountTypeFromSummary(rows) {
  const map = new Map();
  for (const row of rows) {
    if (row[0] === "Symbol/CUSIP") break;
    if (row[0] && row[1] && row[0] !== "Account Type") {
      map.set(row[1].trim(), row[0].trim());
    }
  }
  return map;
}

function parseFidelityStatement(filePath, text) {
  const rows = parseCsvMatrix(text);
  const statementDate = statementDateFromPath(filePath);
  const accountTypes = accountTypeFromSummary(rows);
  const accountSummary = [];
  for (const row of rows) {
    if (row[0] === "Symbol/CUSIP") break;
    if (row[0] && row[1] && row[0] !== "Account Type") {
      accountSummary.push({
        statementDate,
        accountType: row[0].trim(),
        account: row[1].trim(),
        beginningValue: num(row[2]) ?? 0,
        changeInInvestment: num(row[3]) ?? 0,
        endingMarketValue: num(row[4]) ?? 0,
        endingNetValue: num(row[6]) ?? num(row[4]) ?? 0,
      });
    }
  }

  const positions = [];
  let currentAccount = "";
  let currentCategory = "";
  let inPositions = false;
  for (const row of rows) {
    const first = (row[0] ?? "").trim();
    if (first === "Symbol/CUSIP") {
      inPositions = true;
      continue;
    }
    if (!inPositions || !first) continue;
    if (row.filter((x) => String(x ?? "").trim()).length === 1) {
      if (accountTypes.has(first)) currentAccount = first;
      else if (["Stocks", "Mutual Funds", "Core Account"].includes(first)) currentCategory = first;
      continue;
    }
    if (first.startsWith("Subtotal of")) continue;
    if (row.length >= 7 && currentAccount && currentCategory) {
      positions.push({
        statementDate,
        account: currentAccount,
        accountType: accountTypes.get(currentAccount) ?? "",
        category: currentCategory,
        symbol: first,
        description: (row[1] ?? "").trim(),
        quantity: num(row[2]) ?? 0,
        price: num(row[3]) ?? 0,
        beginningValue: num(row[4]),
        endingValue: num(row[5]) ?? 0,
        costBasis: num(row[6]),
      });
    }
  }
  return { statementDate, accountSummary, positions };
}

function productType(position) {
  if (position.category === "Core Account") return "Money Market / Core Cash";
  if (["VOO", "QQQ", "VOOV"].includes(position.symbol)) return "ETF";
  if (position.symbol === "FNGS") return "Exchange-Traded Note";
  if (position.category === "Mutual Funds") return "Mutual Fund";
  return "Individual Stock";
}

function classification(position) {
  if (position.category === "Core Account") return "Cash";
  if (productType(position) === "Individual Stock") return "Stock";
  return "Other Financial Product";
}

function liquidity(position) {
  if (position.accountType === "Individual - TOD") {
    return position.category === "Core Account" ? "Cash available anytime" : "Sellable market asset";
  }
  if (position.accountType.includes("IRA")) return "Retirement/restricted";
  if (position.accountType.includes("Health Savings")) return "Restricted/HSA";
  return "Unknown";
}

function combineTransactionRows(rows) {
  const out = [];
  for (let i = 0; i < rows.length; ) {
    const row = rows[i];
    if (!row.Date) {
      i++;
      continue;
    }
    const rec = { ...row };
    if (i + 1 < rows.length && !rows[i + 1].Date) {
      for (const [key, value] of Object.entries(rows[i + 1])) {
        if (value !== "") rec[key] = value;
      }
      i += 2;
    } else {
      i++;
    }
    out.push(rec);
  }
  return out;
}

const csvText = await fs.readFile(csvPath, "utf8");
const transactions = combineTransactionRows(parseCsv(csvText));
const rsuRows = transactions
  .filter((r) => r.Action === "Lapse")
  .map((r) => {
    const sharesVested = num(r.Quantity) ?? 0;
    const fmv = money(r.FairMarketValuePrice) ?? 0;
    const netShares = num(r.NetSharesDeposited) ?? 0;
    const taxShares = num(r.SharesSoldWithheldForTaxes) ?? 0;
    const taxes = money(r.Taxes) ?? 0;
    const salePrice = money(r.SalePrice) ?? 0;
    return [
      r.Date,
      yearFromDate(r.Date),
      r.Symbol,
      r.AwardDate,
      r.AwardId,
      sharesVested,
      fmv,
      taxShares,
      netShares,
      taxes,
      sharesVested * fmv,
      netShares * fmv,
      salePrice,
      "EquityAwardsCenter CSV",
    ];
  });

const esppRows = transactions
  .filter((r) => r.Action === "Deposit")
  .map((r) => {
    const shares = num(r.Quantity) ?? 0;
    const purchasePrice = money(r.PurchasePrice) ?? 0;
    const subscriptionFmv = money(r.SubscriptionFairMarketValue) ?? 0;
    const purchaseFmv = money(r.PurchaseFairMarketValue) ?? 0;
    return [
      r.PurchaseDate || r.Date,
      yearFromDate(r.PurchaseDate || r.Date),
      r.Symbol,
      shares,
      purchasePrice,
      shares * purchasePrice,
      r.SubscriptionDate,
      subscriptionFmv,
      purchaseFmv,
      shares * (purchaseFmv - purchasePrice),
      rblxPrice,
      shares * rblxPrice,
      shares * (rblxPrice - purchasePrice),
      "EquityAwardsCenter CSV",
    ];
  });

const fidelityStatements = [];
for (const filePath of fidelityStatementPaths) {
  const text = await fs.readFile(filePath, "utf8");
  fidelityStatements.push(parseFidelityStatement(filePath, text));
}
const latestFidelity = fidelityStatements[fidelityStatements.length - 1];
const robinhoodStatements = JSON.parse(await fs.readFile(robinhoodExtractPath, "utf8"));
robinhoodStatements.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
const latestRobinhood = robinhoodStatements[robinhoodStatements.length - 1];
const fidelityHoldingRows = latestFidelity.positions.map((p) => [
  p.accountType,
  "Fidelity",
  p.symbol,
  p.description,
  classification(p),
  productType(p),
  liquidity(p),
  p.quantity,
  p.price,
  "",
  "",
  p.costBasis ?? "",
  "",
  `Account ${p.account}; statement ${p.statementDate}`,
]);
const robinhoodHoldingRows = [
  ...latestRobinhood.positions.map((p) => [
    "Individual",
    "Robinhood",
    p.symbol,
    p.name,
    p.symbol === "SPY" ? "Other Financial Product" : "Stock",
    p.symbol === "SPY" ? "ETF" : "Individual Stock",
    "Sellable market asset",
    p.quantity,
    p.price,
    "",
    "",
    "",
    "",
    `Account ${latestRobinhood.account}; statement ${latestRobinhood.end_date}`,
  ]),
  [
    "Individual",
    "Robinhood",
    "",
    "Brokerage Cash Balance",
    "Cash",
    "Brokerage Cash",
    "Cash available anytime",
    "",
    "",
    latestRobinhood.closing_cash,
    "",
    "",
    "",
    `Account ${latestRobinhood.account}; statement ${latestRobinhood.end_date}`,
  ],
];
const accountHistoryRows = [
  ...fidelityStatements.flatMap((s) =>
  s.accountSummary.map((a) => [
    a.statementDate,
    a.accountType,
    a.account,
    a.beginningValue,
    a.changeInInvestment,
    a.endingMarketValue,
    a.endingNetValue,
  ])
  ),
  ...robinhoodStatements.map((s) => [
    s.end_date,
    "Individual",
    s.account,
    s.opening_portfolio,
    s.closing_portfolio - s.opening_portfolio,
    s.closing_securities,
    s.closing_portfolio,
  ]),
  ["03/17/2025", "Insurance Policy", "8000416809", 0, 17874.93, 17874.93, 1074.93],
  ["03/17/2026", "Insurance Policy", "8000416809", 17874.93, 18331.58, 36206.51, 19406.51],
];

const iulRows = [[
  "Insurance Policy",
  "Nationwide",
  "",
  "Nationwide Indexed Universal Life Accumulator II 2020",
  "Other Financial Product",
  "Indexed Universal Life Insurance",
  "Insurance surrender value / restricted",
  "",
  "",
  36206.51,
  "",
  44000,
  "",
  "Policy 8000416809; statement period 03/18/2025-03/17/2026; net surrender value $19,406.51 after $16,800 surrender charge",
]];

const initialHoldingRows = [...fidelityHoldingRows, ...robinhoodHoldingRows, ...iulRows];

const years = [...new Set([...rsuRows.map((r) => r[1]), ...esppRows.map((r) => r[1])])]
  .filter(Boolean)
  .sort((a, b) => a - b);

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Portfolio Dashboard");
const equityDashboard = workbook.worksheets.add("Company Equity Dashboard");
const holdings = workbook.worksheets.add("Holdings");
const accountHistory = workbook.worksheets.add("Account History");
const rsu = workbook.worksheets.add("RSU Detail");
const espp = workbook.worksheets.add("ESPP Detail");
const sources = workbook.worksheets.add("Sources & Next Steps");

for (const sheet of [dashboard, equityDashboard, holdings, accountHistory, rsu, espp, sources]) {
  sheet.showGridLines = false;
}

const navy = "#17324D";
const blue = "#1F6FEB";
const paleBlue = "#EAF2FB";
const green = "#1F7A4D";
const paleGreen = "#EAF7F0";
const amber = "#FFF3CD";
const gray = "#F5F7FA";
const border = "#D8DEE9";
const text = "#1F2937";

function styleTitle(sheet, range, title) {
  const r = sheet.getRange(range);
  r.values = [[title]];
  r.merge();
  r.format.fill.color = navy;
  r.format.font.color = "#FFFFFF";
  r.format.font.bold = true;
  r.format.font.size = 18;
  r.format.rowHeightPx = 34;
  r.format.horizontalAlignment = "center";
}

function styleHeader(range) {
  range.format.fill.color = navy;
  range.format.font.color = "#FFFFFF";
  range.format.font.bold = true;
  range.format.wrapText = true;
  range.format.verticalAlignment = "middle";
}

function styleSubheader(range) {
  range.format.fill.color = paleBlue;
  range.format.font.bold = true;
  range.format.font.color = text;
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

function formatMoney(range) {
  range.format.numberFormat = "$#,##0;[Red]($#,##0);-";
}

function formatPrice(range) {
  range.format.numberFormat = "$0.00;[Red]($0.00);-";
}

function formatNumber(range) {
  range.format.numberFormat = "#,##0;[Red](#,##0);-";
}

function formatPercent(range) {
  range.format.numberFormat = "0.0%;[Red](0.0%);-";
}

styleTitle(dashboard, "A1:H1", "Portfolio Dashboard");
dashboard.getRange("A3:A9").values = [
  ["Total current holdings tracked"],
  ["Stock holdings"],
  ["Other financial products"],
  ["Cash / cash-like total"],
  ["Cash available anytime"],
  ["Company stock in current holdings"],
  ["Company stock concentration"],
];
dashboard.getRange("B3:B9").formulas = [
  ["=SUM(Holdings!K9:K208)"],
  ['=SUMIFS(Holdings!K9:K208,Holdings!E9:E208,"Stock")+SUMIFS(Holdings!K9:K208,Holdings!E9:E208,"Company Stock")'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!E9:E208,"Other Financial Product")'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!E9:E208,"Cash")'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Cash available anytime")'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!E9:E208,"Company Stock")'],
  ['=IF(B3=0,"",B8/B3)'],
];
dashboard.getRange("A3:A9").format.font.bold = true;
dashboard.getRange("A3:B9").format.fill.color = gray;
dashboard.getRange("A3:B9").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
formatMoney(dashboard.getRange("B3:B8"));
formatPercent(dashboard.getRange("B9"));

dashboard.getRange("D3:F6").values = [
  ["Investment Type", "Value", "% of Total"],
  ["Stock", null, null],
  ["Other financial product", null, null],
  ["Cash / cash-like", null, null],
];
dashboard.getRange("E4:F6").formulas = [
  ["=$B$4", '=IF($B$3=0,"",E4/$B$3)'],
  ["=$B$5", '=IF($B$3=0,"",E5/$B$3)'],
  ["=$B$6", '=IF($B$3=0,"",E6/$B$3)'],
];
styleHeader(dashboard.getRange("D3:F3"));
formatMoney(dashboard.getRange("E4:E6"));
formatPercent(dashboard.getRange("F4:F6"));
dashboard.getRange("D3:F6").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

dashboard.getRange("A12:D16").values = [
  ["Channel", "Value", "% of Total", "What is included"],
  ["Fidelity", null, null, "Brokerage, IRA, HSA positions from latest Fidelity statement"],
  ["Robinhood", null, null, "Taxable brokerage positions from latest Robinhood statement"],
  ["Nationwide", null, null, "Indexed universal life accumulated value"],
  ["Manual / Missing", null, null, "Rows you add later in Holdings"],
];
dashboard.getRange("B13:C16").formulas = [
  ['=SUMIFS(Holdings!K9:K208,Holdings!B9:B208,"Fidelity")', '=IF($B$3=0,"",B13/$B$3)'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!B9:B208,"Robinhood")', '=IF($B$3=0,"",B14/$B$3)'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!B9:B208,"Nationwide")', '=IF($B$3=0,"",B15/$B$3)'],
  ['=$B$3-SUM(B13:B15)', '=IF($B$3=0,"",B16/$B$3)'],
];
styleHeader(dashboard.getRange("A12:D12"));
formatMoney(dashboard.getRange("B13:B16"));
formatPercent(dashboard.getRange("C13:C16"));
dashboard.getRange("D13:D16").format.wrapText = true;
dashboard.getRange("A12:D16").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

dashboard.getRange("F12:H16").values = [
  ["Liquidity", "Value", "% of Total"],
  ["Cash available anytime", null, null],
  ["Sellable market asset", null, null],
  ["Retirement / HSA / insurance restricted", null, null],
  ["Unknown", null, null],
];
dashboard.getRange("G13:H16").formulas = [
  ['=SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Cash available anytime")', '=IF($B$3=0,"",G13/$B$3)'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Sellable market asset")', '=IF($B$3=0,"",G14/$B$3)'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Retirement/restricted")+SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Restricted/HSA")+SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Insurance surrender value / restricted")', '=IF($B$3=0,"",G15/$B$3)'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!G9:G208,"Unknown")', '=IF($B$3=0,"",G16/$B$3)'],
];
styleHeader(dashboard.getRange("F12:H12"));
formatMoney(dashboard.getRange("G13:G16"));
formatPercent(dashboard.getRange("H13:H16"));
dashboard.getRange("F12:H16").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

dashboard.getRange("A19:H20").values = [
  ["Read this first", "This dashboard only reflects statements/files currently loaded: Fidelity, Robinhood, Nationwide, and equity-awards history. Bank accounts or other brokerages not uploaded yet are not included.", "", "", "", "", "", ""],
  ["Missing piece", "The RSU/ESPP files show shares received from Roblox, but not whether those shares are still held today. Add the latest Schwab/equity-awards current-position statement to confirm current RBLX holdings.", "", "", "", "", "", ""],
];
dashboard.getRange("A19:A20").format.font.bold = true;
dashboard.getRange("A19:H20").format.fill.color = amber;
dashboard.getRange("A19:H20").format.wrapText = true;

try {
  const typeChart = dashboard.charts.add("Pie", dashboard.getRange("D3:E6"), "Auto");
  typeChart.title = "Investment Type Mix";
  typeChart.setPosition(dashboard.getRange("A23:C36"));
  typeChart.width = 330;
  typeChart.height = 250;
  typeChart.hasLegend = true;

  const channelChart = dashboard.charts.add("ColumnClustered", dashboard.getRange("A12:B16"), "Auto");
  channelChart.title = "Channel Distribution";
  channelChart.setPosition(dashboard.getRange("D23:H36"));
  channelChart.width = 520;
  channelChart.height = 250;
  channelChart.yAxis = { title: { text: "USD" }, majorGridlines: { fill: "#E5E7EB", style: "solid", width: 1 } };
} catch {
  // Charts are helpful but not critical to the workbook's calculations.
}
setWidths(dashboard, [190, 150, 100, 250, 140, 220, 145, 110]);

styleTitle(equityDashboard, "A1:H1", "Company Equity Dashboard");
equityDashboard.getRange("A3:A13").values = [
  ["Current RBLX price"],
  ["Price as of"],
  ["RSU gross vest value"],
  ["RSU taxes withheld"],
  ["RSU net shares received"],
  ["ESPP shares purchased"],
  ["Total company-channel shares received"],
  ["Estimated value if all received shares still held"],
  ["Current RBLX shares confirmed in holdings"],
  ["Current RBLX value confirmed in holdings"],
  ["Unconfirmed / missing share trail"],
];
equityDashboard.getRange("B3:B13").values = [
  [rblxPrice],
  [rblxPriceAsOf],
  [null],
  [null],
  [null],
  [null],
  [null],
  [null],
  [null],
  [null],
  ["Need latest Schwab/equity-awards position or transaction export showing sales/transfers/current shares."],
];
equityDashboard.getRange("B5:B12").formulas = [
  ["=SUM('RSU Detail'!K2:K500)"],
  ["=SUM('RSU Detail'!J2:J500)"],
  ["=SUM('RSU Detail'!I2:I500)"],
  ["=SUM('ESPP Detail'!D2:D200)"],
  ["=B7+B8"],
  ["=B9*B3"],
  ['=SUMIFS(Holdings!H9:H208,Holdings!C9:C208,"RBLX")'],
  ['=SUMIFS(Holdings!K9:K208,Holdings!C9:C208,"RBLX")'],
];
equityDashboard.getRange("A3:A13").format.font.bold = true;
equityDashboard.getRange("B3").format.font.color = blue;
equityDashboard.getRange("B3").format.fill.color = amber;
formatPrice(equityDashboard.getRange("B3"));
formatMoney(equityDashboard.getRange("B5:B6"));
formatNumber(equityDashboard.getRange("B7:B9"));
formatMoney(equityDashboard.getRange("B10"));
formatNumber(equityDashboard.getRange("B11"));
formatMoney(equityDashboard.getRange("B12"));
equityDashboard.getRange("A3:B13").format.fill.color = gray;
equityDashboard.getRange("B13").format.wrapText = true;
equityDashboard.getRange("A3:B13").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

equityDashboard.getRange("D3:F6").values = [
  ["Company Channel", "Shares Received", "Est. Value at Current RBLX Price"],
  ["RSU net shares", null, null],
  ["ESPP purchased shares", null, null],
  ["Total received", null, null],
];
equityDashboard.getRange("E4:F6").formulas = [
  ["=$B$7", "=E4*$B$3"],
  ["=$B$8", "=E5*$B$3"],
  ["=$B$9", "=E6*$B$3"],
];
styleHeader(equityDashboard.getRange("D3:F3"));
formatNumber(equityDashboard.getRange("E4:E6"));
formatMoney(equityDashboard.getRange("F4:F6"));
equityDashboard.getRange("D3:F6").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });

equityDashboard.getRange("D9:G9").values = [["Year", "RSU Gross Vest Value", "ESPP Discount Value", "Total Work-Equity Value"]];
styleHeader(equityDashboard.getRange("D9:G9"));
if (years.length) {
  equityDashboard.getRange(`D10:D${9 + years.length}`).values = years.map((y) => [y]);
  equityDashboard.getRange(`E10:G${9 + years.length}`).formulas = years.map((_, idx) => {
    const row = 10 + idx;
    return [
      `=SUMIF('RSU Detail'!B:B,D${row},'RSU Detail'!K:K)`,
      `=SUMIF('ESPP Detail'!B:B,D${row},'ESPP Detail'!J:J)`,
      `=E${row}+F${row}`,
    ];
  });
  formatMoney(equityDashboard.getRange(`E10:G${9 + years.length}`));
}

equityDashboard.getRange("A16:H17").values = [
  ["Important distinction", "RSU net shares + ESPP purchased shares means shares received through work. It is not the same as shares currently held unless we also have complete sale/transfer/current-position data.", "", "", "", "", "", ""],
  ["Current status", "The loaded current holdings statements do not show RBLX as currently held. That does not prove you hold zero RBLX; it means the current RBLX position file is still missing from this workbook.", "", "", "", "", "", ""],
];
equityDashboard.getRange("A16:A17").format.font.bold = true;
equityDashboard.getRange("A16:H17").format.fill.color = amber;
equityDashboard.getRange("A16:H17").format.wrapText = true;

try {
  const shareChart = equityDashboard.charts.add("Pie", equityDashboard.getRange("D3:E5"), "Auto");
  shareChart.title = "Company Shares Received";
  shareChart.setPosition(equityDashboard.getRange("A20:C33"));
  shareChart.width = 330;
  shareChart.height = 250;
  shareChart.hasLegend = true;

  const yearChart = equityDashboard.charts.add("ColumnClustered", equityDashboard.getRange(`D9:G${Math.max(10, 9 + years.length)}`), "Auto");
  yearChart.title = "RSU and ESPP Value by Year";
  yearChart.setPosition(equityDashboard.getRange("D20:H33"));
  yearChart.width = 520;
  yearChart.height = 250;
  yearChart.yAxis = { title: { text: "USD" }, majorGridlines: { fill: "#E5E7EB", style: "solid", width: 1 } };
} catch {
  // Charts are helpful but not critical to the workbook's calculations.
}
setWidths(equityDashboard, [235, 185, 24, 200, 145, 175, 170, 120]);

styleTitle(holdings, "A1:N1", "Current Holdings Inventory");
holdings.getRange("A3:N5").values = [
  ["Purpose", "Paste or enter every position/account balance here. This is the source for stock vs other financial products vs cash percentages.", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["Input rule", "Use Manual Market Value for cash, bank balances, and positions where quantity x price is not useful. Otherwise use Quantity and Current Price.", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["Note", "Add brokerage/account position exports here later and I can reconcile this automatically.", "", "", "", "", "", "", "", "", "", "", "", ""],
];
holdings.getRange("A3:A5").format.font.bold = true;
holdings.getRange("A3:N5").format.fill.color = paleGreen;
holdings.getRange("A8:N8").values = [[
  "Account",
  "Institution",
  "Symbol",
  "Asset Name",
  "Classification",
  "Product Type",
  "Liquidity",
  "Quantity",
  "Current Price",
  "Manual Market Value",
  "Market Value",
  "Cost Basis",
  "Unrealized Gain/Loss",
  "Notes",
]];
styleHeader(holdings.getRange("A8:N8"));
if (initialHoldingRows.length) {
  holdings.getRange(`A9:N${8 + initialHoldingRows.length}`).values = initialHoldingRows;
}
holdings.getRange("K9:K208").formulas = Array.from({ length: 200 }, (_, i) => {
  const row = i + 9;
  return [`=IF(OR(H${row}<>"",I${row}<>"",J${row}<>""),IF(J${row}<>"",J${row},H${row}*I${row}),"")`];
});
holdings.getRange("M9:M208").formulas = Array.from({ length: 200 }, (_, i) => {
  const row = i + 9;
  return [`=IF(AND(K${row}<>"",L${row}<>""),K${row}-L${row},"")`];
});
holdings.getRange("E9:E208").dataValidation = {
  allowBlank: true,
  list: { inCellDropDown: true, source: ["Company Stock", "Stock", "Other Financial Product", "Cash"] },
};
holdings.getRange("G9:G208").dataValidation = {
  allowBlank: true,
  list: { inCellDropDown: true, source: ["Cash available anytime", "Sellable market asset", "Retirement/restricted", "Vesting/locked", "Unknown"] },
};
holdings.getRange("A8:N208").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
holdings.getRange("A9:G208").format.font.color = blue;
holdings.getRange("H9:J208").format.font.color = blue;
holdings.getRange("L9:L208").format.font.color = blue;
formatNumber(holdings.getRange("H9:H208"));
formatPrice(holdings.getRange("I9:I208"));
formatMoney(holdings.getRange("J9:M208"));
holdings.freezePanes.freezeRows(8);
setWidths(holdings, [120, 140, 90, 190, 160, 170, 165, 95, 100, 140, 130, 120, 140, 260]);

styleTitle(accountHistory, "A1:G1", "Account Value History");
accountHistory.getRange("A3:G3").values = [[
  "Statement Date",
  "Account Type",
  "Account",
  "Beginning Market Value",
  "Change in Investment",
  "Ending Market Value",
  "Ending Net Value",
]];
styleHeader(accountHistory.getRange("A3:G3"));
if (accountHistoryRows.length) {
  accountHistory.getRange(`A4:G${3 + accountHistoryRows.length}`).values = accountHistoryRows;
}
accountHistory.getRange(`A3:G${Math.max(4, 3 + accountHistoryRows.length)}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
formatMoney(accountHistory.getRange(`D4:G${3 + accountHistoryRows.length}`));
accountHistory.freezePanes.freezeRows(3);
setWidths(accountHistory, [115, 160, 120, 160, 150, 150, 140]);

styleTitle(rsu, "A1:N1", "RSU Vest / Lapse Detail");
rsu.getRange("A2:N2").values = [[
  "Vest Date",
  "Vest Year",
  "Symbol",
  "Award Date",
  "Award ID",
  "Shares Vested",
  "Vest FMV",
  "Tax Shares Sold/Withheld",
  "Net Shares Deposited",
  "Taxes Withheld",
  "Gross Vest Value",
  "Net Share Value at Vest",
  "Tax Sale Price",
  "Source",
]];
styleHeader(rsu.getRange("A2:N2"));
if (rsuRows.length) {
  rsu.getRange(`A3:N${2 + rsuRows.length}`).values = rsuRows;
}
rsu.getRange(`A2:N${Math.max(3, 2 + rsuRows.length)}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
formatNumber(rsu.getRange(`F3:F${2 + rsuRows.length}`));
formatPrice(rsu.getRange(`G3:G${2 + rsuRows.length}`));
formatNumber(rsu.getRange(`H3:I${2 + rsuRows.length}`));
formatMoney(rsu.getRange(`J3:L${2 + rsuRows.length}`));
formatPrice(rsu.getRange(`M3:M${2 + rsuRows.length}`));
rsu.freezePanes.freezeRows(2);
setWidths(rsu, [100, 80, 70, 100, 90, 110, 90, 140, 135, 125, 130, 145, 100, 170]);

styleTitle(espp, "A1:N1", "ESPP Purchase Detail");
espp.getRange("A2:N2").values = [[
  "Purchase Date",
  "Purchase Year",
  "Symbol",
  "Shares Purchased",
  "Purchase Price",
  "Employee Cost",
  "Subscription Date",
  "Subscription FMV",
  "Purchase FMV",
  "Built-in Discount Value",
  "Current RBLX Price",
  "Est. Current Value If Held",
  "Est. Gain/Loss vs Cost If Held",
  "Source",
]];
styleHeader(espp.getRange("A2:N2"));
if (esppRows.length) {
  espp.getRange(`A3:N${2 + esppRows.length}`).values = esppRows;
}
espp.getRange(`K3:K${2 + esppRows.length}`).formulas = esppRows.map(() => ["='Company Equity Dashboard'!$B$3"]);
espp.getRange(`L3:M${2 + esppRows.length}`).formulas = esppRows.map((_, i) => {
  const row = i + 3;
  return [`=D${row}*K${row}`, `=L${row}-F${row}`];
});
espp.getRange(`A2:N${Math.max(3, 2 + esppRows.length)}`).format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
formatNumber(espp.getRange(`D3:D${2 + esppRows.length}`));
formatPrice(espp.getRange(`E3:E${2 + esppRows.length}`));
formatMoney(espp.getRange(`F3:F${2 + esppRows.length}`));
formatPrice(espp.getRange(`H3:I${2 + esppRows.length}`));
formatMoney(espp.getRange(`J3:J${2 + esppRows.length}`));
formatPrice(espp.getRange(`K3:K${2 + esppRows.length}`));
formatMoney(espp.getRange(`L3:M${2 + esppRows.length}`));
espp.freezePanes.freezeRows(2);
setWidths(espp, [110, 90, 70, 120, 105, 115, 120, 120, 105, 150, 120, 150, 170, 170]);

styleTitle(sources, "A1:F1", "Sources, Assumptions, and Next Steps");
sources.getRange("A3:F3").values = [["Item", "Value", "Units", "As of / Period", "Source", "Notes"]];
styleHeader(sources.getRange("A3:F3"));
sources.getRange("A4:F13").values = [
  ["RBLX current price input", rblxPrice, "USD/share", "2026-05-15", rblxPriceSource, "Editable on Company Equity Dashboard!B3; update this whenever you want current estimates refreshed."],
  ["EquityAwardsCenter transactions CSV", csvPath, "file", "export timestamp 2026-05-17", csvPath, "Used for RSU and ESPP row-level detail."],
  ["Restricted Stock Activity statement", "/Users/agao/Downloads/Restricted Stock Activity - All_2026-02-20.PDF", "file", "2026-02-20", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["Restricted Stock Activity statement", "/Users/agao/Downloads/Restricted Stock Activity - All_2025-11-20.PDF", "file", "2025-11-20", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["Restricted Stock Activity statement", "/Users/agao/Downloads/Restricted Stock Activity - All_2025-08-20.PDF", "file", "2025-08-20", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["Restricted Stock Activity statement", "/Users/agao/Downloads/Restricted Stock Activity - All_2025-05-20.PDF", "file", "2025-05-20", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["Restricted Stock Activity statement", "/Users/agao/Downloads/Restricted Stock Activity - All_2025-02-20.PDF", "file", "2025-02-20", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["ESPP summary PDF", "/Users/agao/Downloads/ESPP Purchase and Disposition Summary_2025-03-31.PDF", "file", "2025-03-31", "Schwab / Equity Awards Center PDF", "Used as supporting statement."],
  ["Current holdings needed", "Brokerage/account positions export", "file", "latest available", "User-provided", "Needed to determine what you still hold today versus what you received from work."],
  ["Cash needed", "Bank/checking/HYSA balances", "USD", "latest available", "User-provided", "Needed to calculate true anytime-cash percentage."],
];
sources.getRange("A15:F20").values = [
  ["Checklist", "Why it matters", "", "", "", ""],
  ["Add brokerage positions", "Turns received shares into actual current holdings percentages.", "", "", "", ""],
  ["Add bank/cash balances", "Separates cash available anytime from invested assets.", "", "", "", ""],
  ["Mark liquidity in Holdings", "Shows which money is spendable now vs sellable vs restricted.", "", "", "", ""],
  ["Update Company Equity Dashboard!B3", "Refreshes current-value estimates for RSU/ESPP shares.", "", "", "", ""],
  ["Review company stock %", "Highlights concentration risk from employer stock.", "", "", "", ""],
];
sources.getRange("A15:B15").format.fill.color = paleBlue;
sources.getRange("A15:B15").format.font.bold = true;
sources.getRange("A3:F20").format.applyBorderBlueprint({ all: { color: border, style: "continuous", weight: "thin" } });
sources.getRange("B4:B4").format.font.color = blue;
sources.getRange("F4:F13").format.wrapText = true;
setWidths(sources, [210, 360, 90, 130, 260, 360]);

const checks = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
if (checks.ndjson && checks.ndjson.trim()) {
  console.log(checks.ndjson);
}

await workbook.render({ sheetName: "Portfolio Dashboard", range: "A1:H36", scale: 1 });
await workbook.render({ sheetName: "Company Equity Dashboard", range: "A1:H33", scale: 1 });
await workbook.render({ sheetName: "Holdings", range: "A1:N28", scale: 1 });
await workbook.render({ sheetName: "RSU Detail", range: "A1:N24", scale: 1 });
await workbook.render({ sheetName: "ESPP Detail", range: "A1:N12", scale: 1 });
await workbook.render({ sheetName: "Sources & Next Steps", range: "A1:F20", scale: 1 });

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  rsuRows: rsuRows.length,
  esppRows: esppRows.length,
  rsuGross: rsuRows.reduce((sum, r) => sum + r[10], 0),
  rsuTaxes: rsuRows.reduce((sum, r) => sum + r[9], 0),
  rsuNetShares: rsuRows.reduce((sum, r) => sum + r[8], 0),
  esppShares: esppRows.reduce((sum, r) => sum + r[3], 0),
  esppCost: esppRows.reduce((sum, r) => sum + r[5], 0),
  esppDiscount: esppRows.reduce((sum, r) => sum + r[9], 0),
}, null, 2));
