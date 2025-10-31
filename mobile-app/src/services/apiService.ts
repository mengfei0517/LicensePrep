import axios from 'axios';
import Constants from 'expo-constants';
import { GPSPoint, AudioNote } from '../types';

const DEFAULT_API_PATH = '/api/mobile';

const deriveBackendUrlFromExpo = (): string | null => {
  const hostUri =
    Constants.expoGoConfig?.hostUri ??
    Constants.expoConfig?.hostUri ??
    '';

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];
  if (!host) {
    return null;
  }

  return `http://${host}:5000${DEFAULT_API_PATH}`;
};

const sanitizeUrl = (url: string): string =>
  url.endsWith('/') ? url.slice(0, -1) : url;

const buildApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return sanitizeUrl(envUrl);
  }

  const derivedUrl = deriveBackendUrlFromExpo();
  if (derivedUrl) {
    return sanitizeUrl(derivedUrl);
  }

  return sanitizeUrl(`http://localhost:5000${DEFAULT_API_PATH}`);
};

const API_BASE_URL = buildApiBaseUrl();

const getBackendOrigin = (): string => {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return API_BASE_URL.replace(DEFAULT_API_PATH, '');
  }
};

const BACKEND_ORIGIN = getBackendOrigin();

console.log('[APIService] Backend API base:', API_BASE_URL);

export class APIService {
  private static axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Start a new route recording session
   */
  static async startSession(deviceId: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/routes/start', {
        device_id: deviceId,
        start_time: new Date().toISOString(),
      });
      
      console.log('✅ Session started:', response.data.session_id);
      return response.data.session_id;
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      throw error;
    }
  }

  /**
   * Upload GPS points in batch
   */
  static async uploadGPSPoints(sessionId: string, points: GPSPoint[]): Promise<void> {
    try {
      await this.axiosInstance.post(`/routes/${sessionId}/gps`, {
        points: points,
      });
      
      console.log(`✅ Uploaded ${points.length} GPS points`);
    } catch (error) {
      console.error('❌ Failed to upload GPS points:', error);
      // Don't throw - we'll retry later
    }
  }

  /**
   * Upload audio note with GPS coordinates
   */
  static async uploadAudioNote(
    sessionId: string,
    audioUri: string,
    latitude: number,
    longitude: number,
    timestamp: string
  ): Promise<void> {
    try {
      const formData = new FormData();
      
      // Create audio file object
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a',
        name: `audio_${Date.now()}.m4a`,
      } as any;
      
      formData.append('audio_file', audioFile);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('timestamp', timestamp);

      await this.axiosInstance.post(`/routes/${sessionId}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Audio note uploaded');
    } catch (error) {
      console.error('❌ Failed to upload audio note:', error);
      throw error;
    }
  }

  /**
   * Finish recording session
   */
  static async finishSession(
    sessionId: string,
    totalDistance: number,
    totalDuration: number
  ): Promise<void> {
    try {
      await this.axiosInstance.post(`/routes/${sessionId}/finish`, {
        end_time: new Date().toISOString(),
        total_distance: totalDistance,
        total_duration: totalDuration,
      });
      
      console.log('✅ Session finished');
    } catch (error) {
      console.error('❌ Failed to finish session:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${BACKEND_ORIGIN}/`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch recorded sessions (web + mobile)
   */
  static async listSessions(limit: number = 50, offset: number = 0) {
    const response = await this.axiosInstance.get('/routes', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Fetch a specific session with GPS + audio metadata
   */
  static async getSession(sessionId: string) {
    const response = await this.axiosInstance.get(`/routes/${sessionId}`);
    return response.data;
  }
}
