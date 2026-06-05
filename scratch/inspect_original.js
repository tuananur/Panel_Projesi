const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/\r\n/g, '\n');

console.log('Original stats-content.jsx character count:', code.length);

const startIdx = code.indexOf('export default function StatsContent');
console.log('StatsContent starts at:', startIdx);

// Let's find return ( of StatsContent
const firstReturn = code.indexOf('return (');
console.log('First return index:', firstReturn);
const mainReturn = code.indexOf('return (', startIdx);
console.log('StatsContent return index:', mainReturn);

// Let's find the report template search
const templateSearch = '{/* GİZLİ RAPOR TASLAĞI (PDF İÇİN) - PREMIUM SUNUM TASARIMI */}';
const templateIdx = code.indexOf(templateSearch);
console.log('reportTemplateSearch index:', templateIdx);

// Let's find style jsx tags
let pos = 0;
while ((pos = code.indexOf('<style jsx>', pos)) !== -1) {
  console.log('Found <style jsx> at index:', pos);
  pos += 11;
}

// Let's print the last 500 characters of the file to see how it ends!
console.log('--- Last 500 characters of original file ---');
console.log(code.substring(code.length - 500));
