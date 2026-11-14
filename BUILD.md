# Build Instructions

To build the app using EAS Build:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Project** (if not already linked):
   ```bash
   eas project:init
   ```

4. **Run Development Build (Android APK)**:
   ```bash
   eas build --profile development --platform android
   ```

5. **Run Preview Build (Android APK)**:
   ```bash
   eas build --profile preview --platform android
   ```
