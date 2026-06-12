const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Extract showObjectiveModal (it is around line 983)
const objStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (`;
const objEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
const objStart = content.indexOf(objStartStr);
const objEnd = content.indexOf(objEndStr, objStart);
let objStr = content.substring(objStart, objEnd + objEndStr.length);
content = content.substring(0, objStart) + content.substring(objEnd + objEndStr.length);

// 2. Extract showTrafficSetupModal (it is around line 657)
const trafficStartStr = `{showTrafficSetupModal && activeTab === 'campaigns' && (`;
const trafficEndStr = `</button>
            </div>
          </div>
        </div>
      )}`;
const trafficStart = content.indexOf(trafficStartStr);
const trafficEnd = content.indexOf(trafficEndStr, trafficStart);
let trafficStr = content.substring(trafficStart, trafficEnd + trafficEndStr.length);
content = content.substring(0, trafficStart) + content.substring(trafficEnd + trafficEndStr.length);

// 3. Format them as centered pages instead of modals
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

// For the traffic modal, we use `?` instead of `&& (` and we append `) : (` at the end
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

// Change the Devam buttons in both modals so they don't have a confusing background color
// Well, the styles are fine. Let's just wrap the rest of the form.

// 4. Find the header that comes after `messageModal`
const headerStartStr = `<div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderRadius: '8px 8px 0 0' }}>`;

const headerStart = content.indexOf(headerStartStr);
let beforeHeader = content.substring(0, headerStart);
let afterHeader = content.substring(headerStart);

// We need to wrap `afterHeader` in a div and add `)}` at the end
// Wait, `afterHeader` contains the rest of the component!
// It ends with:
//         <div style={{ padding: '1rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
//           ...
//         </div>
//       </form>
//     </div>
//   );
// };

const formEndStr = `</form>`;
const formEnd = afterHeader.lastIndexOf(formEndStr);
let wrappedContent = 
  `<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>\n        ` +
  afterHeader.substring(0, formEnd + formEndStr.length) +
  `\n      </div>\n      )}`;
  
let finalEnd = afterHeader.substring(formEnd + formEndStr.length);

const finalContent = beforeHeader + objStr + '\n\n      ' + trafficStr + '\n\n      ' + wrappedContent + finalEnd;

fs.writeFileSync(filePath, finalContent);
console.log("Transformation complete.");
