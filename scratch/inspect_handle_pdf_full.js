const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
console.log('--- stats-content.jsx starting from line 119 ---');
for (let i = 118; i < 220; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
