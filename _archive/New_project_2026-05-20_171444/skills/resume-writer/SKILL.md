---
name: resume-writer
description: Draft a submission-ready resume (DOCX/PDF) for Annie Gao with fixed global rules and role-specific tailoring (no coding requirement).
metadata:
  short-description: Submission-ready resume writer
---

# Resume Writer (Annie Gao)

Use this skill whenever the user asks to write/customize a resume for a specific role.

## Non-negotiable global rules (apply to every resume)

1) Remove **SQL** and **Tableau** from Skills.
2) For Excel: remove the word **Advanced** (keep Excel).
3) Add **AI Suite** to Skills (modern AI tools + AI workflow/automation usage).
4) Remove the **Methods** section (Agile/Scrum/Kanban/Waterfall) entirely.
5) Remove any “Open to … (US/China/Remote/Hybrid)” line from the header.
6) Add phone number to header: `+1 804-244-7268`.
7) After `PMP · CSM`, add credentials: `M.Ed · MPI`.
8) Professional Summary must be **bullet points**, not a paragraph.
9) Professional Summary formatting must match the SourceHire template:
   - Bullet list (real bullets; no literal `•`).
   - First bullet: no `:`; bold only the hook phrase `12 years of …` then continue the sentence normally.
   - Subsequent bullets: include a short hook phrase ending with `:`; bold only the hook phrase (up to and including the first `:`).
10) Replace any “Top 1,000”, “Top 15”, etc. with just **“Top”** (avoid specific ranking numbers).
11) Certifications line: replace `Business Analytics, Udacity · Data Visualization, Udacity · UX/UI Design, Udacity` with `Business Analytics · Data Visualization`.
12) In Education, replace “Human Resource Development” with **“Organizational Development”**.
13) Compress whitespace in Education (no blank lines between degrees).
14) Tools list: remove **Flourish**.
15) Do not include literal `•` characters (or a literal `• ` prefix); use real document bullets instead.
16) If the summary bullet contains a `:` then bold only the text up to the first `:`; otherwise bold only the hook phrase.
17) In Education, bold the degree name (text before the first comma).

## Inputs you should gather (minimum)

- Official job link (preferred) or full JD text.
- Which base resume(s) to reference from: `/Users/agao/Annie_Obsidian/JOB/job-dashboard/resumes`
- Target location preference (US/China only; remote/hybrid OK).

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

## Canonical formatting + sections (lock this in)

Use the Google Doc formatting style from the current reference resume doc:
- Google Doc ID: `1Fe3LGPiUyXPp4Tkcy5rkzFCW-qqjHWZH1qmCzfeAllE`

Formatting expectations:
- Name + contact lines centered.
- Section headers in Title Case (e.g., “Professional Summary”, “Professional Experience”), styled consistently (blue accent).
- Bullets are true Google Docs bullets (not pasted `•` characters).

## Canonical Certifications + Education (lock this in)

Always use these contents unless the user explicitly asks to change them:
- Certifications: `Project Management Professional (PMP) · Certified Scrum Master (CSM)`
- Education:
  - `Master of Product Innovation, Virginia Commonwealth University (Dec 2018)`
  - `Master of Education — Adult Learning & Organizational Development, Virginia Commonwealth University (May 2014)`
  - `Bachelor of Art — English & International Relations, Sichuan International Studies University (Jul 2012)`

## Tailoring heuristics (Annie-specific)

- Prefer roles emphasizing: program/portfolio mgmt, stakeholder alignment, escalations/incident response, trust & safety/integrity ops, compliance/policy ops, creator/dev ecosystem ops, vendor mgmt, exec reporting, international expansion.
- If JD mentions “technical fluency” but not hands-on coding: position as technical partnership + platform fluency (DevRel, cross-functional with Eng).
- If JD requires hands-on coding as core responsibility: flag as concern; do not stretch.
