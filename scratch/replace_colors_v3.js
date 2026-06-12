const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Skip renderAdPreview block
const startPreview = content.indexOf('const renderAdPreview =');
const endPreview = content.indexOf('const renderAdFormFields =');
const previewBlock = content.substring(startPreview, endPreview);

let restContent = content.replace(previewBlock, '__RENDER_AD_PREVIEW__');

// Colors replacement map for Dark Mode
restContent = restContent
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
  
  // Explicit inline replaces for CSS classes
  .replace(/background: 'white'/gi, "background: 'var(--bg-secondary)'")
  .replace(/backgroundColor: 'white'/gi, "backgroundColor: 'var(--bg-secondary)'")
  .replace(/background:\s*'#fff'/gi, "background: 'var(--bg-secondary)'")
  .replace(/backgroundColor:\s*'#fff'/gi, "backgroundColor: 'var(--bg-secondary)'");

// Re-inject renderAdPreview block
let finalContent = restContent.replace('__RENDER_AD_PREVIEW__', previewBlock);

// Re-apply tab button fix that was lost during rebuild
finalContent = finalContent
  .replace("background: activeTab === 'campaigns' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)', color: activeTab === 'campaigns' ? '#1877f2'", "background: activeTab === 'campaigns' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'campaigns' ? '#fff'")
  .replace("background: activeTab === 'adsets' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)', color: activeTab === 'adsets' ? '#1877f2'", "background: activeTab === 'adsets' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'adsets' ? '#fff'")
  .replace("background: activeTab === 'ads' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)', color: activeTab === 'ads' ? '#1877f2'", "background: activeTab === 'ads' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'ads' ? '#fff'");

fs.writeFileSync(targetPath, finalContent);
console.log('Colors converted to dark theme, skipping renderAdPreview.');
