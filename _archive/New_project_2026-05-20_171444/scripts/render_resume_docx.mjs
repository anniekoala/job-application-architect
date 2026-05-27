import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function rtfEscape(text) {
  // RTF requires non-ASCII characters to be emitted as \uN? (Unicode escape),
  // otherwise consumers may interpret UTF-8 bytes as Windows-1252 (garbage like â€™ â€“ Â).
  const s = String(text).replaceAll("\t", "    ");
  let out = "";
  for (const ch of s) {
    const codePoint = ch.codePointAt(0);
    if (codePoint == null) continue;
    if (codePoint <= 0x7f) {
      if (ch === "\\") out += "\\\\";
      else if (ch === "{") out += "\\{";
      else if (ch === "}") out += "\\}";
      else out += ch;
    } else {
      // RTF \u uses signed 16-bit integer.
      let signed = codePoint;
      if (signed > 32767) signed -= 65536;
      out += `\\u${signed}?`;
    }
  }
  return out;
}

function mdBoldToRtf(text) {
  // Convert **bold** runs into RTF bold toggles.
  const parts = String(text).split("**");
  if (parts.length === 1) return rtfEscape(text);
  let out = "";
  for (let i = 0; i < parts.length; i += 1) {
    const chunk = rtfEscape(parts[i]);
    if (i % 2 === 1) out += `\\b ${chunk}\\b0 `;
    else out += chunk;
  }
  return out.trimEnd();
}

function mdToRtf(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];

  // RTF header
  out.push("{\\rtf1\\ansi\\deff0");
  out.push("{\\fonttbl{\\f0 Calibri;}}");
  // Colors: 1=near black
  out.push("{\\colortbl;\\red11\\green18\\blue32;}");
  // US Letter in twips: 8.5x11in => 12240 x 15840
  // Margins: 0.4in top/bottom (576 twips), 0.45in left/right (648 twips)
  out.push("\\paperw12240\\paperh15840");
  out.push("\\margl648\\margr648\\margt576\\margb576");
  out.push("\\widowctrl\\hyphauto0");
  out.push("\\fs19\\f0"); // 9.5pt (matches 9.6pt PDF)
  // default line spacing 1.22x (9.5pt = 190twips * 1.22 = 232twips)
  out.push("\\sl232\\slmult1");
  out.push("\\cf1");

  const hr = () => {
    // bottom border line
    out.push("\\pard\\sa40\\brdrb\\brdrs\\brdrw10\\brsp18\\par\\pard\\brdrb0\\sa40");
  };

  let headerRuleAdded = false;
  let inHeader = true;

  for (const line of lines) {
    const t = line.trimEnd();
    if (t.startsWith("## ")) inHeader = false;
    if (!t.trim()) {
      out.push("\\par\\sa40");
      continue;
    }

    if (t.startsWith("# ")) {
      // Name line: bigger, bold
      out.push(`\\qc\\fs30\\b ${mdBoldToRtf(t.slice(2))}\\b0\\fs19\\par\\sa30\\ql`);
      continue;
    }
    if (t.startsWith("## ")) {
      if (!headerRuleAdded) {
        // separator after header/contact lines
        hr();
        headerRuleAdded = true;
      }
      const hdr = t
        .slice(3)
        .toUpperCase();
      out.push("\\par\\sa80");
      out.push(`\\fs21\\b ${mdBoldToRtf(hdr)}\\b0\\par\\sa10`);
      hr();
      continue;
    }
    if (t.startsWith("### ")) {
      out.push("\\par\\sa60");
      out.push(`\\b ${mdBoldToRtf(t.slice(4))}\\b0\\par\\sa10`);
      continue;
    }

    // Preserve markdown bold for role lines and subsection lines as-is.

    if (t.startsWith("- ")) {
      // Bullet line (use unicode bullet; safe due to \u escapes)
      out.push(`\\pard\\li360\\fi-240 \\u8226?\\tab ${mdBoldToRtf(t.slice(2))}\\par\\pard\\sa10`);
      continue;
    }

    // Regular paragraph
    if (inHeader && !headerRuleAdded) {
      out.push(`\\qc ${mdBoldToRtf(t)}\\par\\sa10\\ql`);
    } else {
      out.push(`${mdBoldToRtf(t)}\\par\\sa10`);
    }
  }

  out.push("}");
  return out.join("\n");
}

async function main() {
  const inputMd = process.argv[2];
  const outDocx = process.argv[3];
  if (!inputMd || !outDocx) {
    console.error("Usage: node scripts/render_resume_docx.mjs <input.md> <output.docx>");
    process.exit(2);
  }

  await mkdir(path.dirname(outDocx), { recursive: true });

  const md = await readFile(inputMd, "utf8");
  const rtf = mdToRtf(md);

  const outRtf = outDocx.replace(/\.docx$/i, ".rtf");
  await writeFile(outRtf, rtf);

  // Convert using macOS textutil
  await execFileAsync("textutil", ["-convert", "docx", "-output", outDocx, outRtf], { timeout: 120000 });

  console.log(`Wrote: ${outDocx}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
