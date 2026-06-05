const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');

const idx = code.indexOf('handleDownloadPDF');
if (idx === -1) {
  console.log('Not found!');
} else {
  console.log('--- handleDownloadPDF code ---');
  console.log(code.substring(idx - 20, idx + 1200));
}
