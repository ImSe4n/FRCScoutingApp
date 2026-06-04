from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

from database import get_db
from models import ScoutEntry, User, ScoutAssignment, TeamMembership
from schemas import ScoutEntryCreate, AssignmentCreate
from analytics import calculate_score, merge_sort
from dependencies import get_current_user, require_team, require_admin

router = APIRouter()


def _out(e: ScoutEntry, username: str | None = None) -> dict:
    return {
        "id": e.id,
        "team_id": e.team_id,
        "submitted_by_id": e.submitted_by_id,
        "submitted_by_username": username,
        "team_number": e.team_number,
        "match_number": e.match_number,
        "event_key": e.event_key,
        "scouter_name": e.scouter_name,
        "auto_fuel": e.auto_fuel,
        "tele_fuel": e.tele_fuel,
        "end_fuel": e.end_fuel,
        "climb_level": e.climb_level,
        "defence_time": e.defence_time,
        "driver_rating": e.driver_rating,
        "accuracy_rating": e.accuracy_rating,
        "minor_penalties": e.minor_penalties,
        "major_penalties": e.major_penalties,
        "notes": e.notes,
        "created_at": e.created_at,
        "score": calculate_score(e),
    }


# ── Scout Entries ─────────────────────────────────────────────────────────────

@router.get("/entries")
async def list_entries(
    event_key: Optional[str] = None,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    q = (select(ScoutEntry)
         .where(ScoutEntry.team_id == current["team_id"])
         .order_by(ScoutEntry.created_at.desc()))
    if event_key:
        q = q.where(ScoutEntry.event_key == event_key)
    rows = (await db.execute(q)).scalars().all()
    return [_out(e) for e in rows]


@router.post("/entries", status_code=201)
async def create_entry(
    body: ScoutEntryCreate,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    obj = ScoutEntry(
        **body.model_dump(),
        team_id=current["team_id"],
        submitted_by_id=current["user_id"],
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return _out(obj, current["username"])


@router.get("/entries/{entry_id}")
async def get_entry(entry_id: int, current=Depends(require_team),
                    db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.id == entry_id, ScoutEntry.team_id == current["team_id"])
    )).scalar_one_or_none()
    if not row:
        raise HTTPException(404)
    return _out(row)


@router.put("/entries/{entry_id}")
async def update_entry(entry_id: int, body: ScoutEntryCreate,
                       current=Depends(require_team), db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.id == entry_id, ScoutEntry.team_id == current["team_id"])
    )).scalar_one_or_none()
    if not row:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    await db.commit()
    await db.refresh(row)
    return _out(row)


@router.delete("/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: int, current=Depends(require_team),
                       db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        delete(ScoutEntry)
        .where(ScoutEntry.id == entry_id, ScoutEntry.team_id == current["team_id"])
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(404)


@router.get("/team/{frc_team_number}/entries")
async def team_entries(frc_team_number: int, current=Depends(require_team),
                       db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.team_id == current["team_id"],
               ScoutEntry.team_number == frc_team_number)
        .order_by(ScoutEntry.match_number)
    )).scalars().all()
    return [_out(e) for e in rows]


@router.get("/team/{frc_team_number}/averages")
async def team_averages(frc_team_number: int, current=Depends(require_team),
                        db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(ScoutEntry)
        .where(ScoutEntry.team_id == current["team_id"],
               ScoutEntry.team_number == frc_team_number)
    )).scalars().all()
    if not rows:
        raise HTTPException(404, f"No data for team {frc_team_number}")
    n = len(rows)
    scores = [calculate_score(e) for e in rows]
    return {
        "team_number": frc_team_number,
        "match_count": n,
        "avg_auto_fuel": round(sum(e.auto_fuel for e in rows) / n, 2),
        "avg_tele_fuel": round(sum(e.tele_fuel for e in rows) / n, 2),
        "avg_end_fuel":  round(sum(e.end_fuel  for e in rows) / n, 2),
        "avg_total_fuel": round(sum(e.auto_fuel + e.tele_fuel + e.end_fuel for e in rows) / n, 2),
        "avg_climb_level": round(sum(e.climb_level for e in rows) / n, 2),
        "avg_defence_time": round(sum(e.defence_time for e in rows) / n, 2),
        "avg_driver_rating": round(sum(e.driver_rating for e in rows) / n, 2),
        "avg_accuracy_rating": round(sum(e.accuracy_rating for e in rows) / n, 2),
        "avg_penalties": round(sum(e.minor_penalties + e.major_penalties for e in rows) / n, 2),
        "avg_score": round(sum(scores) / n, 2),
        "scores_over_time": [
            {"match": e.match_number, "score": calculate_score(e)}
            for e in sorted(rows, key=lambda x: x.match_number or 0)
        ],
    }


