'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { SVGProps } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  FireIcon,
  MapPinIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAnalysisOverview } from '@/lib/hooks/use-analysis';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { PracticeTrendSession } from '@/lib/api-client';
import type { LatLngTuple, Map as LeafletMapType, MapOptions } from 'leaflet';
import type { MapContainerProps as LeafletMapContainerProps } from 'react-leaflet';

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatNumber(value: number | undefined | null, fallback = '—') {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }
  return numberFormatter.format(value);
}

export default function RouteAnalysisPage() {
  const { overview, isLoading, error, refresh } = useAnalysisOverview();

  const summaryCards = useMemo<Array<{ title: string; value: string | number; subtitle: string; icon: any; tone: string }>>(() => {
    if (!overview) return [];

    const { summary } = overview.practice_trends;

    return [];
  }, [overview]);

  const [selectedDay, setSelectedDay] = useState<string>('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/routes"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Routes
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Practice Analysis Overview
          </h1>
          <p className="mt-2 text-base text-gray-600">
          It collects all individual practice session pathways and provides a full data summary. This clarity allows you to easily identify your High-Frequency Training Routes and High-Frequency Flagged Points. The resulting insights offer a data-driven path to efficiently prepare for your exams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            <ArrowPathIcon
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          {/* timestamp removed per request */}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load AI analysis: {error.message}
        </div>
      )}

      {isLoading && !overview ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl bg-white shadow-sm border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {overview && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className={`inline-flex rounded-lg p-2 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-500">
                  {card.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Practice trends (moved above map) */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Session Trendline
                </h2>
                <p className="text-sm text-gray-500">
                  Compare rhythm, distance, and smoothness across every saved drive.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs text-gray-500">
                  Session
                  <select
                    className="ml-2 rounded border border-gray-200 bg-white px-2 py-1 text-sm"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="all">All</option>
                    {Array.from(new Set(overview.practice_trends.sessions
                      .map((s) => (s.recorded_at ? s.recorded_at.slice(0, 10) : null))
                      .filter(Boolean) as string[]
                    )).sort((a, b) => (a > b ? -1 : 1)).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {overview.practice_trends.sessions.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                Record at least one route to unlock the trendline.
              </div>
            ) : (
              (() => {
                const sessions = [...overview.practice_trends.sessions];
                const filtered = sessions
                  .filter((s) => (selectedDay === 'all' ? true : (s.recorded_at ? s.recorded_at.slice(0, 10) === selectedDay : false)))
                  .sort((a, b) => {
                    const ta = a.recorded_at ? new Date(a.recorded_at).getTime() : 0;
                    const tb = b.recorded_at ? new Date(b.recorded_at).getTime() : 0;
                    return tb - ta; // newest first
                  });
                return (
                  <div className="mt-6 rounded-xl border border-gray-100">
                    <div
                      className="overflow-x-auto"
                      style={{ maxHeight: (filtered.length >= 3 ? 280 : undefined), overflowY: 'auto' }}
                    >
                      <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left bg-gray-50">Session</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Duration</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Distance</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Voice Notes</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Marked Locations</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Self Assessment</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Coach Assessment</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Links</th>
                            <th className="px-4 py-3 text-left bg-gray-50">Analysis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                          {filtered.map((session) => {
                            const selfKey = `route:${session.route_id}:self_assessment`;
                            const coachKey = `route:${session.route_id}:coach_assessment`;
                            let selfValue = '-';
                            let coachValue = '-';
                            if (typeof window !== 'undefined') {
                              selfValue = localStorage.getItem(selfKey) || '-';
                              coachValue = localStorage.getItem(coachKey) || '-';
                            }
                            let marked = '-';
                            if (typeof window !== 'undefined') {
                              try {
                                const note = JSON.parse(localStorage.getItem(`route:${session.route_id}:note_cached`) || 'null');
                                marked = Array.isArray(note?.notable_events) ? note.notable_events.length : '-';
                              } catch {}
                            }
                            return (
                              <tr key={session.route_id}>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">
                                    {session.recorded_at
                                      ? dateFormatter.format(new Date(session.recorded_at))
                                      : session.route_id}
                                  </div>
                                  <div className="text-xs text-gray-400">Route ID: {session.route_id}</div>
                                </td>
                                <td className="px-4 py-3">{formatNumber(session.duration_min)} min</td>
                                <td className="px-4 py-3">{formatNumber(session.distance_km)} km</td>
                                <td className="px-4 py-3">{session.voice_notes} notes</td>
                                <td className="px-4 py-3">{session.markers}</td>
                                <td className="px-4 py-3">{selfValue}</td>
                                <td className="px-4 py-3">{coachValue}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <a
                                      href={`/backend/route-review/${session.route_id}`}
                                      className="text-blue-500 hover:underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Route Review
                                    </a>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Link
                                    href={`/routes/analysis/${session.route_id}`}
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                  >
                                    Route Analysis
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            )}
          </section>

          <div className="mb-10">
            <MapDisplay sessions={overview.practice_trends.sessions} />
          </div>

          {/* Scene distribution and Speed-duration charts */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Practice Distributions</h2>
                <p className="text-sm text-gray-500">Scene frequency and duration by speed ranges across all sessions.</p>
              </div>
            </div>

            {overview.practice_trends.sessions.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                Record at least one route to unlock distributions.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Chart 1: Scene histogram */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Scene counts</h3>
                  <p className="text-xs text-gray-500">Normal, Rainy, Night, Rush hour</p>
                  <SceneHistogram sessions={overview.practice_trends.sessions} />
                </div>
                {/* Chart 2: Duration by speed buckets */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Duration by speed ranges</h3>
                  <p className="text-xs text-gray-500">Buckets: 0–30, 30–50, 50–70, &gt;70 km/h</p>
                  <SpeedDurationBuckets sessions={overview.practice_trends.sessions} />
                </div>
              </div>
            )}
          </section>

          {/* Personal summaries & todos */}
          <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900 mb-3">Personal Summaries &amp; Todos</h2>
            <AggregatedPersonals sessions={overview.practice_trends.sessions} />
          </section>

          {/* Hotspot Heatmap & Repeating Issues removed by request */}

          {/* Recommendations block removed by request */}
        </>
      )}
    </div>
  );
}

function ShieldSparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 3l7 2v5c0 5-3.47 9.74-7 11-3.53-1.26-7-6-7-11V5l7-2z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12l2 2 3-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SceneHistogram({
  sessions,
}: {
  sessions: {
    route_id: string;
    recorded_at?: string | null;
  }[];
}) {
  const labels = ['Normal', 'Rainy', 'Night', 'Rush hour'];
  const counts = labels.map((label) => {
    let c = 0;
    if (typeof window !== 'undefined') {
      for (const s of sessions) {
        const key = `route:${s.route_id}:scenario`;
        const v = localStorage.getItem(key) || 'Normal';
        if (v === label) c += 1;
      }
    }
    return c;
  });

  const width = 360;
  const height = 160;
  const padding = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...counts, 1);
  const barW = innerW / labels.length - 10;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full h-44">
      <rect x={0} y={0} width={width} height={height} fill="#ffffff" rx={12} />
      {/* Axis */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={height - padding.bottom}
        y2={height - padding.bottom}
        stroke="#e5e7eb"
      />
      {counts.map((value, i) => {
        const x = padding.left + i * (barW + 10);
        const h = (value / max) * innerH;
        const y = height - padding.bottom - h;
        const color = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b'][i];
        return (
          <g key={labels[i]}> 
            <rect x={x} y={y} width={barW} height={h} fill={color} rx={4} />
            <text x={x + barW / 2} y={height - padding.bottom + 16} fontSize={10} fill="#6b7280" textAnchor="middle">
              {labels[i]}
            </text>
            <text x={x + barW / 2} y={y - 4} fontSize={10} fill="#374151" textAnchor="middle">
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SpeedDurationBuckets({
  sessions,
}: {
  sessions: {
    route_id: string;
    recorded_at?: string | null;
    duration_min: number;
    distance_km: number;
  }[];
}) {
  const buckets = [
    { label: '0–30', min: 0, max: 30, color: '#60a5fa' },
    { label: '30–50', min: 30, max: 50, color: '#34d399' },
    { label: '50–70', min: 50, max: 70, color: '#f59e0b' },
    { label: '>70', min: 70, max: Number.POSITIVE_INFINITY, color: '#ef4444' },
  ];

  const [data, setData] = useState<{
    perBucket: { label: string; total: number; perDay: Map<string, number> }[];
    allDays: string[];
    loading: boolean;
  }>({ perBucket: buckets.map((b) => ({ label: b.label, total: 0, perDay: new Map() })), allDays: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { apiClient } = await import('@/lib/api-client');
        const perBucket = buckets.map((b) => ({ label: b.label, total: 0, perDay: new Map<string, number>() }));
        const allDaySet = new Set<string>();
        for (const s of sessions) {
          const dateStr = s.recorded_at ? new Date(s.recorded_at).toISOString().slice(0, 10) : 'Unknown';
          allDaySet.add(dateStr);
          try {
            const note = await apiClient.getRouteAnalysis(s.route_id);
            const segments = note.speed_segments || [];
            for (const seg of segments) {
              const speed = seg.speed_kmh || 0;
              const minutes = (seg.duration_s || 0) / 60.0;
              const idx = buckets.findIndex((b) => speed >= b.min && speed < b.max);
              if (idx >= 0) {
                const pb = perBucket[idx];
                pb.total += minutes;
                pb.perDay.set(dateStr, (pb.perDay.get(dateStr) || 0) + minutes);
              }
            }
          } catch (e) {
            // fallback: if cannot get segments, use average speed of the session to estimate
            const avgSpeed = s.duration_min > 0 ? s.distance_km / (s.duration_min / 60) : 0;
            const idx = buckets.findIndex((b) => avgSpeed >= b.min && avgSpeed < b.max);
            const minutes = Math.max(0, s.duration_min || 0);
            if (idx >= 0) {
              const pb = perBucket[idx];
              pb.total += minutes;
              pb.perDay.set(dateStr, (pb.perDay.get(dateStr) || 0) + minutes);
            }
          }
        }
        if (!cancelled) setData({ perBucket, allDays: Array.from(allDaySet), loading: false });
      } catch {
        if (!cancelled) setData((prev) => ({ ...prev, loading: false }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(sessions)]);

  const { perBucket, allDays, loading } = data;

  const width = 420;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const maxMinutes = Math.max(...perBucket.map((b) => b.total), 1);
  const barW = innerW / buckets.length - 16;

  const dayColor = (i: number) => `rgba(59,130,246,${0.25 + (i % 4) * 0.15})`;

  if (loading) {
    return <div className="mt-4 h-52 w-full animate-pulse rounded-lg border border-gray-100 bg-gray-50" />;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full h-52">
        <rect x={0} y={0} width={width} height={height} fill="#ffffff" rx={12} />
        <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="#e5e7eb" />
        {perBucket.map((b, i) => {
          const baseX = padding.left + i * (barW + 16);
          let yCursor = height - padding.bottom;
          const stacks = allDays.map((d, di) => ({ day: d, minutes: b.perDay.get(d) || 0, color: dayColor(di) }));
          return (
            <g key={b.label}>
              {stacks.map((stk) => {
                const h = (stk.minutes / maxMinutes) * innerH;
                const y = yCursor - h;
                yCursor = y;
                return <rect key={`${b.label}-${stk.day}`} x={baseX} y={y} width={barW} height={h} fill={stk.color} rx={3} />;
              })}
              <text x={baseX + barW / 2} y={height - padding.bottom + 16} fontSize={10} fill="#6b7280" textAnchor="middle">{b.label} km/h</text>
              <text x={baseX + barW / 2} y={yCursor - 4} fontSize={10} fill="#374151" textAnchor="middle">{Math.round(b.total)} min</text>
            </g>
          );
        })}
      </svg>
      {allDays.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {allDays.map((d, i) => (
            <span key={d} className="inline-flex items-center gap-2">
              <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: dayColor(i) }} />
              {d === 'Unknown' ? 'Unknown' : dateFormatter.format(new Date(d))}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AggregatedPersonals({ sessions }: { sessions: { route_id: string; recorded_at?: string | null }[] }) {
  const sorted = [...sessions].sort((a, b) => {
    const ta = a.recorded_at ? new Date(a.recorded_at).getTime() : 0;
    const tb = b.recorded_at ? new Date(b.recorded_at).getTime() : 0;
    return tb - ta;
  });

  if (typeof window === 'undefined') return null;

  return (
    <div className="divide-y divide-amber-100">
      {sorted.map((s) => {
        const dateStr = s.recorded_at ? new Date(s.recorded_at).toLocaleDateString() : s.route_id;
        const summary = localStorage.getItem(`route:${s.route_id}:personal_summary`) || '';
        let todos: { id: string; text: string; done: boolean }[] = [];
        try {
          const raw = localStorage.getItem(`route:${s.route_id}:personal_todos`);
          if (raw) todos = JSON.parse(raw);
        } catch {}
        if (!summary && todos.length === 0) return null;
        return (
          <div key={s.route_id} className="py-3">
            <div className="text-xs mb-1 text-amber-800">Session: {dateStr} (ID: {s.route_id})</div>
            {summary && (
              <div className="bg-white rounded px-3 py-2 text-sm text-amber-800 mb-2 border border-amber-100">
                <span className="font-semibold mr-2">Summary:</span>{summary}
              </div>
            )}
            {todos.length > 0 && (
              <div className="bg-white rounded px-3 py-2 border border-amber-100">
                <span className="font-semibold mr-1">Todos:</span>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {todos.map((td) => (
                    <li key={td.id} className={td.done ? 'text-gray-400 line-through' : 'font-semibold text-red-600'}>
                      {td.text}
                      <span className={`ml-2 inline-block text-xs px-2 py-0.5 rounded ${td.done ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
                        {td.done ? 'Completed' : 'Pending'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
      {sorted.every(s => {
        const summary = localStorage.getItem(`route:${s.route_id}:personal_summary`);
        let todos: unknown[] = [];
        try { const raw = localStorage.getItem(`route:${s.route_id}:personal_todos`); if (raw) todos = JSON.parse(raw); } catch {}
        return !summary && (!todos || todos.length === 0);
      }) && (
        <div className="py-6 text-sm text-gray-400 text-center">No personal summaries or todos found.</div>
      )}
    </div>
  );
}

const MapDisplay = dynamic(
  async () => {
    const { TileLayer, Polyline, CircleMarker, useMap } = await import('react-leaflet');
    const { LeafletContext, createLeafletContext } = await import('@react-leaflet/core');
    const { Map: LeafletMap } = await import('leaflet');
    function SafeMapContainer({
      bounds,
      boundsOptions,
      center,
      children,
      className,
      id,
      placeholder,
      style,
      whenReady,
      zoom,
      ...options
    }: LeafletMapContainerProps) {
      const [staticProps] = useState(() => ({ className, id, style }));
      const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);
      const mapInstanceRef = useRef<LeafletMapType | null>(null);
      const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null && !mapInstanceRef.current) {
          const el = node as HTMLDivElement & { _leaflet_id?: string };
          if (el._leaflet_id) {
            delete el._leaflet_id;
          }
          const map = new LeafletMap(node, options as MapOptions);
          mapInstanceRef.current = map;
          if (center != null && zoom != null) {
            map.setView(center, zoom);
          } else if (bounds != null) {
            map.fitBounds(bounds, boundsOptions);
          }
          if (whenReady) {
            map.whenReady(whenReady);
          }
          setContext(createLeafletContext(map));
        }
      }, []);
      useEffect(() => {
        return () => {
          if (mapInstanceRef.current) {
            const container = mapInstanceRef.current.getContainer() as HTMLDivElement & { _leaflet_id?: string };
            mapInstanceRef.current.remove();
            if (container && container._leaflet_id) {
              delete container._leaflet_id;
            }
            mapInstanceRef.current = null;
          }
        };
      }, []);
      const contents = context ? (
        <LeafletContext value={context}>
          {children}
        </LeafletContext>
      ) : (
        placeholder ?? null
      );
      return (
        <div {...staticProps} ref={containerRef}>
          {contents}
        </div>
      );
    }
    function FitBounds({ polylines }: { polylines: LatLngTuple[][] }) {
      const map = useMap();
      useEffect(() => {
        if (polylines.length === 0) return;
        const allPoints = polylines.flat();
        if (allPoints.length > 1) {
          map.fitBounds(allPoints);
        }
      }, [polylines, map]);
      return null;
    }
    return function MapDisplayInner({ sessions }: { sessions: PracticeTrendSession[] }) {
      const [polylines, setPolylines] = useState<LatLngTuple[][]>([]);
      const [keyPoints, setKeyPoints] = useState<LatLngTuple[]>([]);
      const [isClient, setIsClient] = useState(false);
      useEffect(() => {
        setIsClient(true);
      }, []);
      useEffect(() => {
        let mounted = true;
        (async () => {
          const { apiClient } = await import('@/lib/api-client');
          const lines: LatLngTuple[][] = [];
          const points: LatLngTuple[] = [];
          for (const s of sessions) {
            try {
              const detail = await apiClient.getRoute(s.route_id);
              const gpsRaw = detail.session?.gps_points;
              const gps = Array.isArray(gpsRaw) ? gpsRaw.filter(pt => pt && typeof pt.latitude === 'number' && typeof pt.longitude === 'number') : [];
              if (gps.length > 1) {
                const arr = gps.map(pt => [pt.latitude, pt.longitude] as LatLngTuple);
                lines.push(arr);
              }
              const markersRaw = detail.session?.review_markers;
              const markers = Array.isArray(markersRaw) ? markersRaw.filter((m: any) => m && typeof m.latitude === 'number' && typeof m.longitude === 'number').map((m: any) => [m.latitude, m.longitude] as LatLngTuple) : [];
              points.push(...markers);
            } catch {}
          }
          if (!mounted) return;
          setPolylines(lines);
          setKeyPoints(points);
        })();
        return () => { mounted = false; };
      }, [JSON.stringify(sessions)]);
      const fallback = [51, 10] as LatLngTuple;
      return (
        <div className="mb-6 w-full max-w-6xl mx-auto">
          <h2 className="text-lg font-bold mb-2 text-blue-900">Overall Practice Map</h2>
          <div className="w-full" style={{ aspectRatio: '5 / 3', minHeight: 300 }}>
            {isClient ? (
              <SafeMapContainer
                center={fallback}
                zoom={7}
                style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <FitBounds polylines={polylines} />
                {polylines.map((line, i) => (
                  <Polyline
                    key={i}
                    positions={line}
                    pathOptions={{ color: '#60a5fa', weight: 10, opacity: 0.8 }}
                  />
                ))}
                {keyPoints.map((pos, j) => (
                  <CircleMarker key={j} center={pos} radius={6} fillColor="#f87171" color="#b91c1c" fillOpacity={0.8} />
                ))}
              </SafeMapContainer>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse rounded-xl border border-slate-200" />
            )}
          </div>
        </div>
      );
    };
  },
  { ssr: false }
);
