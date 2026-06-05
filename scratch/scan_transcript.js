const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\30c3af44-67ca-450e-bf41-f7e4fcc57ef1\\.system_generated\\logs\\transcript.jsonl';

async function scan() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.step_index >= 230 && parsed.step_index <= 275) {
        if (parsed.type === 'USER_INPUT' || parsed.type === 'PLANNER_RESPONSE') {
          console.log(`\n=================== INDEX: ${parsed.step_index} (${parsed.source} / ${parsed.type}) ===================`);
          console.log(`THINKING: ${parsed.thinking || ''}`);
          console.log(`CONTENT: ${parsed.content || ''}`);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

scan();