@router.get("/summary")
async def all_team_summaries(
    event_key: Optional[str] = None,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    q = select(ScoutEntry).where(ScoutEntry.team_id == current["team_id"])
    if event_key:
        q = q.where(ScoutEntry.event_key == event_key)
    all_entries = (await db.execute(q)).scalars().all()

    by_team: dict[int, list] = {}
    for e in all_entries:
        by_team.setdefault(e.team_number, []).append(e)

    summaries = []
    for frc_num, entries in by_team.items():
        n = len(entries)
        scores = [calculate_score(e) for e in entries]
        summaries.append({
            "team_number": frc_num,
            "match_count": n,
            "avg_auto_fuel": round(sum(e.auto_fuel for e in entries) / n, 2),
            "avg_tele_fuel": round(sum(e.tele_fuel for e in entries) / n, 2),
            "avg_end_fuel":  round(sum(e.end_fuel  for e in entries) / n, 2),
            "avg_total_fuel": round(sum(e.auto_fuel + e.tele_fuel + e.end_fuel for e in entries) / n, 2),
            "avg_climb_level": round(sum(e.climb_level for e in entries) / n, 2),
            "avg_defence_time": round(sum(e.defence_time for e in entries) / n, 2),
            "avg_driver_rating": round(sum(e.driver_rating for e in entries) / n, 2),
            "avg_accuracy_rating": round(sum(e.accuracy_rating for e in entries) / n, 2),
            "avg_score": round(sum(scores) / n, 2),
        })

    return merge_sort(summaries, key=lambda t: t["avg_score"])


# ── Assignments ───────────────────────────────────────────────────────────────

@router.get("/assignments")
async def list_assignments(
    event_key: Optional[str] = None,
    current=Depends(require_team),
    db: AsyncSession = Depends(get_db),
):
    """Scouts see only their own; admins see all."""
    q = select(ScoutAssignment).where(ScoutAssignment.team_id == current["team_id"])
    if current["role"] != "admin":
        q = q.where(ScoutAssignment.assigned_to_user_id == current["user_id"])
    if event_key:
        q = q.where(ScoutAssignment.event_key == event_key)
    rows = (await db.execute(q.order_by(
        ScoutAssignment.event_key,
        ScoutAssignment.match_number,
        ScoutAssignment.robot_position,
    ))).scalars().all()

    result = []
    for r in rows:
        u = (await db.execute(select(User).where(User.id == r.assigned_to_user_id))).scalar_one_or_none()
        result.append({
            "id": r.id,
            "team_id": r.team_id,
            "assigned_to_user_id": r.assigned_to_user_id,
            "assigned_to_username": u.username if u else None,
            "event_key": r.event_key,
            "match_number": r.match_number,
            "alliance": r.alliance,
            "robot_position": r.robot_position,
            "frc_team_number": r.frc_team_number,
            "created_at": r.created_at,
        })
    return result


@router.post("/assignments", status_code=201)
async def create_assignment(
    body: AssignmentCreate,
    current=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    obj = ScoutAssignment(
        team_id=current["team_id"],
        assigned_to_user_id=body.assigned_to_user_id,
        event_key=body.event_key,
        match_number=body.match_number,
        alliance=body.alliance,
        robot_position=body.robot_position,
        frc_team_number=body.frc_team_number,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return {"id": obj.id, "ok": True}


@router.post("/assignments/bulk", status_code=201)
async def bulk_assignments(
    bodies: List[AssignmentCreate],
    current=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    objs = [
        ScoutAssignment(
            team_id=current["team_id"],
            assigned_to_user_id=b.assigned_to_user_id,
            event_key=b.event_key,
            match_number=b.match_number,
            alliance=b.alliance,
            robot_position=b.robot_position,
            frc_team_number=b.frc_team_number,
        )
        for b in bodies
    ]
    db.add_all(objs)
    await db.commit()
    return {"created": len(objs)}


@router.delete("/assignments/{assignment_id}", status_code=204)
async def delete_assignment(assignment_id: int, current=Depends(require_admin),
                             db: AsyncSession = Depends(get_db)):
    await db.execute(
        delete(ScoutAssignment)
        .where(ScoutAssignment.id == assignment_id,
               ScoutAssignment.team_id == current["team_id"])
    )
    await db.commit()
