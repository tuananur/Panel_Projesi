'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const ATATURK_QUOTES = [
  { text: "Ne mutlu Türk'üm diyene!", author: "Mustafa Kemal Atatürk" },
  { text: "İstikbal göklerdedir.", author: "Mustafa Kemal Atatürk" },
  { text: "Egemenlik kayıtsız şartsız milletindir.", author: "Mustafa Kemal Atatürk" },
  { text: "Hayatta en hakiki mürşit ilimdir.", author: "Mustafa Kemal Atatürk" },
  { text: "Türk, Öğün, Çalış, Güven.", author: "Mustafa Kemal Atatürk" },
  { text: "Yurtta sulh, cihanda sulh.", author: "Mustafa Kemal Atatürk" },
  { text: "Bütün ümidim gençliktedir.", author: "Mustafa Kemal Atatürk" },
  { text: "Sanatsız kalan bir milletin hayat damarlarından biri kopmuş demektir.", author: "Mustafa Kemal Atatürk" },
  { text: "Vatanını en çok seven görevini en iyi yapandır.", author: "Mustafa Kemal Atatürk" },
  { text: "Bizim gerçek dostumuz, bizi kırmayan değil, bize gerçeği söyleyendir.", author: "Mustafa Kemal Atatürk" },
  { text: "Özgürlük ve bağımsızlık benim karakterimdir.", author: "Mustafa Kemal Atatürk" },
  { text: "Gençler, cesaretimizi takviye ve idame eden sizlersiniz.", author: "Mustafa Kemal Atatürk" },
];

const MOTIVATIONAL_QUOTES = [
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Anonim" },
  { text: "Hayallerinize ulaşmak için yapmanız gereken tek şey, vazgeçmemektir.", author: "Anonim" },
  { text: "Gelecek, bugünden ona hazırlananlarındır.", author: "Anonim" },
  { text: "Zorluklar, başarının değerini artıran süslerdir.", author: "Anonim" },
  { text: "Hiç kimse başarı merdivenlerini elleri cebinde tırmanmamıştır.", author: "Anonim" },
  { text: "Başlamak için mükemmel olmak zorunda değilsin ama mükemmel olmak için başlamak zorundasın.", author: "Anonim" },
  { text: "Yarınlar yorgun olanların değil, rahatından vazgeçenlerin olacaktır.", author: "Anonim" },
  { text: "Engeller, gözünüzü hedeften ayırdığınızda gördüğünüz korkunç şeylerdir.", author: "Anonim" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const isAtaturk = (dayOfYear % 10) < 7;

    if (isAtaturk) {
      setQuote(ATATURK_QUOTES[dayOfYear % ATATURK_QUOTES.length]);
    } else {
      setQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
    }
  }, []);

  if (!quote) return null;

  return (
    <div
      className="glass-panel animate-fade-in daily-quote-header"
      style={{
        padding: '0.45rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
        borderLeft: '3px solid var(--accent-primary)',
        borderRight: 'none',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(12px)',
        maxWidth: 'min(240px, 42vw)',
        minWidth: 0,
        pointerEvents: 'none',
        flexShrink: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', justifyContent: 'flex-start' }}>
        <Quote size={11} />
        <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Günün Sözü</span>
      </div>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 500,
        lineHeight: 1.35,
        fontStyle: 'italic',
        color: 'var(--text-primary)',
        textAlign: 'left',
        margin: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        "{quote.text}"
      </p>
      <p style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        color: 'var(--accent-primary)',
        textAlign: 'left',
        margin: 0,
        opacity: 0.85,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        — {quote.author}
      </p>
    </div>
  );
}
