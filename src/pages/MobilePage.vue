<template>
  <q-page class="mobile-page">
    <VideoViewer />
  </q-page>
</template>

<script setup lang="ts">
import VideoViewer from 'src/components/VideoViewer.vue';
</script>

<style scoped>
.mobile-page {
  height: 100vh;
  overflow: hidden;
}
</style> 