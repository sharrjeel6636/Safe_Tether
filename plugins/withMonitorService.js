// plugins/withMonitorService.js
// An Expo config plugin that patches the generated AndroidManifest.xml:
//   1. Notifee's library declares its foreground service as `shortService` (it is stopped by
//      Android after about three minutes). We replace the type with connectedDevice|location.
//   2. Permissions the foreground service needs on Android 14+.
//   3. <queries> so the app may ask "is there a map app?" for the geo: link on Last Location.
const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.VIBRATE',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.INTERNET',
];

module.exports = function withMonitorService(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    AndroidConfig.Manifest.ensureToolsAvailable(manifest);

    // 1. permissions
    manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'] ?? [];
    for (const name of PERMISSIONS) {
      const has = manifest.manifest['uses-permission'].some((p) => p.$['android:name'] === name);
      if (!has) manifest.manifest['uses-permission'].push({ $: { 'android:name': name } });
    }

    // 2. override the foreground service type that Notifee's library manifest declares
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.service = (app.service ?? []).filter((s) => s.$['android:name'] !== 'app.notifee.core.ForegroundService');
    app.service.push({
      $: {
        'android:name': 'app.notifee.core.ForegroundService',
        'android:exported': 'false',
        'android:foregroundServiceType': 'connectedDevice|location',
        'tools:replace': 'android:foregroundServiceType',
      },
    });

    // 3. package visibility for geo: links
    manifest.manifest.queries = manifest.manifest.queries ?? [];
    manifest.manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'geo' } }],
        },
      ],
    });
    return cfg;
  });
};
