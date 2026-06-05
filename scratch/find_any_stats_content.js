const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('metaResult') || line.includes('googleResult')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
