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
  const lines = code.substring(oldCardStartIndex).split('\n');
  console.log('--- CARD START ---');
  for (let i = 0; i < 70; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
