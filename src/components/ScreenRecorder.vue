<template>
  <div class="screen-recorder q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-select
          v-model="selectedSource"
          :options="sources"
          option-label="name"
          label="Select Screen/Window"
          filled
          :loading="loading"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar v-if="scope.opt.thumbnail">
                <img :src="scope.opt.thumbnail" style="width: 40px; height: 30px; object-fit: cover;" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      
      <div class="col-12">
        <div class="row q-col-gutter-sm justify-center">
          <div class="col-auto">
            <q-btn
              color="primary"
              :icon="isRecording ? 'stop' : 'fiber_manual_record'"
              :label="isRecording ? 'Stop Recording' : 'Start Recording'"
              @click="toggleRecording"
              :disable="(!selectedSource && !isRecording) || recordingLoading"
              :loading="recordingLoading"
            />
          </div>
          <div class="col-auto" v-if="!isRecording">
            <q-btn
              color="secondary"
              icon="refresh"
              label="Refresh Sources"
              @click="loadSources"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <div v-if="isRecording" class="col-12 text-center">
        <q-chip color="negative" text-color="white" icon="fiber_manual_record">
          Recording in progress... {{ recordingTime }}
        </q-chip>
      </div>

      <div v-if="recordedVideoUrl" class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Preview</div>
          </q-card-section>
          <q-card-section>
            <video :src="recordedVideoUrl" controls style="width: 100%; max-height: 300px;"></video>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" @click="saveRecording" :loading="savingVideo">
              Save Video
            </q-btn>
            <q-btn color="secondary" @click="discardRecording">
              Discard
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

interface DesktopCapturerSource {
  id: string;
  name: string;
  thumbnail: string;
  display_id?: string;
  appIcon?: string;
}

interface ChromeMediaConstraints {
  chromeMediaSource: string;
  chromeMediaSourceId: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

const $q = useQuasar();

const sources = ref<DesktopCapturerSource[]>([]);
const selectedSource = ref<DesktopCapturerSource | null>(null);
const isRecording = ref(false);
const loading = ref(false);
const recordingLoading = ref(false);
const savingVideo = ref(false);
const recordingTime = ref('00:00');
const recordedVideoUrl = ref<string | null>(null);

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let currentStream: MediaStream | null = null;
let recordingTimer: NodeJS.Timeout | null = null;
let recordingStartTime = 0;

// Add type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      getSources: () => Promise<DesktopCapturerSource[]>;
      getDesktopCapturerSource: (sourceId: string) => Promise<{ sourceId: string }>;
      saveVideo: (buffer: ArrayBuffer) => Promise<string | null>;
      showErrorDialog: (title: string, content: string) => Promise<void>;
      checkScreenPermission: () => Promise<{ hasPermission: boolean; message?: string }>;
      requestScreenPermission: () => Promise<boolean>;
    }
  }
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateRecordingTime = () => {
  if (isRecording.value) {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    recordingTime.value = formatTime(elapsed);
  }
};

const checkPermissions = async (): Promise<boolean> => {
  try {
    const result = await window.electronAPI.checkScreenPermission();
    return result.hasPermission;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

const requestPermissions = async (): Promise<boolean> => {
  try {
    return await window.electronAPI.requestScreenPermission();
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

const loadSources = async () => {
  loading.value = true;
  try {
    // First check if we have permissions
    const hasPermission = await checkPermissions();
    
    if (!hasPermission) {
      $q.notify({
        type: 'warning',
        message: 'Screen recording permission required. Please grant permission to continue.',
        position: 'top',
        timeout: 3000
      });
      
      // Try to request permission
      const granted = await requestPermissions();
      if (!granted) {
        $q.notify({
          type: 'negative',
          message: 'Screen recording permission denied. Cannot load screen sources.',
          position: 'top',
          timeout: 5000
        });
        return;
      }
    }

    sources.value = await window.electronAPI.getSources();
    
    if (sources.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No screen sources found. Please ensure screen recording permissions are granted and restart the app if needed.',
        position: 'top',
        timeout: 5000
      });
    } else {
      $q.notify({
        type: 'positive',
        message: `Found ${sources.value.length} screen source(s)`,
        position: 'top',
        timeout: 2000
      });
      
      // Auto-select first source if none selected
      if (!selectedSource.value && sources.value.length > 0) {
        selectedSource.value = sources.value[0] || null;
      }
    }
  } catch (error) {
    console.error('Error loading sources:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load screen sources. Please check permissions and try again.',
      position: 'top',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const startRecording = async () => {
  if (!selectedSource.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select a screen or window to record',
      position: 'top'
    });
    return;
  }

  recordingLoading.value = true;
  try {
    // Get the desktop capturer source
    await window.electronAPI.getDesktopCapturerSource(selectedSource.value.id);

    // Get user media with desktop capturer
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedSource.value.id,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      } as MediaTrackConstraints & { mandatory: ChromeMediaConstraints }
    });

    currentStream = stream;
    recordedChunks = [];

    // Create MediaRecorder
    const options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedVideoUrl.value = URL.createObjectURL(blob);
    };

    mediaRecorder.start(100); // Collect data every 100ms
    isRecording.value = true;
    recordingStartTime = Date.now();
    
    // Start recording timer
    recordingTimer = setInterval(updateRecordingTime, 1000);

    $q.notify({
      type: 'positive',
      message: 'Recording started successfully',
      icon: 'fiber_manual_record',
      position: 'top'
    });

  } catch (error) {
    console.error('Error starting recording:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to start recording. Please check permissions and try again.',
      icon: 'error',
      position: 'top'
    });
  } finally {
    recordingLoading.value = false;
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }

  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }

  isRecording.value = false;
  recordingTime.value = '00:00';

  $q.notify({
    type: 'positive',
    message: 'Recording stopped',
    icon: 'stop',
    position: 'top'
  });
};

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    await startRecording();
  }
};

const saveRecording = async () => {
  if (!recordedVideoUrl.value) return;

  savingVideo.value = true;
  try {
    // Convert blob URL to ArrayBuffer
    const response = await fetch(recordedVideoUrl.value);
    const arrayBuffer = await response.arrayBuffer();

    // Save via Electron
    const savedPath = await window.electronAPI.saveVideo(arrayBuffer);
    
    if (savedPath) {
      $q.notify({
        type: 'positive',
        message: `Video saved successfully to: ${savedPath}`,
        icon: 'check',
        position: 'top',
        timeout: 5000
      });
      discardRecording();
    }
  } catch (error) {
    console.error('Error saving video:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to save video',
      icon: 'error',
      position: 'top'
    });
  } finally {
    savingVideo.value = false;
  }
};

const discardRecording = () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
    recordedVideoUrl.value = null;
  }
  recordedChunks = [];
};

// Cleanup on component unmount
onUnmounted(() => {
  if (isRecording.value) {
    stopRecording();
  }
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
  }
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
});

onMounted(() => {
  void loadSources();
});
</script>

<style scoped>
.screen-recorder {
  max-width: 800px;
  margin: 0 auto;
}

.q-chip {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style> 