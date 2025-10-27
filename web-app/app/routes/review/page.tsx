'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPinIcon,
  PlayIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useRoutes } from '@/lib/hooks/use-routes';
import { apiClient } from '@/lib/api-client';
import { mapRouteInfoToCard, formatDateLabel } from '@/lib/routes/utils';
import type { RouteCardData } from '@/lib/routes/utils';

const BACKEND_BASE_PATH = '/backend';

export default function RoutesReviewPage() {
  const { routes, isLoading, error, refresh } = useRoutes();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const allRoutes = useMemo<RouteCardData[]>(() => {
    if (!routes) return [];

    const parseTime = (value: string | undefined) => {
      if (!value) return 0;
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return routes
      .map(mapRouteInfoToCard)
      .sort((a, b) => parseTime(b.recordedAt) - parseTime(a.recordedAt));
  }, [routes]);

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) {
      return;
    }
    setDeleteError(null);
    setDeletingId(routeId);
    try {
      await apiClient.deleteRoute(routeId);
      await refresh();
    } catch (err) {
      console.error('Failed to delete route', err);
      const message = err instanceof Error ? err.message : 'Failed to delete route. Please try again.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const openReview = (routeId: string) => {
    window.open(`${BACKEND_BASE_PATH}/route-review/${routeId}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/routes"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Route Recording
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            All Recorded Routes
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Browse every captured drive, play them back with voice notes, or tidy up old sessions.
          </p>
        </div>
        {allRoutes.length > 0 && (
          <button
            onClick={() => refresh()}
            className="inline-flex items-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Refresh
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load routes: {error?.message || 'Unknown error'}
        </div>
      )}

      {deleteError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          {deleteError}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          Loading saved routes...
        </div>
      ) : allRoutes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <MapPinIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">No saved routes yet</h3>
          <p className="mt-2 text-gray-600">
            Record your first drive to see it listed here. You can review and replay it anytime.
          </p>
          <Link
            href="/routes"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Route Recording
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allRoutes.map((route) => (
            <div
              key={route.id}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video bg-gradient-to-r from-indigo-100 to-blue-50">
                <MapPinIcon className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
                {route.previewUrl && (
                  <Image
                    src={route.previewUrl}
                    alt={route.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">{route.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateLabel(route.recordedAt)}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    <span>{route.durationLabel}</span>
                    <span className="mx-2">•</span>
                    <span>{route.distanceLabel} km</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{route.startLocation}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-3">{route.gpsPoints} GPS pts</span>
                    <span>{route.audioNotes} audio notes</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ArrowPathIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{route.endLocation}</span>
                  </div>
                  {route.status && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {route.status}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex space-x-2 pt-2">
                  <Link
                    href={`/routes/analysis/${route.id}`}
                    className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    AI Note
                  </Link>
                  <button
                    onClick={() => openReview(route.id)}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PlayIcon className="mr-1 inline h-4 w-4" />
                    Review
                  </button>
                  <button
                    onClick={() => handleDelete(route.id)}
                    disabled={deletingId === route.id}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === route.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
