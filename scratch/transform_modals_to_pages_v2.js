const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Extract showObjectiveModal
const objModalStart = `{showObjectiveModal && activeTab === 'campaigns' && (`;
let objModalEnd = `</button>
            </div>
          </div>
        </div>
      )}`;

const startObj = content.indexOf(objModalStart);
const endObj = content.indexOf(objModalEnd, startObj);
if (startObj === -1 || endObj === -1) {
    console.error("Could not find showObjectiveModal");
    process.exit(1);
}
let objectiveModalStr = content.substring(startObj, endObj + objModalEnd.length);
content = content.substring(0, startObj) + content.substring(endObj + objModalEnd.length);

// 2. Extract showTrafficSetupModal
const trafficModalStart = `{showTrafficSetupModal && activeTab === 'campaigns' && (`;
const trafficModalEnd = `</button>
            </div>
          </div>
        </div>
      )}`;
      
const startTraffic = content.indexOf(trafficModalStart);
const endTraffic = content.indexOf(trafficModalEnd, startTraffic);
if (startTraffic === -1 || endTraffic === -1) {
    console.error("Could not find showTrafficSetupModal");
    process.exit(1);
}
let trafficModalStr = content.substring(startTraffic, endTraffic + trafficModalEnd.length);
content = content.substring(0, startTraffic) + content.substring(endTraffic + trafficModalEnd.length);

// 3. Format them as pages instead of overlays
objectiveModalStr = objectiveModalStr.replace(
  `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
  `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
);
objectiveModalStr = objectiveModalStr.replace(
  `{showObjectiveModal && activeTab === 'campaigns' && (`,
  `{showObjectiveModal && activeTab === 'campaigns' ? (`
);
objectiveModalStr = objectiveModalStr.replace(
  `)}`,
  `) : `
);

trafficModalStr = trafficModalStr.replace(
  `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
  `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
);
trafficModalStr = trafficModalStr.replace(
  `{showTrafficSetupModal && activeTab === 'campaigns' && (`,
  `showTrafficSetupModal && activeTab === 'campaigns' ? (`
);
trafficModalStr = trafficModalStr.replace(
  `)}`,
  `) : (`
);

// 4. Inject into the main return
const mainReturnStart = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>`;

const mainReturnIdx = content.indexOf(mainReturnStart);
if (mainReturnIdx === -1) {
    console.error("Could not find main return");
    process.exit(1);
}

const insertionPoint = mainReturnIdx + mainReturnStart.length;

let beforeReturn = content.substring(0, insertionPoint);
let afterReturn = content.substring(insertionPoint);

// Add the closing parenthesis and brace for the ternary operator at the end of the form
const formEndIdx = afterReturn.indexOf('</form>');
if (formEndIdx !== -1) {
    afterReturn = afterReturn.substring(0, formEndIdx + 7) + '\n      )}' + afterReturn.substring(formEndIdx + 7);
} else {
    console.error("Could not find </form>");
    process.exit(1);
}

const newContent = beforeReturn + '\n      ' + objectiveModalStr + '\n      ' + trafficModalStr + afterReturn;

fs.writeFileSync(filePath, newContent);
console.log("Successfully transformed modals to pages!");
