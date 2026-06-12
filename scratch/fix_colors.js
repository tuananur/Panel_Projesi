const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `background: '#fff'`,
  `background: 'var(--bg-secondary)'`
);

content = content.replace(
  `background: trafficSetupType === 'custom' ? '#e7f3ff' : 'transparent'`,
  `background: trafficSetupType === 'custom' ? 'rgba(24, 119, 242, 0.1)' : 'transparent'`
);

content = content.replace(
  `background: trafficSetupType === 'custom' ? '#d0e5fb' : '#e7f3ff'`,
  `background: trafficSetupType === 'custom' ? 'rgba(24, 119, 242, 0.2)' : 'rgba(24, 119, 242, 0.05)'`
);

content = content.replace(
  `background: '#f1f5f9'`,
  `background: 'var(--bg-secondary)', border: '1px solid var(--border-color)'`
);
content = content.replace(
  `background: '#f1f5f9'`,
  `background: 'var(--bg-secondary)', border: '1px solid var(--border-color)'`
);
content = content.replace(
  `background: '#f1f5f9'`,
  `background: 'var(--bg-secondary)', border: '1px solid var(--border-color)'`
);

content = content.replace(
  `background: trafficSetupType === 'manual' ? '#e7f3ff' : 'var(--bg-secondary)'`,
  `background: trafficSetupType === 'manual' ? 'rgba(24, 119, 242, 0.1)' : 'var(--bg-secondary)'`
);

content = content.replace(
  `background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'`,
  `background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'`
);

fs.writeFileSync(filePath, content);
console.log("Colors successfully fixed.");
