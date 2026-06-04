from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ── Auth / Team ───────────────────────────────────────────────────────────────
class RegisterCreate(BaseModel):
    username: str
    password: str
    team_name: Optional[str] = None    # set to create a new team
    frc_number: Optional[int] = None   # optional FRC team number for new team
    team_code: Optional[str] = None    # set to join an existing team


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    team_id: Optional[int]
    team_name: Optional[str]
    frc_number: Optional[int]
    team_code: Optional[str]
    role: Optional[str]


class TeamMemberOut(BaseModel):
    user_id: int
    username: str
    role: str


# ── Scout Entry ───────────────────────────────────────────────────────────────
class ScoutEntryCreate(BaseModel):
    team_number: int
    match_number: Optional[int] = None
    event_key: Optional[str] = None
    scouter_name: Optional[str] = None
    # REBUILT 2026 fuel scoring
    auto_fuel: int = 0
    tele_fuel: int = 0
    end_fuel: int = 0
    climb_level: int = Field(default=0, ge=0, le=3)
    # Subjective
    defence_time: int = 0
    driver_rating: int = Field(default=3, ge=1, le=5)
    accuracy_rating: int = Field(default=3, ge=1, le=5)
    minor_penalties: int = 0
    major_penalties: int = 0
    notes: str = ""


class ScoutEntryOut(ScoutEntryCreate):
    id: int
    team_id: int
    submitted_by_id: Optional[int]
    score: float = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Assignments ───────────────────────────────────────────────────────────────
class AssignmentCreate(BaseModel):
    event_key: str
    match_number: int
    alliance: str = Field(pattern="^(red|blue)$")
    robot_position: int = Field(ge=1, le=3)
    assigned_to_user_id: int
    frc_team_number: Optional[int] = None


class AssignmentOut(AssignmentCreate):
    id: int
    team_id: int
    created_at: Optional[datetime] = None
    assigned_to_username: Optional[str] = None

    class Config:
        from_attributes = True
