# The Leaders Android APK — 2026-10-15

[Download signed APK](https://expo.dev/artifacts/eas/MmBBF1VFzpdJ2u-W6nkONHDnkRLSvHk4NgNKXmr3ogM.apk) · [Expo build](https://expo.dev/accounts/devendra_shahi/projects/the-leaders/builds/85f7ce7a-6936-401c-ae13-7662f5ff82a0)

- Version: 1.0.0 (Android version code 2).
- Package: `com.theleaders.app`.
- Android 7.0/API 24 or later; ARM32, ARM64, x86 and x86_64 are included.
- Universal APK size: 168.3 MiB.
- Backend: `https://the-leadersnp.com`. Expo Go and a running Mac are not required.
- Android release signature verified; app is not debuggable. Microphone recording
  permission is absent. Production backend URL verified inside the native bundle.
- SHA-256: `7c7116aad26684ff105fe70bca0ca22e425d42f5033dcf0cd76243c8cfbaac6a`.

## Install

Download the APK on the Android phone and open it. If Android requests it, allow
installation from the app used to download the file, then choose Install.
The local copy is `mobile/artifacts/The-Leaders-1.0.0-android.apk` (ignored by Git).
With a connected debugging device, installation is also available using
`adb install -r mobile/artifacts/The-Leaders-1.0.0-android.apk` from the repo root.

Readers use Settings; approved admins sign in with the existing website email
and password to unlock Studio. Reader content and radio need internet access;
saved article copies can be opened offline.

## Verification and limits

Mobile lint/typecheck, Android production bundle export and 57 focused tests
passed. Live reader, author, search and daily-brief API checks passed. Kantipur,
Ujyaalo, Kalika and BBC Nepali endpoints responded; Radio Nepal timed out on both
HTTP and HTTPS at check time. Endpoint reachability does not verify device audio.
No Android phone or configured emulator was available, so physical-device login,
radio/background playback, offline saves and native artwork export remain pending.

## Rebuild

Run `npm run build:apk` from `mobile/`. The APK profile targets the live HTTPS
backend and reuses this project's Expo-managed Android signing credentials.
Keep the same Expo project/signing key for upgrades to an existing installation.
