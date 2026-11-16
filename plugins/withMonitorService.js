const {
  withAndroidManifest,
  AndroidConfig,
} = require('@expo/config-plugins');

function withMonitorService(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    const permissions = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
      'android.permission.FOREGROUND_SERVICE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ];

    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    for (const perm of permissions) {
      const exists = androidManifest.manifest['uses-permission'].some(
        (p) => p.$ && p.$['android:name'] === perm
      );
      if (!exists) {
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': perm },
        });
      }
    }

    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = [];
    }
    const hasGeoQuery = androidManifest.manifest.queries.some((q) =>
      q.intent && q.intent.some((i) => i.data && i.data.some((d) => d.$ && d.$['android:scheme'] === 'geo'))
    );
    if (!hasGeoQuery) {
      androidManifest.manifest.queries.push({
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [{ $: { 'android:scheme': 'geo' } }],
          },
        ],
      });
    }

    if (mainApplication.service) {
      for (const service of mainApplication.service) {
        if (
          service.$ &&
          (service.$['android:name']?.includes('notifee') ||
            service.$['android:name']?.includes('ForegroundService'))
        ) {
          service.$['android:foregroundServiceType'] = 'connectedDevice|location';
        }
      }
    }

    return config;
  });
}

module.exports = withMonitorService;
