const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const startIdx = code.indexOf('return (');
const substring = code.substring(startIdx);
const lines = substring.split('\n');

let level = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openMatches = [...line.matchAll(/<div\b/g)];
  const closeMatches = [...line.matchAll(/<\/div>/g)];
  
  const origLineNum = code.substring(0, startIdx).split('\n').length + i;
  
  if (origLineNum >= 1220 && origLineNum <= 1260) {
    console.log(`${origLineNum}: Level before: ${level} | ${line.trim()}`);
  }
  level += openMatches.length - closeMatches.length;
  if (origLineNum >= 1220 && origLineNum <= 1260) {
    console.log(`     Level after: ${level}`);
  }
}
