from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, TeamMembership, Team
from auth import decode_token

_bearer = HTTPBearer()


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
):
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    user_id = int(payload.get("sub"))
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")

    return {
        "user": user,
        "user_id": user.id,
        "username": user.username,
        "team_id": payload.get("team_id"),
        "frc_number": payload.get("frc_number"),
        "role": payload.get("role"),
    }


async def require_team(current=Depends(get_current_user)):
    if not current["team_id"]:
        raise HTTPException(403, "You must belong to a team first")
    return current


async def require_admin(current=Depends(require_team)):
    if current["role"] != "admin":
        raise HTTPException(403, "Admin access required")
    return current
