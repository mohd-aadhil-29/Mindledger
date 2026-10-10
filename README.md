# MindLedger

**Unlimited AI, earned by thinking.** A responsive local-first prototype for building healthier AI-use habits through independent practice, focus sessions, short breaks, and progress tracking.

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and add a Gemini API key to enable AI replies. Keep that key in the server `.env` file; do not use a `VITE_` prefix or commit the key. The app can still be explored without a key, but AI chat will show a setup message.

`npm run dev` starts the Vite frontend and local Express API. `npm test` runs prompt/workflow contract checks; `npm run build` creates the production frontend bundle. `npm start` serves the production preview and API locally. The interface loads DM Sans and Manrope from Google Fonts when network access is available; system sans-serif fonts are used as fallback.

## Demo accounts

All demo passwords are `demo1234`.

| Role | Email |
| --- | --- |
| Parent | `parent@mindledger.demo` |
| Child | `child1@mindledger.demo` (also `child2@mindledger.demo`) |
| HR Manager/Admin | `admin@mindledger.demo` |
| Worker | `worker1@mindledger.demo` through `worker5@mindledger.demo` |
| Teacher | `teacher@mindledger.demo` |
| Student | `student1@mindledger.demo` through `student6@mindledger.demo` |
| Individual | Register through the Personal segment; no group code is required |

Demo data uses invented names and seeded sessions. Use the role matching the selected segment to log in.

## What is implemented

- Landing, segment and role selection, login and registration flows.
- Personal segment with an Individual account that does not require a group or invitation code.
- Parent, child, HR/admin, worker, teacher and student demo roles.
- Family/company/class group creation and invitation codes; member registration validates group codes and duplicate emails.
- Local browser persistence for demo profile, sessions, draft mission responses, credit transactions, theme, and session.
- Member views for the five-skill cognitive balance sheet, Think Credits, mission practice, focus timer, optional reaction-time and working-memory challenges, self-reported distraction logging, wander breaks, progress charts, and recent activity.
- One AI Coach for every profile, with a Think First / Instant Answer switch. Each response style has its own local chat list; Think First gives a short cue before the learner chooses a hint or solution, while Instant Answer responds directly. The Coach also handles planning, writing, coding, and everyday questions. Gemini is called by a local Express endpoint, with chat history kept in browser localStorage.
- Five playable cognitive games: Recall Lab, Logic Forge, Clarity Sprint, Idea Lab, and Signal Sprint. Each saves an attempt into the member skill/activity history; games do not award credits or modify cognitive-debt/repaid totals.
- Deterministic mission feedback based on response length, vocabulary variety and task-specific terms. Confidence is recorded with the session. Drafts can be resumed on the same device.
- Credit ledger reconciles earn/spend transactions. Mission rewards are applied once per completed submission; the three-per-day break reward cap is enforced from ledger entries.
- Parent, HR/admin and teacher dashboards with group-linked demo data, chart filters, people views, recommendation rules, alerts/observations, and CSV export.
- Supervisor interfaces contain aggregate scores and activity only. They do not render mission answers or private break reflections. Member responses are saved only with their private local session record.
- Light/dark themes, accessible labels, keyboard focus styling, responsive layouts, reduced-motion support, fixed global bars, and friendly validation.

## What is simulated or seeded

- Authentication is simulated. Demo passwords are stored in local browser state, so this is not secure authentication and must not be used with real credentials or sensitive information.
- Data lives in `localStorage` on one browser/device. There is no server, multi-device sync, account recovery, authorization service, or organization isolation boundary. Browser storage can be inspected or changed by the device owner.
- Seeded metrics and sessions are sample data, not real observations. Some chart fallbacks are illustrative where no matching daily session exists and should be treated as sample trends.
- Think Credits are a local prototype ledger. AI chat does not spend credits; the allowance does not meter or guarantee access to Gemini. API quota and billing are controlled by the configured Gemini account.
- AI requests are sent to Google Gemini. The server does not persist chat requests, and chat history is kept in this browser. The local server is bound to `127.0.0.1`; it has no authenticated API sessions or per-account access control and is not suitable for deployment to multiple users as-is. Add real authentication, authorization, provider privacy/retention review, and service-side abuse controls before exposing it beyond localhost.
- Gemini replies were not live-validated unless a working `GEMINI_API_KEY` is configured. The included 20-question suite checks prompt/mode and workflow contracts; it does not measure model answer quality.
- Focus scores and optional challenges are prototype interactions; distraction logging is self-reported. Nothing monitors other applications or verifies a break.
- Cognitive debt and repayment are experimental product indicators, not validated psychological, educational, or medical measurements.
- Contact delivery and automated AI recommendations/evaluation are not connected. Recommendations use transparent deterministic rules.

## Architecture and data model

The React + TypeScript + Vite frontend uses Recharts for visualizations and Lucide icons. `src/model.ts` defines `Person`, `Group`, `Session`, skills, and invented demo fixtures. `src/App.tsx` contains prototype authentication, group management, local persistence, scoring, credit ledger updates, deterministic recommendations, analytics, role dashboards, and interactive sessions. `src/ChatPanel.tsx` provides the two AI modes and local chat history. `server/index.ts` holds the Gemini key server-side and exposes the localhost chat endpoint; `server/prompts.ts` defines tutor and general-assistant instructions. `server/workflow.ts` bounds Coach stages and hints. `src/GamePanel.tsx` contains the five deterministic games and records their results. `src/styles.css` contains the shared responsive light/dark visual system.

The application state models users, groups, sessions, skill metrics, and credit transactions. Mission responses are attached to member-owned session records and are never included in supervisor rendering. A production server must enforce this boundary in API responses and database policies, not rely on UI filtering.

## Connecting Supabase or Firebase

This prototype intentionally has no backend configuration. For a production implementation:

1. Replace the local login/session flow with the provider's supported authentication SDK; never store a real password in application state.
2. Create users, groups, sessions, skills, recommendations, private mission responses, and credit transaction tables/collections with stable IDs and timestamps.
3. Enforce group membership and role permissions on the server. Add row-level security so supervisors can read authorized aggregate metrics but cannot read mission responses or private reflections.
4. Make credit balance changes server-authoritative and transactional. Add idempotency keys for mission rewards and break rewards; enforce the daily break cap at the server.
5. Keep provider secrets in trusted server functions. Validate any AI evaluator output and do not let a model control authoritative scores or credits.
6. Configure allowed origins, email verification, rate limits, abuse reporting, retention, backups, and monitoring before launch.

## Production-readiness checklist

- [ ] Implement real provider authentication and secure session lifecycle.
- [ ] Add server-side APIs, schema migrations, authorization policies, and per-group data isolation.
- [ ] Move credit operations and eligibility checks into atomic server transactions.
- [ ] Add privacy/consent flows suitable for children, schools, and workplace use in target jurisdictions.
- [ ] Review retention/deletion, exports, incident response, and supervisor access logging.
- [ ] Review accessibility and contrast with assistive technology and representative devices.
- [ ] Configure production hosting, CSP, dependency review, observability, and backups.
- [ ] Validate the experimental metrics with appropriate research before making outcome claims.
