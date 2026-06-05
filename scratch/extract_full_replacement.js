const fs = require('fs');

const stepPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\step_909.json';
const outPath = 'c:\\Users\\Casper\\Desktop\\TEST\\scratch\\slides_raw.jsx';

const data = JSON.parse(fs.readFileSync(stepPath, 'utf8'));
const tc = data.tool_calls[0];
const replacement = tc.args.ReplacementContent;

fs.writeFileSync(outPath, replacement, 'utf8');
console.log('Extracted slides to:', outPath);
console.log('Replacement content size:', replacement.length);
