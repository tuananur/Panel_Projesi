const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\.system_generated\\logs\\transcript.jsonl';
const outPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\slides_extracted.txt';

async function extractStep() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.step_index === 968 || parsed.step_index === 967) {
        console.log(`Found step_index ${parsed.step_index}`);
        fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
        console.log('Saved step to', outPath);
        
        // If there are tool calls, let's also dump the replacementContent of the first tool call
        if (parsed.tool_calls && parsed.tool_calls.length > 0) {
          const tc = parsed.tool_calls[0];
          if (tc.args && tc.args.ReplacementContent) {
            fs.writeFileSync(
              'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\slides_replacement_content.txt',
              tc.args.ReplacementContent,
              'utf8'
            );
            console.log('Saved ReplacementContent to slides_replacement_content.txt');
          }
        }
      }
    } catch (e) {
      // skip invalid lines
    }
  }
}

extractStep();
