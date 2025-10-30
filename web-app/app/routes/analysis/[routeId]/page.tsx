'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  const [personalSummary, setPersonalSummary] = useState<string>('');
  type PersonalTodo = { id: string; text: string; done: boolean };
  const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([]);
  const [scenario, setScenario] = useState<string>('Normal');
  const [selfAssessment, setSelfAssessment] = useState<string>('Fair');
  const [coachAssessment, setCoachAssessment] = useState<string>('Fair');

  const summaryKey = routeId ? `route:${routeId}:personal_summary` : 'route:unknown:personal_summary';
  const todosKey = routeId ? `route:${routeId}:personal_todos` : 'route:unknown:personal_todos';
  const scenarioKey = routeId ? `route:${routeId}:scenario` : 'route:unknown:scenario';
  const selfKey = routeId ? `route:${routeId}:self_assessment` : 'route:unknown:self_assessment';
  const coachKey = routeId ? `route:${routeId}:coach_assessment` : 'route:unknown:coach_assessment';

  useEffect(() => {
    try {
      const savedSummary = typeof window !== 'undefined' ? localStorage.getItem(summaryKey) : null;
      const savedTodos = typeof window !== 'undefined' ? localStorage.getItem(todosKey) : null;
      if (savedSummary) setPersonalSummary(savedSummary);
      if (savedTodos) setPersonalTodos(JSON.parse(savedTodos));
    } catch {}
  }, [summaryKey, todosKey]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(summaryKey, personalSummary);
    } catch {}
  }, [summaryKey, personalSummary]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(todosKey, JSON.stringify(personalTodos));
    } catch {}
  }, [todosKey, personalTodos]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const s = localStorage.getItem(scenarioKey);
      const se = localStorage.getItem(selfKey);
      const ce = localStorage.getItem(coachKey);
      if (s) setScenario(s);
      if (se) setSelfAssessment(se);
      if (ce) setCoachAssessment(ce);
    } catch {}
  }, [scenarioKey, selfKey, coachKey]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(scenarioKey, scenario);
    } catch {}
  }, [scenarioKey, scenario]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(selfKey, selfAssessment);
    } catch {}
  }, [selfKey, selfAssessment]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(coachKey, coachAssessment);
    } catch {}
  }, [coachKey, coachAssessment]);

  const addTodo = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setPersonalTodos((prev) => [{ id: `${Date.now()}`, text: value, done: false }, ...prev]);
  };
  const toggleTodo = (id: string) => {
    setPersonalTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };
  const removeTodo = (id: string) => {
    setPersonalTodos((prev) => prev.filter((t) => t.id !== id));
  };

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

            <div className="px-6 pb-2">
              <div className="mt-2 grid gap-4 sm:grid-cols-3">
                <LabeledSelect
                  label="Scenario"
                  value={scenario}
                  onChange={setScenario}
                  options={[
                    { value: 'Normal', label: 'Normal' },
                    { value: 'Rainy', label: 'Rainy' },
                    { value: 'Night', label: 'Night' },
                    { value: 'Rush hour', label: 'Rush hour' },
                  ]}
                />
                <LabeledSelect
                  label="Self assessment"
                  value={selfAssessment}
                  onChange={setSelfAssessment}
                  options={[
                    { value: 'Good', label: 'Good' },
                    { value: 'Fair', label: 'Fair' },
                    { value: 'Poor', label: 'Poor' },
                  ]}
                />
                <LabeledSelect
                  label="Coach assessment"
                  value={coachAssessment}
                  onChange={setCoachAssessment}
                  options={[
                    { value: 'Good', label: 'Good' },
                    { value: 'Fair', label: 'Fair' },
                    { value: 'Poor', label: 'Poor' },
                  ]}
                />
              </div>
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
                    title="Voice Notes Tags"
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
                    title="Marked Locations"
                    description="Voice notes and markers captured along the drive."
                  />
                  {analysis.notable_events.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      No events recorded on this route. Consider adding markers or notes during playback.
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {analysis.notable_events.map((event, index) => (
                        <li
                          key={`${event.timestamp}-${index}`}
                          className="rounded border border-gray-100 bg-gray-50/90 px-3 py-2"
                        >
                          <div className="flex items-center">
                            <p className="text-sm font-semibold text-gray-900">
                              {event.label ?? 'Event'}
                            </p>
                          </div>
                          {event.description && (
                            <p className="mt-1 text-xs text-gray-600">
                              {event.description}
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
      {analysis && (
        <section className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 px-6 py-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Session Summary</h2>
          <p className="mb-2 text-sm text-blue-800">
            Today's practice duration: <strong>{analysis.summary.duration_min.toFixed(1)} min</strong>,
            distance: <strong>{analysis.summary.distance_km.toFixed(2)} km</strong>,
            average speed: <strong>{analysis.speed_profile?.average_kmh?.toFixed(1) ?? '-'} km/h</strong>,
            maximum speed: <strong>{analysis.speed_profile?.max_kmh?.toFixed(1) ?? '-'} km/h</strong>.
          </p>
          <p className="mb-2 text-sm text-blue-800">
            During the drive, a total of <strong>{analysis.voice_tags.reduce((acc, t) => acc + t.count, 0)}</strong> voice notes were recorded,
            covering <strong>{analysis.voice_tags.length}</strong> distinct domains; most important to focus on: <strong>{[...analysis.voice_tags].sort((a, b) => b.count - a.count).slice(0,2).map(t => `#${t.label}`).join(', ') || '-'}</strong>.
          </p>
          <p className="mb-2 text-sm text-blue-800">
            During route review, <strong>{analysis.notable_events.length}</strong> key locations were marked, related to <strong>{[...new Set(analysis.notable_events.map(e => e.label))].filter(Boolean).length}</strong> different types of driving actions; most important to focus on: <strong>{(() => {
              const freq: { [key: string]: number } = analysis.notable_events.reduce((acc, e) => {
                if (e.label) acc[e.label] = (acc[e.label] || 0) + 1;
                return acc;
              }, {} as { [key: string]: number });
              return (Object.entries(freq) as [string, number][])  
                .sort((a, b) => b[1] - a[1])  
                .slice(0, 2)  
                .map(([label]) => label)  
                .join(', ') || '-';
            })()}</strong>.
          </p>
          <div className="mt-4 bg-blue-100 rounded p-3">
            <div className="mb-1 font-semibold text-blue-700 text-xs">Key exam-relevant skill domains:</div>
            <ul className="text-xs text-blue-700 list-disc ml-5 space-y-0.5">
              <li>Traffic Observation</li>
              <li>Vehicle Positioning &amp; Route Selection</li>
              <li>Speed Adaptation</li>
              <li>Communication with Other Road Users</li>
              <li>Vehicle Operation / Environmentally-conscious driving</li>
            </ul>
          </div>
        </section>
      )}
      {analysis && (
        <section className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/60 px-6 py-6">
          <h2 className="text-lg font-bold text-purple-900 mb-4">Add Personal Summary</h2>
          <p className="text-xs text-purple-700 mb-2">Personal summary (locally saved, not uploaded):</p>
          <textarea
            className="w-full resize-none rounded-md border border-purple-200 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            rows={4}
            placeholder="Today's practice, insights, areas to reinforce..."
            value={personalSummary}
            onChange={(e) => setPersonalSummary(e.target.value)}
          />
          <div className="mt-1 text-[11px] text-purple-600">Auto-saved locally</div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">Add Personal To-do</h3>
            <p className="text-xs text-gray-500 mt-1">Today's practice questions (waiting for confirmation from the coach)</p>
            <TodoInput onAdd={addTodo} />
            {personalTodos.length === 0 ? (
              <div className="mt-3 rounded border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                No pending items, record your questions first.
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {personalTodos.map((todo) => (
                  <li key={todo.id} className="flex items-start justify-between rounded border border-gray-100 bg-white px-3 py-2">
                    <label className="flex items-start gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-300"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <span className={todo.done ? 'line-through text-gray-400' : ''}>{todo.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTodo(todo.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
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

function TodoInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd(value);
            setValue('');
          }
        }}
        placeholder="Enter your question, press Enter to add"
        className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <button
        type="button"
        onClick={() => {
          onAdd(value);
          setValue('');
        }}
        className="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
      >
        Add
      </button>
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <select
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
