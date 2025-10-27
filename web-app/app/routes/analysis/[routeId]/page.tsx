'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  MapPinIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useRouteAnalysis } from '@/lib/hooks/use-analysis';

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const shareFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export default function RouteAnalysisDetailPage() {
  const params = useParams<{ routeId: string }>();
  const routeId = params?.routeId ?? null;
  const { analysis, isLoading, error, refresh } = useRouteAnalysis(routeId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/routes"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Routes
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            AI Session Report
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Structured insights for this drive—smoothness, compliance, and next-step
            focus.
          </p>
        </div>
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load AI note: {error.message}
        </div>
      )}

      {isLoading && !analysis ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {analysis && (
        <>
          {/* Summary */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="grid gap-6 border-b border-gray-100 px-6 py-6 sm:grid-cols-3">
              <SummaryItem
                icon={ClockIcon}
                label="Duration"
                value={`${analysis.summary.duration_min.toFixed(1)} min`}
                hint={
                  analysis.summary.start_time
                    ? dateFormatter.format(new Date(analysis.summary.start_time))
                    : undefined
                }
              />
              <SummaryItem
                icon={MapPinIcon}
                label="Distance"
                value={`${analysis.summary.distance_km.toFixed(2)} km`}
                hint={analysis.summary.device_id ?? undefined}
              />
              <SummaryItem
                icon={ShieldCheckIcon}
                label="Stability"
                value={`${analysis.stability.score.toFixed(1)} / ${analysis.stability.out_of}`}
                hint={`${analysis.stability.harsh_events} harsh event(s)`}
              />
            </div>

            <div className="px-6 py-6 space-y-6">
              <SectionTitle
                title="Stability Highlights"
                description="AI looks for harsh braking or acceleration to provide targeted tips."
              />
              <ul className="space-y-4">
                {analysis.stability.highlights.map((item, index) => (
                  <li
                    key={`${item.timestamp}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3"
                  >
                    <BoltIcon className="mt-1 h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.note}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs text-gray-500">
                          {dateFormatter.format(new Date(item.timestamp))}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <SectionTitle
                    title="Speed & Compliance"
                    description="Relative to your median pace this session."
                  />
                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <dl className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <dt>Average speed</dt>
                        <dd>{analysis.speed_profile.average_kmh.toFixed(1)} km/h</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Max speed</dt>
                        <dd>{analysis.speed_profile.max_kmh.toFixed(1)} km/h</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Stability window compliance</dt>
                        <dd>
                          {analysis.speed_profile.compliance_percent.toFixed(0)}%
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-gray-500">
                      {analysis.speed_profile.commentary}
                    </p>
                  </div>
                </div>

                <div>
                  <SectionTitle
                    title="Driving Context Mix"
                    description="Speed-based estimate of environment types."
                  />
                  <div className="mt-3 space-y-3">
                    {analysis.context_mix.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                        Not enough GPS samples to classify environment.
                      </div>
                    ) : (
                      analysis.context_mix.map((context) => (
                        <div key={context.label}>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span className="capitalize">{context.label}</span>
                            <span>
                              {shareFormatter.format(context.share)} ·{' '}
                              {context.distance_km.toFixed(1)} km
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${context.share * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <SectionTitle
                    title="Voice & Marker Tags"
                    description="Top labels you captured during this drive."
                  />
                  {analysis.voice_tags.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      Tag voice notes and markers to build a detailed issue library for this route.
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.voice_tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                        >
                          #{tag.label}
                          <span className="ml-1 text-[10px] text-indigo-400">
                            ×{tag.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <SectionTitle
                    title="Notable Events"
                    description="Voice notes and markers captured along the drive."
                  />
                  {analysis.notable_events.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      No events recorded on this route. Consider adding markers or notes during playback.
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {analysis.notable_events.map((event, index) => (
                        <li
                          key={`${event.timestamp}-${index}`}
                          className="rounded-lg border border-gray-100 bg-gray-50/70 px-4 py-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">
                              {event.label ?? 'Event'}
                            </p>
                            <MicrophoneIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          {event.description && (
                            <p className="mt-1 text-xs text-gray-600">
                              {event.description}
                            </p>
                          )}
                          {event.timestamp && (
                            <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                              {dateFormatter.format(new Date(event.timestamp))}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Generated: {analysis.generated_at}</span>
            <div className="flex items-center gap-3">
              <Link
                href={`/routes/analysis`}
                className="inline-flex items-center text-blue-500 hover:text-blue-600"
              >
                Back to Overview →
              </Link>
              <a
                href={routeId ? `/backend/route-review/${routeId}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-blue-500 hover:text-blue-600"
              >
                Open Route Review →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}
