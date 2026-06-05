const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\.system_generated\\logs\\transcript.jsonl';

async function scan() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.includes('SLAYT 1') || line.includes('KAPAK SAYFASI')) {
      try {
        const parsed = JSON.parse(line);
        console.log(`[Line ${lineNum}] step_index: ${parsed.step_index}, source: ${parsed.source}, type: ${parsed.type}`);
        // Let's write this complete line to a unique file
        const outName = `C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\step_${parsed.step_index}.json`;
        fs.writeFileSync(outName, JSON.stringify(parsed, null, 2), 'utf8');
        console.log(`  Saved full step to ${outName}`);
      } catch (e) {
        console.log(`[Line ${lineNum}] could not parse JSON:`, line.substring(0, 100));
      }
    }
  }
}

scan();
