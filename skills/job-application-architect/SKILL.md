---
name: job-application-architect
description: A complete, step-by-step interactive workflow to analyze job descriptions, perform matching/gap analysis, tailor the resume, compile & verify layout constraints, and draft custom cover letters.
metadata:
  short-description: Guided end-to-end job application tailor
---

# Job Application Architect (Generic Work-Search System)

Use this skill at the beginning of any new chat where the user wants to tailor their resume and cover letter for a specific job application. This is a generic, configuration-driven tailoring engine. **It reads all personal information, contact details, career history titles, and keyword constraints from the local git-ignored profile file `my_private_profile.json`** to keep the workspace 100% clean and public-repository ready.

---

## Initialization: Load Local Profile

At the very beginning of the chat, the agent MUST read and load the profile config file located at:
`/Users/agao/Annie_Obsidian/JOB/my_private_profile.json`

Extract and use the following parameters from `my_private_profile.json`:
- `personal_info` (name, email, phone, LinkedIn, credentials suffix)
- `education` & `certifications` (degrees, schools, certifications, graduation dates)
- `career_anchors` (exact titles and roles for Roblox US, Roblox China, VCU, CSU)
- `restricted_keywords` (blocked words like SQL, Tableau, Flourish)
- `skills_customization` (AI skill ranking, e.g., Claude first)

---

## The 5-Step Guided Workflow

You MUST execute this workflow sequentially. Do not skip steps or jump ahead. Guide the user through each step interactively.

### Step 1: Onboarding & Job Analysis
**Objective**: Gather the job details, analyze the company context, and identify the hiring manager's hidden intent.
1. Prompt the user to provide:
   - Target Job Description (JD) text or link.
   - Target company and department context.
2. Analyze the JD to extract:
   - **Core Responsibilities**: Key technical, operational, and stakeholder management tasks.
   - **Hidden Intent**: The underlying pain points (e.g., managing high-CCU events, handling crisis escalations, scaling operations from scratch).
   - **Technical Fluency Requirements**: Whether the role requires hands-on coding or cross-functional technical coordination.

### Step 2: Gap Analysis & Tailoring Strategy
**Objective**: Build a side-by-side match comparison and align on the narrative hooks.
1. Match the candidate's core assets (loaded from `my_private_profile.json`) to the JD:
   - Global PM, compliance operations, Trust & Safety (e.g., `roblox_us`).
   - LiveOps, vendor management, high-CCU platforms (e.g., Roblox Live Events).
   - Upward alignment, data pipeline construction, Game Jam execution, compliance scaling (e.g., `roblox_china`).
   - Partnerships, program management, international operations (e.g., `csu` & `vcu`).
2. Call out any gaps/risks (e.g., specific software, heavy policy drafting) and strategies to address or pivot around them.
3. Present this Match & Gap Analysis to the user, highlighting the key hooks you intend to emphasize. Wait for user feedback before drafting the resume.

### Step 3: Markdown Resume Drafting
**Objective**: Customize the resume in Markdown inside the chat interface.
* **CRITICAL RULE**: Always fully finalize and secure explicit user approval on the Markdown Resume **before** drafting the Cover Letter.
1. Draft the tailored resume in Markdown.
2. Apply all **Content & Formatting Guardrails** (loaded from the configuration).
3. Ensure every experience bullet begins with **3-5 bold action hooks** (e.g., `**Coordinate cross-functional internal alignment**`).
4. Ensure tenses are strictly consistent (present tense for current roles, past tense for all past roles).
5. Inject the manual page-break marker `<!-- page-break -->` right before the second company section (e.g., `roblox_china`) to force it strictly to the top of Page 2.

### Step 4: Layout Compilation & Verification
**Objective**: Generate the final files and verify strict layout constraints.
1. Once the user approves the Markdown resume, compile it using the local Node scripts:
   - **PDF Compilation**: `node _archive/New_project_2026-05-20_171444/scripts/render_resume_pdf.mjs outputs/resumes/<Output_Filename>.md outputs/resumes/<Output_Filename>.pdf`
   - **DOCX Compilation**: `node _archive/New_project_2026-05-20_171444/scripts/render_resume_docx.mjs outputs/resumes/<Output_Filename>.md outputs/resumes/<Output_Filename>.docx`
2. **Run Layout Measurement**: Verify the PDF page count and vertical coverage by running:
   - `node _archive/New_project_2026-05-20_171444/scripts/measure_html.mjs outputs/resumes/<Output_Filename>.html`
3. **Verify Strict Constraints**:
   - The PDF **MUST** be exactly **2 pages**.
   - The second major experience entry (e.g., `roblox_china`) **MUST** start exactly on the first line at the top of Page 2.
   - Page 2 body height must fill **90%+** of the printable height (approximately 1300px - 1315px total scroll height).
4. Share the file links with the user for final verification.

### Step 5: Custom Cover Letter Development
**Objective**: Draft a high-impact, tailored Cover Letter.
* **CRITICAL RULE**: Do not write the Cover Letter until the Resume is approved and Step 4 is complete.
1. Draft a concise Cover Letter strictly between **150 and 220 words**.
2. Avoid generic summaries or life stories; lead with **1-2 specific hooks** that align with the company's platform scale or operational intensity.
3. Reference frameworks built (e.g., LiveOps playbooks, upward reporting pipelines) and quantifiable metrics from the tailored resume.
4. Output as a standalone Markdown document and compile to DOCX if requested by the user.

---

## Configuration-Driven Guardrails

Always enforce these rules during Step 3 and Step 4, pulling parameters directly from `my_private_profile.json`:

### Header & Contact Information
- **Contact details**: Load `email`, `phone`, `linkedin`, and `full_name` from `personal_info`.
- **Subheader Credentials**: Load `credentials_suffix` (centered, separated by middle dots).
- **Titles**: Do not include generic taglines or position titles in the header.

### Restricted Keywords & Skills
- **Skills to REMOVE**: Remove any keyword listed in the `restricted_keywords.remove` array (e.g., SQL, Tableau, Flourish) from the skills list.
- **Excel constraint**: Do not use "Advanced Excel", instead use the replacement specified in `restricted_keywords.use_instead` (e.g., Excel).
- **AI Skills ordering**: Always list **AI Skills** first, sorting them to match the array in `skills_customization.ai_skills` (e.g., Claude first).
- **Program Management**: Keep methodologies listed cleanly without a separate "Methods" section.

### Professional Experience Details
- **Corporate Splits**: The current company and its China/international branches MUST be represented as separate, distinct company sections:
  - `roblox_us` section (e.g., `### Roblox Corporation — San Mateo, CA`)
  - `roblox_china` section (e.g., `### Roblox China — Shenzhen, China`)
- **Key bullets matching placeholders**: Match titles, roles, locations, and timeframes strictly to the values in `career_anchors`.
- **California State University**: Role title is loaded from `career_anchors.csu.title` (e.g., `Partnership Programs Lead`).
- **Virginia Commonwealth University**: Role title is loaded from `career_anchors.vcu.title` (e.g., `International Program Manager`).

### Spacing & Layout
- Ensure education entries have compressed spacing (no blank lines between degrees).
- Use double spaces (`  `) at the end of education/certification lines to prevent line wrapping issues.
- Maintain margins of `0.45in top/bottom` and `0.52in left/right` in the PDF renderer to maximize text density and achieve an elegant fit.
