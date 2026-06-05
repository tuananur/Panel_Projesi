const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

for (let i = 430; i < 482; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
