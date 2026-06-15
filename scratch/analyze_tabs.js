const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(targetPath, 'utf8');

const tabIdx = code.indexOf("activeTab === 'campaigns'");
console.log(code.slice(Math.max(0, tabIdx - 100), tabIdx + 3000));
