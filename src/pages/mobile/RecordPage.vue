<template>
  <q-page class="record-page">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="fiber_manual_record" color="red" class="q-mr-sm" />
          Record
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="content-container q-pa-md">
      <!-- Info Card -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="text-center">
          <q-icon name="desktop_windows" size="60px" color="primary" />
          <div class="text-h6 q-mt-md">Desktop Recording</div>
          <div class="text-body2 text-grey-6">
            Screen recording is available on desktop devices
          </div>
        </q-card-section>
      </q-card>

      <!-- Instructions -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">How to Record</div>
          
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">1</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Open Scouter on Desktop</q-item-label>
                <q-item-label caption>Use the Electron app on Windows, Mac, or Linux</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">2</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Select Screen Source</q-item-label>
                <q-item-label caption>Choose which screen or window to record</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">3</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Start Recording</q-item-label>
                <q-item-label caption>Click the record button to begin</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">4</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>View on Mobile</q-item-label>
                <q-item-label caption>Access your recordings here on your mobile device</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Features -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Recording Features</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="hd" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>High Quality</q-item-label>
                  <q-item-label caption>Up to 1080p recording</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="timer" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Real-time Timer</q-item-label>
                  <q-item-label caption>See recording duration</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="preview" color="orange" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Instant Preview</q-item-label>
                  <q-item-label caption>Preview before saving</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="smartphone" color="purple" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mobile Sync</q-item-label>
                  <q-item-label caption>View on any device</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Record page - instructions for desktop recording
</script>

<style scoped>
.record-page {
  background: #f5f5f5;
}

.content-container {
  padding-bottom: 80px; /* Account for bottom tabs */
}
</style> 