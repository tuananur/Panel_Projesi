const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

try {
  // 1. Extract showTrafficSetupModal from renderAdFormFields
  const trafficStartStr = `{showTrafficSetupModal && activeTab === 'campaigns' && (`;
  let trafficEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
  
  const trafficStartIdx = content.indexOf(trafficStartStr);
  if (trafficStartIdx === -1) throw new Error("trafficStartIdx not found");
  
  const trafficEndIdx = content.indexOf(trafficEndStr, trafficStartIdx);
  if (trafficEndIdx === -1) throw new Error("trafficEndIdx not found");
  
  let trafficStr = content.substring(trafficStartIdx, trafficEndIdx + trafficEndStr.length);
  // Remove it from the file
  content = content.substring(0, trafficStartIdx) + content.substring(trafficEndIdx + trafficEndStr.length);

  // 2. Extract showObjectiveModal from the main return
  const objStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (`;
  let objEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
      
  const objStartIdx = content.indexOf(objStartStr);
  if (objStartIdx === -1) throw new Error("objStartIdx not found");
  
  const objEndIdx = content.indexOf(objEndStr, objStartIdx);
  if (objEndIdx === -1) throw new Error("objEndIdx not found");
  
  let objStr = content.substring(objStartIdx, objEndIdx + objEndStr.length);
  // Remove it from the file
  content = content.substring(0, objStartIdx) + content.substring(objEndIdx + objEndStr.length);

  // 3. Reformat both to be pages
  objStr = objStr.replace(
    `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
    `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
  ).replace(
    `{showObjectiveModal && activeTab === 'campaigns' && (`,
    `{showObjectiveModal && activeTab === 'campaigns' ? (`
  ).replace(
    `      )}`,
    `      ) : `
  );

  trafficStr = trafficStr.replace(
    `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
    `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
  ).replace(
    `{showTrafficSetupModal && activeTab === 'campaigns' && (`,
    `showTrafficSetupModal && activeTab === 'campaigns' ? (`
  ).replace(
    `      )}`,
    `      ) : (`
  );

  // 4. Inject them back into the main return
  // Find where messageModal.show is
  const messageModalStr = `{messageModal.show && (`;
  const messageModalIdx = content.indexOf(messageModalStr);
  if (messageModalIdx === -1) throw new Error("messageModalStr not found");

  // We want to insert the layout right after messageModal ends.
  // messageModal ends with `)}`
  const messageModalEndStr = `</button>
          </div>
        </div>
      )}`;
  const messageModalEndIdx = content.indexOf(messageModalEndStr, messageModalIdx);
  if (messageModalEndIdx === -1) throw new Error("messageModalEndStr not found");
  
  const insertLayoutIdx = messageModalEndIdx + messageModalEndStr.length;

  let beforeLayout = content.substring(0, insertLayoutIdx);
  let afterLayout = content.substring(insertLayoutIdx);

  // Close the ternary operator at the end of the form
  const formEndStr = `</form>`;
  const formEndIdx = afterLayout.lastIndexOf(formEndStr);
  if (formEndIdx === -1) throw new Error("formEndStr not found");

  afterLayout = 
    `\n\n      ` + objStr + 
    `\n\n      ` + trafficStr + 
    `\n\n      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>` +
    afterLayout.substring(0, formEndIdx + formEndStr.length) + 
    `\n      </div>\n      )}` + 
    afterLayout.substring(formEndIdx + formEndStr.length);

  const finalContent = beforeLayout + afterLayout;

  fs.writeFileSync(filePath, finalContent);
  console.log("Success! Modals converted to pages cleanly.");
} catch (error) {
  console.error("Error:", error.message);
}
