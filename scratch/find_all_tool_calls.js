const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\.system_generated\\logs\\transcript.jsonl';

async function scanAll() {
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
      
      // Look at model tool calls
      if (parsed.tool_calls) {
        parsed.tool_calls.forEach(tc => {
          if (tc.args) {
            const tf = tc.args.TargetFile || '';
            if (tf.includes('stats-content.jsx') || tc.args.TargetFile === undefined) {
              const len = tc.args.CodeContent ? tc.args.CodeContent.length : (tc.args.ReplacementContent ? tc.args.ReplacementContent.length : 0);
              if (len > 100 || tf.includes('stats-content.jsx')) {
                console.log(`[Line ${lineCount}] Step ${parsed.step_index}: Tool: ${tc.name}, TargetFile: ${tf || '(none)'}, Length: ${len}`);
                // If it's a large replacement on stats-content, print more details
                if (tf.includes('stats-content.jsx') && len > 5000) {
                  const outName = `C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\large_step_${parsed.step_index}.json`;
                  fs.writeFileSync(outName, JSON.stringify(parsed, null, 2), 'utf8');
                  console.log(`  -> Saved large step to ${outName}`);
                }
              }
            }
          }
        });
      }
    } catch (e) {
      // skip invalid lines
    }
  }
}

scanAll();
