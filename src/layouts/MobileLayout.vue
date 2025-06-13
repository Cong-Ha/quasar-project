<template>
  <q-layout view="hHh lpR fFf" class="mobile-layout">
    <!-- Main Content Area -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Tab Navigation (Reddit-style) -->
    <q-footer elevated>
      <q-tabs
        v-model="activeTab"
        class="text-grey-6"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          name="home"
          icon="home"
          label="Home"
          @click="navigateTo('/mobile/home')"
          :class="{ 'text-primary': activeTab === 'home' }"
        />
        
        <q-tab
          name="videos"
          icon="video_library"
          label="Videos"
          @click="navigateTo('/mobile/videos')"
          :class="{ 'text-primary': activeTab === 'videos' }"
        />
        
        <q-tab
          name="record"
          icon="fiber_manual_record"
          label="Record"
          @click="navigateTo('/mobile/record')"
          :class="{ 'text-primary': activeTab === 'record' }"
        />
        
        <q-tab
          name="settings"
          icon="settings"
          label="Settings"
          @click="navigateTo('/mobile/settings')"
          :class="{ 'text-primary': activeTab === 'settings' }"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref('home');

// Update active tab based on current route
watch(() => route.path, (newPath) => {
  if (newPath.includes('/mobile/videos')) {
    activeTab.value = 'videos';
  } else if (newPath.includes('/mobile/record')) {
    activeTab.value = 'record';
  } else if (newPath.includes('/mobile/settings')) {
    activeTab.value = 'settings';
  } else {
    activeTab.value = 'home';
  }
}, { immediate: true });

const navigateTo = (path: string) => {
  void router.push(path);
};
</script>

<style scoped>
.mobile-layout {
  /* Ensure proper safe area handling */
  padding-bottom: env(safe-area-inset-bottom);
}

.q-footer {
  /* Handle safe area for bottom navigation */
  padding-bottom: env(safe-area-inset-bottom);
}

.q-tab {
  min-height: 60px;
  padding: 8px 4px;
}

/* Active tab styling */
.q-tab.text-primary {
  background: rgba(25, 118, 210, 0.1);
}
</style> 