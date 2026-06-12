const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
const code = fs.readFileSync(filePath, 'utf8');

function extractBlock(startStr) {
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) return null;
    
    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIdx; i < content.length; i++) {
        const char = content[i];
        
        if (inString) {
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
            continue;
        }
        
        if (char === '"' || char === "'" || char === "\`") {
            inString = true;
            stringChar = char;
            continue;
        }
        
        if (char === '{') braceCount++;
        if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
                endIdx = i;
                break;
            }
        }
    }
    
    if (endIdx !== -1) {
        const block = content.substring(startIdx, endIdx + 1);
        content = content.substring(0, startIdx) + content.substring(endIdx + 1);
        return block;
    }
    return null;
}

let content = code;

const trafficBlock = extractBlock(`{showTrafficSetupModal && activeTab === 'campaigns' && (`);
const objBlock = extractBlock(`{showObjectiveModal && activeTab === 'campaigns' && (`);

if (!trafficBlock || !objBlock) {
    console.log("Could not find blocks");
    process.exit(1);
}

function reformatBlock(block, conditionVar) {
    let newBlock = block.replace(
        `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
        `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
    );
    newBlock = newBlock.replace(
        `{${conditionVar} && activeTab === 'campaigns' && (`,
        `${conditionVar} && activeTab === 'campaigns' ? (`
    );
    const lastParen = newBlock.lastIndexOf(')}');
    newBlock = newBlock.substring(0, lastParen) + ') : ' + newBlock.substring(lastParen + 2);
    return newBlock;
}

const newObjBlock = reformatBlock(objBlock, 'showObjectiveModal');
const newTrafficBlock = reformatBlock(trafficBlock, 'showTrafficSetupModal').replace(') : ', ') : (');

const regex = /return\s*\(\s*<div style={{ display: 'flex', flexDirection: 'column', gap: '1\.5rem', height: '100%', minHeight: '80vh' }}>/m;

const match = content.match(regex);
if (!match) {
    console.log("Could not find return start via regex");
    process.exit(1);
}

const insertionPoint = match.index + match[0].length;

let before = content.substring(0, insertionPoint);
let after = content.substring(insertionPoint);

const formEndIdx = after.lastIndexOf('</form>');
after = after.substring(0, formEndIdx + 7) + '\n      </div>\n      )}' + after.substring(formEndIdx + 7);

const finalContent = before + 
    '\n\n      {' + newObjBlock + '\n      ' + newTrafficBlock + 
    '\n      <div style={{ flex: 1, display: \'flex\', flexDirection: \'column\' }}>' + after;

fs.writeFileSync(filePath, finalContent);
console.log("Done successfully!");
