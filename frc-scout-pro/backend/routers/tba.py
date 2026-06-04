import asyncio
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import tba_client as tba
from config import CURRENT_YEAR

router = APIRouter()


def _tba_error(e: Exception, detail: str = "TBA API error"):
    raise HTTPException(status_code=502, detail=f"{detail}: {e}")


# ── Status ────────────────────────────────────────────────────────────────────
@router.get("/status")
async def api_status():
    try:
        return await tba.get_status()
    except Exception as e:
        _tba_error(e)


# ── Teams ─────────────────────────────────────────────────────────────────────
@router.get("/team/{team_number}")
async def get_team(team_number: int):
    try:
        return await tba.get_team(team_number)
    except Exception as e:
        raise HTTPException(404, f"Team {team_number} not found")


@router.get("/team/{team_number}/profile")
async def get_team_profile(team_number: int, year: int = CURRENT_YEAR):
    """Full team profile: info + events + awards + media + years participated."""
    try:
        team, events, awards, media, years = await asyncio.gather(
            tba.get_team(team_number),
            tba.get_team_events(team_number, year),
            tba.get_team_awards(team_number, year),
            tba.get_team_media(team_number, year),
            tba.get_team_years_participated(team_number),
            return_exceptions=True,
        )
        return {
            "team": team if not isinstance(team, Exception) else None,
            "events": events if not isinstance(events, Exception) else [],
            "awards": awards if not isinstance(awards, Exception) else [],
            "media": media if not isinstance(media, Exception) else [],
            "years_participated": years if not isinstance(years, Exception) else [],
        }
    except Exception as e:
        raise HTTPException(404, str(e))


@router.get("/team/{team_number}/matches/{year}")
async def get_team_matches(team_number: int, year: int = CURRENT_YEAR):
    try:
        return await tba.get_team_matches(team_number, year)
    except Exception as e:
        raise HTTPException(502, str(e))


@router.get("/team/{team_number}/event/{event_key}/matches")
async def get_team_event_matches(team_number: int, event_key: str):
    try:
        return await tba.get_team_matches_for_event(team_number, event_key)
    except Exception as e:
        raise HTTPException(502, str(e))


@router.get("/team/{team_number}/awards/{year}")
async def get_team_awards(team_number: int, year: int = CURRENT_YEAR):
    try:
        return await tba.get_team_awards(team_number, year)
    except Exception as e:
        raise HTTPException(502, str(e))


@router.get("/teams/page/{page}")
async def get_teams_page(page: int = 0):
    try:
        return await tba.get_teams_page(page)
    except Exception as e:
        _tba_error(e)


# ── Events ────────────────────────────────────────────────────────────────────
@router.get("/events/{year}")
async def get_events(year: int = CURRENT_YEAR):
    try:
        return await tba.get_events(year)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}")
async def get_event(event_key: str):
    try:
        return await tba.get_event(event_key)
    except Exception as e:
        raise HTTPException(404, f"Event {event_key} not found")


@router.get("/event/{event_key}/full")
async def get_event_full(event_key: str):
    """Single payload with teams, matches, rankings, OPRs, alliances, awards."""
    results = await asyncio.gather(
        tba.get_event(event_key),
        tba.get_event_teams(event_key),
        tba.get_event_matches(event_key),
        tba.get_event_rankings(event_key),
        tba.get_event_oprs(event_key),
        tba.get_event_alliances(event_key),
        tba.get_event_awards(event_key),
        tba.get_event_insights(event_key),
        return_exceptions=True,
    )
    keys = ["event", "teams", "matches", "rankings", "oprs",
            "alliances", "awards", "insights"]
    return {k: (v if not isinstance(v, Exception) else None)
            for k, v in zip(keys, results)}


@router.get("/event/{event_key}/teams")
async def get_event_teams(event_key: str):
    try:
        return await tba.get_event_teams(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/matches")
async def get_event_matches(event_key: str):
    try:
        return await tba.get_event_matches(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/rankings")
async def get_event_rankings(event_key: str):
    try:
        return await tba.get_event_rankings(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/oprs")
async def get_event_oprs(event_key: str):
    try:
        return await tba.get_event_oprs(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/insights")
async def get_event_insights(event_key: str):
    try:
        return await tba.get_event_insights(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/alliances")
async def get_event_alliances(event_key: str):
    try:
        return await tba.get_event_alliances(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/event/{event_key}/awards")
async def get_event_awards(event_key: str):
    try:
        return await tba.get_event_awards(event_key)
    except Exception as e:
        _tba_error(e)


@router.get("/match/{match_key}")
async def get_match(match_key: str):
    try:
        return await tba.get_event_match(match_key)
    except Exception as e:
        raise HTTPException(404, str(e))


# ── Districts ─────────────────────────────────────────────────────────────────
@router.get("/districts/{year}")
async def get_districts(year: int = CURRENT_YEAR):
    try:
        return await tba.get_districts(year)
    except Exception as e:
        _tba_error(e)


@router.get("/district/{district_key}/rankings")
async def get_district_rankings(district_key: str):
    try:
        return await tba.get_district_rankings(district_key)
    except Exception as e:
        _tba_error(e)


@router.get("/district/{district_key}/events")
async def get_district_events(district_key: str):
    try:
        return await tba.get_district_events(district_key)
    except Exception as e:
        _tba_error(e)
