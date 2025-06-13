<template>
  <q-page class="settings-page" :class="{ 'dark-bg': $q.dark.isActive }">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="settings" class="q-mr-sm" />
          Settings
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="content-container">
      <!-- App Info -->
      <q-card flat class="settings-card q-ma-md">
        <q-card-section>
          <div class="row items-center">
            <q-avatar size="50px" color="primary" text-color="white" icon="screen_record" />
            <div class="q-ml-md">
              <div class="text-h6">Scouter</div>
              <div class="text-body2 text-grey-6">Screen Recording App</div>
              <div class="text-caption text-grey-5">v1.0.0</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Platform Info -->
      <q-card flat class="settings-card q-ma-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Platform Information</div>
          
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="devices" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Platform</q-item-label>
                <q-item-label caption>{{ platformName }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="smartphone" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Native App</q-item-label>
                <q-item-label caption>{{ isCapacitor ? 'Yes' : 'No' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- App Settings -->
      <q-card flat class="settings-card q-ma-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">App Settings</div>
          
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-icon name="notifications" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notifications</q-item-label>
                <q-item-label caption>Get notified of new recordings</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.notifications" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-icon name="dark_mode" color="indigo" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dark Mode</q-item-label>
                <q-item-label caption>Use dark theme</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.darkMode" @update:model-value="toggleTheme" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-icon name="auto_delete" color="red" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Auto Delete</q-item-label>
                <q-item-label caption>Delete old recordings automatically</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settings.autoDelete" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Storage Info -->
      <q-card flat class="settings-card q-ma-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Storage</div>
          
          <q-item>
            <q-item-section avatar>
              <q-icon name="storage" color="blue" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Videos Stored</q-item-label>
              <q-item-label caption>{{ videoCount }} videos • {{ storageUsed }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-card-actions>
            <q-btn 
              outline 
              color="negative" 
              label="Clear All Videos" 
              icon="delete_forever"
              @click="confirmClearVideos"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>

      <!-- About -->
      <q-card flat class="settings-card q-ma-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">About</div>
          
          <q-list>
            <q-item clickable @click="openUrl('https://github.com/scouter-app')">
              <q-item-section avatar>
                <q-icon name="code" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Source Code</q-item-label>
                <q-item-label caption>View on GitHub</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="open_in_new" color="grey-5" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="openUrl('mailto:support@scouter.app')">
              <q-item-section avatar>
                <q-icon name="support" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Support</q-item-label>
                <q-item-label caption>Get help or report issues</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="open_in_new" color="grey-5" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="showLicenses">
              <q-item-section avatar>
                <q-icon name="description" color="blue" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Licenses</q-item-label>
                <q-item-label caption>Open source licenses</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { usePlatform } from 'src/composables/usePlatform';

const $q = useQuasar();
const { isCapacitor, platformName } = usePlatform();

const settings = ref({
  notifications: true,
  darkMode: false,
  autoDelete: false
});

const videoCount = ref(3);
const storageUsed = ref('45.2 MB');

const toggleTheme = (isDark: boolean) => {
  $q.dark.set(isDark);
  $q.notify({
    type: 'info',
    message: `Switched to ${isDark ? 'dark' : 'light'} theme`,
    position: 'top'
  });
};

const confirmClearVideos = () => {
  $q.dialog({
    title: 'Clear All Videos',
    message: 'Are you sure you want to delete all videos? This action cannot be undone.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    videoCount.value = 0;
    storageUsed.value = '0 MB';
    $q.notify({
      type: 'positive',
      message: 'All videos cleared',
      position: 'top'
    });
  });
};

const openUrl = (url: string) => {
  if (isCapacitor.value) {
    // Use Capacitor's Browser plugin for native apps
    $q.notify({
      type: 'info',
      message: 'Opening in browser...',
      position: 'top'
    });
  } else {
    window.open(url, '_blank');
  }
};

const showLicenses = () => {
  $q.notify({
    type: 'info',
    message: 'Licenses info would be shown here',
    position: 'top'
  });
};
</script>

<style scoped>
.settings-page {
  background: #f5f5f5;
}

.settings-page.dark-bg {
  background: #121212;
}

.content-container {
  padding-bottom: 80px; /* Account for bottom tabs */
}

.settings-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

body.body--dark .settings-card {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: #1e1e1e;
}
</style> 