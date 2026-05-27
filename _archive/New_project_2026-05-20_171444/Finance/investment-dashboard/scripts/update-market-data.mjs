import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputPath = resolve(projectRoot, "data", "market-data.js");

const symbols = [
  "RBLX",
  "NVDA",
  "SPGI",
  "TSLA",
  "GOOGL",
  "DIS",
  "FBGRX",
  "VOO",
  "QQQ",
  "FDSVX",
  "SPY",
  "VMACX",
  "FNGS",
  "FXAIX",
  "VOOV",
];

const windows = [
  ["1D", 1],
  ["1W", 5],
  ["1M", 21],
  ["3M", 63],
  ["6M", 126],
  ["1Y", 252],
];

const period2 = Math.floor(Date.now() / 1000);
const period1 = period2 - 400 * 24 * 60 * 60;

function normalizeSeries(chartResult) {
  const quote = chartResult?.indicators?.quote?.[0];
  const timestamps = chartResult?.timestamp ?? [];
  const closes = quote?.close ?? [];
  return timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: closes[index],
    }))
    .filter((point) => Number.isFinite(point.close));
}

function returnForWindow(series, tradingDays) {
  if (series.length < 2) return null;
  const latest = series.at(-1).close;
  const earlier = series[Math.max(0, series.length - 1 - tradingDays)]?.close;
  if (!Number.isFinite(latest) || !Number.isFinite(earlier) || earlier === 0) return null;
  return latest / earlier - 1;
}

async function fetchSymbol(symbol) {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("interval", "1d");
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");

  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "investment-dashboard-local-updater",
    },
  });
  if (!response.ok) throw new Error(`${symbol}: ${response.status} ${response.statusText}`);

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;
  if (error) throw new Error(`${symbol}: ${error.description ?? error.code}`);

  const series = normalizeSeries(result);
  if (!series.length) throw new Error(`${symbol}: no daily price data returned`);

  const latest = series.at(-1);
  return {
    latest,
    series,
    returns: Object.fromEntries(windows.map(([label, days]) => [label, returnForWindow(series, days)])),
  };
}

const output = {
  generatedAt: new Date().toISOString(),
  source: "Yahoo Finance chart API",
  symbols: {},
  returns: {},
  errors: [],
};

await mkdir(dirname(outputPath), { recursive: true });

for (const symbol of symbols) {
  try {
    const data = await fetchSymbol(symbol);
    output.symbols[symbol] = {
      latest: data.latest,
      series: data.series,
    };
    output.returns[symbol] = data.returns;
  } catch (error) {
    output.errors.push(error.message);
  }
}

const js = `window.marketData = ${JSON.stringify(output, null, 2)};\n`;
await writeFile(outputPath, js, "utf8");

console.log(`Wrote ${outputPath}`);
console.log(`Updated ${Object.keys(output.symbols).length}/${symbols.length} symbols`);
if (output.errors.length) {
  console.log("Errors:");
  for (const error of output.errors) console.log(`- ${error}`);
}
