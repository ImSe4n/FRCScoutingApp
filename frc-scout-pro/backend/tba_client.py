import httpx
from typing import Any
from config import TBA_API_KEY, TBA_BASE_URL

_HEADERS = {"X-TBA-Auth-Key": TBA_API_KEY}


async def _get(path: str) -> Any:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{TBA_BASE_URL}{path}", headers=_HEADERS)
        r.raise_for_status()
        return r.json()


# ── Status ────────────────────────────────────────────────────────────────────
async def get_status():
    return await _get("/status")


# ── Teams ─────────────────────────────────────────────────────────────────────
async def get_team(num: int):
    return await _get(f"/team/frc{num}")

async def get_team_simple(num: int):
    return await _get(f"/team/frc{num}/simple")

async def get_team_years_participated(num: int):
    return await _get(f"/team/frc{num}/years_participated")

async def get_team_robots(num: int):
    return await _get(f"/team/frc{num}/robots")

async def get_team_events(num: int, year: int = 2026):
    return await _get(f"/team/frc{num}/events/{year}")

async def get_team_event_statuses(num: int, year: int = 2026):
    return await _get(f"/team/frc{num}/events/{year}/statuses")

async def get_team_matches(num: int, year: int = 2026):
    return await _get(f"/team/frc{num}/matches/{year}")

async def get_team_matches_for_event(num: int, event_key: str):
    return await _get(f"/team/frc{num}/event/{event_key}/matches")

async def get_team_awards(num: int, year: int = 2026):
    return await _get(f"/team/frc{num}/awards/{year}")

async def get_team_media(num: int, year: int = 2026):
    return await _get(f"/team/frc{num}/media/{year}")

async def get_teams_page(page: int):
    return await _get(f"/teams/{page}/simple")


# ── Events ────────────────────────────────────────────────────────────────────
async def get_events(year: int = 2026):
    return await _get(f"/events/{year}/simple")

async def get_event(key: str):
    return await _get(f"/event/{key}")

async def get_event_simple(key: str):
    return await _get(f"/event/{key}/simple")

async def get_event_teams(key: str):
    return await _get(f"/event/{key}/teams/simple")

async def get_event_matches(key: str):
    return await _get(f"/event/{key}/matches")

async def get_event_match(match_key: str):
    return await _get(f"/match/{match_key}")

async def get_event_rankings(key: str):
    return await _get(f"/event/{key}/rankings")

async def get_event_oprs(key: str):
    return await _get(f"/event/{key}/oprs")

async def get_event_coprs(key: str):
    return await _get(f"/event/{key}/coprs")

async def get_event_insights(key: str):
    return await _get(f"/event/{key}/insights")

async def get_event_awards(key: str):
    return await _get(f"/event/{key}/awards")

async def get_event_alliances(key: str):
    return await _get(f"/event/{key}/alliances")

async def get_event_district_points(key: str):
    return await _get(f"/event/{key}/district_points")


# ── Districts ─────────────────────────────────────────────────────────────────
async def get_districts(year: int = 2026):
    return await _get(f"/districts/{year}")

async def get_district_events(key: str):
    return await _get(f"/district/{key}/events/simple")

async def get_district_teams(key: str):
    return await _get(f"/district/{key}/teams/simple")

async def get_district_rankings(key: str):
    return await _get(f"/district/{key}/rankings")
