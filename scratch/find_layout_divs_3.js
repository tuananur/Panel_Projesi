const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const startIdx = code.indexOf('return (');
const lines = code.substring(startIdx).split('\n');

console.log('--- LAYOUT START PART 3 ---');
for (let i = 120; i < 200; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
