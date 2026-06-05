const { execSync } = require('child_process');
const output = execSync('git show d5bfaf7:src/app/dashboard/client/[id]/stats/stats-content.jsx', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const lines = output.split('\n');

console.log('Searching in d5bfaf7:');
lines.forEach((line, idx) => {
  if (line.includes('activeSlide') || line.includes('SlideWrapper')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
