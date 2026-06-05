const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

// Find all functions declared at top level of the module
lines.forEach((line, idx) => {
  if (line.startsWith('export default function') || line.trim().startsWith('function ') || line.trim().startsWith('const ')) {
    if (line.includes('=>') || line.includes('function')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  }
});
