# [DEPRECATED] Job Search Dashboard (local)

> [!WARNING]
> **DEPRECATED**: This dashboard is now deprecated in favor of the dialogue-first job-hunting workflow. Search results are now printed directly in your chat session and permanently logged in your Obsidian vault at `file:///Users/agao/Annie_Obsidian/JOB/outputs/daily_job_search_results.md`. You do not need to run the local server or import JSON feeds anymore.

## Original Documentation (Archived)

## Run

This dashboard is **serverless** (works via `file://` and persists to your browser localStorage).

Open this file in your browser:

- `/Users/agao/Documents/New project/job-dashboard/public/index.html`
- When you’re ready to prep materials for a role, click **Prepare** to open:
  - `job-dashboard/public/prep.html`

Daily auto-sync:

- The daily automation should overwrite `job-dashboard/public/feed.js`.
- The dashboard will upsert from that feed on page load and preserve your statuses/notes.
  - It also preserves any drafts you keep in the dashboard (resume summary/bullets/cover letter).
- To prevent repeat recommendations, keep a canonical applied list in:
  - `job-dashboard/data/applied_links.txt`
  - Use **Copy applied** in the dashboard, then paste into that file.
- To permanently hide bad/stale roles (e.g., 404 or wrong link), keep a canonical blocked list in:
  - `job-dashboard/data/blocked_links.txt`
  - Use **Block** on the job, then **Copy blocked**, then paste into that file.

Optional (if your environment allows running a local server): you can also run the included Node server.

```bash
cd "/Users/agao/Documents/New project/job-dashboard"
node server.mjs
```

Then open `http://localhost:4317`.

## Import daily results

On the dashboard:

- Click **Import** and paste a JSON array of jobs (example shown in the UI).
- Or add a job manually.
- Or click **Add link** to drop a role into an **Inbox** (`needs_review`) for later evaluation.

The dashboard persists to:

- Browser `localStorage` key: `job_dashboard_db_v1`

## Suggested collaborative workflow (you + me)

1) Each morning I send you a short shortlist (phase 1 only).
2) You either:
   - import that JSON into the dashboard, or
   - paste any official job link you found into **Add link** (Inbox).
3) When you want me to evaluate a role, send me the official link (and optionally your notes).
4) I will:
   - verify it’s active on the official careers/ATS page,
   - summarize the role, fit, concerns, keywords, and compensation if shown,
   - return a JSON snippet you can paste into **Import** to upsert into the dashboard.
5) You mark **Interested / Applied / Archived** in the dashboard as you go.

## Where to paste generated documents

Open a job → click **Prepare**:

- Keep editable drafts for:
  - Resume positioning summary
  - Resume bullet edits
  - Cover letter draft

## Resume library folder (for me to reference when drafting)

Put your previously used resumes in:

- `/Users/agao/Documents/New project/job-dashboard/resumes`

When you ask me to draft a new resume for a specific role, I’ll use the contents of that folder as reference.
