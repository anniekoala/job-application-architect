import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mdInline(md) {
  // bold only (enough for this resume workflow)
  return escapeHtml(md).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inList = false;
  let inHeader = true;

  out.push('<div class="header-container">');

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === "<!-- page-break -->") {
      closeList();
      out.push('<div style="page-break-before: always;"></div>');
      continue;
    }

    // ignore role-target scratchpad section for the PDF
    if (line.trim() === "---") {
      // stop at the first horizontal rule after Education (keep it simple)
      // if you want the scratchpad, export from the dashboard instead
      // eslint-disable-next-line no-continue
      continue;
    }

    if (/^##\s+/.test(line)) {
      if (inHeader) {
        out.push('</div>');
        inHeader = false;
      }
      closeList();
      out.push(`<h2>${mdInline(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      closeList();
      out.push(`<h1>${mdInline(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }
    if (/^###\s+/.test(line)) {
      closeList();
      out.push(`<h3>${mdInline(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      if (!inList) {
        closeList();
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${mdInline(line.replace(/^\s*-\s+/, ""))}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      out.push(`<div class="spacer"></div>`);
      continue;
    }

    closeList();
    // Treat remaining lines as paragraphs; preserve manual line breaks for header lines etc.
    out.push(`<p>${mdInline(line)}</p>`);
  }
  closeList();

  if (inHeader) {
    out.push('</div>');
  }

  return out.join("\n");
}

function wrapHtml(body) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume</title>
  <style>
    @page { size: Letter; margin: 0.45in 0.52in; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0b1220;
      font-size: 10pt;
      line-height: 1.22;
    }
    .header-container {
      text-align: center;
      margin-bottom: 5px;
    }
    .header-container p {
      margin: 0 0 1px 0;
    }
    .header-container .spacer {
      height: 2px;
    }
    h1 {
      font-size: 15.5pt;
      margin: 0 0 3px 0;
      letter-spacing: 0.2px;
      font-weight: 750;
    }
    h2 {
      font-size: 10.8pt;
      margin: 9px 0 3px 0;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1px;
    }
    h3 {
      font-size: 10pt;
      margin: 6px 0 2px 0;
      font-weight: 700;
    }
    p { margin: 0 0 2px 0; }
    ul { margin: 0 0 3px 15px; padding: 0; }
    li { margin: 0 0 1px 0; }
    .spacer { height: 3px; }
    strong { font-weight: 750; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

async function main() {
  const input = process.argv[2];
  const outPdf = process.argv[3];
  if (!input || !outPdf) {
    console.error("Usage: node scripts/render_resume_pdf.mjs <input.md> <output.pdf>");
    process.exit(2);
  }
  await mkdir(path.dirname(outPdf), { recursive: true });

  const md = await readFile(input, "utf8");
  const htmlBody = mdToHtml(md);
  const html = wrapHtml(htmlBody);

  // write a sibling .html for easy debugging
  const outHtml = outPdf.replace(/\.pdf$/i, ".html");
  await writeFile(outHtml, html);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: outPdf,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.45in", right: "0.52in", bottom: "0.45in", left: "0.52in" },
  });
  await browser.close();
  console.log(`Wrote: ${outPdf}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

