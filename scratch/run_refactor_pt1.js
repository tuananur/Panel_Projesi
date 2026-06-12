const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const specialAdStr = fs.readFileSync(path.join(__dirname, 'render_special_ad.js'), 'utf8');
const budgetPlanStr = fs.readFileSync(path.join(__dirname, 'render_budget_planning.js'), 'utf8');

// 1. Insert helper functions
const renderAdFormFieldsRegex = /(const renderAdFormFields = \(data, setData, isCreate, isEditing\) => \{)/;
if (!content.includes('const renderSpecialAdCategories')) {
  content = content.replace(renderAdFormFieldsRegex, `${specialAdStr}\n\n${budgetPlanStr}\n\n$1`);
}

// 2. Replace Custom Traffic "Özel Reklam Kategorileri" card
const customTrafficCardRegex = /<div style={{ padding: '1\.2rem', background: 'var\(--bg-secondary\)', border: '1px solid var\(--border-color\)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>\s*<h3 style={{ margin: 0, fontSize: '0\.95rem', color: 'var\(--text-primary\)', fontWeight: 700 }}>Özel Reklam Kategorileri<\/h3>[\s\S]*?(?=<\/div>\s*<\/div>\s*\) : \()/;
content = content.replace(customTrafficCardRegex, '{renderSpecialAdCategories(createFormData, setCreateFormData)}');

// 3. Replace Bilinirlik "Özel Reklam Kategorileri" card
const bilinirlikCardRegex = /{\/\*\s*Özel Reklam Kategorileri Kartı\s*\*\/}\s*<div style={{ padding: '1\.2rem', background: 'var\(--bg-secondary\)'[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;
content = content.replace(bilinirlikCardRegex, '{/* Özel Reklam Kategorileri Kartı */}\n                    {renderSpecialAdCategories(createFormData, setCreateFormData)}');

// 4. Replace Custom Traffic "Bütçe planlama"
const budgetBlockStart = `<div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.8rem' }} onClick={() => setCreateFormData({ ...createFormData, hideOptions: !createFormData.hideOptions })}>
                              {createFormData.hideOptions ? 'Seçenekleri Göster ▴' : 'Seçenekleri Gizle ▴'}
                            </div>
                            
                            {!createFormData.hideOptions && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>`;

const budgetBlockEndStr = `                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Reklam Planlaması`;

const startIdx = content.indexOf(budgetBlockStart);
if (startIdx !== -1) {
  const endIdx = content.indexOf(budgetBlockEndStr, startIdx);
  if (endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    // Notice we wrap the new renderBudgetPlanning + the Reklam Planlaması inside the hideOptions check
    content = before + `<div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.8rem' }} onClick={() => setCreateFormData({ ...createFormData, hideOptions: !createFormData.hideOptions })}>
                              {createFormData.hideOptions ? 'Seçenekleri Göster ▴' : 'Seçenekleri Gizle ▴'}
                            </div>
                            
                            {!createFormData.hideOptions && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {renderBudgetPlanning(createFormData, setCreateFormData)}
\n` + after;
  }
}

// 5. Replace adsets "Bütçe ve Durum"
const adsetBudgetStart = `<div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Bütçe ve Durum</h3>`;

const adsetBudgetEndStr = `</select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ads' && renderAdFormFields`;

const adsetStartIdx = content.indexOf(adsetBudgetStart);
if (adsetStartIdx !== -1) {
  const adsetEndIdx = content.indexOf(adsetBudgetEndStr, adsetStartIdx);
  if (adsetEndIdx !== -1) {
    const beforeAdset = content.substring(0, adsetStartIdx);
    const afterAdset = content.substring(adsetEndIdx);
    const newAdsetBlock = `<div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Bütçe ve Plan</h3>
                  
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Bütçe <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                    
                    <div style={{ display: 'flex', gap: '0', alignItems: 'center', border: (createFormData.daily_budget && parseFloat(createFormData.daily_budget) < 46.13) ? '1px solid #dc2626' : '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      <select style={{ width: '40%', background: 'var(--bg-secondary)', border: 'none', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', fontSize: '0.85rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option>Günlük Bütçe</option>
                        <option>Toplam Bütçe</option>
                      </select>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', padding: '0 0.85rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TL</span>
                        <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="30,00" style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.65rem 0.5rem', fontSize: '0.85rem', outline: 'none', textAlign: 'right' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>TRY</span>
                        {(createFormData.daily_budget && parseFloat(createFormData.daily_budget) < 46.13) && (
                           <span style={{ color: '#dc2626', marginLeft: '8px' }}>🚫</span>
                        )}
                      </div>
                    </div>
                    
                    {(createFormData.daily_budget && parseFloat(createFormData.daily_budget) < 46.13) && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                        Bütçenizin en az 46,13 TL olması gerekir; aksi takdirde reklamınız yayınlanmayabilir. Lütfen bu reklam seti için bütçenizi artırın.
                      </div>
                    )}
                    
                    {createFormData.daily_budget && parseFloat(createFormData.daily_budget) > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.8rem', lineHeight: '1.4' }}>
                        Günde ortalama {createFormData.daily_budget} TL harcayacaksın. Maksimum günlük harcaman {(parseFloat(createFormData.daily_budget) * 1.75).toFixed(2)} TL, maksimum haftalık harcaman {(parseFloat(createFormData.daily_budget) * 7).toFixed(2)} TL. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Günlük bütçe hakkında</span>
                      </div>
                    )}
                  </div>
                  
                  {(!createFormData.hideBudgetWarning) && (
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)' }}>
                       <div style={{ color: 'var(--text-secondary)' }}>ℹ️</div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', flex: 1 }}>
                         Son Trafik kampanyalarınız, yaklaşık <strong>Günlük 1.025,00 TL</strong> harcayarak sonuç elde etti. <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', marginLeft: '4px' }}>i</span>
                       </div>
                       <button type="button" onClick={() => setCreateFormData({ ...createFormData, hideBudgetWarning: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>X</button>
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>Plan</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Başlangıç Tarihi</div>
                        <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                          <input type="text" defaultValue="12 Haziran 2026" style={{ flex: 1, padding: '0.65rem 0.85rem', border: 'none', borderRight: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          <input type="text" defaultValue="15:27 GMT+3" style={{ flex: 1, padding: '0.65rem 0.85rem', border: 'none', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Bitiş Tarihi</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                          <input type="checkbox" checked={createFormData.setEndDate || false} onChange={e => setCreateFormData({ ...createFormData, setEndDate: e.target.checked })} style={{ cursor: 'pointer' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Bir bitiş tarihi belirleyin</span>
                        </div>
                        {createFormData.setEndDate && (
                          <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <select style={{ width: '30%', padding: '0.65rem 0.85rem', border: 'none', borderRight: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                              <option>Özel</option>
                            </select>
                            <input type="text" defaultValue="24 Haziran 2026" style={{ flex: 1, padding: '0.65rem 0.85rem', border: 'none', borderRight: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            <input type="text" defaultValue="15:27 GMT+3" style={{ flex: 1, padding: '0.65rem 0.85rem', border: 'none', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {renderBudgetPlanning(createFormData, setCreateFormData)}
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>İlk Durum</label>
                    <select value={createFormData.status || 'ACTIVE'} onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                      <option value="PAUSED">Durdurulmuş (Taslak)</option>
`;
    content = beforeAdset + newAdsetBlock + afterAdset;
  }
}


fs.writeFileSync(filePath, content);
console.log('Done replacement part 2');
