from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import asyncio

from database import get_db
from models import ScoutEntry
import analytics as alg
import tba_client as tba

router = APIRouter()


@router.get("/picklist")
async def generate_picklist(
    w_auto: float = Query(default=1.0, ge=0, le=5),
    w_tele: float = Query(default=1.0, ge=0, le=5),
    w_climb: float = Query(default=1.0, ge=0, le=5),
    w_defence: float = Query(default=0.5, ge=0, le=5),
    w_driver: float = Query(default=0.5, ge=0, le=5),
    event_key: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a ranked pick list blending scout averages with optional TBA OPR data.
    Weights are user-configurable sliders from the frontend.
    """
    q = select(ScoutEntry)
    if event_key:
        q = q.where(ScoutEntry.event_key == event_key)
    result = await db.execute(q)
    all_entries = result.scalars().all()

    if not all_entries:
        return []

    # Group by team
    by_team: dict[int, list] = {}
    for e in all_entries:
        by_team.setdefault(e.team_number, []).append(e)

    # Fetch TBA OPR for the event if provided
    opr_map: dict[str, float] = {}
    if event_key:
        try:
            oprs = await tba.get_event_oprs(event_key)
            opr_map = oprs.get("oprs", {})
        except Exception:
            pass

    # Build averages per team
    entries_list = []
    for team_num, entries in by_team.items():
        n = len(entries)
        scores = [alg.calculate_score(e) for e in entries]
        avg = {
            "team_number": team_num,
            "match_count": n,
            "avg_auto_high": sum(e.auto_high for e in entries) / n,
            "avg_auto_low": sum(e.auto_low for e in entries) / n,
            "mobility_rate": sum(1 for e in entries if e.auto_mobility) / n,
            "avg_tele_high": sum(e.tele_high for e in entries) / n,
            "avg_tele_low": sum(e.tele_low for e in entries) / n,
            "avg_defence_time": sum(e.tele_defence_time for e in entries) / n,
            "avg_climb_level": sum(e.end_climb_level for e in entries) / n,
            "avg_driver_rating": sum(e.driver_rating for e in entries) / n,
            "avg_accuracy_rating": sum(e.accuracy_rating for e in entries) / n,
            "avg_score": sum(scores) / n,
        }
        tba_opr = opr_map.get(f"frc{team_num}")
        ws = alg.weighted_score(avg, w_auto, w_tele, w_climb, w_defence, w_driver)

        # Blend with OPR if available
        if tba_opr is not None:
            ws = round(ws * 0.7 + tba_opr * 0.3, 2)

        entries_list.append({**avg, "tba_opr": tba_opr, "weighted_score": ws})

    # Sort descending by weighted_score (merge sort from Java)
    sorted_list = _merge_sort(entries_list, key=lambda x: x["weighted_score"])

    return [{"rank": i + 1, **item} for i, item in enumerate(sorted_list)]


@router.get("/predict")
async def predict_match(
    red: str = Query(..., description="Comma-separated red team numbers e.g. 254,1114,2056"),
    blue: str = Query(..., description="Comma-separated blue team numbers"),
    event_key: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    red_nums = [int(x.strip()) for x in red.split(",") if x.strip()]
    blue_nums = [int(x.strip()) for x in blue.split(",") if x.strip()]

    if len(red_nums) != 3 or len(blue_nums) != 3:
        raise HTTPException(400, "Provide exactly 3 teams per alliance")

    all_nums = red_nums + blue_nums

    async def get_avg(team_num):
        q = select(ScoutEntry).where(ScoutEntry.team_number == team_num)
        if event_key:
            q = q.where(ScoutEntry.event_key == event_key)
        result = await db.execute(q)
        entries = result.scalars().all()
        if not entries:
            return {"team_number": team_num, "avg_score": 0, "match_count": 0}
        n = len(entries)
        scores = [alg.calculate_score(e) for e in entries]
        return {
            "team_number": team_num,
            "avg_score": sum(scores) / n,
            "match_count": n,
            "avg_auto_high": sum(e.auto_high for e in entries) / n,
            "avg_tele_high": sum(e.tele_high for e in entries) / n,
            "avg_climb_level": sum(e.end_climb_level for e in entries) / n,
        }

    avgs = await asyncio.gather(*[get_avg(t) for t in all_nums])
    red_avgs = list(avgs[:3])
    blue_avgs = list(avgs[3:])

    # Fetch OPRs if event_key given
    red_oprs = [None, None, None]
    blue_oprs = [None, None, None]
    if event_key:
        try:
            oprs_data = await tba.get_event_oprs(event_key)
            opr_map = oprs_data.get("oprs", {})
            red_oprs = [opr_map.get(f"frc{t}") for t in red_nums]
            blue_oprs = [opr_map.get(f"frc{t}") for t in blue_nums]
        except Exception:
            pass

    prediction = alg.predict_match(red_avgs, blue_avgs, red_oprs, blue_oprs)

    return {
        "red_teams": [
            {**a, "opr": o} for a, o in zip(red_avgs, red_oprs)
        ],
        "blue_teams": [
            {**a, "opr": o} for a, o in zip(blue_avgs, blue_oprs)
        ],
        **prediction,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────
def _merge_sort(lst, key):
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left = _merge_sort(lst[:mid], key)
    right = _merge_sort(lst[mid:], key)
    return _merge(left, right, key)


def _merge(left, right, key):
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if key(left[i]) >= key(right[j]):
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
