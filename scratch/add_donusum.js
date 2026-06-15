const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(targetPath, 'utf8');

const donusumCard = `
        {/* Dönüşüm Yeri */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Dönüşüm</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Trafiği nereye yönlendirmek istediğinizi seçin. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Daha fazla bilgi alın</span></div>
          </div>
          
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Dönüşüm yeri <span style={{ cursor: 'help' }} title="Trafik hedefi.">i</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="conversion_location" defaultChecked style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>İnternet sitesi</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trafiği internet sitenize gönderin.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="conversion_location" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Uygulama</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trafiği uygulamanıza gönderin.</div>
                </div>
              </label>
            </div>
          </div>
        </div>
`;

// Find where <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
// is in renderAdsetFormFields and inject it right after.
const searchStr = "<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>";
const insertIdx = code.indexOf(searchStr);

if (insertIdx !== -1) {
  // Check if we already inserted it
  if (!code.includes("Dönüşüm yeri")) {
    const splitIdx = insertIdx + searchStr.length;
    const newCode = code.slice(0, splitIdx) + donusumCard + code.slice(splitIdx);
    fs.writeFileSync(targetPath, newCode, 'utf8');
    console.log("Dönüşüm card injected.");
  } else {
    console.log("Already has Dönüşüm card.");
  }
} else {
  console.log("Could not find search string in adset form.");
}
