const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Colors replacement map for Dark Mode
content = content
  // Backgrounds
  .replace(/#ffffff/g, "var(--bg-secondary)") // Card backgrounds
  .replace(/#f9f9f9/g, "rgba(255,255,255,0.02)") // Light gray background
  .replace(/#f5f6f7/g, "rgba(255,255,255,0.05)") // Very light gray background
  .replace(/#f0f2f5/g, "transparent") // Main wrapper background
  .replace(/#e4e6eb/g, "rgba(255,255,255,0.1)") // Light button backgrounds
  .replace(/#e7f3ff/g, "rgba(59,130,246,0.15)") // Light blue background
  
  // Texts
  .replace(/#050505/g, "var(--text-primary)") // Dark text
  .replace(/#1c1e21/g, "var(--text-primary)") // Dark text
  .replace(/#1a1a1a/g, "var(--text-primary)") // Dark text
  .replace(/#2a2a2a/g, "var(--text-primary)") // Dark text
  .replace(/#262626/g, "var(--text-primary)") // Dark text
  
  .replace(/#65676b/g, "var(--text-secondary)") // Gray text
  .replace(/#606770/g, "var(--text-secondary)") // Gray text
  .replace(/#8e8e8e/g, "var(--text-secondary)") // Gray text
  .replace(/#999999/g, "var(--text-secondary)") // Gray text
  .replace(/#4b5563/g, "var(--text-secondary)") // Gray text
  
  // Borders
  .replace(/#e5e7eb/g, "var(--border-color)") // Light border
  .replace(/#ccd0d5/g, "var(--border-color)") // Light border
  .replace(/#dddfe2/g, "var(--border-color)") // Light border
  
  // Misc
  .replace(/boxShadow:\s*'[^']+'/g, "boxShadow: 'none'") // Remove drop shadows for dark mode flat design
  .replace(/border:\s*'none'/g, "border: 'none'") // Keep existing
  
  // Explicit inline replaces for CSS classes
  .replace(/background: 'white'/gi, "background: 'var(--bg-secondary)'")
  .replace(/backgroundColor: 'white'/gi, "backgroundColor: 'var(--bg-secondary)'")
  .replace(/background:\s*'#fff'/gi, "background: 'var(--bg-secondary)'")
  .replace(/backgroundColor:\s*'#fff'/gi, "backgroundColor: 'var(--bg-secondary)'");

fs.writeFileSync(targetPath, content);
console.log('Colors converted to dark theme.');
