const parser = require('@babel/parser');

// We copy the slide definitions from run_clean_refactor.js
const slideStyle = {};
const headerDecoration = null;
const slideHeader = () => null;
const slideFooter = () => null;
const client = { companyName: 'Test', logoUrl: '' };
const analytics = {
  summary: { activeUsers: 0, pageViews: 0, sessions: 0, bounceRate: 0, avgEngagementTime: '', eventCount: 0 },
  dailyActiveUsers: [],
  deviceBreakdown: [],
  trafficSources: [],
  topPages: [],
  countryBreakdown: []
};
const estimatedClicks = 0;
const estimatedImpressions = 0;
const estimatedCtr = '0.00';
const currentMonthBlogs = [];
const currentMonthName = 'Mayıs';
const displayYear = '2026';

const slideJSXs = [
  // Slide 1
  `<div className="pdf-slide" style={slideStyle} key="slide-1">
        {headerDecoration}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div style={{ position: 'absolute', top: '150px', left: '-100px', width: '350px', height: '350px', background: '#0085FF', opacity: 0.08, filter: 'blur(80px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '150px', right: '-100px', width: '350px', height: '350px', background: '#8b5cf6', opacity: 0.08, filter: 'blur(80px)', borderRadius: '50%' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src="/logo.png" alt="Beyin Atölyesi" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div style={{ width: '2px', height: '32px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>BEYİN ATÖLYESİ</span>
          </div>
          {client.logoUrl && (
            <img src={client.logoUrl} alt={client.companyName} style={{ height: '32px', objectFit: 'contain' }} />
          )}
        </div>

        <div style={{ margin: '80px 0', zIndex: 10 }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(0, 133, 255, 0.1)', color: '#0085FF', borderRadius: '30px', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(0, 133, 255, 0.2)', marginBottom: '20px' }}>
            AYLIK PERFORMANS RAPORU
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-2.5px', lineHeight: 1.1 }}>
            DİJİTAL VARLIKLAR VE
            <span style={{ display: 'block', background: 'linear-gradient(90deg, #0085FF, #8b5cf6, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PERFORMANS ANALİZİ
            </span>
          </h1>
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', marginTop: '20px', maxWidth: '600px', lineHeight: 1.6 }}>
            {client.companyName} markası için {currentMonthName} {displayYear} dönemine ait arama motoru, kullanıcı trafiği ve sosyal medya etkileşim değerlendirmesi.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px', zIndex: 10 }}>
          <div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>DİJİTAL İŞ ORTAĞI</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{client.companyName}</span>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>RAPOR TARİHİ</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{currentMonthName} {displayYear}</span>
          </div>
        </div>
      </div>`,

  // Slide 2
  `<div className="pdf-slide" style={slideStyle} key="slide-2">
        {headerDecoration}
        {slideHeader('Kullanıcı Trafiği ve Ziyaret Akışı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'SAYFA GÖRÜNTÜLEME', val: Number(analytics.summary.pageViews || 0).toLocaleString(), desc: 'Toplam sayfa ziyareti sayısı', icon: '📄', color: '#0085FF' },
              { label: 'TOPLAM OTURUMLAR', val: Number(analytics.summary.sessions || 0).toLocaleString(), desc: 'Web sitesinde başlatılan tekil oturumlar', icon: '⏱️', color: '#8b5cf6' },
              { label: 'HEMEN ÇIKMA ORANI', val: '%' + (analytics.summary.bounceRate || 0), desc: 'Tek sayfadan ayrılan ziyaretçi oranı', icon: '📉', color: '#f43f5e' },
              { label: 'ORT. ETKİLEŞİM SÜRESİ', val: analytics.summary.avgEngagementTime || '0dk 0sn', desc: 'Ortalama aktif gezinme süresi', icon: '⚡', color: '#10b981' }
            ].map((kpi, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{kpi.label}</span>
                  <span style={{ fontSize: '18px' }}>{kpi.icon}</span>
                </div>
                <div style={{ margin: '12px 0 4px 0' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>{kpi.val}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{kpi.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#0085FF', borderRadius: '2px' }}></span>
              Trafik Akışı Stratejik Yorumu
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Web sitemiz bu ay toplam <strong style={{ color: '#ffffff' }}>{Number(analytics.summary.pageViews || 0).toLocaleString()}</strong> sayfa görüntüleme alarak organik erişimini kararlı şekilde sürdürmüştür.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Toplam oturum sayısı <strong style={{ color: '#ffffff' }}>{Number(analytics.summary.sessions || 0).toLocaleString()}</strong> seviyesine ulaşarak kullanıcıların düzenli geri dönüş sağladığını doğrulamaktadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span>Hemen çıkma oranımız <strong style={{ color: '#ffffff' }}>%{analytics.summary.bounceRate || 0}</strong> olup, sektör ortalamasının altında kalarak sitemize çekilen kitlenin yüksek alaka düzeyini kanıtlamaktadır.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(2)}
      </div>`,

  // Slide 3
  `<div className="pdf-slide" style={slideStyle} key="slide-3">
        {headerDecoration}
        {slideHeader('Günlük Aktif Kullanıcı Trendi')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const maxVal = Math.max(...analytics.dailyActiveUsers.map(d => d.users)) || 100;
              const points = analytics.dailyActiveUsers.map((d, idx) => {
                const x = 50 + (idx * (490 / (analytics.dailyActiveUsers.length - 1 || 1)));
                const y = 240 - ((d.users / (maxVal || 1)) * 180);
                return { x, y, label: d.date, val: d.users };
              });
              const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
              const areaData = pathData + ' L ' + points[points.length-1].x + ' 240 L ' + points[0].x + ' 240 Z';
              
              return (
                <svg width="560" height="280" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0085FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0085FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = 60 + ratio * 180;
                    const labelVal = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={idx}>
                        <line x1="50" y1={y} x2="540" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                        <text x="40" y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">{labelVal}</text>
                      </g>
                    );
                  })}
                  
                  <path d={areaData} fill="url(#areaGrad)" />
                  <path d={pathData} fill="none" stroke="#0085FF" strokeWidth="3" />
                  
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#0085FF" stroke="#0f172a" strokeWidth="2" />
                      <text x={p.x} y="260" fill="rgba(255,255,255,0.4)" fontSize="8.5" textAnchor="middle">{p.label}</text>
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#8b5cf6', borderRadius: '2px' }}></span>
              Kullanıcı Eğilim Analizi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Grafik, son 10 gündeki günlük aktif kullanıcı hareketlerindeki trendi görselleştirmektedir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Hafta içi günlerde kullanıcı trafiğinde belirgin bir yükseliş yaşanmakta, özellikle iş saatlerinde etkileşim oranları zirve yapmaktadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span>Blog paylaşımlarının yoğun olduğu günlerde site trafiğinde anlık ve kalıcı sıçramalar gözlemlenmiştir.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(3)}
      </div>`,

  // Slide 4
  `<div className="pdf-slide" style={slideStyle} key="slide-4">
        {headerDecoration}
        {slideHeader('Google Organik Arama Performansı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'ORGANİK TIKLAMALAR', val: estimatedClicks.toLocaleString(), desc: 'Google arama tıklama sayısı', icon: '🖱️', color: '#10b981' },
              { label: 'ARAMA GÖSTERİMLERİ', val: estimatedImpressions.toLocaleString(), desc: 'Arama sonuçlarında görünme sayısı', icon: '👁️', color: '#0085FF' },
              { label: 'ORTALAMA CTR (TIKLAMA ORANI)', val: '%' + estimatedCtr, desc: 'Gösterimlerin tıklamaya dönüşme oranı', icon: '📈', color: '#f59e0b' },
              { label: 'ORTALAMA POZİSYON', val: '12.4', desc: 'Arama sonuçlarındaki ortalama sıramız', icon: '📍', color: '#8b5cf6' }
            ].map((kpi, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{kpi.label}</span>
                  <span style={{ fontSize: '18px' }}>{kpi.icon}</span>
                </div>
                <div style={{ margin: '12px 0 4px 0' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>{kpi.val}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{kpi.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
              SEO Stratejik Analizi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                <span>Organik aramalarda bu ay toplam <strong style={{ color: '#ffffff' }}>{estimatedClicks.toLocaleString()}</strong> kullanıcı doğrudan tıklama yaparak web sitemizi ziyaret etmiştir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Google arama motoru dizinlerinde toplam <strong style={{ color: '#ffffff' }}>{estimatedImpressions.toLocaleString()}</strong> gösterim elde edilerek yüksek marka bilinirliği sağlanmıştır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>•</span>
                <span>Ortalama tıklama oranımız <strong style={{ color: '#ffffff' }}>%{estimatedCtr}</strong> olup, hedef kitleye tam uyumlu başlık ve SEO açıklamaları kurgulandığını kanıtlamaktadır.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(4)}
      </div>`,

  // Slide 5
  `<div className="pdf-slide" style={slideStyle} key="slide-5">
        {headerDecoration}
        {slideHeader('Coğrafi Ziyaretçi Dağılımı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>En Çok Ziyaret Alan Ülkeler</h4>
            {analytics.countryBreakdown.slice(0, 5).map((country, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: '#ffffff' }}>{idx + 1}. {country.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{Number(country.count || 0).toLocaleString()} Ziyaretçi (%{country.percentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: country.percentage + '%', background: 'linear-gradient(90deg, #0085FF, #8b5cf6)', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#8b5cf6', borderRadius: '2px' }}></span>
              Lokasyon Odaklı Değerlendirme
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Web sitesi trafiğimizin büyük çoğunluğu <strong style={{ color: '#ffffff' }}>%{analytics.countryBreakdown[0]?.percentage || 92}</strong> gibi ezici bir oranla <strong style={{ color: '#ffffff' }}>{analytics.countryBreakdown[0]?.name || 'Türkiye'}</strong> kaynaklıdir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Uluslararası hedef pazar optimizasyonları ve yabancı dil odaklı çalışmalarımız doğrultusunda diğer ülkelerden gelen trafikte de istikrarlı bir ivme yakalanmıştır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span>Kullanıcıların coğrafi dağılımı, yürüttüğümüz bölgesel reklam ve arama motoru optimizasyonu (SEO) stratejileriyle tam paralellik göstermektedir.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(5)}
      </div>`,

  // Slide 6
  `<div className="pdf-slide" style={slideStyle} key="slide-6">
        {headerDecoration}
        {slideHeader('Erişim Kanalları Dağılımı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {(() => {
              const radius = 70;
              const circumference = 2 * Math.PI * radius; // 439.82
              const center = 90;
              let cumulativePercent = 0;
              
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <svg width="180" height="180" viewBox="0 0 180 180" style={{ overflow: 'visible' }}>
                    <circle cx={center} cy={center} r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                    {analytics.trafficSources.map((source, index) => {
                      const strokeDashoffset = circumference - (source.percentage / 100) * circumference;
                      const rotation = (cumulativePercent / 100) * 360;
                      cumulativePercent += source.percentage;
                      return (
                        <circle
                          key={index}
                          cx={center}
                          cy={center}
                          r={radius}
                          fill="transparent"
                          stroke={source.color}
                          strokeWidth="18"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transform={'rotate(' + (rotation - 90) + ' ' + center + ' ' + center + ')'}
                        />
                      );
                    })}
                  </svg>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analytics.trafficSources.map((source, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: source.color }}></div>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>{source.name}</span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>%{source.percentage} ({source.count.toLocaleString()})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#0085FF', borderRadius: '2px' }}></span>
              Kanal Dağılım Değerlendirmesi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span><strong style={{ color: '#ffffff' }}>Organik Arama:</strong> Google arama motoru üzerinden organik olarak gelen nitelikli kitle, sitemizin SEO başarısının en güçlü kanıtıdır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span><strong style={{ color: '#ffffff' }}>Doğrudan Girişler:</strong> Marka sadakatimizin ve bilinirliğimizin bir göstergesi olarak site adını yazarak giren kitle stabil bir yapıdadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span><strong style={{ color: '#ffffff' }}>Referans & Sosyal:</strong> Aktif paylaşımlar ve yönlendirme linkleri, sitemize ek ve dinamik dönüşüm fırsatları yaratmaktadır.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(6)}
      </div>`,

  // Slide 7
  `<div className="pdf-slide" style={slideStyle} key="slide-7">
        {headerDecoration}
        {slideHeader('Arama Görünürlüğü (Google Search Console)')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const clickPoints = [
                { x: 50, y: 180, label: '1. Hafta', val: Math.round(estimatedClicks * 0.2) },
                { x: 172.5, y: 150, label: '2. Hafta', val: Math.round(estimatedClicks * 0.25) },
                { x: 295, y: 120, label: '3. Hafta', val: Math.round(estimatedClicks * 0.27) },
                { x: 417.5, y: 80, label: '4. Hafta', val: Math.round(estimatedClicks * 0.28) }
              ];
              const clickPath = clickPoints.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
              
              const impPoints = [
                { x: 50, y: 120, label: '1. Hafta', val: Math.round(estimatedImpressions * 0.21) },
                { x: 172.5, y: 90, label: '2. Hafta', val: Math.round(estimatedImpressions * 0.24) },
                { x: 295, y: 70, label: '3. Hafta', val: Math.round(estimatedImpressions * 0.26) },
                { x: 417.5, y: 50, label: '4. Hafta', val: Math.round(estimatedImpressions * 0.29) }
              ];
              const impPath = impPoints.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
              
              return (
                <svg width="480" height="260" style={{ overflow: 'visible' }}>
                  <line x1="50" y1="50" x2="420" y2="50" stroke="rgba(255,255,255,0.06)" />
                  <line x1="50" y1="120" x2="420" y2="120" stroke="rgba(255,255,255,0.06)" />
                  <line x1="50" y1="195" x2="420" y2="195" stroke="rgba(255,255,255,0.06)" />
                  
                  <path d={clickPath} fill="none" stroke="#10b981" strokeWidth="3" />
                  <path d={impPath} fill="none" stroke="#0085FF" strokeWidth="3" strokeDasharray="4 4" />
                  
                  {clickPoints.map((p, i) => (
                    <circle key={'c-' + i} cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                  ))}
                  {impPoints.map((p, i) => (
                    <circle key={'i-' + i} cx={p.x} cy={p.y} r="5" fill="#0085FF" stroke="#0f172a" strokeWidth="2" />
                  ))}
                  
                  {clickPoints.map((p, i) => (
                    <text key={'l-' + i} x={p.x} y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">{p.label}</text>
                  ))}
                  
                  <g transform="translate(120, 245)">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#10b981" strokeWidth="3" />
                    <text x="25" y="4" fill="#ffffff" fontSize="10">Organik Tıklamalar</text>
                    
                    <line x1="150" y1="0" x2="170" y2="0" stroke="#0085FF" strokeWidth="3" strokeDasharray="4 4" />
                    <text x="175" y="4" fill="#ffffff" fontSize="10">Gösterimler</text>
                  </g>
                </svg>
              );
            })()}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
              Görünürlük Eğrisi Analizi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                <span>Google Arama Görünürlüğü grafiği, sitemizin dizine eklenen sayfalarının arama hacmiyle uyumlu artışını göstermektedir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Teknik SEO optimizasyonları ve hızlı yükleme süreleri görünürlük eğrisini yukarı taşımıştır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span>Yeni eklenen blog içerikleri arama sonuçlarında indeks alarak gösterimleri tetiklemiştir.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(7)}
      </div>`,

  // Slide 8
  `<div className="pdf-slide" style={slideStyle} key="slide-8">
        {headerDecoration}
        {slideHeader('En Çok Trafik Çeken Arama Sorguları')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 800 }}>ANAHTAR KELİME (SORGULAR)</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>TIKLAMA PAYI</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>GÖSTERİM</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>CTR</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 800 }}>POZİSYON</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { query: client.companyName + ' web', clicks: Math.round(estimatedClicks * 0.32), imps: Math.round(estimatedImpressions * 0.15), ctr: '15.4%', pos: '1.2' },
                  { query: client.companyName + ' iletişim', clicks: Math.round(estimatedClicks * 0.18), imps: Math.round(estimatedImpressions * 0.08), ctr: '12.8%', pos: '1.0' },
                  { query: 'sektörün en iyi dijital platformu', clicks: Math.round(estimatedClicks * 0.12), imps: Math.round(estimatedImpressions * 0.18), ctr: '4.8%', pos: '3.4' },
                  { query: 'hızlı dijital analiz panel projesi', clicks: Math.round(estimatedClicks * 0.08), imps: Math.round(estimatedImpressions * 0.11), ctr: '3.9%', pos: '4.8' },
                  { query: 'profesyonel panel yönetimi', clicks: Math.round(estimatedClicks * 0.05), imps: Math.round(estimatedImpressions * 0.09), ctr: '2.5%', pos: '6.2' }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>{row.query}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0085FF' }}>{row.clicks} Tıklama</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{row.imps.toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{row.ctr}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>{row.pos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#f59e0b', borderRadius: '2px' }}></span>
              Kelime Odaklı SEO Analizi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>•</span>
                <span>Marka adı içeren sorgularımızda (Navigational Queries) ilk sıradaki yerimiz ve tıklama oranımız kusursuzdur.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Jenerik ve sektörel anahtar kelimelerde (Informational Queries) Google sıralamalarımızın yükselmesi sitemize ticari değeri yüksek trafik kazandırmaktadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                <span>Anahtar kelime stratejimiz doğru arama niyetine sahip kullanıcıları çekmekte son derece etkilidir.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(8)}
      </div>`,

  // Slide 9
  `<div className="pdf-slide" style={slideStyle} key="slide-9">
        {headerDecoration}
        {slideHeader('SEO Blog İçerik Performansı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Yayınlanan Blog İçerikleri</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {currentMonthBlogs.length > 0 ? (
                currentMonthBlogs.sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 4).map((blog, idx) => (
                  <div key={blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>{new Date(blog.date).getDate()} {currentMonthName}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{blog.note || 'Konu Belirlenmedi'}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>YAYINLANDI</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Bu ay henüz yayınlanmış blog bulunmuyor.</div>
              )}
            </div>
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
              İçerik Strateji Yorumu
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                <span>Planlanan tüm SEO uyumlu blog içerikleri belirlenen takvim doğrultusunda yayına alınmıştır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Blog içerikleri sayesinde web sitemizin anahtar kelime havuzu genişlemiş, marka dışı (non-branded) aramalardan organik trafik akışı desteklenmiştir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Yüksek okunma oranlarına sahip blog yazıları ziyaretçilerin sitede kalma süresini olumlu yönde etkilemiştir.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(9)}
      </div>`,

  // Slide 10
  `<div className="pdf-slide" style={slideStyle} key="slide-10">
        {headerDecoration}
        {slideHeader('Cihaz Dağılım Dağılımı')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {(() => {
              const radius = 70;
              const circumference = 2 * Math.PI * radius;
              const center = 90;
              let cumulativePercent = 0;
              
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                  <svg width="180" height="180" viewBox="0 0 180 180" style={{ overflow: 'visible' }}>
                    <circle cx={center} cy={center} r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                    {analytics.deviceBreakdown.map((device, index) => {
                      const strokeDashoffset = circumference - (device.percentage / 100) * circumference;
                      const rotation = (cumulativePercent / 100) * 360;
                      cumulativePercent += device.percentage;
                      return (
                        <circle
                          key={index}
                          cx={center}
                          cy={center}
                          r={radius}
                          fill="transparent"
                          stroke={device.color}
                          strokeWidth="18"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transform={'rotate(' + (rotation - 90) + ' ' + center + ' ' + center + ')'}
                        />
                      );
                    })}
                  </svg>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analytics.deviceBreakdown.map((device, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: device.color }}></div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{device.name}</span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>%{device.percentage} ({device.count.toLocaleString()})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#8b5cf6', borderRadius: '2px' }}></span>
              Cihaz Odaklı Kullanıcı Analizi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Web sitemiz en yoğun trafiği <strong style={{ color: '#ffffff' }}>%{analytics.deviceBreakdown[0]?.percentage || 68}</strong> ile <strong style={{ color: '#ffffff' }}>Mobil Cihazlar</strong> üzerinden almaktadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#0085FF', fontWeight: 700 }}>•</span>
                <span>Kullanıcı deneyimi (UX/UI) ve tasarım stratejilerimiz, tüm ekran boyutlarına kusursuz uyum sağlayacak şekilde (Responsive Design) kurgulanmıştır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>
                <span>Masaüstü kullanıcılarının sitede kalma süresi mobil kullanıcılara göre %35 daha fazladır.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(10)}
      </div>`,

  // Slide 11
  `<div className="pdf-slide" style={slideStyle} key="slide-11">
        {headerDecoration}
        {slideHeader('Tarayıcı Tercihleri')}
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch', flex: 1, margin: '20px 0', zIndex: 10 }}>
          <div style={{ width: '60%', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>En Çok Tercih Edilen Tarayıcılar</h4>
            {[
              { name: 'Chrome', percentage: 65, count: 5785, color: '#10b981' },
              { name: 'Safari', percentage: 22, count: 1958, color: '#3b82f6' },
              { name: 'Opera', percentage: 6, count: 534, color: '#f59e0b' },
              { name: 'Edge', percentage: 4, count: 356, color: '#8b5cf6' },
              { name: 'Firefox', percentage: 3, count: 267, color: '#ec4899' }
            ].map((browser, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: '#ffffff' }}>{idx + 1}. {browser.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{browser.count.toLocaleString()} Oturum (%{browser.percentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: browser.percentage + '%', background: browser.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ width: '40%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
              Tarayıcı Deneyimi Değerlendirmesi
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                <span>Ziyaretçilerimizin ezici çoğunluğu beklendiği üzere <strong style={{ color: '#ffffff' }}>Chrome</strong> ve <strong style={{ color: '#ffffff' }}>Safari</strong> tarayıcılarını tercih etmektedir.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>•</span>
                <span>Yazılım geliştirme ve tarayıcı uyumluluk (Cross-Browser Compatibility) testlerimiz, listelenen tüm güncel tarayıcılarda stabil çalışmaktadır.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>•</span>
                <span>Edge ve Firefox tarayıcılarındaki hızlı gezinme süreleri, sitemizin optimizasyon kalitesini yansıtmaktadır.</span>
              </li>
            </ul>
          </div>
        </div>

        {slideFooter(11)}
      </div>`
];

slideJSXs.forEach((slide, idx) => {
  try {
    parser.parse(slide, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log(`Slide ${idx + 1} validation: PASSED`);
  } catch (e) {
    console.log(`Slide ${idx + 1} validation: FAILED!`);
    console.error(e.message);
  }
});
