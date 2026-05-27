---
name: cover-letter-writer
description: Draft a concise, role-targeted cover letter for Annie Gao (separate doc) emphasizing 1–2 strongest hooks for the employer and role requirements.
metadata:
  short-description: Concise cover letter writer
---

# Cover Letter Writer (Annie Gao)

Use this skill whenever the user asks to write a cover letter.

## Non-negotiable rules (apply to every cover letter)

1) Keep it **short** (≈ 150–220 words). No comprehensive life story.
2) Highlight **1–2 strongest hooks** for the specific employer + role.
3) Must reflect employer context (platform, operations intensity, cross-functional nature) and the role’s stated emphasis.
4) No invented facts; only use information from Annie’s resumes and the provided JD/link.
5) Output as a **standalone document** (cover letter only, not bundled into the resume).

## Inputs

- Official job link (preferred) or JD text
- Company/employer context (if “Confidential”, call out quick-fit themes without over-claiming company specifics)
- Annie’s resume library: `/Users/agao/Annie_Obsidian/JOB/job-dashboard/resumes`

## Output format

- Primary: Markdown text ready to paste into an application form
- When asked for Word: generate a `.docx` in `outputs/cover_letters/` using the local converter script.

## Recommended structure

- Header line (name + phone + email + LinkedIn)
- Greeting
- Hook paragraph: 1–2 hooks that match role emphasis
- Evidence paragraph: 2–3 sentences tying to specific responsibilities (stakeholders, delivery, operating mechanisms, risk/issue, KPIs)
- Closing: enthusiasm + invite to talk

