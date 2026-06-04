# FRC REBUILT 2026 — Scout Pro · Handoff Document

---

## Goal

Build a full-stack FRC scouting web app for the **2026 REBUILT season** that rivals [Lovat](https://lovat.app) in features.  
Data comes from **The Blue Alliance API v3** (real 2026 data). Manual match observations are stored per-team in a local SQLite database.  
The app is multi-user and team-scoped: each FRC scouting group has its own account, join code, and data silo.

---

## What's Working Right Now

| Area | Status |
|---|---|
| Backend boots (FastAPI + SQLite) | ✅ |
| TBA API proxy — all major 2026 endpoints | ✅ |
| JWT auth — register / login / join-by-code | ✅ |
| Team management — roles (admin/scout), remove member, regen code | ✅ |
| Scout entry form — fuel + climb scoring, TBA event/match/team dropdowns | ✅ |
| Per-team data scoping (your team's data only) | ✅ |
| Scout dashboard — sortable table, bar charts, CSV export | ✅ |
| Match predictor — scout avg × 60% + TBA OPR × 40% | ✅ |
| Pick list — merge-sort, configurable weight sliders, OPR blend | ✅ |
| Admin assignments page — auto-schedule all quals, manual add | ✅ |
| Scouts see their assignments on Scout Entry page | ✅ |
| Event browser (browse all 2026 events) | ✅ |
| Event view — rankings, OPRs, matches, alliances, awards | ✅ |
| Team profile — TBA info + radar chart + match history | ✅ |
| 422 fix — removed Field constraints, proper Pydantic error display | ✅ |

---

## Scoring Formula (REBUILT 2026)

Ported directly from `ScoutedRobot.java`:

```
accuracy_factor = accuracy_rating / 5.0   (default 1.0 if unrated)
fuel_score      = (auto_fuel + tele_fuel + end_fuel) × accuracy_factor
climb_score     = climb_level × 10        (L0=0, L1=10, L2=20, L3=30)
penalties       = minor×5 + major×15
total           = fuel_score + climb_score − penalties
```

Pick list adds TBA OPR: `weighted = scout_ws × 0.7 + opr × 0.3`  
Match predictor: `alliance_score = scout_avg × 0.6 + opr × 0.4`

---

## Repo Structure

```
ICS4RSummative/
├── ── master branch ── Java school version (untouched)
│   ├── Alliance.java
│   ├── Match.java
│   ├── Robot.java
│   ├── ScoutedRobot.java
│   ├── Tournament.java
│   └── ScoutingApp.java
│
└── ── personal branch ── full-stack app
    └── frc-scout-pro/
        ├── HANDOFF.md            ← you are here
        ├── backend/
        │   ├── main.py           ← FastAPI app entry, CORS, lifespan DB init
        │   ├── config.py         ← TBA_API_KEY, DATABASE_URL, CURRENT_YEAR=2026
        │   ├── database.py       ← async SQLAlchemy engine + session
        │   ├── models.py         ← Team, User, TeamMembership, ScoutAssignment, ScoutEntry
        │   ├── schemas.py        ← Pydantic models for request/response
        │   ├── auth.py           ← JWT create/decode, bcrypt hash, team code generator
        │   ├── dependencies.py   ← get_current_user, require_team, require_admin
        │   ├── analytics.py      ← calculate_score, weighted_score, predict_match, merge_sort
        │   ├── tba_client.py     ← async httpx wrappers for all TBA v3 endpoints
        │   ├── requirements.txt
        │   └── routers/
        │       ├── auth.py       ← /api/auth/* — register, login, team management
        │       ├── tba.py        ← /api/tba/*  — proxy to TBA, /full aggregates
        │       ├── scouting.py   ← /api/scout/* — entries CRUD, averages, assignments
        │       └── analytics.py  ← /api/analytics/* — picklist, predict
        │
        └── frontend/
            ├── package.json
            ├── vite.config.js    ← proxies /api → localhost:8000
            ├── tailwind.config.js
            └── src/
                ├── App.jsx           ← routes, AuthProvider, ProtectedRoute wrapper
                ├── main.jsx
                ├── index.css         ← Tailwind + custom utility classes
                ├── api/
                │   └── client.js     ← axios instance, auth interceptor, tba/scout/analytics exports
                ├── context/
                │   └── AuthContext.jsx ← user state, login/logout, updateTeamCode
                ├── components/
                │   ├── Navbar.jsx        ← sidebar nav, team code display, logout
                │   ├── ProtectedRoute.jsx ← redirects to /login if unauthenticated
                │   ├── LoadingSpinner.jsx
                │   └── StatCard.jsx
                └── pages/
                    ├── Login.jsx         ← 3-tab: sign in / create team / join team
                    ├── Home.jsx          ← search, quick links, featured events
                    ├── EventBrowser.jsx  ← list all 2026 events, filter by type/name
                    ├── EventView.jsx     ← rankings, OPRs, matches, alliances, awards
                    ├── TeamProfile.jsx   ← TBA data, radar chart, score trend, match history
                    ├── ScoutEntry.jsx    ← fuel/climb form, TBA dropdowns, assignments
                    ├── ScoutDashboard.jsx ← team-scoped table + charts + CSV export
                    ├── MatchPredictor.jsx ← event→match autofill, alliance picker, prediction
                    ├── PickList.jsx      ← weight sliders, merge-sort ranking, CSV export
                    ├── Assignments.jsx   ← admin: auto-schedule, manual assign, delete
                    └── TeamManagement.jsx ← team code, member roles, remove members
```

---

## Database Schema (SQLite · `scout_data.db`)

```
teams              id, name, frc_number, team_code, created_at
users              id, username, hashed_password, created_at
team_memberships   id, user_id→users, team_id→teams, role("admin"|"scout")
scout_assignments  id, team_id, assigned_to_user_id, event_key, match_number,
                   alliance("red"|"blue"), robot_position(1-3), frc_team_number
scout_entries      id, team_id, submitted_by_id, team_number, match_number,
                   event_key, scouter_name,
                   auto_fuel, tele_fuel, end_fuel, climb_level(0-3),
                   defence_time, driver_rating(1-5), accuracy_rating(1-5),
                   minor_penalties, major_penalties, notes, created_at
```

> **Heads-up:** `create_all` won't rename columns. If you change field names, delete `scout_data.db` to recreate it fresh.

---

## TBA API Endpoints In Use

All proxied through the backend at `/api/tba/*` so the API key never hits the frontend.

| Endpoint | Used For |
|---|---|
| `GET /status` | API health check |
| `GET /team/frc{num}` | Team profile info |
| `GET /team/frc{num}/events/2026` | Team's events |
| `GET /team/frc{num}/matches/2026` | Team's match history |
| `GET /team/frc{num}/awards/2026` | Team awards |
| `GET /team/frc{num}/media/2026` | Team media/photos |
| `GET /events/2026/simple` | All 2026 events (event browser, dropdowns) |
| `GET /event/{key}` | Event info |
| `GET /event/{key}/teams/simple` | Teams at event (scout entry dropdown) |
| `GET /event/{key}/matches` | Match schedule (match dropdown, predictor autofill) |
| `GET /event/{key}/rankings` | Qual rankings |
| `GET /event/{key}/oprs` | OPR / DPR / CCWM (pick list + predictor blend) |
| `GET /event/{key}/alliances` | Alliance selections |
| `GET /event/{key}/awards` | Event awards |
| `GET /event/{key}/insights` | Game-specific insights |
| `GET /districts/2026` | All districts |
| `GET /district/{key}/rankings` | District point rankings |
| `GET /district/{key}/events/simple` | Events in a district |

---

## Auth Flow

```
Register (Create Team)
  → POST /api/auth/register { username, password, team_name, frc_number? }
  ← JWT token + user/team info stored in localStorage

Register (Join Team)
  → POST /api/auth/register { username, password, team_code }
  ← JWT token, joined as "scout"

Login
  → POST /api/auth/login { username, password }
  ← JWT token (7-day expiry)

Every subsequent request
  → Authorization: Bearer <token>  (set by axios interceptor in client.js)
```

JWT payload contains: `sub` (user_id), `username`, `team_id`, `frc_number`, `role`

---

## Known Issues / Bugs to Fix Before Final

1. **No DB migrations** — changing any model field name requires manually deleting `scout_data.db`. Add Alembic for the final version.
2. **`/api/auth/team/members` `role` query param** — `setRole` in `routers/auth.py` reads role from `?role=` query param which is slightly awkward. Change to a JSON body `{ "role": "admin" }`.
3. **`team_profile` endpoint** uses `asyncio.gather` but the module-level `asyncio` import is missing in `routers/tba.py` — add `import asyncio` at the top.
4. **`create_assignment` and `bulk_assignments`** were fixed (untyped `body` → `AssignmentCreate`) but haven't been end-to-end tested.
5. **`TBA 403` errors** — TBA blocks direct browser fetch; all calls go through the backend proxy correctly, but make sure you never call TBA directly from the frontend.
6. **Assignments auto-schedule creates duplicates** — calling "Auto-Assign" twice doubles the assignments. Add a "clear existing" step first.
7. **`/api/scout/summary` returns all events merged** unless `event_key` filter is used — the dashboard event filter dropdown handles this, but make sure users understand it.

---

## What To Build Next (Final App Roadmap)

### High Priority
- [ ] **Real game fields** — verify REBUILT 2026 game mechanics from TBA's `score_breakdown` and update `auto_fuel` / `tele_fuel` / `end_fuel` labels to match actual game elements
- [ ] **Pit scouting form** — separate from match scouting; record drivetrain, auto capabilities, robot dimensions, notes
- [ ] **Team comparison view** — select 2-3 teams and see their stats side by side (bar chart + radar)
- [ ] **Scouting coordinator view** — admin sees real-time submission status (who has submitted for each match slot)
- [ ] **Persistent event selection** — save the currently active event in localStorage so it pre-fills everywhere
- [ ] **Delete scout_data.db note in setup** — or add proper Alembic migrations

### Medium Priority
- [ ] **Offline support** — cache scout entries in IndexedDB or localStorage, sync when back online (core Lovat feature)
- [ ] **Mobile responsive layout** — the sidebar collapses on small screens; the scouting form needs a vertical-only layout for phones
- [ ] **Strategy notes per team** — a freetext notes panel on TeamProfile that's shared across your scouting team
- [ ] **Alliance selection helper** — given your team's rank, simulate which teams you'd want to pick (uses pick list output)
- [ ] **Match schedule view** — show a timeline of when your assigned matches come up, with a countdown
- [ ] **OPR-only mode** — for events where you have no scout data, use TBA OPR directly for pick list and predictor

### Lower Priority
- [ ] **Export to Google Sheets** via a Sheets API integration
- [ ] **Push notifications** (browser or email) when admin creates new assignments
- [ ] **Dark/light theme toggle**
- [ ] **Avatar/team logo** — pull from TBA `/team/frc{num}/media/2026` and display in navbar
- [ ] **District rankings integration** — show where a team sits in their district

---

## How To Run

```bash
# 1. Backend (from frc-scout-pro/backend)
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2. Frontend (from frc-scout-pro/frontend)
npm install
npm run dev
# → open http://localhost:5173
```

First user to register for a given team becomes the admin and gets the join code.  
Share the 6-char code with scouts → they register with "Join Team".

---

## Key Design Decisions Made

| Decision | Rationale |
|---|---|
| Python FastAPI (not Java backend) | Easier async HTTP, SQLite ORM, JWT in a weekend |
| TBA calls proxied through backend | Keeps API key server-side; frontend never sees it |
| SQLite (not Postgres) | Zero setup; file-based is fine for one team per tournament |
| JWT in localStorage | Simple for a desktop web app; not a public SaaS |
| Merge sort + binary search in Python analytics.py | Direct port of Java Tournament.java algorithms as required |
| Fuel + climb scoring (not generic high/low) | Matches the existing Java app schema and REBUILT 2026 game |
| `team_id` on every ScoutEntry | All data is siloed per scouting team — no cross-team leakage |
| 6-char uppercase team code | Same UX pattern as Lovat — easy to share verbally or on paper |

---

*Generated June 2026 · personal branch · Sean Nie*
