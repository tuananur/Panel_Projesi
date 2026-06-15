const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(targetPath, 'utf8');

const kimlikBlock = `
          {/* Kimlik Seçimi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>FACEBOOK SAYFASI i</label>
              <select value={data.page_id || 'Terapimle'} onChange={e => setData({...data, page_id: e.target.value})} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <option value="Terapimle">Terapimle</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>INSTAGRAM PROFİLİ i</label>
              <select value={data.instagram_actor_id || 'terapiylecom'} onChange={e => setData({...data, instagram_actor_id: e.target.value})} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                <option value="terapiylecom">terapiylecom</option>
              </select>
            </div>
          </div>
`;

const tarayiciEklentileriBlock = `
          {/* Tarayıcı Eklentileri */}
          <div style={{ marginTop: '0.5rem' }}>
             <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>TARAYICI EKLENTİLERİ i</label>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" name="browserExt" defaultChecked />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Yok <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(Düğme eklenmesin)</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" name="browserExt" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Ara <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(İnternet sitenize arama düğmesi ekleyin)</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" name="browserExt" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>WhatsApp <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(WhatsApp düğmesi ekleyin)</span></span>
                </div>
             </div>
          </div>
`;

code = code.replace(
  '<div style={{ fontSize: \'0.8rem\', color: \'var(--text-secondary)\' }}>Kullanıcıların göreceği görsel, metin ve hedef bağlantı.</div>',
  '<div style={{ fontSize: \'0.8rem\', color: \'var(--text-secondary)\' }}>Kullanıcıların göreceği görsel, metin ve hedef bağlantı.</div>' + kimlikBlock
);

code = code.replace(
  '<div style={{ background: \'rgba(24, 119, 242, 0.05)\', border: \'1px solid rgba(24, 119, 242, 0.2)\', padding: \'0.8rem\', borderRadius: \'8px\' }}>',
  tarayiciEklentileriBlock + '\n          <div style={{ background: \'rgba(24, 119, 242, 0.05)\', border: \'1px solid rgba(24, 119, 242, 0.2)\', padding: \'0.8rem\', borderRadius: \'8px\' }}>'
);

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully injected Kimlik and Tarayici Eklentileri');
