const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

const targetStart = `            {activeTab === 'ads' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>`;

const targetEnd = `              </div>
            ) : (`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find the target block to replace.");
  process.exit(1);
}

const replacement = `            {activeTab === 'ads' ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '1rem' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Gelişmiş Önizleme</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Advantage+ kreatif ile reklamınızın farklı reklam alanlarında nasıl görüneceğini gözden geçirebilirsiniz. Performansı en çok artıracağını tahmin ettiğimiz unsurlara göre reklamınızın varyasyonlarını göstereceğiz.</span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Reklamınızın görüleceği şekiller</div>

                <div className="custom-scrollbar" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', width: '100%' }}>
                  {[
                    { id: 'fb_feed', label: 'Facebook Akış', icon: 'f', isMobile: false },
                    { id: 'ig_feed', label: 'Instagram Akış', icon: 'i', isMobile: false },
                    { id: 'ig_stories', label: 'Instagram Stories', icon: 'i', isMobile: true },
                    { id: 'fb_stories', label: 'Facebook Stories', icon: 'f', isMobile: true },
                    { id: 'ig_reels', label: 'Instagram Reels', icon: 'i', isMobile: true },
                    { id: 'fb_reels', label: 'Facebook Reels', icon: 'f', isMobile: true },
                    { id: 'threads', label: 'Threads Akış', icon: '@', isMobile: false },
                    { id: 'search_results', label: 'Arama Sonuçları', icon: 'f', isMobile: false }
                  ].map(p => (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: p.isMobile ? '260px' : '300px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: p.icon === 'i' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : p.icon === '@' ? '#000' : '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                          {p.icon}
                        </div>
                        {p.label}
                      </div>

                      {p.isMobile ? (
                        <div style={{ 
                          width: '100%', background: '#ffffff', borderRadius: '32px', padding: '6px',
                          border: '2px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative'
                        }}>
                          <div style={{ width: '80px', height: '20px', background: '#e5e7eb', margin: '0 auto', borderRadius: '0 0 12px 12px', position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', top: '-6px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9ca3af' }}></div>
                            <div style={{ width: '24px', height: '3px', background: '#9ca3af', borderRadius: '2px' }}></div>
                          </div>
                          <div style={{ borderRadius: '26px', overflow: 'hidden', background: '#000000', marginTop: '-14px' }}>
                            {renderAdPreview(p.id, createFormData)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          {renderAdPreview(p.id, createFormData)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(targetPath, content);
console.log('Preview layout updated.');
