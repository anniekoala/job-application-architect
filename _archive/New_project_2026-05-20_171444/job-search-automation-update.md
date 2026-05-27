## 要改的两件事（建议直接复制粘贴）

目标文件：[`/Users/agao/.codex/automations/daily-tech-program-manager-job-search/automation.toml`](/Users/agao/.codex/automations/daily-tech-program-manager-job-search/automation.toml)

### 1) 把每天运行时间改成上午 9:30（洛杉矶时间）

你现在的配置是：
`rrule = "FREQ=DAILY;BYHOUR=19;BYMINUTE=0;BYSECOND=0"`

由于 Codex 的 `rrule` 时区实现可能因环境而异，给你两个可选值：

- **如果 rrule 按本地时间（America/Los_Angeles）解释**：改成  
  `rrule = "FREQ=DAILY;BYHOUR=9;BYMINUTE=30;BYSECOND=0"`

- **如果 rrule 按 UTC 解释**（PDT=UTC-7，09:30 PDT = 16:30 UTC）：改成  
  `rrule = "FREQ=DAILY;BYHOUR=16;BYMINUTE=30;BYSECOND=0"`

改完后观察下一次实际触发时间；如果偏差 7/8 小时，就在上面两种之间切换即可。

### 2) 把每日输出改成“先给岗位清单，等我确认再准备材料”

把 `prompt = "...` 里末尾的输出要求部分（从 `For the daily output, provide:` 开始）替换为下面这段（整段复制粘贴进去即可）：

```
For the daily output, provide a ranked shortlist of the best confirmed-active openings found today. This is PHASE 1 only: do NOT draft resume bullets or cover letters unless the user explicitly confirms they want to apply to a specific role.

For each role include:
1) Company
2) Title
3) Location (and remote eligibility if shown)
4) Direct official company/ATS link
5) Posted date (if available)
6) Active verification note (e.g., “official page loads and shows Apply/Apply Now”)
7) Short role synopsis (3–5 lines) derived from the official description
8) Recommendation rationale (why it matches Annie Gao’s background/goals)
9) Compensation range/level (only if shown on the official page)
10) Fit score (1–10)
11) Concerns / missing qualifications (brief)
12) Top keywords to mirror in resume

Also include a brief list of major companies checked (even if no strong roles found), and include mid-size tech companies beyond the largest firms (not AI-only).
```

## （新增）让 Dashboard 自动更新：生成 `feed.js`

如果你使用本地 Dashboard（`/Users/agao/Documents/New project/job-dashboard/public/index.html`），建议把自动化的“结构化 JSON 输出”保存成一个文件，然后渲染成：

- `/Users/agao/Documents/New project/job-dashboard/public/feed.js`

仓库里已经提供脚本（无需改代码）：

```bash
cd "/Users/agao/Documents/New project/job-dashboard"
node scripts/render_job_feed.mjs /path/to/jobs.json public/feed.js
```

实现方式建议：
- 自动化运行时把“严格 JSON”写到一个临时文件（例如 `outputs/daily-jobs.json`）
- 然后调用上面的脚本生成 `feed.js`（覆盖写入）
- Dashboard 每次打开会自动从 `feed.js` upsert，并且不会覆盖你手工标记的 `status/notes/appliedAt`

## （新增）避免每日重复推荐：读取已申请清单并排除

为了避免反复推荐你已经申请过的职位，建议让自动化在筛选/输出时排除以下文件里出现过的链接：

- `/Users/agao/Documents/New project/job-dashboard/data/applied_links.txt`

这个文件可以通过 Dashboard 右上角 **Copy applied** 快速复制，然后粘贴进去（1 行 1 个 URL）。

在 prompt 里加一条硬约束（示例文字）：

```
IMPORTANT: Before ranking, load the local applied-links file at
/Users/agao/Documents/New project/job-dashboard/data/applied_links.txt
and exclude any roles whose official link matches a line in that file (case-insensitive).
If a role is already applied, do not include it in the ranked shortlist or feed output.
```

Also load the blocked-links file at:
/Users/agao/Documents/New project/job-dashboard/data/blocked_links.txt
and exclude any roles whose official link matches (case-insensitive). Use this for roles that were found to be 404, stale, or otherwise not real.

## （新增）地区过滤：只要美国或中国

在 prompt 里加一条硬约束，保证输出只包含美国或中国地区的岗位（包含 Remote US / US hybrid / 中国远程 / 中国城市等表述）：

```
LOCATION FILTER (HARD REQUIREMENT): Only include roles located in the United States or China.
Exclude any roles whose location is outside US/China (e.g., Mexico, Canada, EU, India, etc.).
If the official page does not clearly indicate US or China location/eligibility, treat it as out-of-scope and do not include it in the ranked shortlist or feed output.
```

## （新增）纳入“高薪 + 沟通驱动”的服务型 Tech 项目管理岗

如果出现以下类型岗位，也可以纳入 shortlist（前提仍然满足：非工程岗、非以写代码为核心、并通过官方页面验证 active）：

- Staffing/Services/Consulting 取向的 “technology company” 项目群/项目组合管理（Program/Portfolio）岗位
- 强调：stakeholder management、executive communication、risk/issue management、KPIs/dashboards、process improvement
- 远程/混合办公优先；薪酬显著高于同级别市场（若官方页明确展示）

但需要在输出里明确标注：
- 该类公司/岗位可能偏“交付/客户项目管理”；以及雇主主体（如页面为 Confidential）需要二次确认。
# Dashboard feed wiring (required)

To ensure the daily automation results show up in the local dashboard at:
`/Users/agao/Documents/New project/job-dashboard/public/index.html`

Make the automation output a strict JSON payload (array of jobs OR `{generatedAt, jobs}`), then render it into:
`/Users/agao/Documents/New project/job-dashboard/public/feed.js`

Run (inside the automation) after producing JSON:

```bash
# Option A: write JSON to a temp file then render
node "/Users/agao/Documents/New project/scripts/render_job_feed.mjs" --input "/private/tmp/jobs.json" --output "/Users/agao/Documents/New project/job-dashboard/public/feed.js"

# Option B: pipe JSON directly into the renderer
cat "/private/tmp/jobs.json" | node "/Users/agao/Documents/New project/scripts/render_job_feed.mjs" --output "/Users/agao/Documents/New project/job-dashboard/public/feed.js"
```
