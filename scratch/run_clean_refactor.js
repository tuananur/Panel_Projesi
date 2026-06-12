const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let lines = fs.readFileSync(targetPath, 'utf8').split('\n');

// 1. Add State Hooks
const stateHookIdx = lines.findIndex(l => l.includes('const [createFormData, setCreateFormData]'));
const stateCode = [
  "  const [showObjectiveModal, setShowObjectiveModal] = useState(true);",
  "  const [selectedObjective, setSelectedObjective] = useState('Bilinirlik');",
  "  const objectives = [",
  "    { id: 'Bilinirlik', label: 'Bilinirlik', desc: 'Reklamlarınızı onları hatırlama olasılığı yüksek kişilere gösterin.', icon: '📢' },",
  "    { id: 'Trafik', label: 'Trafik', desc: 'İnsanları web sitenize veya uygulamanıza yönlendirin.', icon: '🖱️' },",
  "    { id: 'Etkileşim', label: 'Etkileşim', desc: 'Daha fazla mesaj, video görüntülemesi veya gönderi etkileşimi alın.', icon: '💬' },",
  "    { id: 'Potansiyel Müşteriler', label: 'Potansiyel Müşteriler', desc: 'İşletmeniz için potansiyel müşteri toplayın.', icon: '📝' },",
  "    { id: 'Uygulama tanıtımı', label: 'Uygulama tanıtımı', desc: 'İnsanları uygulamanızı yüklemeye veya kullanmaya teşvik edin.', icon: '📱' },",
  "    { id: 'Satışlar', label: 'Satışlar', desc: 'Ürün veya hizmetinizi satın alma ihtimali yüksek kişileri bulun.', icon: '🛍️' }",
  "  ];"
];
lines.splice(stateHookIdx, 0, ...stateCode);

// 2. Add Modal UI right after the MAIN return (
// Find the last return ( in the file? No, we can search for the start of the return block which contains messageModal
const mainReturnIdx = lines.findIndex(l => l.includes('return (') && lines[lines.indexOf(l) + 1].includes('<div style={{ display: \'flex\', flexDirection: \'column\', gap: \'1.5rem\''));

const modalLines = [
  "      {showObjectiveModal && activeTab === 'campaigns' && (",
  "        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>",
  "          <div className=\"card\" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)' }}>",
  "            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>",
  "              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Kampanya Amacınızı Seçin</h3>",
  "              <button onClick={() => setShowObjectiveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>",
  "            </div>",
  "            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>",
  "              {objectives.map(obj => (",
  "                <div ",
  "                  key={obj.id}",
  "                  onClick={() => setSelectedObjective(obj.id)}",
  "                  style={{ ",
  "                    display: 'flex', ",
  "                    gap: '1rem', ",
  "                    padding: '1rem', ",
  "                    border: selectedObjective === obj.id ? '2px solid #1877f2' : '1px solid var(--border-color)', ",
  "                    borderRadius: '8px', ",
  "                    cursor: 'pointer',",
  "                    background: selectedObjective === obj.id ? 'rgba(24, 119, 242, 0.05)' : 'var(--bg-secondary)'",
  "                  }}",
  "                >",
  "                  <div style={{ fontSize: '1.5rem' }}>{obj.icon}</div>",
  "                  <div>",
  "                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{obj.label}</div>",
  "                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{obj.desc}</div>",
  "                  </div>",
  "                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>",
  "                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedObjective === obj.id ? '6px solid #1877f2' : '2px solid var(--border-color)', background: '#fff' }} />",
  "                  </div>",
  "                </div>",
  "              ))}",
  "            </div>",
  "            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-secondary)' }}>",
  "              <button onClick={() => setShowObjectiveModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>İptal</button>",
  "              <button onClick={() => setShowObjectiveModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam Et</button>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}"
];

lines.splice(mainReturnIdx + 2, 0, ...modalLines);

// 3. Replace the Kampanya tab content
const campaignStartIdx = lines.findIndex(l => l.includes("{activeTab === 'campaigns' && ("));
const adsetsStartIdx = lines.findIndex((l, idx) => idx > campaignStartIdx && l.includes("{activeTab === 'adsets' && ("));

const newCampaignTab = [
  "            {activeTab === 'campaigns' && (",
  "              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>",
  "                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>",
  "                  <div>",
  "                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA ADI *</label>",
  "                    <input required className=\"form-control\" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder={\"Örn: Yeni \" + selectedObjective + \" Kampanyası\"} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />",
  "                  </div>",
  "                  <div>",
  "                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA AMACI</label>",
  "                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>",
  "                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedObjective}</span>",
  "                      <button type=\"button\" onClick={() => setShowObjectiveModal(true)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Değiştir</button>",
  "                    </div>",
  "                  </div>",
  "                </div>",
  "                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>",
  "                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kampanya Bütçesi</h3>",
  "                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>",
  "                    <div>",
  "                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Bütçe Türü</label>",
  "                      <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>",
  "                        <option>Günlük Bütçe</option>",
  "                        <option>Toplam Bütçe</option>",
  "                      </select>",
  "                    </div>",
  "                    <div>",
  "                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Tutar (TL) *</label>",
  "                      <input type=\"number\" required className=\"form-control\" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder=\"Örn: 500\" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />",
  "                    </div>",
  "                  </div>",
  "                </div>",
  "                <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid rgba(24, 119, 242, 0.2)', padding: '0.8rem', borderRadius: '8px' }}>",
  "                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1877f2', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>",
  "                    <span>💡</span> Otomatik Ayarlar Devrede",
  "                  </div>",
  "                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>",
  "                    A/B Testi, Teklif Stratejisi (En Yüksek Hacim) ve Satın Alma Türü (Açık Artırma) arka planda otomatik olarak en verimli şekilde ayarlanmıştır.",
  "                  </div>",
  "                </div>",
  "              </div>",
  "            )}"
];

lines.splice(campaignStartIdx, adsetsStartIdx - campaignStartIdx, ...newCampaignTab);

fs.writeFileSync(targetPath, lines.join('\n'));
console.log('Successfully applied clean refactor.');
