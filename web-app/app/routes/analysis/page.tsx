'use client';

import { useMemo } from 'react';
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

  const summaryCards = useMemo(() => {
    if (!overview) return [];

    const { summary } = overview.practice_trends;
    const topIssue = overview.top_issues?.[0];

    return [
      {
        title: 'Recorded Sessions',
        value: summary.session_count,
        subtitle: `${formatNumber(summary.total_distance_km, '0')} km covered`,
        icon: MapPinIcon,
        tone: 'bg-blue-50 text-blue-600',
      },
      {
        title: 'Practice Hours',
        value: formatNumber(summary.total_duration_min / 60, '0'),
        subtitle: `${formatNumber(summary.average_duration_min, '0')} min avg length`,
        icon: ClockIcon,
        tone: 'bg-indigo-50 text-indigo-600',
      },
      {
        title: 'Safety Index',
        value: formatNumber(summary.safety_index, '100'),
        subtitle: `${summary.total_harsh_events} harsh events detected`,
        icon: ShieldSparkIcon,
        tone: 'bg-green-50 text-green-600',
      },
      {
        title: 'Top Improvement Area',
        value: topIssue ? topIssue.label : 'No tags yet',
        subtitle: topIssue
          ? `${topIssue.count} mentions across ${topIssue.routes.length} routes`
          : 'Tag voice notes or markers to surface focus areas',
        icon: FireIcon,
        tone: 'bg-orange-50 text-orange-600',
      },
    ];
  }, [overview]);

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
            AI Practice Analysis
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Macro lens on every recorded drive. Spot recurring mistakes, track momentum,
            and plan the next targeted practice route.
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
          <span className="text-xs text-gray-500">
            Updated:{' '}
            {overview
              ? dateFormatter.format(new Date(overview.generated_at))
              : '—'}
          </span>
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

          {/* Heatmap & Top issues */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Hotspot Heatmap
                  </h2>
                  <p className="text-sm text-gray-500">
                    Locations with recurring voice notes, markers, or harsh events.
                  </p>
                </div>
                <SparklesIcon className="h-6 w-6 text-purple-500" />
              </div>

              {overview.heatmap.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  No hotspots yet. Mark locations or log voice notes during review to
                  uncover patterns.
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {overview.heatmap.slice(0, 6).map((spot) => (
                    <li
                      key={spot.cluster_id}
                      className="rounded-lg border border-gray-100 bg-gray-50/80 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {spot.dominant_label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {spot.count} signals •{' '}
                            {spot.routes.length} route(s)
                          </p>
                        </div>
                        <MapPinIcon className="h-5 w-5 text-rose-500" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Lat {spot.latitude.toFixed(3)} · Lng{' '}
                        {spot.longitude.toFixed(3)}
                      </p>
                      {spot.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {spot.tags.map((tag) => (
                            <span
                              key={`${spot.cluster_id}-${tag.label}`}
                              className="inline-flex items-center rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm"
                            >
                              #{tag.label}{' '}
                              <span className="ml-1 text-[10px] text-gray-400">
                                ×{tag.count}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Repeating Issues
                  </h2>
                  <p className="text-sm text-gray-500">
                    Voice note tags and location flags ranked by frequency.
                  </p>
                </div>
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>

              {overview.top_issues.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  No issues recorded. Tag your notes (e.g. “observation”, “gear change”)
                  to build a personalised improvement list.
                </div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {overview.top_issues.map((issue) => (
                    <li
                      key={issue.label}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          #{issue.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          Appears in {issue.routes.length} route(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {issue.count}
                        <span className="text-xs text-gray-400">mentions</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Practice trends */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Session Trendline
                </h2>
                <p className="text-sm text-gray-500">
                  Compare rhythm, distance, and smoothness across every saved drive.
                </p>
              </div>
            </div>

            {overview.practice_trends.sessions.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                Record at least one route to unlock the trendline.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Session</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-left">Distance</th>
                      <th className="px-4 py-3 text-left">Voice Notes</th>
                      <th className="px-4 py-3 text-left">Harsh Events</th>
                      <th className="px-4 py-3 text-left">Safety Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                    {overview.practice_trends.sessions.map((session) => (
                      <tr key={session.route_id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {session.recorded_at
                              ? dateFormatter.format(new Date(session.recorded_at))
                              : session.route_id}
                          </div>
                          <div className="text-xs text-gray-400">
                            Route ID: {session.route_id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {formatNumber(session.duration_min)} min
                        </td>
                        <td className="px-4 py-3">
                          {formatNumber(session.distance_km)} km
                        </td>
                        <td className="px-4 py-3">
                          {session.voice_notes} notes
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              session.harsh_events > 0
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {session.harsh_events}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-green-500"
                                style={{
                                  width: `${Math.max(
                                    8,
                                    Math.min(100, session.safety_score)
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {session.safety_score}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended Segments
                </h2>
                <p className="text-sm text-gray-500">
                  AI suggests where to practice next based on recurring mistakes and
                  exam hotspots.
                </p>
              </div>
            </div>

            {overview.recommended_segments.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                Once hotspots are logged, targeted practice recommendations will appear
                here.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overview.recommended_segments.map((segment) => (
                  <div
                    key={`${segment.label}-${segment.latitude}-${segment.longitude}`}
                    className="rounded-xl border border-gray-100 bg-gradient-to-br from-white via-white to-blue-50 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {segment.label}
                      </h3>
                      <MapPinIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Lat {segment.latitude.toFixed(3)} · Lng{' '}
                      {segment.longitude.toFixed(3)}
                    </p>
                    <p className="mt-3 text-sm text-gray-600">{segment.reason}</p>
                    {segment.routes.length > 0 && (
                      <p className="mt-3 text-xs text-gray-500">
                        Seen in {segment.routes.length} route(s).
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
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
