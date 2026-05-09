'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const ATATURK_QUOTES = [
  "Ne mutlu Türk'üm diyene!",
  "İstikbal göklerdedir.",
  "Egemenlik kayıtsız şartsız milletindir.",
  "Hayatta en hakiki mürşit ilimdir.",
  "Türk, Öğün, Çalış, Güven.",
  "Yurtta sulh, cihanda sulh.",
  "Bütün ümidim gençliktedir.",
  "Sanatsız kalan bir milletin hayat damarlarından biri kopmuş demektir.",
  "Milletin bağrından temiz bir nesil yetişiyor. Bu eseri ona bırakacağım ve gözüm arkada kalmayacak.",
  "Vatanını en çok seven görevini en iyi yapandır.",
  "Bir millet eğitim ordusuna sahip olmadıkça, savaş meydanlarında ne kadar parlak zaferler elde ederse etsin, o zaferlerin kalıcı sonuçlar vermesi ancak eğitim ordusuyla mümkündür.",
  "Bizim gerçek dostumuz, bizi kırmayan değil, bize gerçeği söyleyendir.",
  "Özgürlük ve bağımsızlık benim karakterimdir.",
  "Gençler, cesaretimizi takviye ve idame eden sizlersiniz. Siz, almakta olduğunuz terbiye ve irfan ile insanlık ve medeniyetin, vatan sevgisinin, fikir hürriyetinin en kıymetli timsali olacaksınız."
];

const MOTIVATIONAL_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Hayallerinize ulaşmak için yapmanız gereken tek şey, vazgeçmemektir.",
  "Gelecek, bugünden ona hazırlananlarındır.",
  "Zorluklar, başarının değerini artıran süslerdir.",
  "Engeller, gözünüzü hedeften ayırdığınızda gördüğünüz korkunç şeylerdir.",
  "Hiç kimse başarı merdivenlerini elleri cebinde tırmanmamıştır.",
  "Başlamak için mükemmel olmak zorunda değilsin ama mükemmel olmak için başlamak zorundasın.",
  "Yarınlar yorgun olanların değil, rahatından vazgeçenlerin olacaktır."
];

export default function DailyQuote() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Merge lists, but prioritize Atatürk (he gets more spots or we pick from him mostly)
    // Actually, let's just combine them and pick based on day of year
    const allQuotes = [...ATATURK_QUOTES, ...MOTIVATIONAL_QUOTES];
    
    // For a daily effect, we can use the date as a seed
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Pick from Atatürk more often (e.g. 70% of the time)
    const isAtaturk = (dayOfYear % 10) < 7; // 70% chance
    
    if (isAtaturk) {
      setQuote(ATATURK_QUOTES[dayOfYear % ATATURK_QUOTES.length]);
    } else {
      setQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
    }
  }, []);

  if (!quote) return null;

  return (
    <div 
      className="glass-panel animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        padding: '1rem 1.5rem',
        maxWidth: '320px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        borderLeft: '4px solid var(--accent-primary)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(16px)',
        pointerEvents: 'none' // Don't block clicks underneath
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
        <Quote size={16} />
        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Günün Sözü</span>
      </div>
      <p style={{ 
        fontSize: '0.85rem', 
        fontWeight: 500, 
        lineHeight: 1.5, 
        fontStyle: 'italic',
        color: 'var(--text-primary)'
      }}>
        "{quote}"
      </p>
    </div>
  );
}
