# Xcode Guide for Scouter Mobile App

## Getting Started with Xcode

Since you mentioned you've never used Xcode before, here's a simple guide to get your iOS app running:

### 1. **Xcode Interface Overview**
When Xcode opens, you'll see:
- **Left Panel**: Project navigator (files and folders)
- **Center**: Code editor or Interface Builder
- **Right Panel**: Inspector and utilities
- **Top**: Toolbar with play/stop buttons

### 2. **Running the App on iOS Simulator**

#### Step 1: Select a Simulator
- Look at the top toolbar in Xcode
- You'll see a dropdown that might say something like "iPhone 15" or "Any iOS Device"
- Click on it and select an iPhone simulator (e.g., "iPhone 15", "iPhone 14", etc.)

#### Step 2: Build and Run
- Click the **Play button** (▶️) in the top-left corner of Xcode
- Or press `Cmd + R`
- Xcode will build the app and launch the iOS Simulator

#### Step 3: Wait for Build
- First build takes a few minutes
- You'll see progress in the status bar at the top
- The iOS Simulator will open automatically

### 3. **What You Should See**
Once the app launches, you should see:
- A mobile video gallery interface
- A green chip showing "capacitor" (indicating native mode)
- Mock video files for testing
- Mobile-optimized UI with touch-friendly buttons

### 4. **Testing Features**
You can test:
- **Tap videos** to play them in fullscreen
- **Tap share button** to test native sharing
- **Tap more options** (⋮) for additional actions
- **Pull to refresh** to reload videos

### 5. **Common Issues & Solutions**

#### If Build Fails:
1. Make sure you have the latest Xcode version
2. Try cleaning the build: `Product > Clean Build Folder`
3. Check the error messages in the bottom panel

#### If Simulator Doesn't Open:
1. Go to `Xcode > Open Developer Tool > Simulator`
2. Or press `Cmd + Shift + 2`

#### If App Crashes:
1. Check the debug console at the bottom of Xcode
2. Look for error messages in red

### 6. **Next Steps**

#### To Test on Real Device:
1. Connect your iPhone via USB
2. Select your device from the dropdown (instead of simulator)
3. You may need to:
   - Trust the developer certificate on your phone
   - Enable Developer Mode in iPhone Settings

#### To Add Real Video Files:
Currently, the app shows mock data. To add real videos:
1. The desktop Electron app needs to save videos to a shared location
2. Or implement cloud sync between desktop and mobile apps

### 7. **Useful Xcode Shortcuts**
- `Cmd + R`: Build and run
- `Cmd + .`: Stop running app
- `Cmd + Shift + K`: Clean build folder
- `Cmd + B`: Build only (don't run)

### 8. **Debugging**
- Use the **Debug Console** at the bottom to see `console.log()` output
- Set breakpoints by clicking in the left margin of code lines
- Use the **Debug Navigator** (left panel) when app is running

---

## Current App Features

### Mobile Video Viewer
- ✅ Video gallery with thumbnails
- ✅ Fullscreen video player
- ✅ Native sharing (iOS/Android)
- ✅ File management (delete videos)
- ✅ Platform detection
- ✅ Touch-optimized UI

### Desktop Screen Recorder
- ✅ Screen capture with source selection
- ✅ Recording controls
- ✅ Permission handling
- ✅ Video preview and save

### Next Features to Implement
- 🔄 Sync videos between desktop and mobile
- 🔄 Cloud storage integration
- 🔄 Video compression options
- 🔄 Advanced sharing options

---

**Need Help?** If you encounter any issues, the error messages in Xcode's debug console will help identify the problem! 