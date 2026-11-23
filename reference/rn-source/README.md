# SafeTether parent app (React Native + TypeScript)

Android app for the SafeTether wearable (ESP32, Bluetooth LE). It watches the wearable's signal,
alerts the parent when the child goes out of range, the panic button is held, the link is lost or the
wearable battery is low, can ring the wearable, and keeps an alert history (phone database first,
Firestore copy second).

## Status: what has and has not been checked

| Checked here | Result |
|---|---|
| `npx tsc --noEmit` (strict) | 0 errors |
| `npx jest` | 66 tests pass (alert rules, RSSI pipeline, protocol, monitor controller, runtime wiring, data helpers) |
| `npx expo prebuild --platform android` | generated the Android project; the merged manifest has the permissions and the foreground-service override (`android_setup/AndroidManifest.generated.xml`) |
| `npx expo export --platform android` | the JavaScript bundles (about 1,100 modules, Hermes bytecode) |

| **Not** checked | Why |
|---|---|
| A Gradle build / APK | no Android SDK in the workspace and the download hosts are blocked |
| Anything on a real phone or the wearable | no device available |
| Firebase (login, Firestore, rules) | no Firebase project; the rules were not run in the emulator |
| Native-library compatibility with React Native 0.88 (New Architecture only) | `react-native-ble-plx` and `@notifee/react-native` are classic native modules; confirm on a real build |
| Bonding through an encrypted write, foreground service on Android 14+, behaviour on Xiaomi / Oppo / Vivo / Infinix | needs devices (test plan: Appendix F of the build plan) |

## Run it

```bash
npm install
# 1. Firebase: create a project, add an Android app with package com.example.safetether (change it in app.json),
#    download google-services.json into this folder, enable Email/Password in Authentication,
#    create Firestore and publish firebase/firestore.rules.
npx expo prebuild --platform android      # native code: Bluetooth, notifications, Firebase
npx expo run:android                      # needs the Android SDK and a phone with USB debugging
```

This app does **not** run in Expo Go: Bluetooth, Notifee and Firebase are native modules.
Without `google-services.json` remove the `@react-native-firebase/app` plugin and `googleServicesFile`
from `app.json`; the app then runs with "Use without an account" (alerts stay on the phone).

## Layout

```
index.ts            registers the foreground-service task before the app
App.tsx             navigation container, notification taps
plugins/withMonitorService.js   manifest patch: Notifee service type, permissions, geo: query
src/services/       pure logic (alertEngine, rssiFilter, distanceModel, zoneTracker, protocol, mapTiles)
                    bleService (react-native-ble-plx), monitorController, monitorRuntime,
                    notifier, foregroundService, location, permissions
src/data/           SQLite, AsyncStorage settings, Firebase auth + Firestore, sync
src/state/          zustand stores and hooks
src/screens/        the 14 screens
firmware/           ESP32 firmware (PlatformIO) that this app talks to
firebase/           Firestore security rules
__tests__/          Jest tests (a fake Bluetooth link drives the whole monitor)
```

## Contract with the wearable

Service `a7c30001-8e6f-42ea-8292-1758b7090812`; Panic `…0002` (notify `[state, counter]`),
Buzzer `…0003` (write `[1, seconds]` / `[0]`, encrypted), Status `…0004` (`[flags, fwMajor, fwMinor]`),
standard Battery Level `0x2A19`.
