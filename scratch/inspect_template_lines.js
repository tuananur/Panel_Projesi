const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const templateSearch = '{/* GİZLİ RAPOR TASLAĞI (PDF İÇİN) - PREMIUM SUNUM TASARIMI */}';
const templateIdx = code.indexOf(templateSearch);

if (templateIdx === -1) {
  console.log('Not found!');
} else {
  const preceding = code.substring(0, templateIdx);
  const lineNumber = preceding.split('\n').length;
  console.log('Found template at line:', lineNumber);
  console.log('--- Context ---');
  const lines = code.split('\n');
  for (let i = lineNumber - 10; i <= lineNumber + 15; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
