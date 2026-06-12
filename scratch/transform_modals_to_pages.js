const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The original modals look like this:
// {showObjectiveModal && activeTab === 'campaigns' && (
//   <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//     <div className="card" style={{ width: '100%', maxWidth: '750px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)', borderRadius: '8px' }}>

// {showTrafficSetupModal && activeTab === 'campaigns' && (
//   <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//     <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)', borderRadius: '8px' }}>

content = content.replace(
  /{showObjectiveModal && activeTab === 'campaigns' && \(\s*<div style={{ position: 'fixed', inset: 0, background: 'rgba\(0,0,0,0\.5\)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>/g,
  `{showObjectiveModal && activeTab === 'campaigns' ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
);

content = content.replace(
  /{showTrafficSetupModal && activeTab === 'campaigns' && \(\s*<div style={{ position: 'fixed', inset: 0, background: 'rgba\(0,0,0,0\.5\)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>/g,
  `: showTrafficSetupModal && activeTab === 'campaigns' ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 2rem' }}>`
);

// We need to change the ends of these modals from:
//      )}
// to:
//      )
content = content.replace(
  /}\s*style={{ padding: '0\.6rem 1\.2rem', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/g,
  `} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam</button>
            </div>
          </div>
        </div>
      )`
);

content = content.replace(
  /}\s*style={{ padding: '0\.6rem 1\.2rem', borderRadius: '6px', border: 'none', background: '#0064d1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/g,
  `} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0064d1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam</button>
            </div>
          </div>
        </div>
      ) : (`
);

// And close the final `) : (` at the end of the form.
// Find the end of the <form> which is `</form>`
const formEndIdx = content.indexOf('</form>');
if (formEndIdx !== -1) {
  content = content.substring(0, formEndIdx + 7) + '\n      )}' + content.substring(formEndIdx + 7);
}

fs.writeFileSync(filePath, content);
console.log('Done transforming modals to pages.');
