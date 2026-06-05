const fs = require('fs');

const steps = [909, 956, 967, 968, 1022, 1026, 1030, 1042];

steps.forEach(s => {
  const p = `C:\\Users\\Casper\\.gemini\\antigravity-ide\\brain\\5df8037e-3a6c-4f54-bf98-9bb0dd781adc\\step_${s}.json`;
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(`Step ${s}:`);
    console.log(`  type: ${data.type}`);
    if (data.tool_calls) {
      console.log(`  tool_calls count: ${data.tool_calls.length}`);
      data.tool_calls.forEach((tc, i) => {
        console.log(`    tc ${i}: ${tc.name}`);
        if (tc.args) {
          console.log(`      args keys: ${Object.keys(tc.args).join(', ')}`);
          if (tc.args.TargetFile) console.log(`      TargetFile: ${tc.args.TargetFile}`);
          if (tc.args.CodeContent) console.log(`      CodeContent length: ${tc.args.CodeContent.length}`);
          if (tc.args.ReplacementContent) console.log(`      ReplacementContent length: ${tc.args.ReplacementContent.length}`);
        }
      });
    }
  } else {
    console.log(`Step ${s} file does not exist!`);
  }
});
