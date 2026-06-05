const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\.system_generated\\logs\\transcript.jsonl';

async function search() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('refactor_slides.js') || line.includes('SLAYT 1') || line.includes('KAPAK SAYFASI')) {
      try {
        const parsed = JSON.parse(line);
        console.log(`Match at line ${lineCount}, step_index: ${parsed.step_index}, source: ${parsed.source}, type: ${parsed.type}`);
        // print first 200 chars of content
        console.log('  Content Preview:', (parsed.content || '').substring(0, 200).replace(/\n/g, ' '));
        if (parsed.tool_calls) {
          console.log('  Tool Calls:', JSON.stringify(parsed.tool_calls).substring(0, 200));
        }
      } catch (e) {
        console.log(`Match at line ${lineCount} (could not parse JSON):`, line.substring(0, 200));
      }
    }
  }
  console.log(`Done scanning ${lineCount} lines.`);
}

search();
