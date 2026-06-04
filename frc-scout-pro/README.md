# FRC REBUILT 2026 — Scout Pro

Full-stack scouting app using The Blue Alliance API.

## Stack
- **Backend** — Python FastAPI + SQLite + async TBA proxy
- **Frontend** — React 18 + Vite + Tailwind CSS + Recharts

## Setup

### Backend
```bash
cd frc-scout-pro/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frc-scout-pro/frontend
npm install
npm run dev
```
Then open http://localhost:5173

## Features
| Page | Description |
|------|-------------|
| Home | Team/event search |
| Events | Browse all 2026 REBUILT events |
| Event View | Rankings, OPR/DPR/CCWM, matches, alliances, awards |
| Team Profile | TBA data + radar chart + match history |
| Scout Entry | Per-match scouting form |
| Dashboard | Averaged stats table + bar charts + CSV export |
| Match Predictor | Scout data × 0.6 + OPR × 0.4 blend |
| Pick List | Configurable weighted ranking with merge sort |

## TBA API Endpoints Used
- `/team/frc{num}` `/team/frc{num}/events/2026` `/team/frc{num}/matches/2026` `/team/frc{num}/awards/2026`
- `/events/2026` `/event/{key}` `/event/{key}/teams` `/event/{key}/matches`
- `/event/{key}/rankings` `/event/{key}/oprs` `/event/{key}/insights` `/event/{key}/alliances` `/event/{key}/awards`
- `/districts/2026` `/district/{key}/rankings`
