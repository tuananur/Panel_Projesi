const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const oldCardSearchStart = '<div className="card" style={{ display: \'flex\', flexDirection: \'column\', alignItems: \'center\', minHeight: \'450px\', padding: \'1.5rem\', position: \'relative\', overflow: \'hidden\' }}>';
const oldCardStartIndex = code.indexOf(oldCardSearchStart);

if (oldCardStartIndex === -1) {
  console.log('Could not find old card start!');
} else {
  const preceding = code.substring(0, oldCardStartIndex);
  const lines = preceding.split('\n');
  console.log('--- PRECEDING 30 LINES ---');
  for (let i = lines.length - 30; i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
