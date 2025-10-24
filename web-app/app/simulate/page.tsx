'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { 
  MapPinIcon, 
  PlayIcon, 
  ChartBarIcon,
  MicrophoneIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useRoutes } from '@/lib/hooks/use-routes';
import { apiClient } from '@/lib/api-client';
import type { RouteInfo, RouteLocation } from '@/lib/api-client';

const BACKEND_BASE_PATH = '/backend';

const formatDurationLabel = (minutes: number | undefined): string => {
  if (!minutes || Number.isNaN(minutes)) {
    return '0 min';
  }

  if (minutes < 1) {
    const seconds = Math.max(Math.round(minutes * 60), 1);
    return `${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
  }

  return `${Math.round(minutes)} min`;
};

const formatDistanceLabel = (distanceKm: number | undefined): string => {
  if (!distanceKm || Number.isNaN(distanceKm)) {
    return '0.00';
  }
  return distanceKm.toFixed(2);
};

const formatDateLabel = (isoDate: string | undefined): string => {
  if (!isoDate) return 'Unknown date';
  try {
    return new Date(isoDate).toLocaleString('de-DE');
  } catch {
    return isoDate;
  }
};

const formatLocationLabel = (location?: RouteLocation | null): string => {
  if (!location) return 'Not captured';
  if (location.description) return location.description;
  const { latitude, longitude } = location;
  if (latitude === undefined || longitude === undefined) return 'Not captured';
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

interface SavedRouteCard {
  id: string;
  title: string;
  recordedAt: string | undefined;
  durationLabel: string;
  distanceLabel: string;
  startLocation: string;
  endLocation: string;
  status?: string;
  gpsPoints: number;
  audioNotes: number;
  previewUrl?: string | null;
}

export default function SimulatePage() {
  const { routes, isLoading, error, refresh } = useRoutes();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const savedRoutes = useMemo<SavedRouteCard[]>(() => {
    if (!routes) return [];

    return routes.map((route: RouteInfo) => ({
      id: route.route_id,
      title: route.device_id ? `Drive (${route.device_id})` : route.route_id,
      recordedAt: route.recorded_at,
      durationLabel: formatDurationLabel(route.duration_min),
      distanceLabel: formatDistanceLabel(route.distance_km),
      startLocation: formatLocationLabel(route.start_location),
      endLocation: formatLocationLabel(route.end_location),
      status: route.status,
      gpsPoints: route.gps_points_count ?? 0,
      audioNotes: route.audio_notes_count ?? 0,
      previewUrl: route.preview_url ? `/backend${route.preview_url}` : null,
    }));
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

  const openRecorder = () => {
    // Open Flask route recorder in new window
    window.open(`${BACKEND_BASE_PATH}/route-recorder`, '_blank');
  };

  const openReview = (routeId: string) => {
    // Open Flask route review in new window
    window.open(`${BACKEND_BASE_PATH}/route-review/${routeId}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Exam Route Simulation
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Record, analyze, and review your practice driving routes
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          onClick={openRecorder}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <MapPinIcon className="w-12 h-12" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">New</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Record Route</h3>
          <p className="text-sm opacity-90">
            Start GPS tracking and record your practice drive with voice notes
          </p>
        </button>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-12 h-12" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Pro</span>
          </div>
          <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
          <p className="text-sm opacity-90">
            Get detailed feedback on your driving performance and mistakes
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <PlayIcon className="w-12 h-12" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Review</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Playback Routes</h3>
          <p className="text-sm opacity-90">
            Replay your routes with speed visualization and voice notes
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">GPS Tracking</h4>
              <p className="text-sm text-gray-600">High-accuracy GPS recording with OpenStreetMap visualization</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MicrophoneIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Voice Notes</h4>
              <p className="text-sm text-gray-600">Record voice observations during your drive with GPS coordinates</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Speed Analysis</h4>
              <p className="text-sm text-gray-600">Visualize speed changes, acceleration, and braking patterns</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Route Playback</h4>
              <p className="text-sm text-gray-600">Replay routes with adjustable speed and voice note synchronization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Routes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Saved Routes ({savedRoutes.length})
          </h2>
          {savedRoutes.length > 0 && (
            <button
              onClick={() => refresh()}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load routes: {error?.message || 'Unknown error'}
          </div>
        )}

        {deleteError && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {deleteError}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading routes...</p>
          </div>
        ) : savedRoutes.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No routes recorded yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by recording your first practice route
            </p>
            <button
              onClick={openRecorder}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPinIcon className="w-5 h-5 mr-2" />
              Record First Route
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-to-r from-indigo-100 to-blue-50 flex items-center justify-center">
                  <MapPinIcon className="w-12 h-12 text-indigo-400" />
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

                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {route.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{route.durationLabel}</span>
                      <span className="mx-2">•</span>
                      <span>{route.distanceLabel} km</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{route.startLocation}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-3">{route.gpsPoints} GPS pts</span>
                      <span>{route.audioNotes} audio notes</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      <span className="truncate">{route.endLocation}</span>
                    </div>
                    {route.status && (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                        {route.status}
                      </span>
                    )}
                    <div className="text-xs text-gray-500">
                      {formatDateLabel(route.recordedAt)}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => openReview(route.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <PlayIcon className="w-4 h-4 inline mr-1" />
                      Review
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      disabled={deletingId === route.id}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Info Banner */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 How Route Simulation Works
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Record:</strong> Use the GPS recorder to track your practice drives. Add voice notes for mistakes or observations.
          </p>
          <p>
            <strong>2. Review:</strong> Replay your routes with speed visualization, voice notes, and detailed statistics.
          </p>
          <p>
            <strong>3. Analyze:</strong> Get AI-powered feedback on your driving performance and areas to improve.
          </p>
          <p className="pt-2 border-t border-blue-200">
            <strong>Note:</strong> Sessions recorded in the mobile app upload automatically to this dashboard after you finish recording. Hit refresh if you do not see the latest drive.
          </p>
        </div>
      </div>
    </div>
  );
}
