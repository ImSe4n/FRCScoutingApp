from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from database import get_db
from models import ScoutEntry
from schemas import ScoutEntryCreate, ScoutEntryOut
from analytics import calculate_score

router = APIRouter()


def _entry_to_out(e: ScoutEntry) -> dict:
    return {
        "id": e.id,
        "team_number": e.team_number,
        "match_number": e.match_number,
        "event_key": e.event_key,
        "scouter_name": e.scouter_name,
        "auto_high": e.auto_high,
        "auto_low": e.auto_low,
        "auto_mobility": e.auto_mobility,
        "tele_high": e.tele_high,
        "tele_low": e.tele_low,
        "tele_defence_time": e.tele_defence_time,
        "end_climb_level": e.end_climb_level,
        "driver_rating": e.driver_rating,
        "accuracy_rating": e.accuracy_rating,
        "minor_penalties": e.minor_penalties,
        "major_penalties": e.major_penalties,
        "notes": e.notes,
        "created_at": e.created_at,
        "score": calculate_score(e),
    }


@router.get("/entries", response_model=List[dict])
async def list_entries(
    event_key: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(ScoutEntry).order_by(ScoutEntry.created_at.desc())
    if event_key:
        q = q.where(ScoutEntry.event_key == event_key)
    result = await db.execute(q)
    return [_entry_to_out(e) for e in result.scalars().all()]


@router.post("/entries", response_model=dict, status_code=201)
async def create_entry(entry: ScoutEntryCreate, db: AsyncSession = Depends(get_db)):
    obj = ScoutEntry(**entry.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return _entry_to_out(obj)


@router.get("/entries/{entry_id}", response_model=dict)
async def get_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScoutEntry).where(ScoutEntry.id == entry_id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, "Entry not found")
    return _entry_to_out(obj)


@router.put("/entries/{entry_id}", response_model=dict)
async def update_entry(
    entry_id: int,
    entry: ScoutEntryCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ScoutEntry).where(ScoutEntry.id == entry_id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, "Entry not found")
    for k, v in entry.model_dump().items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return _entry_to_out(obj)


@router.delete("/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        delete(ScoutEntry).where(ScoutEntry.id == entry_id)
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(404, "Entry not found")


@router.get("/team/{team_number}/entries", response_model=List[dict])
async def team_entries(team_number: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.team_number == team_number)
        .order_by(ScoutEntry.match_number)
    )
    return [_entry_to_out(e) for e in result.scalars().all()]


@router.get("/team/{team_number}/averages")
async def team_averages(team_number: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.team_number == team_number)
    )
    entries = result.scalars().all()
    if not entries:
        raise HTTPException(404, f"No scout data for team {team_number}")

    n = len(entries)
    scores = [calculate_score(e) for e in entries]

    return {
        "team_number": team_number,
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
        "avg_penalties": sum(e.minor_penalties + e.major_penalties for e in entries) / n,
        "avg_score": sum(scores) / n,
        "scores_over_time": [
            {"match": e.match_number, "score": calculate_score(e)}
            for e in sorted(entries, key=lambda x: x.match_number or 0)
        ],
    }


@router.get("/summary")
async def all_team_summaries(db: AsyncSession = Depends(get_db)):
    """Averaged stats for every scouted team — used by Dashboard and PickList."""
    result = await db.execute(select(ScoutEntry))
    all_entries = result.scalars().all()

    by_team: dict[int, list] = {}
    for e in all_entries:
        by_team.setdefault(e.team_number, []).append(e)

    summaries = []
    for team_num, entries in by_team.items():
        n = len(entries)
        scores = [calculate_score(e) for e in entries]
        summaries.append({
            "team_number": team_num,
            "match_count": n,
            "avg_auto_high": round(sum(e.auto_high for e in entries) / n, 2),
            "avg_auto_low": round(sum(e.auto_low for e in entries) / n, 2),
            "mobility_rate": round(sum(1 for e in entries if e.auto_mobility) / n, 2),
            "avg_tele_high": round(sum(e.tele_high for e in entries) / n, 2),
            "avg_tele_low": round(sum(e.tele_low for e in entries) / n, 2),
            "avg_defence_time": round(sum(e.tele_defence_time for e in entries) / n, 2),
            "avg_climb_level": round(sum(e.end_climb_level for e in entries) / n, 2),
            "avg_driver_rating": round(sum(e.driver_rating for e in entries) / n, 2),
            "avg_score": round(sum(scores) / n, 2),
        })

    # Merge-sort by avg_score descending (ported from Java)
    return _merge_sort(summaries, key=lambda t: t["avg_score"])


def _merge_sort(lst: list, key) -> list:
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left = _merge_sort(lst[:mid], key)
    right = _merge_sort(lst[mid:], key)
    return _merge(left, right, key)


def _merge(left: list, right: list, key) -> list:
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if key(left[i]) >= key(right[j]):
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
