const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

const startStr = '<div className="card" style={{ display: \'flex\', flexDirection: \'column\', alignItems: \'center\', minHeight: \'450px\', padding: \'1.5rem\', position: \'relative\', overflow: \'hidden\' }}>';
const startIdx = code.indexOf(startStr);
console.log('startIdx:', startIdx);

const buttonStr = 'Raporu Oluştur';
const buttonIdx = code.indexOf(buttonStr);
console.log('buttonIdx:', buttonIdx);

if (startIdx !== -1 && buttonIdx !== -1) {
  const gap = buttonIdx - startIdx;
  console.log('Distance between start and button:', gap);
  
  const midSlice = code.substring(buttonIdx - 150, buttonIdx + 150);
  console.log('Context around button in full file:');
  console.log(midSlice);
  
  // Let's print out what lies at the end of the card starting at buttonIdx
  const closeIdx = code.indexOf('</div>', buttonIdx);
  console.log('Next closing div index:', closeIdx);
  const endSlice = code.substring(buttonIdx - 50, closeIdx + 30);
  console.log('End slice to closing div:');
  console.log(JSON.stringify(endSlice));
}
