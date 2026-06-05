const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

console.log('Finding renderSlides boundaries:');
let openBraces = 0;
let started = false;
let startLine = 481;
let endLine = -1;

for (let i = startLine - 1; i < lines.length; i++) {
  const line = lines[i];
  if (!started && line.includes('renderSlides =')) {
    started = true;
    console.log(`Started at line ${i + 1}`);
  }
  
  if (started) {
    // Count braces
    for (let char of line) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }
    if (openBraces === 0) {
      endLine = i + 1;
      console.log(`Ended at line ${endLine}`);
      break;
    }
  }
}
