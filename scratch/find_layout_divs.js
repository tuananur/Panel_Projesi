const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const startIdx = code.indexOf('return (');
const lines = code.substring(startIdx).split('\n');

console.log('--- RETURN START LAYOUT ---');
for (let i = 0; i < 40; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
