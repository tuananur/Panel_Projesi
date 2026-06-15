const fs = require('fs');
const path = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `{selectedObjective === 'Trafik' && trafficSetupType === 'custom' ? (
               renderTailoredTrafficFormFields(createFormData, setCreateFormData)
            ) : (
              <>
            {activeTab === 'campaigns' && (`;

const replacementStr = `{activeTab === 'campaigns' && selectedObjective === 'Trafik' && trafficSetupType === 'custom' ? (
               renderTailoredTrafficFormFields(createFormData, setCreateFormData)
            ) : (
              <>
            {activeTab === 'campaigns' && (`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Successfully fixed tab logic!');
} else {
  console.log('Could not find target string.');
}
