from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ScoutEntryCreate(BaseModel):
    team_number: int
    match_number: Optional[int] = None
    event_key: Optional[str] = None
    scouter_name: Optional[str] = None
    auto_high: int = 0
    auto_low: int = 0
    auto_mobility: bool = False
    tele_high: int = 0
    tele_low: int = 0
    tele_defence_time: int = 0
    end_climb_level: int = Field(default=0, ge=0, le=3)
    driver_rating: int = Field(default=3, ge=1, le=5)
    accuracy_rating: int = Field(default=3, ge=1, le=5)
    minor_penalties: int = 0
    major_penalties: int = 0
    notes: str = ""

class ScoutEntryOut(ScoutEntryCreate):
    id: int
    score: float = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TeamAverages(BaseModel):
    team_number: int
    match_count: int
    avg_auto_high: float
    avg_auto_low: float
    mobility_rate: float
    avg_tele_high: float
    avg_tele_low: float
    avg_defence_time: float
    avg_climb_level: float
    avg_driver_rating: float
    avg_accuracy_rating: float
    avg_penalties: float
    avg_score: float

class PicklistEntry(BaseModel):
    rank: int
    team_number: int
    weighted_score: float
    avg_score: float
    match_count: int
    tba_opr: Optional[float] = None
