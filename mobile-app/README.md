# AccentAI Mobile

A real native mobile application for AccentAI, built with **React Native + Expo**.
This is a genuine native app (not a PWA, not a web wrapper) — it compiles to a real
`.apk` / `.aab` for Android and `.ipa` for iOS, with access to native device APIs
(microphone, speech recognition, haptics).

## Tech stack

- **Framework:** Expo SDK 52 (React Native 0.76)
- **Language:** TypeScript 5
- **Navigation:** expo-router (file-based, like Next.js)
- **Styling:** NativeWind v4 (Tailwind for React Native) + custom theme
- **State:** Zustand with AsyncStorage persistence
- **TTS:** expo-speech (native on-device speech synthesis)
- **Speech recognition:** expo-speech-recognition (native SFSpeechRecognizer on iOS,
  Android SpeechRecognizer on Android)
- **Icons:** lucide-react-native

## Project structure

```
mobile-app/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx              # Root layout (SafeArea, onboarding gate)
│   ├── index.tsx                # Redirects based on onboarding state
│   ├── onboarding.tsx           # First-run: name + accent selection
│   ├── (tabs)/                  # Bottom tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Dashboard (streak, XP, continue lesson)
│   │   ├── journey.tsx          # 8-phase lesson roadmap
│   │   ├── practice.tsx         # Free pronunciation practice
│   │   ├── coach.tsx            # AI coach chat (streams from backend)
│   │   └── more.tsx             # Stats, settings, badges
│   └── lesson/[id].tsx          # Lesson player (modal)
├── src/
│   ├── components/
│   │   └── ProgressRing.tsx
│   ├── lib/
│   │   ├── store.ts             # Zustand store (mirrors web app)
│   │   ├── api.ts               # AI coach API client (SSE streaming)
│   │   ├── tts.ts               # expo-speech wrapper
│   │   ├── recognition.ts       # expo-speech-recognition wrapper
│   │   ├── theme.ts             # Colors, typography, spacing
│   │   ├── types.ts             # Lesson schema (copied from web)
│   │   ├── phoneme-data.ts      # Phoneme drill data (copied from web)
│   │   └── lessons/             # 32 lessons across 8 phases (copied from web)
│   └── hooks/
└── assets/                      # App icon, splash, adaptive icon
```

## Build & run

### Prerequisites (on your own machine — this sandbox can't compile native binaries)

- **Node.js 18+** and **npm** or **bun**
- **For Android:** Android Studio (with Android SDK 35), JDK 17
- **For iOS:** macOS 14+ with Xcode 15+ and CocoaPods
- An **Expo account** (free) — sign up at https://expo.dev

### 1. Install dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure the backend URL

The mobile app talks to the AccentAI Next.js backend for the AI coach chat.
Edit `app.json` → `expo.extra.apiBaseUrl`, or create a `.env` file:

```bash
cp .env.example .env
# Edit .env and set API_BASE_URL to your deployed backend URL
# For local dev: API_BASE_URL=http://192.168.1.5:3000 (your machine's LAN IP)
```

### 3. Run on a device / emulator during development

```bash
# Start the Expo dev server
npx expo start

# Then press:
#   a  → open in Android emulator
#   i  → open in iOS simulator
#   scan the QR code with Expo Go (Android) or Camera (iOS) to run on a real device
```

### 4. Build a real APK / IPA for the app stores

#### Option A — EAS Build (cloud, recommended, no local toolchain needed)

```bash
# Install the EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure the project (one-time)
eas build:configure

# Build a production Android APK (preview profile, outputs .apk)
eas build --platform android --profile preview

# Build a production Android App Bundle for Play Store (.aab)
eas build --platform android --profile production

# Build for iOS (requires Apple Developer account, $99/year)
eas build --platform ios --profile production
```

EAS Build compiles in Expo's cloud — you don't need Android Studio or Xcode
installed locally. Build artifacts are downloadable from the Expo dashboard.

#### Option B — Local build (full native toolchain required)

```bash
# Generate the native android/ and ios/ folders
npx expo prebuild

# Build Android APK locally
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Build iOS (macOS only)
cd ios
pod install
xcodebuild -workspace AccentAI.xcworkspace -scheme AccentAI -configuration Release archive
```

### 5. Submit to app stores

- **Google Play Store:** Upload the `.aab` from EAS Build to the Play Console.
  One-time $25 registration fee.
- **Apple App Store:** Upload the `.ipa` from EAS Build via `eas submit`.
  Requires Apple Developer Program membership ($99/year).

## Feature parity with the web app

✅ Onboarding (name + accent selection)
✅ Dashboard (streak, XP, daily goal, continue lesson)
✅ Journey (8-phase roadmap with 32 lessons)
✅ Lesson player (intro, concept, mouth-diagram, example, tap-pronounce, tip, practice, quiz, completion)
✅ Practice mode (free pronunciation drills with speech recognition scoring)
✅ AI Coach chat (streams from the Next.js /api/ai-coach endpoint)
✅ More screen (stats, badges, daily goal, reset)
✅ TTS playback (native expo-speech)
✅ Speech recognition (native expo-speech-recognition)
✅ Async-storage persistence (progress survives app restarts)

### Still to wire up (handled by the recurring dev task)

- Vowel reference images (bundled assets instead of URL refs)
- Vowel chart interactive quadrilateral
- Rhythm / stress bars / intonation contour / linking diagram step widgets
- XP shop (streak freezes, double XP, custom theme)
- Daily challenge mode
- Push notifications (expo-notifications)
- Dark mode

## Notes on speech recognition

- **Android:** Uses `android.speech.recognition` — works in any locale that has
  a speech recognizer installed. Generally excellent accuracy.
- **iOS:** Uses `SFSpeechRecognizer` — caps recognition at ~60 seconds per
  session (Apple's limit). For longer audio, the lesson player automatically
  stops and finalizes after each phrase. The native recognizer requires network
  by default; on-device recognition can be enabled by setting
  `requiresOnDeviceRecognition: true` in `src/lib/recognition.ts`.

## License

Part of the AccentAI project.
