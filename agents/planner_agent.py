"""Exam simulation planner agent."""
from __future__ import annotations

import json
import random
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from api.routes_analysis import (  # type: ignore
    _aggregate_heatmap,
    _load_all_sessions,
)


class PlannerAgent:
    """Rule-based exam simulation planner that stitches curated segments."""

    SEGMENT_PATH = Path("data/exam/segments.json")
    TASK_PATH = Path("data/exam/tasks.json")

    REQUIRED_TAG_GROUPS: Sequence[Sequence[str]] = (
        ("warmup", "departure"),
        ("30_zone",),
        ("complex_intersection",),
        ("landstrasse", "rural"),
        ("autobahn", "highway"),
        ("turnaround",),
    )

    DEFAULT_TARGET_MIN = 45
    MIN_TARGET = 40
    MAX_TARGET = 50

    def __init__(self) -> None:
        self.segments: List[Dict[str, Any]] = self._load_json(self.SEGMENT_PATH)
        self.tasks: List[Dict[str, Any]] = self._load_json(self.TASK_PATH)

    def plan(
        self,
        start: str,
        duration_min: int = DEFAULT_TARGET_MIN,
        seed: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Create an exam-ready route plan with structured metadata."""

        if not self.segments:
            raise RuntimeError("Segment catalogue is empty.")

        target_duration = min(
            self.MAX_TARGET, max(self.MIN_TARGET, int(duration_min))
        )
        actual_seed = seed if seed is not None else int(datetime.utcnow().timestamp())
        rng = random.Random(actual_seed)

        selected_segments = self._select_segments(target_duration, rng)
        total_duration = sum(seg["duration_min"] for seg in selected_segments)
        total_distance = sum(seg["distance_km"] for seg in selected_segments)

        hotspots = self._load_hotspots()
        self._attach_hotspots(selected_segments, hotspots, rng)

        exam_tasks = self._choose_tasks(selected_segments, rng)
        checklist = self._build_checklist(selected_segments, exam_tasks)

        plan = {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "seed": actual_seed,
            "start": start,
            "estimated_duration_min": round(total_duration, 1),
            "estimated_distance_km": round(total_distance, 1),
            "segments": selected_segments,
            "exam_tasks": exam_tasks,
            "hotspots": hotspots[:3],
            "checklist": checklist[:10],
            "target_window_min": {
                "min": self.MIN_TARGET,
                "ideal": target_duration,
                "max": self.MAX_TARGET,
            },
        }

        return plan

    # --------------------------------------------------------------------- #
    # Internal helpers
    # --------------------------------------------------------------------- #

    def _select_segments(
        self,
        target_duration: int,
        rng: random.Random,
    ) -> List[Dict[str, Any]]:
        """Greedy segment selection that satisfies required tag coverage."""

        remaining = [deepcopy(segment) for segment in self.segments]
        selected: List[Dict[str, Any]] = []
        used_ids: set[str] = set()
        duration = 0.0

        def pick_segment(candidates: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
            viable = [
                seg for seg in candidates if seg["id"] not in used_ids
            ]
            if not viable:
                return None
            chosen = rng.choice(viable)
            return deepcopy(chosen)

        # Cover core requirements
        for tag_group in self.REQUIRED_TAG_GROUPS:
            candidates = [
                seg
                for seg in remaining
                if any(tag in seg.get("tags", []) for tag in tag_group)
            ]
            chosen = pick_segment(candidates)
            if not chosen:
                continue
            selected.append(chosen)
            used_ids.add(chosen["id"])
            duration += chosen["duration_min"]

        # Add filler segments until within window
        attempts = 0
        while duration < target_duration - 4 and attempts < 10 and remaining:
            attempts += 1
            candidates = [seg for seg in remaining if seg["id"] not in used_ids]
            if not candidates:
                break
            chosen = rng.choice(candidates)
            # Prevent exceeding max by large margin
            if duration + chosen["duration_min"] > self.MAX_TARGET + 3:
                continue
            selected.append(deepcopy(chosen))
            used_ids.add(chosen["id"])
            duration += chosen["duration_min"]

        # If too long, drop longest optional segments
        while duration > self.MAX_TARGET and len(selected) > len(self.REQUIRED_TAG_GROUPS):
            longest = max(selected, key=lambda seg: seg["duration_min"])
            selected.remove(longest)
            used_ids.remove(longest["id"])
            duration -= longest["duration_min"]

        # As a safety net ensure we still have at least two segments
        if len(selected) < 2:
            fallback = pick_segment(remaining)
            if fallback:
                selected.append(fallback)

        return selected

    def _choose_tasks(
        self,
        segments: List[Dict[str, Any]],
        rng: random.Random,
    ) -> List[Dict[str, Any]]:
        """Select three exam tasks and map them to matching segments."""

        if not self.tasks:
            return []

        shuffled = self.tasks[:]
        rng.shuffle(shuffled)
        selected_tasks = shuffled[:3]

        results: List[Dict[str, Any]] = []
        for task in selected_tasks:
            recommended_tags = set(task.get("recommended_tags", []))
            assigned_segment = None
            if recommended_tags:
                for segment in segments:
                    if recommended_tags.intersection(segment.get("tags", [])):
                        assigned_segment = segment
                        break

            if not assigned_segment and segments:
                assigned_segment = rng.choice(segments)

            results.append(
                {
                    "id": task["id"],
                    "name": task["name"],
                    "description": task["description"],
                    "steps": task.get("steps", []),
                    "recommended_segment_id": assigned_segment["id"]
                    if assigned_segment
                    else None,
                }
            )

            if assigned_segment:
                assigned_segment.setdefault("scheduled_tasks", []).append(task["id"])

        return results

    def _attach_hotspots(
        self,
        segments: List[Dict[str, Any]],
        hotspots: List[Dict[str, Any]],
        rng: random.Random,
    ) -> None:
        """Attach selected hotspots to the most relevant segments."""

        if not segments or not hotspots:
            return

        for hotspot in hotspots[:3]:
            dominant_tag = hotspot.get("dominant_tag")
            candidate_segment = None
            if dominant_tag:
                for segment in segments:
                    segment_tags = segment.get("tags", [])
                    if any(
                        dominant_tag in tag or tag in dominant_tag
                        for tag in segment_tags
                    ):
                        candidate_segment = segment
                        break

            if not candidate_segment:
                candidate_segment = rng.choice(segments)

            focus_list = candidate_segment.setdefault("focus_hotspots", [])
            focus_list.append(
                {
                    "label": hotspot.get("dominant_label"),
                    "tag": hotspot.get("dominant_tag"),
                    "count": hotspot.get("count"),
                    "latitude": hotspot.get("latitude"),
                    "longitude": hotspot.get("longitude"),
                    "routes": hotspot.get("routes", [])[:3],
                }
            )

    def _build_checklist(
        self,
        segments: List[Dict[str, Any]],
        tasks: List[Dict[str, Any]],
    ) -> List[str]:
        checklist: List[str] = []

        for segment in segments:
            for objective in segment.get("objectives", [])[:2]:
                checklist.append(f"{segment['name']}: {objective}")

        for task in tasks:
            checklist.append(f"Exam Task – {task['name']}: {task['description']}")

        return checklist

    def _load_hotspots(self) -> List[Dict[str, Any]]:
        try:
            sessions = _load_all_sessions()
            heatmap, _ = _aggregate_heatmap(sessions)
            return heatmap
        except Exception:
            return []

    @staticmethod
    def _load_json(path: Path) -> List[Dict[str, Any]]:
        if not path.exists():
            return []
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
