# Quick Start Guide

## For Developers

### Running the app in development:
```bash
npm start
```

### Building for distribution:
```bash
build.bat
```
This creates a `bin` folder with installer and portable versions.

### Creating a release zip:
```bash
create-release.bat
```
This builds the app and creates a zip file ready to share.

---

## For End Users

### If you have the installer:
1. Run "DM Screen Setup.exe"
2. Follow the installation wizard
3. Launch from desktop shortcut or start menu

### If you have the portable version:
1. Run "DM-Screen-Portable.exe"
2. The app will create a "Saves" folder next to it for your campaigns
3. No installation needed - you can move this anywhere

---

## What's Included

- **Full Electron App** - Desktop application built with Electron
- **Campaign Manager** - Manage your D&D campaigns
- **Character Sheets** - Track player characters
- **Quest Visualizer** - Visual quest/story graph
- **Item Cards** - Manage items and loot
- **Local Saves** - All data saved locally in JSON format

---

## File Sizes

- Installer: ~150-200MB
- Portable: ~150-200MB
- Installed: ~300-400MB (includes Electron runtime)

The size is large because it includes a full Chromium browser and Node.js runtime, making it a complete standalone application.
