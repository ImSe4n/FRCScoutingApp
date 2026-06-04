"""
Scoring formula and pick-list logic (ported & extended from the Java codebase).

REBUILT 2026 scoring approximation:
  Auto  – high: 5 pts, low: 2 pts, mobility bonus: 3 pts
  Teleop– high: 3 pts, low: 1 pt
  Climb – park: 2, shallow: 6, deep: 12
  Penalty deductions: minor ×5, major ×15
  Accuracy factor applied to cycle counts (mirrors Java's accuracy-rating logic).
"""
from models import ScoutEntry

CLIMB_PTS = {0: 0, 1: 2, 2: 6, 3: 12}


def calculate_score(entry: ScoutEntry) -> float:
    accuracy = (entry.accuracy_rating / 5.0) if entry.accuracy_rating > 0 else 1.0

    auto = (entry.auto_high * 5 + entry.auto_low * 2) * accuracy
    if entry.auto_mobility:
        auto += 3

    tele = (entry.tele_high * 3 + entry.tele_low * 1) * accuracy
    climb = CLIMB_PTS.get(entry.end_climb_level, 0)
    penalties = entry.minor_penalties * 5 + entry.major_penalties * 15

    return round(auto + tele + climb - penalties, 2)


def weighted_score(
    avg: dict,
    w_auto: float,
    w_tele: float,
    w_climb: float,
    w_defence: float,
    w_driver: float,
) -> float:
    auto_pts = (avg["avg_auto_high"] * 5 + avg["avg_auto_low"] * 2
                + avg["mobility_rate"] * 3)
    tele_pts = avg["avg_tele_high"] * 3 + avg["avg_tele_low"] * 1
    climb_pts = avg["avg_climb_level"] * 4    # weighted average of climb levels → points
    defence_pts = avg["avg_defence_time"] / 10.0
    driver_pts = avg["avg_driver_rating"] * 2

    return round(
        w_auto * auto_pts
        + w_tele * tele_pts
        + w_climb * climb_pts
        + w_defence * defence_pts
        + w_driver * driver_pts,
        2,
    )


def predict_match(
    red_avgs: list[dict],
    blue_avgs: list[dict],
    red_oprs: list[float],
    blue_oprs: list[float],
) -> dict:
    """
    Blend scout averages (60 %) with TBA OPR (40 %) for each alliance.
    Returns predicted scores and win probability.
    """
    def alliance_score(avgs, oprs):
        scout_total = sum(a["avg_score"] for a in avgs)
        opr_total = sum(o for o in oprs if o is not None)
        opr_count = sum(1 for o in oprs if o is not None)
        if opr_count:
            blend = scout_total * 0.6 + opr_total * 0.4
        else:
            blend = scout_total
        return round(blend, 1)

    red_score = alliance_score(red_avgs, red_oprs)
    blue_score = alliance_score(blue_avgs, blue_oprs)
    total = red_score + blue_score if (red_score + blue_score) > 0 else 1

    return {
        "red_predicted": red_score,
        "blue_predicted": blue_score,
        "red_win_prob": round(red_score / total, 3),
        "blue_win_prob": round(blue_score / total, 3),
        "predicted_winner": "Red" if red_score >= blue_score else "Blue",
        "margin": round(abs(red_score - blue_score), 1),
    }
