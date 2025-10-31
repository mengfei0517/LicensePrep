'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const BACKEND_BASE_PATH = '/backend';

export default function RoutesPage() {
  const openRecorder = () => {
    // Open Flask route recorder in new window
    window.open(`${BACKEND_BASE_PATH}/route-recorder`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                <SparklesIcon className="mr-2 h-4 w-4" />
                Suite · Routes Record, Review & Analyze
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Manage Your Practice Routes
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Initiate GPS tracking and capture your practice drive in real-time. Start tracking automatically and add contextual Voice Notes to mark mistakes or observations as they happen.
              </p>
            </div>
            <div className="self-center rounded-xl border border-purple-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-gray-500">
              Core functionality uses precise GPS + voice note time-stamping. Recording is seamless, designed to capture every detail of your practice session for accurate evaluation.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Only keep illustration cards below */}

        {/* Illustrations */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            onClick={openRecorder}
            className="group rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-48 md:h-56 lg:h-60 overflow-hidden rounded-t-2xl bg-gray-50">
              <Image
                src={`${BACKEND_BASE_PATH}/static/images/route/route_record.png`}
                alt="Record Route illustration"
                fill
                className="object-contain p-6"
                unoptimized
              />
            </div>
            <div className="px-5 pt-4 pb-5">
              <h3 className="text-base font-semibold text-gray-900">Routes Recording</h3>
              <p className="mt-1 text-sm text-gray-600">
                Start GPS tracking and record your practice drive with voice notes.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Start now</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </button>

          <Link
            href="/routes/review"
            className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-48 md:h-56 lg:h-60 overflow-hidden rounded-t-2xl bg-gray-50">
              <Image
                src={`${BACKEND_BASE_PATH}/static/images/route/route_review.png`}
                alt="Playback Routes illustration"
                fill
                className="object-contain p-6"
                unoptimized
              />
            </div>
            <div className="px-5 pt-4 pb-5">
              <h3 className="text-base font-semibold text-gray-900">Routes Review</h3>
              <p className="mt-1 text-sm text-gray-600">
                Replay your routes with speed visualization and synced voice notes.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Browse recorded routes</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/routes/analysis"
            className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-48 md:h-56 lg:h-60 overflow-hidden rounded-t-2xl bg-gray-50">
              <Image
                src={`${BACKEND_BASE_PATH}/static/images/route/route_analysis.png`}
                alt="Routes Analysis illustration"
                fill
                className="object-contain p-6"
                unoptimized
              />
            </div>
            <div className="px-5 pt-4 pb-5">
              <h3 className="text-base font-semibold text-gray-900">Routes Analysis</h3>
              <p className="mt-1 text-sm text-gray-600">
                Get AI-powered feedback on performance and areas to improve.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>View macro insights</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
