# Job Application Playbook & Tailoring Workflow
**Candidate:** Yilan (Annie) Gao  
**Purpose:** Standardize the end-to-end process of analyzing job postings, performing gap analyses, and crafting aligned resume and cover letter materials, incorporating Annie's specific styling and content preferences.

---

## Part 1: The 5-Step Application Workflow

Follow this step-by-step process for every new job posting:

### Step 1: Job Description & Intent Analysis
Analyze the target job posting to extract:
* **Core Responsibilities**: Key operations, incident response, compliance, or stakeholder management tasks.
* **Hiring Manager's Hidden Intent**: The underlying pain points the manager is trying to solve (e.g., building a team from scratch, handling crisis escalations, scaling processes).
* **Technical Fluency Requirements**: Whether the role requires hands-on coding or high-level technical coordination with engineering and policy teams.

### Step 2: Gap Analysis & Match Strategy
Perform a side-by-side comparison of Annie's background against the posting:
* **Core Alignment**: Strong matching stories (Roblox global scale, escalations, LiveOps, data pipeline creation).
* **Potential Gaps/Risks**: Identify any missing criteria and formulate a strategy to address or pivot around them.
* **Highlight Strategy**: Define the key narrative themes to elevate (e.g., "the builder," "the crisis manager," or "the cross-functional coordinator").

### Step 3: Markdown Resume Drafting
Tailor the resume content in **Markdown format first** within the chat interface:
* Apply all styling and content constraints in Part 2.
* Highlight 3-5 bold action hooks at the start of every bullet point.
* Verify tense consistency (present tense for the current role, past tense for all past roles).
* **CRITICAL WORKFLOW RULE**: Always fully finalize and secure explicit user approval on the Markdown Resume **before** drafting or updating the Cover Letter or any other application essays.

### Step 4: Cover Letter & Essay Development
*Only proceed with this step after the Resume is 100% finalized and the user explicitly instructs to write/draft the Cover Letter:*
* Draft the corresponding application copy in separate Markdown files:
* **Cover Letter**: Keep it concise (150–220 words) with 1-2 high-impact hooks. Focus on operational achievements, frameworks built, and cross-functional coordination.
* **Why Company Essay**: Focus on high-level mission alignment, personal worldview, and motivation. Describe AI's transformative impact and the builder's drive for founding member roles.

### Step 5: Final Review & Batch Compilation
* Proactively check the Markdown file for formatting errors, wordiness, and structural alignment.
* **CRITICAL RULE**: Do not run compilation scripts iteratively while editing. Wait until the user has fully approved the Markdown text, then run the render scripts *once* to generate PDF, DOCX, HTML, and RTF formats.

---

## Part 2: Resume Content & Styling Preferences

### 1. Header & Contact Information
* **Dynamic Configuration**: All personal contact details, credentials, and experience parameters MUST be loaded from the git-ignored local profile `/Users/agao/Annie_Obsidian/JOB/my_private_profile.json`.
* **Subheader format**: Centered, containing email, phone, LinkedIn, and credentials.
* **No generic titles**: Remove taglines like "Global Operations Leader" unless explicitly requested.

### 2. Core Skills Layout & Content Constraints
* **Order of Skills**: 
  1. **AI Skills** (with `Claude` listed first, followed by other models/automation).
  2. **Program Management** (a comprehensive list of methodology and operations keywords).
  3. **Tools** (software/collaboration suites).
* **Restricted Keywords**:
  * **NO SQL**, **NO Tableau**, **NO Flourish** anywhere in the skills list.
  * For Excel: do **NOT** use the word "Advanced".

### 3. Bullet Formatting
* **Professional Summary**: Formatted as bullet points (not paragraphs) with bold hook phrases.
* **Action Hooks**: Every bullet in the experience sections must begin with 3-5 bolded words that immediately hook the reader (e.g., `**Lead global compliance operations**`, `**Established upward communication mechanisms**`).

### 4. Professional Experience Specifications
* **Roblox Current Role (2023–Present)**:
  * Title: `Community & Compliance Lead` (2025–Present)
  * Highlight global operations, safety classification systems, playbooks/SOPs, post-incident reviews, and product deficits investigation.
* **Roblox China (Mar 2021 – Feb 2023)**:
  * **MUST** be treated as a separate, distinct company entry: `### Roblox China — Shenzhen, China` with the role `**Senior Program Manager, Developer Relations**`.
  * Highlight **upward management** (reporting directly to VP of DevRel, aligning President of Roblox China and Global HQ on resources/KPIs).
  * Highlight **data strategy** (building the team's first end-to-end data pipeline, defining KPIs, and establishing data channels with commercial teams).
  * Highlight **compliance escalation frameworks** (building frameworks for imported international games, balancing safety and developer experience).
  * Highlight **Game Jam execution** (conceptualizing and executing Roblox's first-ever Game Jam in China from scratch, proving a zero-to-one capability).
  * Highlight **international developer support** (directing support across product compliance and engine operations, guiding creators through local policies).
* **California State University**: Role title is `Partnership Programs Lead`.
* **Virginia Commonwealth University**: Role title **MUST** be `International Program Manager`.

### 5. Education Section
* **Formatting**: Bold degree names, compress vertical white space, and separate entries onto individual lines.
* **Markdown Trailing Breaks**: Use double trailing spaces (`  `) at the end of each line to ensure standard Markdown viewers render them on separate lines instead of a single merged paragraph.
* **Degree Wording**: Use "Organizational Development" instead of "Human Resource Development" in VCU Master's description.

---

## Part 3: Cover Letter & Essay Preferences

### 1. Cover Letter Rules
* Word count must be strictly between **150 and 220 words**.
* Elevate specific achievements, frameworks, and metrics (e.g., "built an operational framework to balance compliance and safety requirements with community needs").
* Keep a highly professional, action-oriented tone.

### 2. "Why Company" Essay Rules
* Written as a short personal essay, **not** a standard cover letter.
* Focus on **mission alignment** and personal worldview rather than repeating resume bullet points.
* Emphasize the qualitative shift AI represents for **non-technical professionals** (serving as a force multiplier to solve problems once restricted to engineers).
* Emphasize the drive and achievement found in **founding member** roles (building teams/frameworks from zero to one and setting foundations).
* Keep details about specific tool playbooks/SOPs in the Cover Letter and out of the Essay.

---

## Part 4: Document Compilation Rules

* The PDF compilation script is located at: `_archive/New_project_2026-05-20_171444/scripts/render_resume_pdf.mjs`
* The DOCX compilation script is located at: `_archive/New_project_2026-05-20_171444/scripts/render_resume_docx.mjs`
* **PDF margin constraints**: PDF rendering margins should be kept to `0.45in top/bottom` and `0.5in left/right` to ensure a clean 2-page fit with centered header formatting.
