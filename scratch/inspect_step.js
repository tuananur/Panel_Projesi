const fs = require('fs');

const path = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\slides_extracted.txt';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log('Keys of parsed step:', Object.keys(data));
console.log('type:', data.type);
console.log('source:', data.source);
if (data.tool_calls) {
  console.log('Number of tool calls:', data.tool_calls.length);
  data.tool_calls.forEach((tc, idx) => {
    console.log(`Tool Call ${idx}:`, tc.name);
    if (tc.args) {
      console.log(`  Args keys:`, Object.keys(tc.args));
      for (const k of Object.keys(tc.args)) {
        const valStr = String(tc.args[k]);
        console.log(`    ${k} length:`, valStr.length);
        console.log(`    ${k} start:`, valStr.substring(0, 200));
      }
    }
  });
}
