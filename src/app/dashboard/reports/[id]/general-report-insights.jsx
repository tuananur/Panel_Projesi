// Genel raporun 48-50. bölümleri: verinin kendisinden türetilen yorum, aksiyon planı ve özet.
//
// Buradaki metinler dil modeli çıktısı değil; build.js içindeki kurallarla gerçek metriklerden
// üretilir. Ölçüm yoksa cümle de üretilmez, bölüm gizlenir.

import { ReportSection, SourceTag } from './general-report-ui';

const PRIORITY_COLORS = {
  Kritik: { bg: 'rgba(234, 67, 53, 0.12)', border: 'rgba(234, 67, 53, 0.4)', text: '#EA4335' },
  Yüksek: { bg: 'rgba(251, 188, 5, 0.14)', border: 'rgba(251, 188, 5, 0.45)', text: '#B98900' },
  Orta: { bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', text: '#4285F4' },
  Düşük: { bg: 'rgba(120, 120, 120, 0.12)', border: 'var(--border-color)', text: 'var(--text-secondary)' },
};

function SummaryBlock({ title, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '0.88rem', margin: '0 0 0.4rem', color }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

export function buildInsightSections(report) {
  const sections = [];
  const hidden = [];

  // ------------------------------------------------------------------ 48
  if (report.analysis.length > 0) {
    sections.push(
      <ReportSection
        key="s48"
        no={48}
        title="Beyin Atölyesi Analizi"
        sources={['Beyin']}
        note="Her madde yukarıdaki gerçek ölçümlerden üretilir: ne oldu, neden önemli, ne yapılmalı."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {report.analysis.map((item, index) => (
            <div
              key={index}
              style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 0.95rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.92rem' }}>{item.title}</strong>
                <SourceTag source={item.source} />
              </div>
              <p style={{ fontSize: '0.85rem', margin: '0 0 0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ne oldu? </span>{item.what}
              </p>
              <p style={{ fontSize: '0.85rem', margin: '0 0 0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Neden önemli? </span>{item.why}
              </p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ne yapılmalı? </span>{item.todo}
              </p>
            </div>
          ))}
        </div>
      </ReportSection>,
    );
  } else {
    hidden.push({ no: 48, title: 'Beyin Atölyesi Analizi', reason: 'Yorum üretmek için yeterli ölçüm yok' });
  }

  // ------------------------------------------------------------------ 49
  if (report.actions.length > 0) {
    sections.push(
      <ReportSection
        key="s49"
        no={49}
        title="Önceliklendirilmiş Aksiyon Planı"
        sources={['Beyin']}
        note="Öncelik, ölçülen etkiye göre atanır: trafik/tıklama kaybı ve kırık sayfalar kritik, fırsatlar yüksek ve orta."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {report.actions.map((action, index) => {
            const theme = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.Düşük;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  borderRadius: '10px',
                  padding: '0.7rem 0.85rem',
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.text, whiteSpace: 'nowrap', paddingTop: '0.1rem' }}>
                  {action.priority.toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{action.title}</strong>
                    <SourceTag source={action.source} />
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>{action.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>,
    );
  } else {
    hidden.push({ no: 49, title: 'Önceliklendirilmiş Aksiyon Planı', reason: 'Aksiyon üretecek sinyal bulunamadı' });
  }

  // ------------------------------------------------------------------ 50
  const conclusion = report.conclusion;
  const hasConclusion =
    conclusion.good.length > 0 || conclusion.bad.length > 0 || conclusion.opportunities.length > 0 || conclusion.next.length > 0;
  if (hasConclusion) {
    sections.push(
      <ReportSection key="s50" no={50} title="Yönetici Özeti" sources={['Beyin']} note="Dönemin özeti ve önümüzdeki dönem için ilk beş iş.">
        <SummaryBlock title="İyi giden" items={conclusion.good} color="#34A853" />
        <SummaryBlock title="Kötü giden" items={conclusion.bad} color="#EA4335" />
        <SummaryBlock title="Fırsatlar" items={conclusion.opportunities} color="#4285F4" />
        <SummaryBlock title="Gelecek dönem yapılacaklar" items={conclusion.next} color="var(--text-primary)" />
      </ReportSection>,
    );
  } else {
    hidden.push({ no: 50, title: 'Yönetici Özeti', reason: 'Karşılaştırma ve fırsat verisi olmadan özet üretilmiyor' });
  }

  return { sections, hidden };
}
