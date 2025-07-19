# Git Configuration for Unified Electron Structure

## Updated .gitignore

The `.gitignore` has been updated to reflect the new unified project structure:

### ✅ **What's Tracked in Git:**
- Source code (`src/`)
- Public assets (`public/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`README.md`, `STRUCTURE.md`, etc.)
- Directory structure markers (`.gitkeep` files)

### ❌ **What's Ignored:**
- **Build artifacts**: `build/`, `dist/`
- **Dependencies**: `node_modules/`
- **User data**: Database files, game covers, ROM files, emulator binaries
- **Development files**: IDE settings, logs, temporary files
- **Platform-specific**: OS-generated files, Electron build cache

### 📁 **Directory Structure Preservation:**
Using `.gitkeep` files to maintain empty directories:
- `backend/covers/.gitkeep` - Keeps covers directory for game images
- `emulators/.gitkeep` - Keeps emulators directory for binaries
- `roms/.gitkeep` - Keeps roms directory for game files

### 🔧 **Key Features:**
1. **User Data Protection**: Database, covers, ROMs, and emulators are ignored
2. **Clean Repository**: Only source code and configuration are tracked
3. **Cross-Platform**: Handles Windows, macOS, and Linux generated files
4. **Build-Ready**: Supports both development and packaging workflows

### 💡 **Setup for New Users:**
When someone clones the repository, they need to:
1. `npm install` - Install dependencies
2. Add emulator binaries to `emulators/` directories
3. Add ROM files to `roms/` directories  
4. Run `npm run dev` - Start the application

The `.gitignore` ensures that personal game libraries and system-specific files don't get committed while preserving the project structure.
