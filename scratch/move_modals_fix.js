const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The modals string starts with "{showObjectiveModal && activeTab === 'campaigns' && ("
const modalsStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (`

// And ends before: "{showTrafficSetupModal && activeTab === 'campaigns' && (" ends ... wait no.
// Let's use a known string after the modals end.
// After the second modal (showTrafficSetupModal), we have:
const modalsEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;

const startIdx = content.indexOf(modalsStartStr);
const endIdx = content.indexOf(modalsEndStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const fullModalsContent = content.substring(startIdx, endIdx + modalsEndStr.length);
  
  // Remove the modals from inside renderAdFormFields
  content = content.substring(0, startIdx) + content.substring(endIdx + modalsEndStr.length);
  
  // Find where to insert it in the main return.
  // The main return starts with:
  // return (
  //   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>
  
  // Let's look for minHeight: '80vh'
  const targetIdx = content.indexOf("minHeight: '80vh' }}>");
  
  if (targetIdx !== -1) {
    const insertPosition = targetIdx + "minHeight: '80vh' }}>".length;
    
    content = content.substring(0, insertPosition) + "\n\n" + fullModalsContent + "\n\n" + content.substring(insertPosition);
    fs.writeFileSync(filePath, content);
    console.log("Modals moved successfully.");
  } else {
    console.log("Target insertion point not found.");
  }
} else {
  console.log("Modals not found.");
}
