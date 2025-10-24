import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Device from 'expo-device';
import { AudioNote, GPSPoint, RecordingStats } from '../types';
import { LocationService } from '../services/locationService';
import { AudioService } from '../services/audioService';
import { APIService } from '../services/apiService';

interface SessionSummary extends RecordingStats {
  sessionId: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

const INITIAL_STATS: RecordingStats = {
  duration: 0,
  distance: 0,
  speed: 0,
  pointsCount: 0,
  audioNotesCount: 0,
};

const MAX_LOG_ENTRIES = 30;

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDistance = (distanceKm: number) => distanceKm.toFixed(2);

const RecordScreen: React.FC = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState<string>('unknown-device');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [stats, setStats] = useState<RecordingStats>(INITIAL_STATS);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const resolveDeviceId = async () => {
      try {
        const deviceName = await Device.getDeviceNameAsync();
        const model = Device.modelName ?? 'unknown';
        const idCandidates = [
          Device.osBuildId,
          Device.osInternalBuildId,
          Device.modelId,
        ].filter(Boolean);
        const id = idCandidates.join('-') || `${deviceName ?? 'Device'}-${model}`;
        setDeviceId(id);
      } catch (error) {
        console.warn('Failed to resolve device id:', error);
        setDeviceId(`device-${Date.now()}`);
      }
    };

