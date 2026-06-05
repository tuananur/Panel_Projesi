const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');
const code = fs.readFileSync(filePath, 'utf8');

try {
  // Let's use swc or babel if available, otherwise write a simple searcher
  const parser = require('@babel/parser');
  console.log('Using @babel/parser to parse stats-content.jsx...');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parser successfully compiled stats-content.jsx!');
} catch (e) {
  console.error('Babel parser caught syntax error:');
  console.error(e.message);
  if (e.loc) {
    console.error(`Line: ${e.loc.line}, Column: ${e.loc.column}`);
    const lines = code.split('\n');
    const startLine = Math.max(0, e.loc.line - 10);
    const endLine = Math.min(lines.length - 1, e.loc.line + 10);
    console.log('--- Context around error ---');
    for (let i = startLine; i <= endLine; i++) {
      const marker = (i === e.loc.line - 1) ? '>>> ' : '    ';
      console.log(`${marker}${i + 1}: ${lines[i]}`);
    }
  }
}
