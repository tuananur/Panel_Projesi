const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('return') && line.includes('(')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
