// Genel raporun 48-50. bölümleri: veriden türetilen yorum, aksiyon planı ve özet.

import { ReportSection, SourceTag, ImpactBadge } from './general-report-ui';

function SummaryCard({ title, items, tone }) {
  if (!items || items.length === 0) return null;
  const tones = {
    good: { bg: 'rgba(52, 168, 83, 0.08)', border: 'rgba(52, 168, 83, 0.35)', title: '#34A853' },
    bad: { bg: 'rgba(234, 67, 53, 0.08)', border: 'rgba(234, 67, 53, 0.35)', title: '#EA4335' },
    opportunity: { bg: 'rgba(66, 133, 244, 0.08)', border: 'rgba(66, 133, 244, 0.35)', title: '#4285F4' },
    next: { bg: 'var(--bg-secondary)', border: 'var(--border-color)', title: 'var(--text-primary)' },
  };
  const theme = tones[tone] || tones.next;
  return (
    <div style={{ marginBottom: '0.75rem', padding: '0.85rem', borderRadius: '10px', background: theme.bg, border: `1px solid ${theme.border}` }}>
      <h3 style={{ fontSize: '0.88rem', margin: '0 0 0.4rem', color: theme.title }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

export function buildInsightSections(report) {
  const sections = [];
  const hidden = [];

  if (report.analysis.length > 0) {
    sections.push(
      <ReportSection
        key="s48"
        no={48}
        title="Beyin Atölyesi Analizi"
        sources={['Beyin']}
        note="Her madde yukarıdaki gerçek ölçümlerden üretilir: ne oldu, neden önemli, ne yapılmalı."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {report.analysis.map((item, index) => (
            <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 0.95rem' }}>
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

  if (report.actions.length > 0) {
    sections.push(
      <ReportSection
        key="s49"
        no={49}
        title="Önceliklendirilmiş Aksiyon Planı"
        sources={['Beyin']}
        note="Öncelik, ölçülen etkiye göre atanır."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {report.actions.map((action, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.7rem 0.85rem',
              }}
            >
              <ImpactBadge value={action.priority} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem' }}>{action.title}</strong>
                  <SourceTag source={action.source} />
                </div>
                <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>{action.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>,
    );
  } else {
    hidden.push({ no: 49, title: 'Önceliklendirilmiş Aksiyon Planı', reason: 'Aksiyon üretecek sinyal bulunamadı' });
  }

  const conclusion = report.conclusion;
  const hasConclusion =
    conclusion.good.length > 0 || conclusion.bad.length > 0 || conclusion.opportunities.length > 0 || conclusion.next.length > 0;
  if (hasConclusion) {
    sections.push(
      <ReportSection key="s50" no={50} title="Yönetici Özeti" sources={['Beyin']} note="Dönemin özeti ve önümüzdeki dönem için ilk işler.">
        <SummaryCard title="İyi giden" items={conclusion.good} tone="good" />
        <SummaryCard title="Kötü giden" items={conclusion.bad} tone="bad" />
        <SummaryCard title="Fırsatlar" items={conclusion.opportunities} tone="opportunity" />
        <SummaryCard title="Gelecek dönem yapılacaklar" items={conclusion.next} tone="next" />
      </ReportSection>,
    );
  } else {
    hidden.push({ no: 50, title: 'Yönetici Özeti', reason: 'Karşılaştırma ve fırsat verisi olmadan özet üretilmiyor' });
  }

  return { sections, hidden };
}
