<template>
  <q-page class="video-viewer">
    <!-- Header with Safe Area -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="video_library" class="q-mr-sm" />
          Video Gallery
        </q-toolbar-title>
        
        <q-chip 
          :color="isCapacitor ? 'green' : 'orange'" 
          text-color="white" 
          size="sm"
          :icon="isCapacitor ? 'smartphone' : 'web'"
          class="q-mr-sm"
        >
          {{ platformName }}
        </q-chip>
        
        <q-btn 
          flat 
          round 
          icon="refresh" 
          @click="loadVideos"
          :loading="loading"
        />
      </q-toolbar>
    </q-header>

    <!-- Video List -->
    <div class="video-content">
        <div class="q-pa-md">
          <div v-if="videos.length === 0 && !loading" class="text-center q-py-xl">
            <q-icon name="video_library" size="4rem" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No videos found</div>
            <div class="text-body2 text-grey-6">
              Record videos on your desktop app to view them here
            </div>
          </div>

          <q-list v-else separator>
            <q-item 
              v-for="video in videos" 
              :key="video.id"
              clickable
              @click="playVideo(video)"
              class="video-item"
            >
              <q-item-section avatar>
                <q-avatar rounded size="60px">
                  <video 
                    :src="video.url" 
                    class="video-thumbnail"
                    @loadedmetadata="onVideoLoaded"
                  />
                  <q-icon 
                    name="play_circle_filled" 
                    size="2rem" 
                    color="white"
                    class="play-overlay"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ video.name }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatDate(video.dateCreated) }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatFileSize(video.size) }} • {{ formatDuration(video.duration) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center">
                  <q-btn 
                    flat 
                    round 
                    icon="share" 
                    size="sm"
                    @click.stop="shareVideo(video)"
                  />
                  <q-btn 
                    flat 
                    round 
                    icon="more_vert" 
                    size="sm"
                    @click.stop="showVideoOptions(video)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <!-- Loading State -->
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-page>

    <!-- Video Player Dialog -->
    <q-dialog v-model="showPlayer" maximized>
      <q-card class="bg-black">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">{{ selectedVideo?.name }}</div>
          <q-space />
          <q-btn 
            icon="close" 
            flat 
            round 
            dense 
            color="white"
            @click="closePlayer" 
          />
        </q-card-section>

        <q-card-section class="q-pt-none full-height">
          <video 
            v-if="selectedVideo"
            :src="selectedVideo.url"
            controls
            autoplay
            class="full-width full-height"
            style="object-fit: contain;"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Video Options Menu -->
    <q-dialog v-model="showOptions">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ selectedVideo?.name }}</div>
        </q-card-section>

        <q-list>
          <q-item clickable @click="shareVideo(selectedVideo)" v-close-popup>
            <q-item-section avatar>
              <q-icon name="share" />
            </q-item-section>
            <q-item-section>Share Video</q-item-section>
          </q-item>

          <q-item clickable @click="downloadVideo(selectedVideo)" v-close-popup>
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
            <q-item-section>Save to Photos</q-item-section>
          </q-item>

          <q-item clickable @click="deleteVideo(selectedVideo)" v-close-popup>
            <q-item-section avatar>
              <q-icon name="delete" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">Delete Video</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { capacitorService, type VideoFile } from 'src/services/capacitorService';
import { usePlatform } from 'src/composables/usePlatform';

const $q = useQuasar();
const { isCapacitor, platformName } = usePlatform();

const videos = ref<VideoFile[]>([]);
const loading = ref(false);
const showPlayer = ref(false);
const showOptions = ref(false);
const selectedVideo = ref<VideoFile | null>(null);

const loadVideos = async () => {
  loading.value = true;
  try {
    videos.value = await capacitorService.getVideoFiles();
    
    $q.notify({
      type: 'positive',
      message: `Loaded ${videos.value.length} videos`,
      position: 'top'
    });
  } catch (error) {
    console.error('Error loading videos:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load videos',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const playVideo = (video: VideoFile) => {
  selectedVideo.value = video;
  showPlayer.value = true;
};

const closePlayer = () => {
  showPlayer.value = false;
  selectedVideo.value = null;
};

const showVideoOptions = (video: VideoFile) => {
  selectedVideo.value = video;
  showOptions.value = true;
};

const shareVideo = async (video: VideoFile | null) => {
  if (!video) return;
  
  try {
    if (capacitorService.isNative()) {
      await capacitorService.shareVideo(video);
      $q.notify({
        type: 'positive',
        message: 'Video shared successfully!',
        position: 'top'
      });
    } else {
      // Web fallback - copy link to clipboard or show share options
      $q.notify({
        type: 'info',
        message: 'Sharing is available on mobile devices',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error sharing video:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to share video',
      position: 'top'
    });
  }
};

const downloadVideo = (video: VideoFile | null) => {
  if (!video) return;
  
  try {
    if (capacitorService.isNative()) {
      // On native platforms, the file is already saved to the device
      $q.notify({
        type: 'positive',
        message: 'Video is already saved to your device',
        position: 'top'
      });
    } else {
      // Web fallback - trigger download
      const link = document.createElement('a');
      link.href = video.url;
      link.download = video.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      $q.notify({
        type: 'positive',
        message: 'Video download started',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error downloading video:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to download video',
      position: 'top'
    });
  }
};

const deleteVideo = async (video: VideoFile | null) => {
  if (!video) return;
  
  try {
    const confirmed = await capacitorService.showConfirmDialog(
      'Delete Video',
      `Are you sure you want to delete "${video.name}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      if (capacitorService.isNative()) {
        await capacitorService.deleteVideo(video);
      }
      
      // Remove from local list
      videos.value = videos.value.filter(v => v.id !== video.id);
      
      $q.notify({
        type: 'positive',
        message: 'Video deleted successfully',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to delete video',
      position: 'top'
    });
  }
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const onVideoLoaded = (event: Event) => {
  // Handle video thumbnail loading
  const video = event.target as HTMLVideoElement;
  video.currentTime = 1; // Seek to 1 second for thumbnail
};

// Handle safe area for mobile devices (currently unused but kept for future use)
// const styleFn = (offset: number) => {
//   return { minHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' };
// };

onMounted(async () => {
  await loadVideos();
});
</script>

<style scoped>
.video-viewer {
  height: 100vh;
}

.video-item {
  min-height: 80px;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
}

.q-avatar {
  position: relative;
}
</style> 