<template>
  <!-- Desktop Layout (Electron/Desktop) -->
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <!-- TO DO: Add a logo here for q-avatar -->
        <q-avatar size="28px" color="primary" text-color="white" icon="screen_record" class="q-mr-sm" />
        <q-toolbar-title>
          Scouter - Screen Recorder
        </q-toolbar-title>

        <q-chip 
          :color="platformChipColor" 
          text-color="white" 
          :icon="platformIcon"
          size="md"
        >
          {{ platformName }}
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          <q-icon name="video_camera_front" class="q-mr-sm" />
          Screen Recording
        </q-item-label>

        <q-item 
          clickable 
          :active="$route.path === '/'"
          @click="$router.push('/')"
        >
          <q-item-section avatar>
            <q-icon name="videocam" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Record Screen</q-item-label>
            <q-item-label caption>Capture your screen activity</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>
          <q-icon name="info" class="q-mr-sm" />
          About
        </q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon name="devices" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Platform</q-item-label>
            <q-item-label caption>{{ platformName }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon name="smartphone" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mobile App</q-item-label>
            <q-item-label caption>View videos on mobile devices</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlatform } from 'src/composables/usePlatform';

const router = useRouter();

// Platform detection
const { shouldShowMobileUI, platformName } = usePlatform();

// Redirect mobile users to mobile layout (but NOT Electron)
onMounted(() => {
  if (shouldShowMobileUI.value && !platformName.value.includes('electron') && !router.currentRoute.value.path.startsWith('/mobile')) {
    void router.replace('/mobile');
  }
});

// Platform-specific styling
const platformChipColor = computed(() => {
  switch (platformName.value) {
    case 'electron': return 'blue';
    case 'capacitor': return 'green';
    case 'cordova': return 'orange';
    default: return 'grey';
  }
});

const platformIcon = computed(() => {
  switch (platformName.value) {
    case 'electron': return 'desktop_windows';
    case 'capacitor': return 'smartphone';
    case 'cordova': return 'phone_android';
    default: return 'web';
  }
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
