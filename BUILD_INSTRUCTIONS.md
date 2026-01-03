# DM Screen - Build Instructions

This document explains how to build the DM Screen application for distribution.

## Prerequisites

- Node.js and npm installed
- All dependencies installed (`npm install`)

## Building the Application

### Quick Build (Recommended)

Simply run the build script:

```bash
build.bat
```

This will:
1. Clean previous builds
2. Build both installer and portable versions
3. Copy the executables to a `bin` folder
4. The `bin` folder will contain everything you need to distribute

### Manual Build Commands

If you prefer to build manually:

```bash
# Build both installer and portable versions for Windows
npm run build:win

# Or build all configured platforms
npm run build

# Or build to a directory (unpacked, for testing)
npm run build:dir
```

## Output Files

After building, you'll find the following in the `bin` folder:

1. **DM Screen Setup 1.0.0.exe** - Full installer
   - Allows users to choose installation directory
   - Creates desktop and start menu shortcuts
   - Recommended for most users

2. **DM-Screen-Portable.exe** - Portable version
   - No installation required
   - Can run from USB drive or any folder
   - Perfect for quick distribution

## Distribution

### Option 1: Zip the bin folder
1. After running `build.bat`, zip the entire `bin` folder
2. Share the zip file
3. Users can extract and run either the installer or portable version

### Option 2: Share individual executables
- Share just the portable exe for a single-file distribution
- Share the installer for a traditional installation experience

## Folder Structure

```
DndCampaign/
├── bin/                          # Built executables (created after build)
│   ├── DM Screen Setup 1.0.0.exe
│   └── DM-Screen-Portable.exe
├── dist/                         # Full build output (can be deleted after copying to bin)
├── build.bat                     # Quick build script
└── package.json                  # Build configuration
```

## Notes

- The `Saves` folder will be included in the build and will be created next to the app when installed
- The app icon is automatically included from `icons/ZuesLogoNoBG.png`
- All necessary files (HTML, CSS, JS, icons) are bundled automatically

## Troubleshooting

If the build fails:

1. Make sure all dependencies are installed: `npm install`
2. Delete `node_modules` and reinstall: `rmdir /s /q node_modules && npm install`
3. Make sure you have enough disk space (builds can be 200-300MB)
4. Check that you're running the command from the project root directory

## Advanced Configuration

To modify build settings, edit the `build` section in `package.json`. You can configure:

- App name and version
- Icon files
- Target platforms
- Installer options
- File associations
- And more...

See the [electron-builder documentation](https://www.electron.build/) for all options.
