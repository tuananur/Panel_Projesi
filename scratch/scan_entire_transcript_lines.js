const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\.system_generated\\logs\\transcript.jsonl';

async function scan() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    try {
      const parsed = JSON.parse(line);
      console.log(`[Line ${lineCount}] Step ${parsed.step_index}: source=${parsed.source}, type=${parsed.type}`);
    } catch (e) {
      console.log(`[Line ${lineCount}] Could not parse JSON`);
    }
  }
}

scan();
