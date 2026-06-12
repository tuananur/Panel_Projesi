const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
const code = fs.readFileSync(filePath, 'utf8');

// I'm not going to use babel because dealing with JSX parsing can be tricky with presets.
// Let's use a simpler string matching with a counter for braces to extract exactly.

function extractBlock(startStr) {
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) return null;
    
    // Find the opening brace of this block `{`
    // actually startStr already includes it. Let's find the end.
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

console.log("Traffic block length:", trafficBlock.length);
console.log("Objective block length:", objBlock.length);

// Now reformat them
function reformatBlock(block, conditionVar) {
    let newBlock = block.replace(
        `<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>`,
        `<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
    );
    newBlock = newBlock.replace(
        `{${conditionVar} && activeTab === 'campaigns' && (`,
        `${conditionVar} && activeTab === 'campaigns' ? (`
    );
    // Replace the final `)}` with `) : (`
    const lastParen = newBlock.lastIndexOf(')}');
    newBlock = newBlock.substring(0, lastParen) + ') : ' + newBlock.substring(lastParen + 2);
    return newBlock;
}

const newObjBlock = reformatBlock(objBlock, 'showObjectiveModal');
const newTrafficBlock = reformatBlock(trafficBlock, 'showTrafficSetupModal').replace(') : ', ') : (');

// Now inject them into the main return
const returnStart = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>`;

const returnIdx = content.indexOf(returnStart);
if (returnIdx === -1) {
    console.log("Could not find return start");
    process.exit(1);
}

const insertionPoint = returnIdx + returnStart.length;

let before = content.substring(0, insertionPoint);
let after = content.substring(insertionPoint);

// Need to add `)}` at the end of the form
const formEndIdx = after.lastIndexOf('</form>');
after = after.substring(0, formEndIdx + 7) + '\n      </div>\n      )}' + after.substring(formEndIdx + 7);

const finalContent = before + 
    '\n\n      {' + newObjBlock + '\n      ' + newTrafficBlock + 
    '\n      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>' + after;

fs.writeFileSync(filePath, finalContent);
console.log("Done successfully!");
