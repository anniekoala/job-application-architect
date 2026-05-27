#!/usr/bin/env node
/**
 * Render a file://-friendly feed.js for the local Job Dashboard.
 *
 * Input: JSON from --input <path> or stdin.
 * Accepts either:
 *  - Array<job>
 *  - { generatedAt?: string, jobs: Array<job> }
 *
 * Output: JS file assigning window.__JOB_FEED__.
 */

import fs from "node:fs";

function parseArgs(argv) {
  const args = { input: "", output: "", generatedAt: "" };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--input") args.input = argv[++i] || "";
    else if (a === "--output") args.output = argv[++i] || "";
    else if (a === "--generatedAt") args.generatedAt = argv[++i] || "";
  }
  return args;
}

function todayLocalDateISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
    process.stdin.on("error", reject);
  });
}

function ensureArrayJobs(input) {
  if (Array.isArray(input)) return { jobs: input };
  if (input && typeof input === "object" && Array.isArray(input.jobs)) return { jobs: input.jobs, generatedAt: input.generatedAt };
  throw new Error("Input JSON must be an array of jobs or an object with { jobs: [...] }");
}

function pickJobFields(job) {
  const obj = job && typeof job === "object" ? job : {};
  const pick = (k) => (typeof obj[k] === "string" ? obj[k] : obj[k] == null ? "" : obj[k]);
  const out = {
    company: pick("company"),
    title: pick("title"),
    location: pick("location"),
    link: pick("link"),
    synopsis: pick("synopsis"),
    keyQualifications: pick("keyQualifications"),
    rationale: pick("rationale"),
    concerns: pick("concerns"),
    compensation: pick("compensation"),
    postedDate: pick("postedDate"),
    foundDate: pick("foundDate"),
    verification: pick("verification"),
    fitScore: Number.isFinite(Number(obj.fitScore)) ? Number(obj.fitScore) : null,
    keywords: Array.isArray(obj.keywords) ? obj.keywords : typeof obj.keywords === "string" ? obj.keywords : [],
    status: pick("status") || "new",
  };
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const outputPath = args.output || "/Users/agao/Documents/New project/job-dashboard/public/feed.js";

  const raw = args.input ? fs.readFileSync(args.input, "utf8") : await readStdin();
  if (!raw.trim()) throw new Error("No JSON provided (pass --input <file> or pipe JSON via stdin).");

  const parsed = JSON.parse(raw);
  const { jobs, generatedAt: inGeneratedAt } = ensureArrayJobs(parsed);

  const generatedAt = (args.generatedAt || inGeneratedAt || todayLocalDateISO()).slice(0, 10);
  const cleanedJobs = jobs.map(pickJobFields).filter((j) => j.company && j.title);

  const payload = { generatedAt, jobs: cleanedJobs };
  const js = `// Auto-generated feed. Do not edit by hand.\nwindow.__JOB_FEED__ = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, "utf8");

  process.stdout.write(`Wrote ${cleanedJobs.length} jobs to ${outputPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});

