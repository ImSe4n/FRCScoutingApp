from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database import get_db
from models import User, Team, TeamMembership
from schemas import RegisterCreate, LoginRequest, TokenResponse, TeamMemberOut
from auth import verify_password, hash_password, create_token, generate_team_code
from dependencies import get_current_user, require_admin

router = APIRouter()


async def _build_token_response(user: User, membership: TeamMembership | None,
                                 team: Team | None) -> dict:
    return {
        "access_token": create_token(
            user_id=user.id,
            username=user.username,
            team_id=team.id if team else None,
            frc_number=team.frc_number if team else None,
            role=membership.role if membership else None,
        ),
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "team_id": team.id if team else None,
        "team_name": team.name if team else None,
        "frc_number": team.frc_number if team else None,
        "team_code": team.team_code if team else None,
        "role": membership.role if membership else None,
    }


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterCreate, db: AsyncSession = Depends(get_db)):
    if not body.team_name and not body.team_code:
        raise HTTPException(400, "Provide team_name (create) or team_code (join)")

    # Check username unique
    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Username already taken")

    user = User(username=body.username, hashed_password=hash_password(body.password))
    db.add(user)
    await db.flush()  # get user.id

    if body.team_name:
        # Create new team — this user becomes admin
        code = generate_team_code()
        # Ensure code is unique (extremely unlikely collision but handle it)
        while True:
            c = await db.execute(select(Team).where(Team.team_code == code))
            if not c.scalar_one_or_none():
                break
            code = generate_team_code()

        team = Team(name=body.team_name, frc_number=body.frc_number, team_code=code)
        db.add(team)
        await db.flush()
        membership = TeamMembership(user_id=user.id, team_id=team.id, role="admin")
    else:
        # Join existing team
        t = await db.execute(select(Team).where(Team.team_code == body.team_code.upper()))
        team = t.scalar_one_or_none()
        if not team:
            raise HTTPException(404, "Team code not found")
        membership = TeamMembership(user_id=user.id, team_id=team.id, role="scout")

    db.add(membership)
    await db.commit()

    return await _build_token_response(user, membership, team)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")

    mem = await db.execute(
        select(TeamMembership).where(TeamMembership.user_id == user.id)
    )
    membership = mem.scalar_one_or_none()

    team = None
    if membership:
        t = await db.execute(select(Team).where(Team.id == membership.team_id))
        team = t.scalar_one_or_none()

    return await _build_token_response(user, membership, team)


@router.get("/me")
async def me(current=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    team = None
    if current["team_id"]:
        t = await db.execute(select(Team).where(Team.id == current["team_id"]))
        team = t.scalar_one_or_none()
    return {
        "user_id": current["user_id"],
        "username": current["username"],
        "team_id": current["team_id"],
        "team_name": team.name if team else None,
        "frc_number": team.frc_number if team else None,
        "team_code": team.team_code if team else None,
        "role": current["role"],
    }


@router.get("/team/members")
async def list_members(current=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current["team_id"]:
        raise HTTPException(403, "No team")
    mems = await db.execute(
        select(TeamMembership).where(TeamMembership.team_id == current["team_id"])
    )
    result = []
    for m in mems.scalars().all():
        u = await db.execute(select(User).where(User.id == m.user_id))
        usr = u.scalar_one_or_none()
        if usr:
            result.append({"user_id": usr.id, "username": usr.username, "role": m.role})
    return result


@router.put("/team/members/{user_id}/role")
async def set_role(user_id: int, role: str, current=Depends(require_admin),
                   db: AsyncSession = Depends(get_db)):
    if role not in ("admin", "scout"):
        raise HTTPException(400, "Role must be 'admin' or 'scout'")
    mem = await db.execute(
        select(TeamMembership).where(
            TeamMembership.team_id == current["team_id"],
            TeamMembership.user_id == user_id,
        )
    )
    m = mem.scalar_one_or_none()
    if not m:
        raise HTTPException(404, "Member not found")
    m.role = role
    await db.commit()
    return {"ok": True}


@router.delete("/team/members/{user_id}", status_code=204)
async def remove_member(user_id: int, current=Depends(require_admin),
                        db: AsyncSession = Depends(get_db)):
    if user_id == current["user_id"]:
        raise HTTPException(400, "Cannot remove yourself")
    await db.execute(
        delete(TeamMembership).where(
            TeamMembership.team_id == current["team_id"],
            TeamMembership.user_id == user_id,
        )
    )
    await db.commit()


@router.post("/team/regenerate-code")
async def regenerate_code(current=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    t = await db.execute(select(Team).where(Team.id == current["team_id"]))
    team = t.scalar_one_or_none()
    if not team:
        raise HTTPException(404)
    while True:
        code = generate_team_code()
        c = await db.execute(select(Team).where(Team.team_code == code))
        if not c.scalar_one_or_none():
            break
    team.team_code = code
    await db.commit()
    return {"team_code": code}
