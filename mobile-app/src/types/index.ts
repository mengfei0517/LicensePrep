// Type definitions for LicensePrep Mobile App

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  timestamp: string;
}

export interface AudioNote {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  audioUri: string;
  duration: number;
}

export interface RouteSession {
  sessionId: string;
  deviceId: string;
  startTime: string;
  endTime?: string;
  totalDistance?: number;
  totalDuration?: number;
  gpsPoints: GPSPoint[];
  audioNotes: AudioNote[];
}

export interface RecordingStats {
  duration: number; // in seconds
  distance: number; // in kilometers
  speed: number; // in km/h
  pointsCount: number;
  audioNotesCount: number;
}



