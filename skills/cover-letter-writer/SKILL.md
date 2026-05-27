---
name: cover-letter-writer
description: Draft a concise, role-targeted cover letter (separate doc) emphasizing 1–2 strongest hooks for the employer and role requirements.
metadata:
  short-description: Concise cover letter writer
---

# Cover Letter Writer (Config-Driven Engine)

Use this skill whenever the user asks to write a cover letter. **It reads all personal information and contact details from the local git-ignored profile file `my_private_profile.json`** to keep the workspace 100% clean and public-repository ready.

---

## Initialization: Load Local Profile

At the very beginning, the agent MUST read and load the profile config file located at:
`/Users/agao/Annie_Obsidian/JOB/my_private_profile.json`

Extract and use the following parameters from `my_private_profile.json`:
- `personal_info` (name, email, phone, LinkedIn, credentials suffix)

---

## Non-negotiable rules (apply to every cover letter)

1) Keep it **short** (≈ 150–220 words). No comprehensive life story.
2) Highlight **1–2 strongest hooks** for the specific employer + role.
3) Must reflect employer context (platform, operations intensity, cross-functional nature) and the role’s stated emphasis.
4) No invented facts; only use information from the candidate's resumes (e.g., from `my_private_profile.json` career history) and the provided JD/link.
5) Output as a **standalone document** (cover letter only, not bundled into the resume).

---

## Inputs

- Official job link (preferred) or JD text
- Company/employer context
- Candidate's resume library: `/Users/agao/Annie_Obsidian/JOB/job-dashboard/resumes`

---

## Output format

- Primary: Markdown text ready to paste into an application form
- When asked for Word: generate a `.docx` in `outputs/cover_letters/` using the local converter script.

---

## Recommended structure

- Header line (load dynamic name + phone + email + LinkedIn from `personal_info`)
- Greeting
- Hook paragraph: 1–2 hooks that match role emphasis
- Evidence paragraph: 2–3 sentences tying to specific responsibilities (stakeholders, delivery, operating mechanisms, risk/issue, KPIs)
- Closing: enthusiasm + invite to talk
