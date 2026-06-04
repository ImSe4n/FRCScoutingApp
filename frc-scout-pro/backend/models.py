from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class ScoutEntry(Base):
    __tablename__ = "scout_entries"

    id = Column(Integer, primary_key=True, index=True)
    team_number = Column(Integer, nullable=False, index=True)
    match_number = Column(Integer, nullable=True)
    event_key = Column(String(20), nullable=True, index=True)
    scouter_name = Column(String(50), nullable=True)

    # Autonomous phase
    auto_high = Column(Integer, default=0)
    auto_low = Column(Integer, default=0)
    auto_mobility = Column(Boolean, default=False)

    # Teleop phase
    tele_high = Column(Integer, default=0)
    tele_low = Column(Integer, default=0)
    tele_defence_time = Column(Integer, default=0)

    # Endgame phase — 0=none, 1=park, 2=shallow, 3=deep
    end_climb_level = Column(Integer, default=0)

    # Subjective
    driver_rating = Column(Integer, default=3)    # 1–5
    accuracy_rating = Column(Integer, default=3)  # 1–5
    minor_penalties = Column(Integer, default=0)
    major_penalties = Column(Integer, default=0)
    notes = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
