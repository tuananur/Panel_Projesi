const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

console.log(`Total lines: ${lines.length}`);
for (let i = 2100; i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