    resolveDeviceId();
  }, []);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [message, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const healthCheck = useCallback(async () => {
    try {
      const isOnline = await APIService.healthCheck();
      setBackendOnline(isOnline);
    } catch (error) {
      setBackendOnline(false);
      console.error('Health check failed:', error);
    }
  }, []);

  useEffect(() => {
    healthCheck();
    const interval = setInterval(healthCheck, 15000);
    return () => clearInterval(interval);
  }, [healthCheck]);

  const updateStatsWithPoints = useCallback((points: GPSPoint[]) => {
    if (!points.length) {
      return;
    }

    setStats((prev) => {
      let distance = prev.distance;
      let lastPoint = lastPointRef.current;

      points.forEach((point) => {
        if (lastPoint) {
          distance += LocationService.calculateDistance(
            lastPoint.latitude,
            lastPoint.longitude,
            point.latitude,
            point.longitude
          );
        }
        lastPoint = point;
      });

      lastPointRef.current = lastPoint ?? lastPointRef.current;
      const latestPoint = points[points.length - 1];
      const speed = latestPoint.speed ?? prev.speed;

      return {
        ...prev,
        distance,
        pointsCount: prev.pointsCount + points.length,
        speed: speed ?? 0,
      };
    });
  }, []);

  const startDurationTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (recordingStartRef.current) {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setStats((prev) => ({
          ...prev,
          duration: elapsed,
        }));
      }
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecordingState = useCallback(() => {
    setStats(INITIAL_STATS);
    setAudioNotes([]);
    setIsRecording(false);
    setIsAudioRecording(false);
    setSessionId(null);
    sessionIdRef.current = null;
    lastPointRef.current = null;
    recordingStartRef.current = null;
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isRecording || isLoading) {
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    addLog('Initializing recording session...');

    try {
      try {
        await LocationService.requestPermissions();
        addLog('Location permissions granted.');
      } catch (permissionError: any) {
        const message =
          permissionError?.message ||
          'Location permission is required to start recording.';
        throw new Error(message);
      }

      const audioGranted = await AudioService.requestPermissions();
      if (!audioGranted) {
        addLog('Audio permission denied. Voice notes will be unavailable.');
      }

      const backendSessionId = await APIService.startSession(deviceId);
      setSessionId(backendSessionId);
      sessionIdRef.current = backendSessionId;
      setIsRecording(true);
      recordingStartRef.current = Date.now();
      startDurationTimer();
      addLog(`Session started: ${backendSessionId}`);

      const started = await LocationService.startTracking(async (points) => {
        if (!sessionIdRef.current) {
          return;
        }

        updateStatsWithPoints(points);

        try {
          await APIService.uploadGPSPoints(sessionIdRef.current, points);
          addLog(`Uploaded ${points.length} GPS points`);
        } catch (error) {
          console.error('Failed to upload GPS points:', error);
          addLog('Failed to upload GPS points (will retry on next batch).');
        }
      });

      if (!started) {
        throw new Error('Unable to start GPS tracking.');
      }

      setSessionSummary(null);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      setErrorMessage(error.message || 'Failed to start recording session.');
      Alert.alert('Recording Error', error.message || 'Unable to start recording.');
      resetRecordingState();
    } finally {
      setIsLoading(false);
    }
  }, [addLog, deviceId, isLoading, isRecording, resetRecordingState, startDurationTimer, updateStatsWithPoints]);

  const handleStopRecording = useCallback(async () => {
    if (!isRecording || !sessionIdRef.current) {
      return;
    }

    setIsLoading(true);
    addLog('Stopping recording session...');

    try {
      LocationService.stopTracking();
      stopDurationTimer();

      const durationSeconds = stats.duration;
      const durationMinutes = Math.max(durationSeconds / 60, 0);
      const distanceKm = stats.distance;

      await APIService.finishSession(
        sessionIdRef.current,
        Number(distanceKm.toFixed(3)),
        Number(durationMinutes.toFixed(2))
      );

      addLog('Session finished and uploaded to backend.');
      setSessionSummary({
        ...stats,
        sessionId: sessionIdRef.current,
        startedAt: recordingStartRef.current
          ? new Date(recordingStartRef.current).toISOString()
          : null,
        endedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Failed to finish session:', error);
      setErrorMessage(error.message || 'Failed to finish recording session.');
      Alert.alert('End Session Error', error.message || 'Unable to finish session.');
    } finally {
      resetRecordingState();
      setIsLoading(false);
    }
  }, [addLog, resetRecordingState, stats, stopDurationTimer]);

  const handleToggleAudioRecording = useCallback(async () => {
    if (!isRecording || !sessionIdRef.current) {
      Alert.alert('Not Recording', 'Start route recording before adding audio notes.');
      return;
    }

    try {
      if (!isAudioRecording) {
        const started = await AudioService.startRecording();
        if (started) {
          setIsAudioRecording(true);
          addLog('Voice note recording started.');
        } else {
          Alert.alert('Audio Error', 'Unable to start audio recording.');
        }
        return;
      }

      const result = await AudioService.stopRecording();
      setIsAudioRecording(false);

      if (!result?.uri) {
        addLog('Audio recording cancelled.');
        return;
      }

      const currentLocation = await LocationService.getCurrentLocation();
      if (!currentLocation) {
        Alert.alert('Location Error', 'Could not determine location for audio note.');
        return;
      }

      try {
        await APIService.uploadAudioNote(
          sessionIdRef.current,
          result.uri,
          currentLocation.latitude,
          currentLocation.longitude,
          currentLocation.timestamp
        );

        const note: AudioNote = {
          id: `${Date.now()}`,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: currentLocation.timestamp,
          audioUri: result.uri,
          duration: result.duration,
        };

        setAudioNotes((prev) => [note, ...prev]);
        setStats((prev) => ({
          ...prev,
          audioNotesCount: prev.audioNotesCount + 1,
        }));

        addLog(`Voice note uploaded (${result.duration}s).`);
      } catch (uploadError: any) {
        console.error('Failed to upload audio note:', uploadError);
        setErrorMessage(uploadError.message || 'Audio note upload failed.');
        Alert.alert('Upload Error', uploadError.message || 'Failed to upload audio note.');
      }
    } catch (error) {
      console.error('Audio recording error:', error);
      setIsAudioRecording(false);
      Alert.alert('Audio Error', 'Unexpected error while handling audio note.');
    }
  }, [addLog, isAudioRecording, isRecording]);

  const backendStatusText = useMemo(() => {
    if (backendOnline === null) return 'Checking...';
    return backendOnline ? 'Online' : 'Offline';
  }, [backendOnline]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LicensePrep Recorder</Text>
        <View
          style={[
            styles.statusBadge,
            backendOnline ? styles.statusOnline : styles.statusOffline,
          ]}
        >
          <Text style={styles.statusText}>Backend: {backendStatusText}</Text>
        </View>
        <Text style={styles.deviceId} numberOfLines={1}>
          Device: {deviceId}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Live Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distance (km)</Text>
              <Text style={styles.statValue}>{formatDistance(stats.distance)}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Speed (km/h)</Text>
              <Text style={styles.statValue}>{stats.speed.toFixed(1)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>GPS Points</Text>
              <Text style={styles.statValue}>{stats.pointsCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Audio Notes</Text>
              <Text style={styles.statValue}>{stats.audioNotesCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isRecording ? styles.stopButton : styles.startButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (!isRecording || isLoading) && styles.buttonDisabled,
              isAudioRecording && styles.audioRecordingButton,
            ]}
            onPress={handleToggleAudioRecording}
            disabled={!isRecording || isLoading}
          >
            <Text style={styles.secondaryButtonText}>
              {isAudioRecording ? 'Finish Voice Note' : 'Record Voice Note'}
            </Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#4c51bf" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}
        </View>

        {sessionSummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Last Session Summary</Text>
            <Text style={styles.summaryText}>
              Session ID: {sessionSummary.sessionId ?? 'Unknown'}
            </Text>
            <Text style={styles.summaryText}>
              Duration: {formatDuration(sessionSummary.duration)}
            </Text>
            <Text style={styles.summaryText}>
              Distance: {formatDistance(sessionSummary.distance)} km
            </Text>
            <Text style={styles.summaryText}>
              GPS Points: {sessionSummary.pointsCount}
            </Text>
            <Text style={styles.summaryText}>
              Audio Notes: {sessionSummary.audioNotesCount}
            </Text>
            <Text style={styles.summaryTimestamp}>
              {sessionSummary.startedAt
                ? `Started: ${new Date(sessionSummary.startedAt).toLocaleString()}`
                : ''}
            </Text>
            <Text style={styles.summaryTimestamp}>
              {sessionSummary.endedAt
                ? `Ended: ${new Date(sessionSummary.endedAt).toLocaleString()}`
                : ''}
            </Text>
          </View>
        )}

        {audioNotes.length > 0 && (
          <View style={styles.audioNotesCard}>
            <Text style={styles.sectionTitle}>Recent Voice Notes</Text>
            {audioNotes.map((note) => (
              <View key={note.id} style={styles.audioNoteRow}>
                <Text style={styles.audioNoteTitle}>
                  Note @ {new Date(note.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.audioNoteMeta}>
                  {note.duration}s • {note.latitude.toFixed(5)}, {note.longitude.toFixed(5)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.logsCard}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          {logs.length === 0 ? (
            <Text style={styles.logEntry}>No activity yet. Start a session to begin.</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={`${log}-${index}`} style={styles.logEntry}>
                • {log}
              </Text>
            ))
          )}
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: '#4338ca',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusOnline: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  statusOffline: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  deviceId: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#fff',
  },
  audioRecordingButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  secondaryButtonText: {
    color: '#4338ca',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loadingText: {
    color: '#4c51bf',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  audioNotesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  audioNoteRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  audioNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  audioNoteMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  logsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logEntry: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  errorBanner: {
    marginTop: 12,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default RecordScreen;
