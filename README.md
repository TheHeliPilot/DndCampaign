# DM Screen - D&D Campaign Manager

A desktop application for Dungeon Masters to manage their D&D campaigns, built with Electron.

## Features

- Campaign management with multiple save files
- Character sheet tracking
- Quest/story graph visualizer
- Item and loot cards
- Local JSON-based saves
- Offline-first design

## For Developers

### Installation
```bash
npm install
```

### Development
```bash
npm start        # Run the app
npm run dev      # Run with detailed logging
```

### Building
```bash
npm run build        # Build for current platform
npm run build:win    # Build for Windows
npm run build:dir    # Build unpacked (for testing)
```

Or use the convenient build scripts:
```bash
build.bat           # Build and copy to bin folder
create-release.bat  # Build and create release zip
```

## Distribution

After building, you'll get:

1. **DM Screen Setup.exe** - Full installer with shortcuts
2. **DM-Screen-Portable.exe** - Portable single-file version

Both are ready to share. The `bin` folder contains everything needed for distribution.

## Project Structure

```
DndCampaign/
├── main.js                    # Electron main process
├── preload.js                 # Preload script for IPC
├── index.html                 # Main app interface
├── character-sheet.html       # Character management
├── quest-visualizer.html      # Quest graph
├── item-cards.html            # Item management
├── js/                        # JavaScript modules
│   ├── app.js
│   ├── entities.js
│   ├── quest-graph.js
│   └── ui.js
├── css/                       # Stylesheets
├── icons/                     # App icons and UI icons
├── Saves/                     # Campaign save files (JSON)
└── build.bat                  # Build script
```

## Building for Distribution

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed build instructions.

See [QUICK_START.md](QUICK_START.md) for a quick reference guide.

## Technology Stack

- **Electron** - Desktop app framework
- **Node.js** - Backend runtime
- **HTML/CSS/JavaScript** - Frontend
- **Vis.js** - Graph visualization (quest system)

## License

ISC

## Support

For issues or questions, check the build instructions or modify the configuration in `package.json`.
