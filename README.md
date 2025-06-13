# Scouter

Cross-platform screen recording and video viewing app built with Quasar.

- **Desktop (Electron)**: Screen recording functionality
- **Mobile (Capacitor)**: Video viewing with Reddit-style interface

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

## 📱 Development Scripts

### Web Development
```bash
npm run dev              # Start web development server
npm run build            # Build for web production
```

### Desktop (Electron)
```bash
npm run dev:electron     # Start Electron app in development
npm run build:electron   # Build Electron app for production
```

### Mobile Development

#### iOS
```bash
npm run dev:ios          # Start iOS development (requires iOS Simulator)
npm run build:ios        # Build iOS app
npm run build:ios:xcode  # Build and open in Xcode for App Store deployment
```

#### Android
```bash
npm run dev:android      # Start Android development (requires Android emulator)
npm run build:android    # Build Android app
```

### Capacitor Utilities
```bash
npm run cap:sync         # Sync web assets + native plugins + config
npm run cap:copy         # Copy web assets only (faster for quick updates)
npm run cap:clean        # Reset Capacitor setup (removes src-capacitor folder)
```

### Code Quality
```bash
npm run lint             # Check code style with ESLint
npm run format           # Format code with Prettier
npm run test             # Run tests (placeholder)
```

## 🛠️ Development Workflow

1. **Web Development**: `npm run dev`
2. **Desktop Testing**: `npm run dev:electron`
3. **iOS Testing**: `npm run dev:ios` (requires Xcode)
4. **Android Testing**: `npm run dev:android` (requires Android Studio)

## 📦 Building for Production

- **Web**: `npm run build`
- **Desktop**: `npm run build:electron`
- **iOS**: `npm run build:ios:xcode` (opens Xcode for final build)
- **Android**: `npm run build:android`

## 🔧 Configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
