import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

async function main() {
  const inputHtml = process.argv[2];
  if (!inputHtml) {
    console.error("Usage: node measure_html.mjs <input.html>");
    process.exit(1);
  }
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const html = await fs.readFile(path.resolve(inputHtml), "utf8");
  await page.setContent(html, { waitUntil: "load" });
  
  // Measure total scroll height and page heights
  const measurements = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.offsetHeight,
      viewportHeight: window.innerHeight
    };
  });
  
  console.log("Measurements:", measurements);
  
  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: "0.45in", right: "0.5in", bottom: "0.45in", left: "0.5in" },
  });
  
  const pdfString = pdfBuffer.toString("binary");
  const matches = pdfString.match(/\/Type\s*\/Page\b/g);
  console.log("Playwright PDF Page Count:", matches ? matches.length : "unknown");
  
  await browser.close();
}

main().catch(console.error);
