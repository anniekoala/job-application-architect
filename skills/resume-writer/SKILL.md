---
name: resume-writer
description: Draft a submission-ready resume (DOCX/PDF) for Annie Gao with fixed global rules and role-specific tailoring (no coding requirement).
metadata:
  short-description: Submission-ready resume writer
---

# Resume Writer (Config-Driven Engine)

Use this skill whenever the user asks to write/customize a resume for a specific role. **It reads all personal information, contact details, career history titles, and keyword constraints from the local git-ignored profile file `my_private_profile.json`** to keep the workspace 100% clean and public-repository ready.

---

## Initialization: Load Local Profile

At the very beginning, the agent MUST read and load the profile config file located at:
`/Users/agao/Annie_Obsidian/JOB/my_private_profile.json`

Extract and use the following parameters from `my_private_profile.json`:
- `personal_info` (name, email, phone, LinkedIn, credentials suffix)
- `education` & `certifications` (degrees, schools, certifications, graduation dates)
- `career_anchors` (exact titles and roles for Roblox US, Roblox China, VCU, CSU)
- `restricted_keywords` (blocked words like SQL, Tableau, Flourish)
- `skills_customization` (AI skill ranking, e.g., Claude first)

---

## Non-negotiable global rules (apply to every resume)

1) **Remove Restricted Keywords**: Automatically remove any keyword listed in the `restricted_keywords.remove` array (e.g., SQL, Tableau, Flourish) from the skills list.
2) **Excel constraint**: Do not use "Advanced Excel", instead use the replacement specified in `restricted_keywords.use_instead` (e.g., Excel).
3) **AI Skills ordering**: Always list **AI Skills** first, sorting them to match the array in `skills_customization.ai_skills` (e.g., Claude first).
4) Remove the **Methods** section (Agile/Scrum/Kanban/Waterfall) entirely.
5) Remove any “Open to … (US/China/Remote/Hybrid)” line from the header.
6) Add phone number to header: loaded from `personal_info.phone` (e.g., `+1 804-244-7268`).
7) After name, add credentials: loaded from `personal_info.credentials_suffix` (e.g., `PMP · CSM · M.Ed · MPI`).
8) Professional Summary must be **bullet points**, not a paragraph.
9) Professional Summary formatting must match the template:
   - Bullet list (real bullets; no literal `•`).
   - First bullet: no `:`; bold only the hook phrase `12 years of …` then continue the sentence normally.
   - Subsequent bullets: include a short hook phrase ending with `:`; bold only the hook phrase (up to and including the first `:`).
10) Replace any “Top 1,000”, “Top 15”, etc. with just **“Top”** (avoid specific ranking numbers).
11) Certifications line: load from `certifications` in `my_private_profile.json`.
12) In Education, load degrees and institution names from `education` in `my_private_profile.json`.
13) Compress whitespace in Education (no blank lines between degrees).
14) Do not include literal `•` characters (or a literal `• ` prefix); use real document bullets instead.
15) If the summary bullet contains a `:` then bold only the text up to the first `:`; otherwise bold only the hook phrase.
16) In Education, bold the degree name (text before the first comma).

---

## Inputs you should gather (minimum)

- Official job link (preferred) or full JD text.
- Which base resume(s) to reference from: `/Users/agao/Annie_Obsidian/JOB/job-dashboard/resumes`
- Target location preference (US/China only; remote/hybrid OK).

---

## Output format (submission-ready)

Default deliverable:
- `DOCX` resume + rendered `PDF`.

Workflow:
1) Extract the most relevant bullets from the base resume(s) (do not invent new facts).
2) Tailor summary + top bullets to match JD “Key Qualifications”.
3) Keep resume 1–2 pages, ATS-friendly, consistent tense, quantified impact where already present.
4) Produce a final DOCX and a PDF.

When generating DOCX/PDF:
- Use the `documents` skill/tooling for Word creation and render-to-PDF QA.
- Ensure formatting is clean (spacing, alignment, consistent bullet style).
If the environment cannot render PDF directly, generate a clean DOCX with standard margins (≈0.6–0.75in), single-column layout, and ATS-friendly formatting (no graphics/text boxes).

---

## Canonical formatting + sections (lock this in)

Use the Google Doc formatting style from the current reference resume doc:
- Google Doc ID: `1Fe3LGPiUyXPp4Tkcy5rkzFCW-qqjHWZH1qmCzfeAllE`

Formatting expectations:
- Name + contact lines centered.
- Section headers in Title Case (e.g., “Professional Summary”, “Professional Experience”), styled consistently (blue accent).
- Bullets are true Google Docs bullets (not pasted `•` characters).

---

## Canonical Certifications + Education (lock this in)

Always load these dynamically from `my_private_profile.json`.

---

## Tailoring heuristics (Candidate-specific)

- Prefer roles emphasizing: program/portfolio mgmt, stakeholder alignment, escalations/incident response, trust & safety/integrity ops, compliance/policy ops, creator/dev ecosystem ops, vendor mgmt, exec reporting, international expansion.
- If JD mentions “technical fluency” but not hands-on coding: position as technical partnership + platform fluency (DevRel, cross-functional with Eng).
- If JD requires hands-on coding as core responsibility: flag as concern; do not stretch.
