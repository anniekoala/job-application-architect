# Automation → Dashboard (no server)

The dashboard loads job recommendations from:

- `/Users/agao/Documents/New project/job-dashboard/public/feed.js`

`feed.js` must define:

```js
window.__JOB_FEED__ = { generatedAt: "YYYY-MM-DD", jobs: [...] }
```

## One-step render (recommended)

If you have a JSON file (either `[...]` or `{generatedAt, jobs}`), render `feed.js` with:

```bash
node "/Users/agao/Documents/New project/scripts/render_job_feed.mjs" \
  --input "/path/to/jobs.json" \
  --output "/Users/agao/Documents/New project/job-dashboard/public/feed.js"
```

Then refresh the dashboard:

- `file:///Users/agao/Documents/New%20project/job-dashboard/public/index.html`

## Notes

- The dashboard will upsert incoming jobs by `link` (fallback: `company + title`).
- It will **not** overwrite user fields (`status`, `notes`, `appliedAt`, drafts).
- If you “Dismiss” a job, its link is blocked and it won’t reappear even if the feed includes it.

