const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Extract showTrafficSetupModal from renderAdFormFields
const trafficStartStr = `showTrafficSetupModal && activeTab === 'campaigns' ? (`;
const trafficEndStr = `            </div>
          </div>
        </div>
      ) : (`

const trafficStartIdx = content.indexOf(trafficStartStr);
if (trafficStartIdx === -1) {
  console.log("trafficStartStr not found");
  process.exit(1);
}

const trafficEndIdx = content.indexOf(trafficEndStr, trafficStartIdx);
if (trafficEndIdx === -1) {
  console.log("trafficEndStr not found");
  process.exit(1);
}

// Extract it completely. Notice we do not include " : (" so we trim 4 characters.
let trafficStr = content.substring(trafficStartIdx, trafficEndIdx + trafficEndStr.length - 4);
content = content.substring(0, trafficStartIdx) + content.substring(trafficEndIdx + trafficEndStr.length);

// 2. Put it in the main return
// We want to replace this:
//      ) :
//
//
//      {messageModal.show && (
//
// Notice there might be a \r\n or \n. Let's use a regex to match it reliably.
const regex = /\s*\) :\s*\{messageModal\.show && \(/;

const fixedTernaryStr = `\n      ) : ` + trafficStr + ` : (\n\n      {messageModal.show && (`;

content = content.replace(regex, fixedTernaryStr);

fs.writeFileSync(filePath, content);
console.log("Done");
