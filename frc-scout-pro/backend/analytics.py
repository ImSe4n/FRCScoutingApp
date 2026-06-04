"""
REBUILT 2026 scoring — direct port of Java ScoutedRobot.getIndividualScore():

  accuracy_factor = accuracy_rating / 5   (or 1.0 if rating is 0)
  fuel_score      = (auto_fuel + tele_fuel + end_fuel) * accuracy_factor
  climb_score     = climb_level * 10
  penalties       = minor * 5 + major * 15
  total           = fuel_score + climb_score - penalties
"""

CLIMB_PTS = {0: 0, 1: 10, 2: 20, 3: 30}


def calculate_score(entry) -> float:
    accuracy = (entry.accuracy_rating / 5.0) if entry.accuracy_rating > 0 else 1.0
    fuel  = (entry.auto_fuel + entry.tele_fuel + entry.end_fuel) * accuracy
    climb = CLIMB_PTS.get(entry.climb_level, 0)
    pens  = entry.minor_penalties * 5 + entry.major_penalties * 15
    return round(fuel + climb - pens, 2)


def weighted_score(avg: dict, w_auto: float, w_tele: float, w_climb: float,
                   w_defence: float, w_driver: float) -> float:
    return round(
        w_auto    * avg["avg_auto_fuel"]
        + w_tele  * avg["avg_tele_fuel"]
        + w_climb * avg["avg_climb_level"] * 10
        + w_defence * avg["avg_defence_time"] / 10.0
        + w_driver  * avg["avg_driver_rating"] * 2,
        2,
    )


def predict_match(red_avgs, blue_avgs, red_oprs, blue_oprs) -> dict:
    def side(avgs, oprs):
        scout = sum(a["avg_score"] for a in avgs)
        valid = [(o) for o in oprs if o is not None]
        opr   = sum(valid) if valid else None
        return round(scout * 0.6 + opr * 0.4, 1) if opr is not None else round(scout, 1)

    r, b = side(red_avgs, red_oprs), side(blue_avgs, blue_oprs)
    total = (r + b) or 1
    return {
        "red_predicted": r, "blue_predicted": b,
        "red_win_prob": round(r / total, 3), "blue_win_prob": round(b / total, 3),
        "predicted_winner": "Red" if r >= b else "Blue",
        "margin": round(abs(r - b), 1),
    }


# ── Merge sort (ported from Java Tournament.mergeSort) ────────────────────────
def merge_sort(lst: list, key) -> list:
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    return _merge(merge_sort(lst[:mid], key), merge_sort(lst[mid:], key), key)


def _merge(left, right, key):
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if key(left[i]) >= key(right[j]):
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
