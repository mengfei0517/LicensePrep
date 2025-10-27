from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime
from math import asin, cos, radians, sin, sqrt
from statistics import mean
from typing import Any, Dict, List, Optional, Tuple

from flask import Blueprint, jsonify

from api.routes_mobile import _list_sessions, _load_session  # type: ignore

bp = Blueprint("analysis", __name__, url_prefix="/api/analysis")


def _parse_timestamp(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two lat/lng coordinates."""
    r = 6371000.0
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return 2 * r * asin(sqrt(a))


def _normalise_tags(raw_tags: Any, fallback: Optional[str] = None) -> List[str]:
    tags: List[str] = []
    if isinstance(raw_tags, list):
        tags = [str(tag).strip().lower() for tag in raw_tags if str(tag).strip()]
    elif isinstance(raw_tags, str):
        if raw_tags.startswith("[") and raw_tags.endswith("]"):
            # JSON-encoded array
            try:
                import json

                parsed = json.loads(raw_tags)
                if isinstance(parsed, list):
                    tags = [
                        str(tag).strip().lower() for tag in parsed if str(tag).strip()
                    ]
            except (json.JSONDecodeError, TypeError):
                pass
        if not tags:
            tags = [
                part.strip().lower()
                for part in raw_tags.split(",")
                if part.strip()
            ]
    if not tags and fallback:
        tags = [fallback.lower()]
    return tags


def _compute_harsh_events(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if len(points) < 2:
        return []

    enriched: List[Dict[str, Any]] = []
    for point in points:
        lat = point.get("latitude")
        lng = point.get("longitude")
        timestamp = _parse_timestamp(point.get("timestamp"))
        if lat is None or lng is None or timestamp is None:
            continue
        speed = point.get("speed")
        if isinstance(speed, (int, float)):
            speed_ms = float(speed)
        else:
            speed_ms = None
        enriched.append(
            {
                "lat": float(lat),
                "lng": float(lng),
                "timestamp": timestamp,
                "speed": speed_ms,
            }
        )

    if len(enriched) < 2:
        return []

    enriched.sort(key=lambda item: item["timestamp"])
    events: List[Dict[str, Any]] = []
    prev = enriched[0]
    prev_speed = prev["speed"]

    for current in enriched[1:]:
        delta_t = (current["timestamp"] - prev["timestamp"]).total_seconds()
        if delta_t <= 0:
            prev = current
            prev_speed = current["speed"]
            continue

        speed = current["speed"]
        if speed is None or prev_speed is None:
            # fallback to computed speed
            distance = _haversine_m(
                prev["lat"], prev["lng"], current["lat"], current["lng"]
            )
            speed = distance / delta_t if delta_t > 0 else 0.0
        acceleration = (speed - (prev_speed or 0.0)) / delta_t

        if acceleration < -1.5:  # braking threshold (m/s^2)
            events.append(
                {
                    "timestamp": current["timestamp"].isoformat(),
                    "acceleration": acceleration,
                    "latitude": current["lat"],
                    "longitude": current["lng"],
                }
            )

        prev = current
        prev_speed = speed

    return events


def _compute_segments(points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    segments: List[Dict[str, Any]] = []
    if len(points) < 2:
        return segments

    parsed_points: List[Dict[str, Any]] = []
    for point in points:
        lat = point.get("latitude")
        lng = point.get("longitude")
        timestamp = _parse_timestamp(point.get("timestamp"))
        if lat is None or lng is None or timestamp is None:
            continue
        parsed_points.append(
            {
                "lat": float(lat),
                "lng": float(lng),
                "timestamp": timestamp,
                "speed": point.get("speed"),
            }
        )

    if len(parsed_points) < 2:
        return segments

    parsed_points.sort(key=lambda item: item["timestamp"])
    prev = parsed_points[0]

    for current in parsed_points[1:]:
        delta_t = (current["timestamp"] - prev["timestamp"]).total_seconds()
        if delta_t <= 0:
            prev = current
            continue

        distance_m = _haversine_m(
            prev["lat"], prev["lng"], current["lat"], current["lng"]
        )
        speed_ms = (
            float(current["speed"])
            if isinstance(current["speed"], (int, float))
            else distance_m / delta_t
        )
        segments.append(
            {
                "start": prev["timestamp"].isoformat(),
                "end": current["timestamp"].isoformat(),
                "duration_s": delta_t,
                "distance_km": distance_m / 1000.0,
                "speed_ms": speed_ms,
                "speed_kmh": speed_ms * 3.6,
            }
        )
        prev = current

    return segments


def _load_all_sessions() -> List[Dict[str, Any]]:
    sessions: List[Dict[str, Any]] = []
    for summary in _list_sessions():
        session_id = summary.get("session_id")
        if not session_id:
            continue
        session = _load_session(session_id)
        if session:
            sessions.append(session)
    return sessions


def _aggregate_heatmap(
    sessions: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], Counter]:
    clusters: Dict[Tuple[int, int], Dict[str, Any]] = {}
    tag_counter: Counter = Counter()

    for session in sessions:
        session_id = session.get("session_id")

        # Review markers
        for marker in session.get("review_markers", []) or []:
            lat = marker.get("latitude")
            lng = marker.get("longitude")
            if lat is None or lng is None:
                continue
            key = (round(float(lat) * 1000), round(float(lng) * 1000))
            cluster = clusters.setdefault(
                key,
                {
                    "count": 0,
                    "lat_sum": 0.0,
                    "lng_sum": 0.0,
                    "labels": Counter(),
                    "tags": Counter(),
                    "routes": set(),
                    "sources": Counter(),
                },
            )
            cluster["count"] += 1
            cluster["lat_sum"] += float(lat)
            cluster["lng_sum"] += float(lng)
            label = marker.get("label") or marker.get("type") or "Key location"
            cluster["labels"][label] += 1
            tags = _normalise_tags(marker.get("tags"), fallback=marker.get("type"))
            for tag in tags:
                cluster["tags"][tag] += 1
                tag_counter[tag] += 1
            cluster["routes"].add(session_id)
            cluster["sources"][marker.get("type") or "marker"] += 1

        # Voice notes
        for note in session.get("audio_notes", []) or []:
            location = (
                note.get("latitude"),
                note.get("longitude"),
            )
            if location[0] is None or location[1] is None:
                continue
            key = (round(float(location[0]) * 1000), round(float(location[1]) * 1000))
            cluster = clusters.setdefault(
                key,
                {
                    "count": 0,
                    "lat_sum": 0.0,
                    "lng_sum": 0.0,
                    "labels": Counter(),
                    "tags": Counter(),
                    "routes": set(),
                    "sources": Counter(),
                },
            )
            cluster["count"] += 1
            cluster["lat_sum"] += float(location[0])
            cluster["lng_sum"] += float(location[1])
            cluster["labels"]["Voice note"] += 1
            tags = _normalise_tags(note.get("tags"), fallback="voice_note")
            for tag in tags:
                cluster["tags"][tag] += 1
                tag_counter[tag] += 1
            cluster["routes"].add(session_id)
            cluster["sources"]["voice_note"] += 1

    heatmap = []
    for (lat_key, lng_key), cluster in clusters.items():
        count = cluster["count"]
        if count == 0:
            continue
        dominant_tag = (
            cluster["tags"].most_common(1)[0][0] if cluster["tags"] else None
        )
        heatmap.append(
            {
                "cluster_id": f"{lat_key}_{lng_key}",
                "count": count,
                "latitude": cluster["lat_sum"] / count,
                "longitude": cluster["lng_sum"] / count,
                "dominant_label": cluster["labels"].most_common(1)[0][0]
                if cluster["labels"]
                else "Hotspot",
                "dominant_tag": dominant_tag,
                "tags": [
                    {"label": tag, "count": tag_count}
                    for tag, tag_count in cluster["tags"].most_common(5)
                ],
                "routes": list(cluster["routes"]),
                "source_breakdown": cluster["sources"],
            }
        )

    heatmap.sort(key=lambda item: item["count"], reverse=True)
    return heatmap, tag_counter


def _aggregate_top_issues(
    tag_counter: Counter, tag_routes: Dict[str, set]
) -> List[Dict[str, Any]]:
    top_items: List[Dict[str, Any]] = []
    for tag, count in tag_counter.most_common(5):
        top_items.append(
            {
                "label": tag,
                "count": int(count),
                "routes": list(tag_routes.get(tag, []))[:5],
            }
        )
    return top_items


def _compute_practice_trends(
    sessions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    trend_items: List[Dict[str, Any]] = []
    total_duration = 0.0
    total_distance = 0.0
    total_harsh = 0
    total_notes = 0

    for session in sessions:
        session_id = session.get("session_id")
        recorded_at = _parse_timestamp(session.get("start_time"))
        duration = float(session.get("total_duration_min") or 0.0)
        distance = float(session.get("total_distance_km") or 0.0)
        notes_count = len(session.get("audio_notes") or [])
        markers_count = len(session.get("review_markers") or [])
        harsh_events = _compute_harsh_events(session.get("gps_points") or [])
        harsh_count = len(harsh_events)

        total_duration += duration
        total_distance += distance
        total_harsh += harsh_count
        total_notes += notes_count

        safety_score = max(
            0.0, min(100.0, 100.0 - (harsh_count * 8.0) + (markers_count * 1.5))
        )

        trend_items.append(
            {
                "route_id": session_id,
                "recorded_at": recorded_at.isoformat() if recorded_at else None,
                "duration_min": duration,
                "distance_km": distance,
                "voice_notes": notes_count,
                "markers": markers_count,
                "harsh_events": harsh_count,
                "safety_score": round(safety_score, 1),
            }
        )

    trend_items.sort(key=lambda item: item["recorded_at"] or "", reverse=False)
    total_sessions = len(trend_items)
    avg_duration = total_duration / total_sessions if total_sessions else 0.0
    avg_distance = total_distance / total_sessions if total_sessions else 0.0
    harsh_per_hour = (
        total_harsh / (total_duration / 60.0) if total_duration > 0 else total_harsh
    )
    safety_index = max(
        0.0, min(100.0, 100.0 - harsh_per_hour * 12.0 + (total_notes * 0.8))
    )

    return {
        "sessions": trend_items,
        "summary": {
            "session_count": total_sessions,
            "total_duration_min": round(total_duration, 2),
            "total_distance_km": round(total_distance, 2),
            "average_duration_min": round(avg_duration, 2),
            "average_distance_km": round(avg_distance, 2),
            "total_harsh_events": total_harsh,
            "safety_index": round(safety_index, 1),
            "voice_notes_logged": total_notes,
        },
    }


def _suggest_practice_segments(
    heatmap: List[Dict[str, Any]],
    tag_routes: Dict[str, set],
    sessions: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    recommendations: List[Dict[str, Any]] = []
    if not heatmap:
        return recommendations

    for hotspot in heatmap[:5]:
        dominant_tag = hotspot.get("dominant_tag")
        label = hotspot.get("dominant_label")
        if not dominant_tag:
            dominant_tag = label.lower() if label else "focus area"
        reason = (
            f"'{label}' has been flagged {hotspot['count']} times "
            if label
            else f"Recurring events tagged '{dominant_tag}'"
        )
        related_routes = list(tag_routes.get(dominant_tag, []))[:3]
        recommendations.append(
            {
                "label": label or dominant_tag.title(),
                "tag": dominant_tag,
                "reason": reason,
                "latitude": hotspot["latitude"],
                "longitude": hotspot["longitude"],
                "routes": related_routes,
            }
        )
        if len(recommendations) >= 3:
            break

    if not recommendations and heatmap:
        top = heatmap[0]
        recommendations.append(
            {
                "label": top.get("dominant_label", "Practice hotspot"),
                "tag": top.get("dominant_tag"),
                "reason": f"High activity area with {top['count']} events logged.",
                "latitude": top["latitude"],
                "longitude": top["longitude"],
                "routes": top.get("routes", [])[:3],
            }
        )

    return recommendations


def _build_route_note(session: Dict[str, Any]) -> Dict[str, Any]:
    session_id = session.get("session_id")
    start_time = _parse_timestamp(session.get("start_time"))
    end_time = _parse_timestamp(session.get("end_time"))
    duration_min = float(session.get("total_duration_min") or 0.0)
    distance_km = float(session.get("total_distance_km") or 0.0)
    device_id = session.get("device_id")

    gps_points = session.get("gps_points") or []
    segments = _compute_segments(gps_points)
    harsh_events = _compute_harsh_events(gps_points)

    avg_speed = (
        mean(segment["speed_kmh"] for segment in segments) if segments else 0.0
    )
    max_speed = (
        max(segment["speed_kmh"] for segment in segments) if segments else 0.0
    )

    # Stability score: start from 5, subtract per harsh event
    stability_score = max(1.0, 5.0 - (len(harsh_events) * 0.7))
    if duration_min >= 30 and len(harsh_events) == 0:
        stability_score = min(5.0, stability_score + 0.3)

    stability_commentary = []
    if harsh_events:
        worst = sorted(harsh_events, key=lambda e: e["acceleration"])[:3]
        for event in worst:
            stability_commentary.append(
                {
                    "timestamp": event["timestamp"],
                    "type": "brake",
                    "note": f"Hard brake detected (−{abs(event['acceleration']):.2f} m/s²)",
                }
            )
    else:
        stability_commentary.append(
            {
                "timestamp": start_time.isoformat() if start_time else None,
                "type": "praise",
                "note": "No harsh braking detected in this session. Great job!",
            }
        )

    # Speed compliance: compare to adaptive window around median speed
    speeds = [segment["speed_kmh"] for segment in segments if segment["speed_kmh"] > 0]
    compliance_pct = 100.0
    compliance_comment = "Insufficient speed data recorded."
    if speeds:
        median_speed = sorted(speeds)[len(speeds) // 2]
        lower_bound = median_speed * 0.7
        upper_bound = median_speed * 1.2
        compliant = [
            s
            for s in speeds
            if lower_bound <= s <= upper_bound
        ]
        compliance_pct = (len(compliant) / len(speeds)) * 100.0
        compliance_comment = (
            f"{compliance_pct:.0f}% of the drive stayed within "
            f"70–120% of your median speed ({median_speed:.0f} km/h)."
        )

    # Context mix derived from speed buckets
    context_totals = {"urban": 0.0, "rural": 0.0, "highway": 0.0}
    total_distance = sum(segment["distance_km"] for segment in segments)
    for segment in segments:
        speed = segment["speed_kmh"]
        if speed < 40:
            context_totals["urban"] += segment["distance_km"]
        elif speed < 70:
            context_totals["rural"] += segment["distance_km"]
        else:
            context_totals["highway"] += segment["distance_km"]

    context_mix = []
    if total_distance > 0:
        for label, dist in context_totals.items():
            context_mix.append(
                {
                    "label": label,
                    "share": dist / total_distance,
                    "distance_km": dist,
                }
            )

    # Voice note & marker insights
    voice_notes = session.get("audio_notes") or []
    markers = session.get("review_markers") or []
    voice_tags: Counter = Counter()
    for note in voice_notes:
        tags = _normalise_tags(note.get("tags"))
        if tags:
            voice_tags.update(tags)
    for marker in markers:
        tags = _normalise_tags(marker.get("tags"), fallback=marker.get("type"))
        if tags:
            voice_tags.update(tags)

    top_tags = [
        {"label": tag, "count": count} for tag, count in voice_tags.most_common(5)
    ]

    notable_events: List[Dict[str, Any]] = []
    for marker in markers[:5]:
        notable_events.append(
            {
                "timestamp": marker.get("timestamp"),
                "label": marker.get("label"),
                "description": marker.get("description"),
                "type": marker.get("type", "marker"),
            }
        )
    for note in voice_notes[:5]:
        notable_events.append(
            {
                "timestamp": note.get("timestamp"),
                "label": "Voice note",
                "description": note.get("transcript")
                or "Audio note captured during drive.",
                "type": "voice_note",
                "tags": _normalise_tags(note.get("tags")),
            }
        )

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "route_id": session_id,
        "summary": {
            "start_time": start_time.isoformat() if start_time else None,
            "end_time": end_time.isoformat() if end_time else None,
            "duration_min": duration_min,
            "distance_km": distance_km,
            "device_id": device_id,
        },
        "stability": {
            "score": round(stability_score, 1),
            "out_of": 5,
            "harsh_events": len(harsh_events),
            "highlights": stability_commentary,
        },
        "speed_profile": {
            "average_kmh": round(avg_speed, 1),
            "max_kmh": round(max_speed, 1),
            "compliance_percent": round(compliance_pct, 1),
            "commentary": compliance_comment,
        },
        "context_mix": context_mix,
        "voice_tags": top_tags,
        "notable_events": notable_events[:6],
    }


@bp.get("/overview")
def analysis_overview():
    sessions = _load_all_sessions()
    generated_at = datetime.utcnow().isoformat() + "Z"

    if not sessions:
        return jsonify(
            {
                "generated_at": generated_at,
                "routes_count": 0,
                "heatmap": [],
                "top_issues": [],
                "practice_trends": {
                    "sessions": [],
                    "summary": {
                        "session_count": 0,
                        "total_duration_min": 0,
                        "total_distance_km": 0,
                        "average_duration_min": 0,
                        "average_distance_km": 0,
                        "total_harsh_events": 0,
                        "safety_index": 100,
                        "voice_notes_logged": 0,
                    },
                },
                "recommended_segments": [],
            }
        )

    heatmap, tag_counter = _aggregate_heatmap(sessions)
    tag_routes: Dict[str, set] = defaultdict(set)

    for hotspot in heatmap:
        for tag in hotspot.get("tags", []):
            tag_routes[tag["label"]].update(hotspot.get("routes", []))

    # Ensure raw tags also contribute route linking
    for session in sessions:
        session_id = session.get("session_id")
        for note in session.get("audio_notes", []) or []:
            tags = _normalise_tags(note.get("tags"))
            for tag in tags:
                tag_routes[tag].add(session_id)
        for marker in session.get("review_markers", []) or []:
            tags = _normalise_tags(marker.get("tags"), fallback=marker.get("type"))
            for tag in tags:
                tag_routes[tag].add(session_id)

    top_issues = _aggregate_top_issues(tag_counter, tag_routes)
    practice_trends = _compute_practice_trends(sessions)
    recommendations = _suggest_practice_segments(heatmap, tag_routes, sessions)

    overview = {
        "generated_at": generated_at,
        "routes_count": len(sessions),
        "heatmap": heatmap[:20],
        "top_issues": top_issues,
        "practice_trends": practice_trends,
        "recommended_segments": recommendations,
    }

    return jsonify(overview)


@bp.get("/routes/<session_id>")
def route_analysis(session_id: str):
    session = _load_session(session_id)
    if not session:
        return jsonify({"error": "Route not found"}), 404

    note = _build_route_note(session)
    return jsonify(note)
