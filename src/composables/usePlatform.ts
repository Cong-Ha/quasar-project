import { computed } from 'vue';
import { Platform } from 'quasar';

export function usePlatform() {
  const isMobile = computed(() => {
    return Platform.is.capacitor || Platform.is.cordova || Platform.is.mobile;
  });

  const isDesktop = computed(() => {
    return Platform.is.electron || Platform.is.desktop;
  });

  const isWeb = computed(() => {
    return !isMobile.value && !isDesktop.value;
  });

  const isCapacitor = computed(() => {
    return Platform.is.capacitor;
  });

  const isElectron = computed(() => {
    return Platform.is.electron;
  });

  const platformName = computed(() => {
    if (Platform.is.capacitor) return 'capacitor';
    if (Platform.is.electron) return 'electron';
    if (Platform.is.cordova) return 'cordova';
    if (Platform.is.mobile) return 'mobile-web';
    if (Platform.is.desktop) return 'desktop-web';
    return 'web';
  });

  const shouldShowMobileUI = computed(() => {
    return isMobile.value || Platform.is.capacitor;
  });

  const shouldShowDesktopUI = computed(() => {
    return isDesktop.value || Platform.is.electron;
  });

  return {
    isMobile,
    isDesktop,
    isWeb,
    isCapacitor,
    isElectron,
    platformName,
    shouldShowMobileUI,
    shouldShowDesktopUI
  };
} 