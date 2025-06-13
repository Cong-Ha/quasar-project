import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Dialog } from '@capacitor/dialog';

export interface VideoFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  dateCreated: Date;
  path: string;
}

export class CapacitorService {
  private static instance: CapacitorService;
  private readonly VIDEO_DIRECTORY = 'scouter-videos';

  static getInstance(): CapacitorService {
    if (!CapacitorService.instance) {
      CapacitorService.instance = new CapacitorService();
    }
    return CapacitorService.instance;
  }

  /**
   * Check if running on a native platform
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize the video directory
   */
  async initializeVideoDirectory(): Promise<void> {
    if (!this.isNative()) return;

    try {
      await Filesystem.mkdir({
        path: this.VIDEO_DIRECTORY,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (error) {
      // Directory might already exist, which is fine
      console.log('Video directory already exists or created');
      console.error(error);
    }
  }

  /**
   * Get list of video files from the device
   */
  async getVideoFiles(): Promise<VideoFile[]> {
    if (!this.isNative()) {
      // Return mock data for web/development
      return this.getMockVideoFiles();
    }

    try {
      await this.initializeVideoDirectory();
      
      const result = await Filesystem.readdir({
        path: this.VIDEO_DIRECTORY,
        directory: Directory.Documents
      });

      const videoFiles: VideoFile[] = [];
      
      for (const file of result.files) {
        if (file.name.endsWith('.webm') || file.name.endsWith('.mp4')) {
          try {
            const stat = await Filesystem.stat({
              path: `${this.VIDEO_DIRECTORY}/${file.name}`,
              directory: Directory.Documents
            });

            const fileUri = await Filesystem.getUri({
              path: `${this.VIDEO_DIRECTORY}/${file.name}`,
              directory: Directory.Documents
            });

            videoFiles.push({
              id: file.name,
              name: file.name,
              url: fileUri.uri,
              size: stat.size,
              duration: 0, // We'll need to get this from video metadata
              dateCreated: new Date(stat.mtime),
              path: `${this.VIDEO_DIRECTORY}/${file.name}`
            });
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        }
      }

      return videoFiles.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    } catch (error) {
      console.error('Error reading video files:', error);
      throw new Error('Failed to load video files');
    }
  }

  /**
   * Save a video file to the device
   */
  async saveVideoFile(videoBlob: Blob, filename: string): Promise<string> {
    if (!this.isNative()) {
      throw new Error('File saving is only available on native platforms');
    }

    try {
      await this.initializeVideoDirectory();

      // Convert blob to base64
      const base64Data = await this.blobToBase64(videoBlob);
      
      const filePath = `${this.VIDEO_DIRECTORY}/${filename}`;
      
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Documents
      });

      return filePath;
    } catch (error) {
      console.error('Error saving video file:', error);
      throw new Error('Failed to save video file');
    }
  }

  /**
   * Share a video file
   */
  async shareVideo(videoFile: VideoFile): Promise<void> {
    if (!this.isNative()) {
      throw new Error('Sharing is only available on native platforms');
    }

    try {
      await Share.share({
        title: 'Share Video',
        text: `Check out this screen recording: ${videoFile.name}`,
        url: videoFile.url,
        dialogTitle: 'Share Video'
      });
    } catch (error) {
      console.error('Error sharing video:', error);
      throw new Error('Failed to share video');
    }
  }

  /**
   * Delete a video file
   */
  async deleteVideo(videoFile: VideoFile): Promise<void> {
    if (!this.isNative()) {
      throw new Error('File deletion is only available on native platforms');
    }

    try {
      await Filesystem.deleteFile({
        path: videoFile.path,
        directory: Directory.Documents
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video');
    }
  }

  /**
   * Show a confirmation dialog
   */
  async showConfirmDialog(title: string, message: string): Promise<boolean> {
    if (!this.isNative()) {
      return confirm(`${title}\n\n${message}`);
    }

    try {
      const result = await Dialog.confirm({
        title,
        message
      });
      return result.value;
    } catch (error) {
      console.error('Error showing dialog:', error);
      return false;
    }
  }

  /**
   * Show an alert dialog
   */
  async showAlert(title: string, message: string): Promise<void> {
    if (!this.isNative()) {
      alert(`${title}\n\n${message}`);
      return;
    }

    try {
      await Dialog.alert({
        title,
        message
      });
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  }

  /**
   * Convert blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get mock video files for development/web
   */
  private getMockVideoFiles(): VideoFile[] {
    return [
      {
        id: '1',
        name: 'Screen Recording 2024-01-15.webm',
        url: 'data:video/webm;base64,', // Empty video data for demo
        size: 15728640, // 15MB
        duration: 120, // 2 minutes
        dateCreated: new Date('2024-01-15T10:30:00'),
        path: '/mock/path/video1.webm'
      },
      {
        id: '2',
        name: 'Demo Recording.webm',
        url: 'data:video/webm;base64,', // Empty video data for demo
        size: 8388608, // 8MB
        duration: 75, // 1:15
        dateCreated: new Date('2024-01-14T15:45:00'),
        path: '/mock/path/video2.webm'
      },
      {
        id: '3',
        name: 'Tutorial Recording.webm',
        url: 'data:video/webm;base64,', // Empty video data for demo
        size: 25165824, // 24MB
        duration: 300, // 5 minutes
        dateCreated: new Date('2024-01-13T09:15:00'),
        path: '/mock/path/video3.webm'
      }
    ];
  }

  /**
   * Get platform information
   */
  getPlatformInfo() {
    return {
      platform: Capacitor.getPlatform(),
      isNative: this.isNative(),
      isWeb: !this.isNative()
    };
  }
}

// Export singleton instance
export const capacitorService = CapacitorService.getInstance(); 