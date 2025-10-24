import { Audio } from 'expo-av';
import { AudioNote } from '../types';

export class AudioService {
  private static recording: Audio.Recording | null = null;
  private static recordingStartTime: number = 0;

  /**
   * Request audio recording permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('❌ Audio recording permission denied');
        return false;
      }

      console.log('✅ Audio recording permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  static async startRecording(): Promise<boolean> {
    try {
      // Check if already recording
      if (this.recording) {
        console.warn('⚠️  Already recording audio');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.recordingStartTime = Date.now();

      console.log('🎤 Audio recording started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start audio recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and return audio URI
   */
  static async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    try {
      if (!this.recording) {
        console.warn('⚠️  No active recording to stop');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);

      this.recording = null;

      if (uri) {
        console.log('⏹️  Audio recording stopped:', uri);
        return { uri, duration };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to stop audio recording:', error);
      return null;
    }
  }

  /**
   * Check if currently recording
   */
  static isRecording(): boolean {
    return this.recording !== null;
  }

  /**
   * Get recording duration in seconds
   */
  static getRecordingDuration(): number {
    if (!this.recording || this.recordingStartTime === 0) {
      return 0;
    }
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }

  /**
   * Cancel recording without saving
   */
  static async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.recordingStartTime = 0;
        console.log('❌ Recording cancelled');
      } catch (error) {
        console.error('❌ Error cancelling recording:', error);
      }
    }
  }
}



