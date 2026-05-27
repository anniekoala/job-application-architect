#!/usr/bin/env node
/**
 * Render a file://-friendly feed.js for the local Job Dashboard.
 * Default behavior: MERGE into existing feed.js so old items remain.
 *
 * Input: JSON from --input <path> or stdin.
 * Accepts either:
 *  - Array<job>
 *  - { generatedAt?: string, jobs: Array<job> }
 *
 * Output: JS file assigning window.__JOB_FEED__.
 *
 * Flags:
 *  --no-merge   overwrite instead of merge
 */
import fs from "node:fs";

function parseArgs(argv) {
  const args = { input: "", output: "", generatedAt: "", merge: true };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--input") args.input = argv[++i] || "";
    else if (a === "--output") args.output = argv[++i] || "";
    else if (a === "--generatedAt") args.generatedAt = argv[++i] || "";
    else if (a === "--no-merge") args.merge = false;
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
  return {
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
    status: pick("status") || "new"
  };
}

function normLink(link) {
  return String(link || "").trim().toLowerCase();
}

function jobKey(job) {
  const link = normLink(job.link);
  if (link) return `link:${link}`;
  const c = String(job.company || "").trim().toLowerCase();
  const t = String(job.title || "").trim().toLowerCase();
  return `ct:${c}::${t}`;
}

function extractExistingFeed(outputPath) {
  try {
    if (!fs.existsSync(outputPath)) return null;
    const js = fs.readFileSync(outputPath, "utf8");
    const m = js.match(/window\.__JOB_FEED__\s*=\s*(\{[\s\S]*\});?/);
    if (!m) return null;
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function mergeJobs(existingJobs, incomingJobs) {
  const map = new Map();
  for (const j of existingJobs || []) {
    const jj = pickJobFields(j);
    if (!jj.company || !jj.title) continue;
    map.set(jobKey(jj), jj);
  }
  for (const j of incomingJobs || []) {
    const jj = pickJobFields(j);
    if (!jj.company || !jj.title) continue;
    const key = jobKey(jj);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, jj);
      continue;
    }
    // Preserve user-ish status if it exists in the feed already.
    const preservedStatus = prev.status && prev.status !== "new" ? prev.status : jj.status;
    map.set(key, { ...prev, ...jj, status: preservedStatus });
  }
  return Array.from(map.values());
}

async function main() {
  const args = parseArgs(process.argv);
  const outputPath = args.output || "/Users/agao/Annie_Obsidian/JOB/job-dashboard/public/feed.js";

  const raw = args.input ? fs.readFileSync(args.input, "utf8") : await readStdin();
  if (!raw.trim()) throw new Error("No JSON provided (pass --input <file> or pipe JSON via stdin).");

  const parsed = JSON.parse(raw);
  const { jobs, generatedAt: inGeneratedAt } = ensureArrayJobs(parsed);

  const generatedAt = (args.generatedAt || inGeneratedAt || todayLocalDateISO()).slice(0, 10);
  const cleanedJobs = jobs.map(pickJobFields).filter((j) => j.company && j.title);

  let finalJobs = cleanedJobs;
  if (args.merge) {
    const existing = extractExistingFeed(outputPath);
    if (existing && Array.isArray(existing.jobs)) {
      finalJobs = mergeJobs(existing.jobs, cleanedJobs);
    }
  }

  const payload = { generatedAt, jobs: finalJobs };
  const js = `// Auto-generated feed. Do not edit by hand.\nwindow.__JOB_FEED__ = ${JSON.stringify(payload, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, "utf8");
  process.stdout.write(`Wrote ${finalJobs.length} jobs to ${outputPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
