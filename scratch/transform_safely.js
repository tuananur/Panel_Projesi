const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

try {
  // 1. Extract showObjectiveModal (around line 983)
  const objStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (`;
  let objEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
  const objStart = content.indexOf(objStartStr);
  if (objStart === -1) throw new Error("objStart not found");
  
  const objEnd = content.indexOf(objEndStr, objStart);
  if (objEnd === -1) throw new Error("objEnd not found");
  
  let objStr = content.substring(objStart, objEnd + objEndStr.length);
  content = content.substring(0, objStart) + content.substring(objEnd + objEndStr.length);

  // 2. Extract showTrafficSetupModal (around line 657)
  const trafficStartStr = `{showTrafficSetupModal && activeTab === 'campaigns' && (`;
  const trafficEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
  const trafficStart = content.indexOf(trafficStartStr);
  if (trafficStart === -1) throw new Error("trafficStart not found");
  
  const trafficEnd = content.indexOf(trafficEndStr, trafficStart);
  if (trafficEnd === -1) throw new Error("trafficEnd not found");
  
  let trafficStr = content.substring(trafficStart, trafficEnd + trafficEndStr.length);
  content = content.substring(0, trafficStart) + content.substring(trafficEnd + trafficEndStr.length);

  // 3. Format them as pages instead of modals
  objStr = objStr.replace(
    `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
    `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
  ).replace(
    `{showObjectiveModal && activeTab === 'campaigns' && (`,
    `{showObjectiveModal && activeTab === 'campaigns' ? (`
  ).replace(
    `)}`,
    `) : `
  );

  trafficStr = trafficStr.replace(
    `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
    `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
  ).replace(
    `{showTrafficSetupModal && activeTab === 'campaigns' && (`,
    `showTrafficSetupModal && activeTab === 'campaigns' ? (`
  ).replace(
    `)}`,
    `) : (`
  );

  // 4. Inject them into the main return
  const mainReturnStart = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>`;
  
  const mainReturnIdx = content.indexOf(mainReturnStart);
  if (mainReturnIdx === -1) throw new Error("mainReturnStart not found");
  
  const insertionPoint = mainReturnIdx + mainReturnStart.length;
  
  let beforeReturn = content.substring(0, insertionPoint);
  let afterReturn = content.substring(insertionPoint);

  // Close the ternary operator at the end of the form
  const formEndStr = `</form>`;
  const formEndIdx = afterReturn.lastIndexOf(formEndStr);
  if (formEndIdx === -1) throw new Error("formEndStr not found");
  
  afterReturn = 
    `\n      ` + objStr + 
    `\n      ` + trafficStr + 
    `\n      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>` +
    afterReturn.substring(0, formEndIdx + formEndStr.length) + 
    `\n      </div>\n      )}` + 
    afterReturn.substring(formEndIdx + formEndStr.length);

  const finalContent = beforeReturn + afterReturn;

  fs.writeFileSync(filePath, finalContent);
  console.log("Success! Modals converted to pages safely.");
} catch (error) {
  console.error("Error:", error.message);
}
