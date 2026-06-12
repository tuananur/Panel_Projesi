const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let lines = fs.readFileSync(targetPath, 'utf8').split('\n');

const campaignStartIdx = lines.findIndex(l => l.includes("{activeTab === 'campaigns' && ("));
const adsetsStartIdx = lines.findIndex((l, idx) => idx > campaignStartIdx && l.includes("{activeTab === 'adsets' && ("));

const newCampaignTab = `
            {activeTab === 'campaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      </div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Kampanya Adı</label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input required className="form-control" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder={"Örn: Yeni " + selectedObjective + " Kampanyası"} style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                      <button type="button" style={{ padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Şablon Oluştur</button>
                    </div>
                  </div>
                </div>

                {selectedObjective === 'Bilinirlik' && (
                  <>
                    {/* Canlı Video Reklamı Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Canlı video reklamı</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{createFormData.live_video_ad ? 'Açık' : 'Kapalı'}</span>
                          <div 
                            onClick={() => setCreateFormData({ ...createFormData, live_video_ad: !createFormData.live_video_ad })}
                            style={{ width: '40px', height: '22px', background: createFormData.live_video_ad ? '#1877f2' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
                          >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: createFormData.live_video_ad ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Canlı video reklam için önerilen ayarları kullanın. Bu ayarlar, reklamlarınızı daha verimli şekilde sunmak ve etkileşimi artırmak için bütçenizi ve planınızı ayarlayacaktır.</p>
                      
                      {createFormData.live_video_ad && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Canlı video konumu</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Canlı videonu nerede yayınlayacağını seç.</div>
                          <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid #1877f2', borderRadius: '6px', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '5px solid #1877f2', background: '#fff' }} />
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>f</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Facebook</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Kampanya Detayları Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kampanya Detayları</h3>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Satın Alma Türü</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Açık Artırma</div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Kampanya amacı <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedObjective}</div>
                        </div>
                        <button type="button" onClick={() => setShowObjectiveModal(true)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Düzenle</button>
                      </div>
                    </div>

                    {/* Advantage+ Kampanya Bütçesi Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '10px', height: '2px', background: '#ef4444' }} />
                          </div>
                          <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Advantage+ kampanya bütçesi ✨</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{createFormData.advantage_budget !== false ? 'Açık' : 'Kapalı'}</span>
                          <div 
                            onClick={() => setCreateFormData({ ...createFormData, advantage_budget: createFormData.advantage_budget === false ? true : false })}
                            style={{ width: '40px', height: '22px', background: createFormData.advantage_budget !== false ? '#1877f2' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
                          >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: createFormData.advantage_budget !== false ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Daha fazla sonuç elde etmek için bütçenizi reklam setlerine dağıtın. Her bir reklam seti için harcamayı kontrol edebilirsiniz. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Advantage+ kampanya bütçesi hakkında</span></p>

                      {createFormData.advantage_budget !== false && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>Bütçe <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <select style={{ width: '140px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                                <option>Toplam bütçe</option>
                                <option>Günlük bütçe</option>
                              </select>
                              <div style={{ flex: 1, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TL</span>
                                <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="0,00" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem 0.65rem 2rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TRY</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Kampanya Teklif Stratejisi <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></label>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>En yüksek hacim</div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Bütçe planlama <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                              <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Gör</button>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Belirli gün veya saatlerde bütçenizi artırın.</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: 0.5 }}>
                              <input type="checkbox" disabled />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Reklam Planlaması <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reklamları sürekli yayınla</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedObjective !== 'Bilinirlik' && (
                  <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kampanya Detayları</h3>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA AMACI</label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedObjective}</span>
                        <button type="button" onClick={() => setShowObjectiveModal(true)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Değiştir</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Bütçe Türü</label>
                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                          <option>Günlük Bütçe</option>
                          <option>Toplam Bütçe</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Tutar (TL) *</label>
                        <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
`;

lines.splice(campaignStartIdx, adsetsStartIdx - campaignStartIdx, newCampaignTab);

fs.writeFileSync(targetPath, lines.join('\n'));
console.log('Successfully updated Campaign Tab for Bilinirlik');
