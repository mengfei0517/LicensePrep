"""
Mobile App API Routes
Handles route recording data from React Native mobile app
"""

from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from pathlib import Path

bp = Blueprint("mobile", __name__, url_prefix="/api/mobile")

# Storage directory for mobile uploads
UPLOAD_FOLDER = os.path.join("data", "mobile_uploads")
SESSIONS_FOLDER = os.path.join(UPLOAD_FOLDER, "sessions")
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, "audio")
SNAPSHOT_FOLDER = os.path.join(UPLOAD_FOLDER, "snapshots")

# Create folders if they don't exist
os.makedirs(SESSIONS_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(SNAPSHOT_FOLDER, exist_ok=True)

# In-memory session storage (for MVP, use database in production)
active_sessions = {}


def _session_file_path(session_id: str) -> str:
    return os.path.join(SESSIONS_FOLDER, f"{session_id}.json")


def _load_session(session_id: str) -> Optional[Dict[str, Any]]:
    session_file = _session_file_path(session_id)
    if not os.path.exists(session_file):
        return None
    with open(session_file, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_session(session: Dict[str, Any]) -> None:
    session_id = session.get("session_id")
    if not session_id:
        raise ValueError("Session must include session_id")

    session["last_updated"] = datetime.utcnow().isoformat()
    # Ensure preview_url stays in sync if snapshot present
    snapshot_name = session.get("preview_snapshot")
    if snapshot_name:
        session["preview_url"] = f"/api/mobile/routes/{session_id}/snapshot"
    elif "preview_url" in session:
        # Remove stale preview url when snapshot removed
        session.pop("preview_url", None)
    session_file = _session_file_path(session_id)
    with open(session_file, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2)


def _format_location(point: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not point:
        return None
    latitude = point.get("latitude")
    longitude = point.get("longitude")
    if latitude is None or longitude is None:
        return None

    return {
        "latitude": latitude,
        "longitude": longitude,
        "description": f"{latitude:.5f}, {longitude:.5f}",
        "timestamp": point.get("timestamp"),
    }


def _session_to_summary(session: Dict[str, Any]) -> Dict[str, Any]:
    gps_points: List[Dict[str, Any]] = session.get("gps_points", [])
    audio_notes: List[Dict[str, Any]] = session.get("audio_notes", [])
    start_point = gps_points[0] if gps_points else None
    end_point = gps_points[-1] if gps_points else None

    return {
        "route_id": session.get("session_id"),
        "device_id": session.get("device_id"),
        "status": session.get("status", "unknown"),
        "recorded_at": session.get("start_time"),
        "completed_at": session.get("end_time"),
        "duration_min": session.get("total_duration_min", 0),
        "distance_km": session.get("total_distance_km", 0),
        "gps_points_count": len(gps_points),
        "audio_notes_count": len(audio_notes),
        "start_location": _format_location(start_point),
        "end_location": _format_location(end_point),
        "last_updated": session.get("last_updated"),
        "preview_url": session.get("preview_url"),
        "map_bounds": session.get("map_bounds"),
        "source": session.get("source", "unknown"),
    }


def _list_sessions() -> List[Dict[str, Any]]:
    sessions: List[Dict[str, Any]] = []
    for path in Path(SESSIONS_FOLDER).glob("*.json"):
        try:
            with path.open("r", encoding="utf-8") as f:
                session = json.load(f)
                sessions.append(session)
        except Exception as exc:
            print(f"[Mobile API] ⚠️  Failed to read session file {path}: {exc}")

    sessions.sort(key=lambda item: item.get("start_time", ""), reverse=True)
    return sessions


def _save_map_snapshot(session_id: str, data_url: str | None) -> Optional[str]:
    """Persist base64 map snapshot and return stored filename."""
    if not data_url:
        return None
    if not data_url.startswith("data:"):
        print(f"[Mobile API] ⚠️  Invalid snapshot format for {session_id}")
        return None

    try:
        header, encoded = data_url.split(",", 1)
    except ValueError:
        print(f"[Mobile API] ⚠️  Snapshot parsing failed for {session_id}")
        return None

    media_type = header.split(";")[0].replace("data:", "")
    extension = "png"
    if "image/jpeg" in media_type or "image/jpg" in media_type:
        extension = "jpg"
    elif "image/webp" in media_type:
        extension = "webp"

    snapshot_bytes = None
    try:
        import base64
        snapshot_bytes = base64.b64decode(encoded)
    except Exception as exc:
        print(f"[Mobile API] ⚠️  Snapshot base64 decode failed for {session_id}: {exc}")
        return None

    filename = f"{session_id}.{extension}"
    snapshot_path = os.path.join(SNAPSHOT_FOLDER, filename)
    try:
        with open(snapshot_path, "wb") as snapshot_file:
            snapshot_file.write(snapshot_bytes)
        return filename
    except OSError as exc:
        print(f"[Mobile API] ⚠️  Failed to save snapshot for {session_id}: {exc}")
        return None


@bp.post("/routes/start")
def start_session():
    """Start a new route recording session"""
    try:
        data = request.get_json()
        device_id = data.get("device_id")
        start_time = data.get("start_time")

        if not device_id or not start_time:
            return jsonify({"error": "device_id and start_time are required"}), 400

        # Generate session ID
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{device_id[:8]}"
        now_iso = datetime.utcnow().isoformat()

        source = data.get("source", "mobile")

        # Create session data
        session_data = {
            "session_id": session_id,
            "device_id": device_id,
            "start_time": start_time,
            "created_at": now_iso,
            "last_updated": now_iso,
            "gps_points": [],
            "audio_notes": [],
            "status": "recording",
            "source": source,
        }

        # Save to in-memory storage
        active_sessions[session_id] = session_data

        # Save to disk
        _save_session(session_data)

        print(f"[Mobile API] ✅ Session started: {session_id}")
        return jsonify({
            "session_id": session_id,
            "upload_url": f"/api/mobile/routes/{session_id}"
        }), 201

    except Exception as e:
        print(f"[Mobile API] ❌ Error starting session: {e}")
        return jsonify({"error": str(e)}), 500


@bp.post("/routes/<session_id>/gps")
def upload_gps_points(session_id):
    """Upload GPS points for a session"""
    try:
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404

        data = request.get_json()
        points = data.get("points", [])

        if not points:
            return jsonify({"error": "No GPS points provided"}), 400

        # Add points to session
        session = active_sessions[session_id]
        session["gps_points"].extend(points)

        # Update session file
        _save_session(session)

        print(f"[Mobile API] ✅ Uploaded {len(points)} GPS points for {session_id}")
        print(f"[Mobile API]    Total points: {len(session['gps_points'])}")
        
        return jsonify({
            "success": True,
            "points_received": len(points),
            "total_points": len(session["gps_points"])
        }), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error uploading GPS points: {e}")
        return jsonify({"error": str(e)}), 500


@bp.post("/routes/<session_id>/audio")
def upload_audio_note(session_id):
    """Upload audio note for a session"""
    try:
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404

        # Get audio file
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio_file']
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        timestamp = request.form.get('timestamp')
        duration_ms = request.form.get('duration_ms')

        if not timestamp:
            return jsonify({"error": "Missing timestamp"}), 400

        try:
            latitude_val = float(latitude) if latitude not in (None, "", "null") else None
            longitude_val = float(longitude) if longitude not in (None, "", "null") else None
        except ValueError:
            return jsonify({"error": "Invalid GPS coordinates"}), 400

        # Save audio file
        filename = secure_filename(f"{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.m4a")
        audio_path = os.path.join(AUDIO_FOLDER, filename)
        audio_file.save(audio_path)

        # Add audio note to session
        audio_note = {
            "filename": filename,
            "latitude": latitude_val,
            "longitude": longitude_val,
            "timestamp": timestamp,
            "file_path": audio_path,
            "file_url": f"/api/mobile/routes/{session_id}/audio/{filename}",
        }
        if duration_ms not in (None, "", "null"):
            try:
                audio_note["duration_ms"] = float(duration_ms)
            except ValueError:
                pass

        session = active_sessions[session_id]
        session["audio_notes"].append(audio_note)

        # Update session file
        _save_session(session)

        print(f"[Mobile API] ✅ Audio note uploaded for {session_id}")
        print(
            f"[Mobile API]    Location: "
            f"{latitude_val if latitude_val is not None else 'N/A'}, "
            f"{longitude_val if longitude_val is not None else 'N/A'}"
        )
        
        return jsonify({
            "success": True,
            "audio_note_id": filename,
            "total_audio_notes": len(session["audio_notes"])
        }), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error uploading audio note: {e}")
        return jsonify({"error": str(e)}), 500


@bp.post("/routes/<session_id>/finish")
def finish_session(session_id):
    """Finish a route recording session"""
    try:
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404

        data = request.get_json() or {}
        end_time = data.get("end_time") or datetime.utcnow().isoformat()
        total_distance = float(data.get("total_distance", 0) or 0)
        total_duration = float(data.get("total_duration", 0) or 0)
        map_snapshot = data.get("map_snapshot")
        map_bounds = data.get("map_bounds")

        # Update session
        session = active_sessions[session_id]
        session["end_time"] = end_time
        session["total_distance_km"] = total_distance
        session["total_duration_min"] = total_duration
        session["status"] = "completed"

        if map_bounds:
            session["map_bounds"] = map_bounds
        elif session.get("gps_points"):
            lats = [p.get("latitude") for p in session["gps_points"] if p.get("latitude") is not None]
            lngs = [p.get("longitude") for p in session["gps_points"] if p.get("longitude") is not None]
            if lats and lngs:
                session["map_bounds"] = {
                    "min_lat": min(lats),
                    "max_lat": max(lats),
                    "min_lng": min(lngs),
                    "max_lng": max(lngs),
                }

        snapshot_filename = _save_map_snapshot(session_id, map_snapshot)
        if snapshot_filename:
            old_snapshot = session.get("preview_snapshot")
            if old_snapshot and old_snapshot != snapshot_filename:
                old_path = os.path.join(SNAPSHOT_FOLDER, old_snapshot)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError as exc:
                        print(f"[Mobile API] ⚠️  Failed to remove old snapshot {old_snapshot}: {exc}")
            session["preview_snapshot"] = snapshot_filename
        elif map_snapshot == "":
            # Explicit request to remove snapshot
            session.pop("preview_snapshot", None)
            session.pop("preview_url", None)

        # Save final session file
        _save_session(session)

        summary = _session_to_summary(session)

        # Remove from active sessions
        del active_sessions[session_id]

        print(f"[Mobile API] ✅ Session finished: {session_id}")
        print(f"[Mobile API]    Distance: {total_distance:.2f} km")
        print(f"[Mobile API]    Duration: {total_duration:.2f} min")
        print(f"[Mobile API]    GPS Points: {len(session['gps_points'])}")
        print(f"[Mobile API]    Audio Notes: {len(session['audio_notes'])}")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "summary": summary
        }), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error finishing session: {e}")
        return jsonify({"error": str(e)}), 500


@bp.get("/routes")
def list_sessions():
    """List recorded sessions for the web dashboard."""
    try:
        sessions = _list_sessions()
        summaries = [_session_to_summary(session) for session in sessions]

        limit = request.args.get("limit")
        offset = request.args.get("offset")
        limit_value = len(summaries) if limit is None else max(int(limit), 0)
        offset_value = 0 if offset is None else max(int(offset), 0)

        sliced = summaries[offset_value: offset_value + limit_value]

        return jsonify({
            "routes": sliced,
            "total": len(summaries),
            "limit": limit_value,
            "offset": offset_value
        }), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error listing sessions: {e}")
        return jsonify({"error": str(e)}), 500


@bp.get("/routes/<session_id>")
def get_session(session_id):
    """Get detailed session data"""
    try:
        session = _load_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404

        return jsonify({
            "route": _session_to_summary(session),
            "session": session
        }), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error getting session: {e}")
        return jsonify({"error": str(e)}), 500


@bp.delete("/routes/<session_id>")
def delete_session(session_id):
    """Delete a recorded session and its associated assets."""
    try:
        session = _load_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404

        # Delete audio files referenced by the session
        for note in session.get("audio_notes", []):
            file_path = note.get("file_path")
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as exc:
                    print(f"[Mobile API] ⚠️  Failed to delete audio file {file_path}: {exc}")

        # Delete session file
        session_file = _session_file_path(session_id)
        if os.path.exists(session_file):
            os.remove(session_file)

        # Delete snapshot if exists
        snapshot_name = session.get("preview_snapshot")
        if snapshot_name:
            snapshot_path = os.path.join(SNAPSHOT_FOLDER, snapshot_name)
            if os.path.exists(snapshot_path):
                try:
                    os.remove(snapshot_path)
                except OSError as exc:
                    print(f"[Mobile API] ⚠️  Failed to delete snapshot {snapshot_path}: {exc}")

        # Remove from in-memory map
        active_sessions.pop(session_id, None)

        print(f"[Mobile API] 🗑️  Deleted session: {session_id}")
        return jsonify({"success": True}), 200

    except Exception as e:
        print(f"[Mobile API] ❌ Error deleting session {session_id}: {e}")
        return jsonify({"error": str(e)}), 500


@bp.get("/routes/<session_id>/snapshot")
def get_snapshot(session_id):
    """Serve stored map snapshot for a session."""
    session = _load_session(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    snapshot_name = session.get("preview_snapshot")
    if not snapshot_name:
        return jsonify({"error": "Snapshot not available"}), 404

    return send_from_directory(SNAPSHOT_FOLDER, snapshot_name)


@bp.get("/routes/<session_id>/audio/<filename>")
def get_audio(session_id, filename):
    """Serve an audio note file if it belongs to the session."""
    session = _load_session(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    safe_name = secure_filename(filename)
    if safe_name != filename:
        return jsonify({"error": "Invalid filename"}), 400

    audio_notes = session.get("audio_notes", [])
    if not any(note.get("filename") == filename for note in audio_notes):
        return jsonify({"error": "Audio note not found"}), 404

    return send_from_directory(AUDIO_FOLDER, filename)
