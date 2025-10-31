'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  MapIcon,
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon,
  FlagIcon,
  MapPinIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  apiClient,
  ExamPlanSegment,
  ExamSimulationPlan,
} from '@/lib/api-client';

const DURATION_MIN = 45;

export default function ExamSimulationPage() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [durationMin, setDurationMin] = useState<number>(DURATION_MIN);
  const [plan, setPlan] = useState<ExamSimulationPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const summaryCards = useMemo(() => {
    if (!plan) return [];
    return [
      {
        title: 'Estimated Duration',
        value: `${plan.estimated_duration_min} min`,
        icon: ClockIcon,
        tone: 'bg-blue-50 text-blue-600',
        hint: `Target window ${plan.target_window_min.min}-${plan.target_window_min.max} min`,
      },
      {
        title: 'Estimated Distance',
        value: `${plan.estimated_distance_km} km`,
        icon: MapIcon,
        tone: 'bg-purple-50 text-purple-600',
        hint: `${plan.segments.length} curated segments`,
      },
      {
        title: 'Exam Tasks',
        value: `${plan.exam_tasks.length} tasks`,
        icon: FlagIcon,
        tone: 'bg-orange-50 text-orange-600',
        hint: 'Mix of manoeuvres & emergency exercises',
      },
      {
        title: 'Hotspots Covered',
        value: `${plan.hotspots.length}`,
        icon: ShieldCheckIcon,
        tone: 'bg-emerald-50 text-emerald-600',
        hint: 'Targets recurring mistake zones',
      },
    ];
  }, [plan]);

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.planRoute(start, durationMin);
      setPlan(response);
    } catch (err) {
      console.error('Failed to generate plan', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate exam simulation route.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                <SparklesIcon className="mr-2 h-4 w-4" />
                Beta · Exam Route Simulation
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Generate a TÜV-style Practice Route
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Our planner stitches curated segments across 30 zones, city cores,
                Landstraße, and Autobahn—mirroring the 45-minute German driving exam
                with AI-weighted hotspots from your learning history.
              </p>
            </div>
            <div className="self-center rounded-xl border border-purple-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">
                Planner uses curated geo-fencing + AI heatmap weighting. Routes are
                exam-level difficult yet fresh on each generation.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Form */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <form
            className="grid gap-6 px-6 py-6 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              generatePlan();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="start"
                className="text-sm font-medium text-gray-700"
              >
                Start Location
              </label>
              <input
                id="start"
                type="text"
                placeholder="For example: Ahornstrasse 1, 85774"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <p className="text-xs text-gray-500">
                Enter the starting address for your practice route.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="end"
                className="text-sm font-medium text-gray-700"
              >
                End Location
              </label>
              <input
                id="end"
                type="text"
                placeholder="For example: München Hauptbahnhof"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <p className="text-xs text-gray-500">
                Enter the ending address for your practice route.
              </p>
            </div>

            <div className="flex items-end gap-6 md:col-span-2">
              <div className="w-1/2 space-y-2">
                <label
                  htmlFor="duration"
                  className="text-sm font-medium text-gray-700"
                >
                  Target Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="range"
                  min={40}
                  max={60}
                  value={durationMin}
                  onChange={(event) => setDurationMin(Number(event.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>40 min</span>
                  <span>{durationMin} min</span>
                  <span>60 min</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading || !start.trim() || !end.trim()}
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Plan'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </section>

        {plan && (
          <>
            {/* Summary cards */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className={clsx('inline-flex rounded-lg p-2', card.tone)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-500">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
                </div>
              ))}
            </section>

            {/* Segments */}
            <section className="space-y-6">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Route Segments
                  </h2>
                  <p className="text-sm text-gray-500">
                    Required exam contexts (30 zone, complex city, Landstraße,
                    Autobahn) are all woven into the plan.
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {plan.segments.map((segment) => (
                  <SegmentCard key={segment.id} segment={segment} />
                ))}
              </div>
            </section>

            {/* Tasks & hotspots */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Assigned Exam Tasks
                </h2>
                <p className="text-sm text-gray-500">
                  Complete each manoeuvre exactly as TÜV examiners require.
                </p>
                <ul className="mt-4 space-y-4">
                  {plan.exam_tasks.map((task) => (
                    <li
                      key={task.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {task.name}
                        </p>
                        <span className="text-xs uppercase tracking-wide text-gray-400">
                          Segment:{' '}
                          {task.recommended_segment_id ?? 'TBD'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {task.description}
                      </p>
                      {task.steps.length > 0 && (
                        <ol className="mt-2 list-decimal pl-5 text-xs text-gray-500 space-y-1">
                          {task.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hotspots & Error Zones
                </h2>
                <p className="text-sm text-gray-500">
                  Top mistake clusters blended into the route for targeted practice.
                </p>
                {plan.hotspots.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    Record more practice routes to feed heatmap intelligence.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {plan.hotspots.map((hotspot) => (
                      <li
                        key={hotspot.cluster_id}
                        className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-700"
                      >
                        <p className="font-semibold text-gray-900">
                          {hotspot.dominant_label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {hotspot.count} events · Lat {hotspot.latitude.toFixed(3)} ·
                          Lng {hotspot.longitude.toFixed(3)}
                        </p>
                        {hotspot.dominant_tag && (
                          <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                            #{hotspot.dominant_tag}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Checklist */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Examiner Checklist
              </h2>
              <p className="text-sm text-gray-500">
                Bring this list along and tick off each observation and manoeuvre.
              </p>
              <ol className="mt-4 space-y-2 pl-5 text-sm text-gray-700 list-decimal">
                {plan.checklist.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ol>
              <div className="mt-4 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ClipboardDocumentCheckIcon className="mr-2 h-4 w-4" />
                Bring a printed copy into the car for examiner notes.
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SegmentCard({ segment }: { segment: ExamPlanSegment }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {segment.name}
          </h3>
          <p className="text-xs text-gray-500">
            ~{segment.duration_min} min · {segment.distance_km} km ·{' '}
            {segment.difficulty ?? 'balanced'}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
          {segment.tags.slice(0, 2).join(' · ')}
        </span>
      </div>

      {segment.objectives && segment.objectives.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-gray-600">
          {segment.objectives.map((objective, index) => (
            <li key={index}>• {objective}</li>
          ))}
        </ul>
      )}

      {segment.waypoints && segment.waypoints.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Waypoints
          </p>
          <ul className="space-y-1 text-xs text-gray-500">
            {segment.waypoints.map((waypoint, index) => (
              <li key={index} className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>{waypoint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {segment.focus_hotspots && segment.focus_hotspots.length > 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 p-3">
          <p className="text-xs font-semibold text-amber-700">
            Focus Hotspots
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700">
            {segment.focus_hotspots.map((hotspot, index) => (
              <li key={index}>
                {hotspot.label ?? 'Hotspot'} — Lat{' '}
                {hotspot.latitude?.toFixed(3)} / Lng{' '}
                {hotspot.longitude?.toFixed(3)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
