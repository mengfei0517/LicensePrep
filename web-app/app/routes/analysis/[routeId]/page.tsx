'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  MapPinIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import { useRouteAnalysis } from '@/lib/hooks/use-analysis';
import type { RouteAnalysisNote } from '@/lib/api-client';

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
            <div className="grid gap-6 border-b border-gray-100 px-6 py-6 sm:grid-cols-2">
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
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="relative">
                <SectionTitle
                  title="Speed Timeline"
                  description="Segment-level speed profile across this drive."
                />
                <SpeedTimelineChart
                  segments={analysis.speed_segments ?? []}
                  previewUrl={analysis.summary.preview_url}
                />
              </div>

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

function SpeedTimelineChart({
  segments,
  previewUrl,
}: {
  segments: RouteAnalysisNote['speed_segments'];
  previewUrl?: string | null;
}) {
  const parsed = segments
    .map((segment) => {
      const startTs = new Date(segment.start).getTime();
      const endTs = new Date(segment.end).getTime();
      if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs <= startTs) {
        return null;
      }
      return {
        ...segment,
        startTs,
        endTs,
      };
    })
    .filter((segment): segment is RouteAnalysisNote['speed_segments'][number] & {
      startTs: number;
      endTs: number;
    } => Boolean(segment));

  if (parsed.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        Not enough GPS samples to build a speed timeline.
      </div>
    );
  }

  const minTime = Math.min(...parsed.map((segment) => segment.startTs));
  const maxTime = Math.max(...parsed.map((segment) => segment.endTs));
  const maxSpeed = Math.max(...parsed.map((segment) => segment.speed_kmh), 1);

  if (maxTime === minTime) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        Timeline data is unavailable for this drive.
      </div>
    );
  }

  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 16, bottom: 32, left: 12, right: 12 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const baselineY = padding.top + innerHeight;
  const duration = maxTime - minTime;

  const speedBuckets = [
    { label: '0–30 km/h', min: 0, max: 30, color: '#38bdf8' },
    { label: '30–50 km/h', min: 30, max: 50, color: '#34d399' },
    { label: '50–70 km/h', min: 50, max: 70, color: '#facc15' },
    { label: '70–100 km/h', min: 70, max: 100, color: '#f97316' },
    { label: '>100 km/h', min: 100, max: Number.POSITIVE_INFINITY, color: '#ef4444' },
  ];

  const assignBucket = (speed: number) => {
    return (
      speedBuckets.find(
        (bucket) => speed >= bucket.min && speed < bucket.max
      ) ?? speedBuckets[speedBuckets.length - 1]
    );
  };

  const scaledSegments = parsed.map((segment) => {
    const x1 =
      padding.left +
      ((segment.startTs - minTime) / duration) * innerWidth;
    const x2 =
      padding.left +
      ((segment.endTs - minTime) / duration) * innerWidth;
    const speedRatio = Math.min(segment.speed_kmh / maxSpeed, 1);
    const y = padding.top + (1 - speedRatio) * innerHeight;
    const bucket = assignBucket(segment.speed_kmh);

    return {
      ...segment,
      x1,
      x2,
      y,
      bucket,
    };
  });

  const tickFormatter = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const tickPositions = [minTime, minTime + duration / 2, maxTime];

  return (
    <div className="mt-3 relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-48 w-full"
        role="img"
        aria-label="Speed timeline chart"
      >
        <rect
          x="0"
          y="0"
          width={chartWidth}
          height={chartHeight}
          fill="#ffffff"
          rx="12"
        />
        <line
          x1={padding.left}
          x2={chartWidth - padding.right}
          y1={baselineY}
          y2={baselineY}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {scaledSegments.map((segment, index) => {
          const prevY = index === 0 ? segment.y : scaledSegments[index - 1].y;
          const commands = [
            `M${segment.x1} ${index === 0 ? segment.y : prevY}`,
          ];
          if (index !== 0 && prevY !== segment.y) {
            commands.push(`L${segment.x1} ${segment.y}`);
          }
          commands.push(`L${segment.x2} ${segment.y}`);

          return (
            <path
              key={`${segment.start}-${segment.end}-${index}`}
              d={commands.join(' ')}
              fill="none"
              stroke={segment.bucket.color}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {tickPositions.map((tick, index) => {
          const x =
            padding.left + ((tick - minTime) / duration) * innerWidth;
          const anchor =
            index === 0
              ? 'start'
              : index === tickPositions.length - 1
              ? 'end'
              : 'middle';
          return (
            <text
              key={tick}
              x={x}
              y={chartHeight - 8}
              fill="#6b7280"
              fontSize="10"
              textAnchor={anchor}
            >
              {tickFormatter.format(new Date(tick))}
            </text>
          );
        })}
        <text
          x={padding.left}
          y={padding.top + 12}
          fill="#6b7280"
          fontSize="10"
        >
          {`Peak ${maxSpeed.toFixed(0)} km/h`}
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {speedBuckets.map((bucket) => (
          <span key={bucket.label} className="inline-flex items-center gap-2">
            <span
              className="h-2 w-6 rounded-full"
              style={{ backgroundColor: bucket.color }}
            />
            {bucket.label}
          </span>
        ))}
      </div>
      {previewUrl ? (
        <figure className="absolute right-4 top-4 w-40 overflow-hidden rounded-lg border border-white bg-white shadow-lg ring-1 ring-black/10">
          <div className="relative h-28 w-full">
            <Image
              src={previewUrl}
              alt="Route snapshot"
              fill
              className="object-cover"
              sizes="160px"
              priority={false}
            />
          </div>
          <figcaption className="bg-white/85 px-2 py-1 text-[10px] text-right uppercase tracking-wide text-gray-500">
            Route snapshot
          </figcaption>
        </figure>
      ) : null}
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
