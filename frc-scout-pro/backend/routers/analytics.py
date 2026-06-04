import asyncio
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from database import get_db
from models import ScoutEntry
import analytics as alg
import tba_client as tba
from dependencies import require_team

router = APIRouter()


@router.get("/picklist")
async def picklist(
    w_auto:    float = Query(default=1.0, ge=0, le=5),
    w_tele:    float = Query(default=1.0, ge=0, le=5),
    w_climb:   float = Query(default=1.0, ge=0, le=5),
    w_defence: float = Query(default=0.5, ge=0, le=5),
    w_driver:  float = Query(default=0.5, ge=0, le=5),
    event_key: Optional[str] = None,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    q = select(ScoutEntry).where(ScoutEntry.team_id == current["team_id"])
    if event_key:
        q = q.where(ScoutEntry.event_key == event_key)
    all_entries = (await db.execute(q)).scalars().all()
    if not all_entries:
        return []

    by_team: dict[int, list] = {}
    for e in all_entries:
        by_team.setdefault(e.team_number, []).append(e)

    opr_map: dict[str, float] = {}
    if event_key:
        try:
            oprs = await tba.get_event_oprs(event_key)
            opr_map = oprs.get("oprs", {})
        except Exception:
            pass

    items = []
    for frc_num, entries in by_team.items():
        n = len(entries)
        scores = [alg.calculate_score(e) for e in entries]
        avg = {
            "team_number": frc_num,
            "match_count": n,
            "avg_auto_fuel": sum(e.auto_fuel for e in entries) / n,
            "avg_tele_fuel": sum(e.tele_fuel for e in entries) / n,
            "avg_end_fuel":  sum(e.end_fuel  for e in entries) / n,
            "avg_climb_level": sum(e.climb_level for e in entries) / n,
            "avg_defence_time": sum(e.defence_time for e in entries) / n,
            "avg_driver_rating": sum(e.driver_rating for e in entries) / n,
            "avg_score": sum(scores) / n,
        }
        tba_opr = opr_map.get(f"frc{frc_num}")
        ws = alg.weighted_score(avg, w_auto, w_tele, w_climb, w_defence, w_driver)
        if tba_opr is not None:
            ws = round(ws * 0.7 + tba_opr * 0.3, 2)
        items.append({**avg, "tba_opr": tba_opr, "weighted_score": ws})

    ranked = alg.merge_sort(items, key=lambda x: x["weighted_score"])
    return [{"rank": i + 1, **item} for i, item in enumerate(ranked)]


@router.get("/predict")
async def predict(
    red:       str = Query(..., description="Comma-separated red team numbers"),
    blue:      str = Query(..., description="Comma-separated blue team numbers"),
    event_key: Optional[str] = None,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    red_nums  = [int(x.strip()) for x in red.split(",")  if x.strip()]
    blue_nums = [int(x.strip()) for x in blue.split(",") if x.strip()]
    if len(red_nums) != 3 or len(blue_nums) != 3:
        raise HTTPException(400, "Exactly 3 teams per alliance required")

    async def avg_for(frc_num):
        q = select(ScoutEntry).where(
            ScoutEntry.team_id == current["team_id"],
            ScoutEntry.team_number == frc_num,
        )
        if event_key:
            q = q.where(ScoutEntry.event_key == event_key)
        rows = (await db.execute(q)).scalars().all()
        if not rows:
            return {"team_number": frc_num, "avg_score": 0, "match_count": 0,
                    "avg_auto_fuel": 0, "avg_tele_fuel": 0, "avg_climb_level": 0}
        n = len(rows)
        return {
            "team_number": frc_num,
            "avg_score": sum(alg.calculate_score(e) for e in rows) / n,
            "match_count": n,
            "avg_auto_fuel": sum(e.auto_fuel for e in rows) / n,
            "avg_tele_fuel": sum(e.tele_fuel for e in rows) / n,
            "avg_climb_level": sum(e.climb_level for e in rows) / n,
        }

    avgs = await asyncio.gather(*[avg_for(t) for t in red_nums + blue_nums])
    red_avgs, blue_avgs = list(avgs[:3]), list(avgs[3:])

    red_oprs = blue_oprs = [None, None, None]
    if event_key:
        try:
            oprs_data = await tba.get_event_oprs(event_key)
            omap = oprs_data.get("oprs", {})
            red_oprs  = [omap.get(f"frc{t}") for t in red_nums]
            blue_oprs = [omap.get(f"frc{t}") for t in blue_nums]
        except Exception:
            pass

    prediction = alg.predict_match(red_avgs, blue_avgs, red_oprs, blue_oprs)
    return {
        "red_teams":  [{**a, "opr": o} for a, o in zip(red_avgs, red_oprs)],
        "blue_teams": [{**a, "opr": o} for a, o in zip(blue_avgs, blue_oprs)],
        **prediction,
    }
