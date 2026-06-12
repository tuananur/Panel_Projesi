const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

content = content
  .replace(/background:\s*'#ffffff'/g, "background: 'var(--bg-secondary)'")
  .replace(/background:\s*'#f0f2f5'/g, "background: 'transparent'")
  .replace(/background:\s*'#f5f6f7'/g, "background: 'rgba(255,255,255,0.05)'")
  .replace(/background:\s*'#e4e6eb'/g, "background: 'rgba(255,255,255,0.1)'")
  .replace(/border:\s*'1px solid #[a-zA-Z0-9]+'/g, "border: '1px solid var(--border-color)'")
  .replace(/color:\s*'#1c1e21'/g, "color: 'var(--text-primary)'")
  .replace(/color:\s*'#606770'/g, "color: 'var(--text-secondary)'")
  .replace(/boxShadow:\s*'0 1px 2px rgba\(0,0,0,0\.05\)'/g, "boxShadow: 'none'")
  .replace(/borderTop:\s*'1px solid #[a-zA-Z0-9]+'/g, "borderTop: '1px solid var(--border-color)'");

fs.writeFileSync(targetPath, content);
console.log('Replaced colors successfully.');
