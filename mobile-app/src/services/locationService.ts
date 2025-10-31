import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { GPSPoint } from '../types';

export class LocationService {
  private static locationSubscription: Location.LocationSubscription | null = null;
  private static gpsPointsBuffer: GPSPoint[] = [];
  private static onPointsCollected: ((points: GPSPoint[]) => void) | null = null;

  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<void> {
    try {
      const existing = await Location.getForegroundPermissionsAsync();

      if (existing.status === 'granted') {
        console.log('✅ Foreground location permission already granted');
      } else {
        if (!existing.canAskAgain) {
          throw new Error(
            'Location access is blocked. Enable it in system settings (Settings → Privacy → Location Services).'
          );
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error(
            'Location permission denied. Please allow access when prompted to start recording routes.'
          );
        }
        console.log('✅ Foreground location permission granted');
      }

      // Optional background permission for continuous tracking (best-effort)
      if (Platform.OS === 'android') {
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backgroundStatus !== 'granted') {
            console.warn('⚠️  Background location permission not granted (Android). Continuing with foreground tracking.');
          } else {
            console.log('✅ Background location permission granted (Android)');
          }
        } catch (error) {
          console.warn('⚠️  Unable to request background location permission:', error);
        }
      }

      // Improve accuracy on Android devices where possible
      if (Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (error) {
          console.warn('⚠️  Unable to enable network provider:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error requesting location permissions:', error);
      throw error instanceof Error
        ? error
        : new Error('Unexpected error while requesting location permissions.');
    }
  }

  /**
   * Start tracking location
   */
  static async startTracking(onPointsCallback: (points: GPSPoint[]) => void): Promise<boolean> {
    try {
      // Check if already tracking
      if (this.locationSubscription) {
        console.warn('⚠️  Already tracking location');
        return true;
      }

      this.onPointsCollected = onPointsCallback;
      this.gpsPointsBuffer = [];

      // Start watching location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          const point: GPSPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed ? location.coords.speed * 3.6 : null, // Convert m/s to km/h
            timestamp: new Date(location.timestamp).toISOString(),
          };

          this.gpsPointsBuffer.push(point);

          // Upload in batches every 5 points (approximately every 5 seconds)
          if (this.gpsPointsBuffer.length >= 5) {
            if (this.onPointsCollected) {
              this.onPointsCollected([...this.gpsPointsBuffer]);
            }
            this.gpsPointsBuffer = [];
          }
        }
      );

      console.log('✅ Location tracking started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error);
      return false;
    }
  }

  /**
   * Stop tracking location
   */
  static stopTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
      
      // Upload remaining points
      if (this.gpsPointsBuffer.length > 0 && this.onPointsCollected) {
        this.onPointsCollected([...this.gpsPointsBuffer]);
        this.gpsPointsBuffer = [];
      }

      console.log('⏹️  Location tracking stopped');
    }
  }

  /**
   * Get current location (one-time)
   */
  static async getCurrentLocation(): Promise<GPSPoint | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed ? location.coords.speed * 3.6 : null,
        timestamp: new Date(location.timestamp).toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two GPS points (Haversine formula)
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}


