const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The file currently has a syntax error at line 1048: `) :` instead of `) : (` or whatever.
// Let's first extract the showTrafficSetupModal chunk.
const trafficStartStr = `showTrafficSetupModal && activeTab === 'campaigns' ? (`;
const trafficEndStr = `</button>
            </div>
          </div>
        </div>
      ) : (`

const tStart = content.indexOf(trafficStartStr);
if (tStart === -1) {
  console.log("trafficStartStr not found");
  process.exit(1);
}

const tEnd = content.indexOf(trafficEndStr, tStart);
if (tEnd === -1) {
  console.log("trafficEndStr not found");
  process.exit(1);
}

// Extract it completely
const trafficBlock = content.substring(tStart, tEnd + trafficEndStr.length - 4); // omit " : ("
content = content.substring(0, tStart) + content.substring(tEnd + trafficEndStr.length);

// Now, around line 1048, we have:
//      ) :
//
//
//      {messageModal.show && (
const badTernaryStr = `) :

      {messageModal.show && (`

const fixedTernaryStr = `) : ` + trafficBlock + ` : (

      {messageModal.show && (`

content = content.replace(badTernaryStr, fixedTernaryStr);

// Wait, the messageModal is not part of the form!
// messageModal should be OUTSIDE the ternary operator.
// The structure should be:
// return (
//   <div ...>
//     {messageModal.show && ( ... )}
//     {showObjectiveModal ? ( ... ) : showTrafficSetupModal ? ( ... ) : ( ...the rest of the form... )}
//   </div>
// )

// But right now we have:
// {showObjectiveModal && activeTab === 'campaigns' ? ( ... ) : showTrafficSetupModal ? ( ... ) : (
//    {messageModal.show && ( ... )}
//    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//    ... form ...
// )}

// This is actually valid JSX, just `messageModal` will only be rendered if NO modal is shown.
// That is fine, or we can move `messageModal` up.
// Let's just fix the syntax first.

content = content.replace(`) :


      {messageModal.show && (`,
`) : ` + trafficBlock + ` : (


      {messageModal.show && (`);

fs.writeFileSync(filePath, content);
console.log("Done");
