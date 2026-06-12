const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the modals inside renderAdFormFields
const modalsStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (`;
const modalsEndStr = `</label>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-primary)' }}>
              <button onClick={() => setShowTrafficSetupModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Geri</button>
              <button onClick={() => setShowTrafficSetupModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0064d1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam</button>
            </div>
          </div>
        </div>
      )}`;

const startIdx = content.indexOf(modalsStartStr);
const endIdx = content.indexOf(modalsEndStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const fullModalsContent = content.substring(startIdx, endIdx + modalsEndStr.length);
  
  // Remove the modals from renderAdFormFields
  content = content.substring(0, startIdx) + content.substring(endIdx + modalsEndStr.length);
  
  // Now place them inside the main return
  const mainReturnStr = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>`;
    
  const targetIdx = content.indexOf(mainReturnStr);
  if (targetIdx !== -1) {
    const beforeTarget = content.substring(0, targetIdx + mainReturnStr.length);
    const afterTarget = content.substring(targetIdx + mainReturnStr.length);
    
    // Insert the modals right after the main return div wrapper
    content = beforeTarget + "\n      " + fullModalsContent + afterTarget;
    
    fs.writeFileSync(filePath, content);
    console.log('Modals moved to main return successfully.');
  } else {
    console.log('Main return not found!');
  }
} else {
  console.log('Modals not found!');
}
