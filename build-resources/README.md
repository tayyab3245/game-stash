# Build Resources

This directory contains the build resources for electron-builder packaging.

## Icons Required

For a complete build, you need the following icon files:

### Windows
- `icon.ico` - Windows icon (256x256 or multiple sizes)

### macOS  
- `icon.icns` - macOS icon bundle (multiple sizes from 16x16 to 1024x1024)

### Linux
- `icon.png` - Linux icon (512x512 recommended)

## Icon Creation

You can create these icons from a high-resolution PNG (1024x1024) using:

1. **Online converters**: 
   - icoconvert.com (for .ico)
   - iconverticons.com (for .icns)

2. **Command line tools**:
   ```bash
   # For .ico (using ImageMagick)
   convert icon.png -resize 256x256 icon.ico
   
   # For .icns (using iconutil on macOS)
   iconutil -c icns icon.iconset
   ```

3. **Electron-builder can auto-generate**:
   - Place a 1024x1024 PNG as `icon.png` 
   - electron-builder will generate platform-specific icons automatically

## Note
Currently using placeholder configuration. Add proper icons before building for distribution.
