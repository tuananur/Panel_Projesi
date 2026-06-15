const fs = require('fs');
const path = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<div style={{ display: 'flex', gap: '1rem' }}>\s*<button onClick=\{\(\) => { setActiveTab\('campaigns'\);[^>]+>Kampanya<\/button>\s*<button onClick=\{\(\) => { setActiveTab\('adsets'\);[^>]+>Reklam Seti<\/button>\s*<button onClick=\{\(\) => { setActiveTab\('ads'\);[^>]+>Reklam<\/button>/g;

const replacement = `<div style={{ display: 'flex', gap: '1rem' }}>
          {!(selectedObjective === 'Trafik' && trafficSetupType === 'custom') && (
            <>
              <button onClick={() => { setActiveTab('campaigns'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'campaigns' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'campaigns' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Kampanya</button>
              <button onClick={() => { setActiveTab('adsets'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'adsets' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'adsets' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Reklam Seti</button>
              <button onClick={() => { setActiveTab('ads'); setCreateFormData({ name: 'Yeni Etkileşim Reklamı', parent_id: '', status: 'ACTIVE', website_url: 'https://terapiyle.com/', display_link: 'https://terapiyle.com/', primary_text: 'Bazen sadece doğru uzmanla konuşmak her şeyi değiştirir...', headline: 'Terapiyle Sana En Uygun Terapisti Bul', call_to_action: 'LEARN_MORE', page_id: 'Terapimle', instagram_actor_id: 'terapiylecom', pixel_id: '1850906787926541', image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'ads' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'ads' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Reklam</button>
            </>
          )}`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Successfully hid tabs!');
} else {
  console.log('Regex failed.');
}
