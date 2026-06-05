const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

console.log('Searching for slides or slide state:');
lines.forEach((line, idx) => {
  if (line.includes('useState') || line.includes('[activeSlide') || line.includes('currentSlide') || line.includes('slideIndex') || line.includes('activeTab') || line.includes('slide') || line.includes('Slide')) {
    if (line.includes('state') || line.includes('State') || line.includes('SlideViewer') || line.includes('handle') || line.includes('const') || line.includes('function')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  }
});
