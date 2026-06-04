from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Team(Base):
    """A scouting team (e.g. Team 1234's scouting group)."""
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    frc_number = Column(Integer, nullable=True)   # optional FRC team number
    team_code = Column(String(10), unique=True, nullable=False)  # join code
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TeamMembership(Base):
    """Links a user to a team with a role."""
    __tablename__ = "team_memberships"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    role = Column(String(20), default="scout", nullable=False)  # "admin" | "scout"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ScoutAssignment(Base):
    """Admin assigns a scout to a specific match position."""
    __tablename__ = "scout_assignments"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_key = Column(String(20), nullable=False)
    match_number = Column(Integer, nullable=False)
    alliance = Column(String(4), nullable=False)   # "red" | "blue"
    robot_position = Column(Integer, nullable=False)  # 1, 2, or 3
    frc_team_number = Column(Integer, nullable=True)  # the FRC robot to scout
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ScoutEntry(Base):
    """A single match observation recorded by a scout."""
    __tablename__ = "scout_entries"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    submitted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    team_number = Column(Integer, nullable=False, index=True)  # FRC robot being scouted
    match_number = Column(Integer, nullable=True)
    event_key = Column(String(20), nullable=True, index=True)
    scouter_name = Column(String(50), nullable=True)

    # ── REBUILT 2026 scoring (fuel-based, matching the Java app) ──────────────
    auto_fuel = Column(Integer, default=0)   # fuel scored in autonomous
    tele_fuel = Column(Integer, default=0)   # fuel scored in teleop
    end_fuel  = Column(Integer, default=0)   # fuel scored in endgame
    climb_level = Column(Integer, default=0) # 0=none, 1=low, 2=mid, 3=high → ×10 pts

    # ── Subjective ratings ────────────────────────────────────────────────────
    defence_time    = Column(Integer, default=0)  # seconds defending
    driver_rating   = Column(Integer, default=3)  # 1–5
    accuracy_rating = Column(Integer, default=3)  # 1–5; used as accuracy factor
    minor_penalties = Column(Integer, default=0)
    major_penalties = Column(Integer, default=0)
    notes = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
