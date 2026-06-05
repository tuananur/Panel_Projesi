const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\30c3af44-67ca-450e-bf41-f7e4fcc57ef1';

// A simple utility to get JPEG/PNG dimensions from binary buffer
function getImageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  if (filePath.endsWith('.png')) {
    // PNG dimensions are at offset 16 (4 bytes width, 4 bytes height)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    // JPEG dimensions parsing
    let i = 2;
    while (i < buffer.length) {
      const marker = buffer.readUInt16BE(i);
      i += 2;
      
      // SOF0 (Start of Frame 0) marker is 0xFFC0, SOF2 is 0xFFC2
      if (marker === 0xFFC0 || marker === 0xFFC2) {
        // Height is at offset 3, Width is at offset 5 relative to block start
        const blockLength = buffer.readUInt16BE(i);
        const height = buffer.readUInt16BE(i + 3);
        const width = buffer.readUInt16BE(i + 5);
        return { width, height };
      } else {
        // Skip block
        const blockLength = buffer.readUInt16BE(i);
        i += blockLength;
      }
    }
  }
  return null;
}

const files = fs.readdirSync(brainDir);
for (const file of files) {
  if (file.startsWith('media__')) {
    const fullPath = path.join(brainDir, file);
    try {
      const dims = getImageDimensions(fullPath);
      if (dims) {
        console.log(`${file}: ${dims.width}x${dims.height}`);
      } else {
        console.log(`${file}: format not recognized`);
      }
    } catch (e) {
      console.log(`${file}: Error - ${e.message}`);
    }
  }
}
