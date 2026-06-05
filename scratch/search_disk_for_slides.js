const fs = require('fs');
const path = require('path');

const searchDirs = [
  'c:\\Users\\Casper\\Desktop\\TEST',
  'C:\\Users\\Casper\\.gemini\\antigravity-ide'
];

function scanDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === '.next') continue;
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        // Skip large log files if we already searched them, but wait, let's inspect files under 500KB
        if (stat.size < 1024 * 1024 * 5) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('pdf-slide') || content.includes('SLAYT 1:') || content.includes('KAPAK SAYFASI')) {
              console.log(`FOUND MATCH in: ${fullPath} (size: ${stat.size} bytes)`);
              if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.txt')) {
                console.log('  File type matches code/txt');
              }
            }
          } catch (e) {
            // ignore binary/read errors
          }
        }
      }
    }
  } catch (e) {
    // ignore dir read errors
  }
}

for (const d of searchDirs) {
  console.log('Scanning directory:', d);
  scanDir(d);
}
console.log('Done scanning.');
