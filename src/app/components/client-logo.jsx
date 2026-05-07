'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function ClientLogo({ logoUrl, companyName, size = '40px', borderRadius = '8px', isCircular = false }) {
  const [imgError, setImgError] = useState(false);
  
  // URL bir resim mi yoksa web sitesi mi kontrol et
  let finalSrc = logoUrl;
  
  if (logoUrl && !imgError) {
    const isDirectImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(logoUrl.split('?')[0]);
    
    if (!isDirectImage) {
      // Eğer bir web sitesi linki ise, domaini ayıkla ve servis üzerinden çek
      try {
        const domain = new URL(logoUrl).hostname.replace('www.', '');
        finalSrc = `https://logo.clearbit.com/${domain}`;
      } catch (e) {
        // Geçersiz URL ise domain olarak kabul etmeyi dene
        if (logoUrl.includes('.')) {
          finalSrc = `https://logo.clearbit.com/${logoUrl.replace('www.', '')}`;
        }
      }
    }
  }

  if (!logoUrl || imgError) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: isCircular ? '50%' : borderRadius, 
        background: 'var(--accent-primary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: parseInt(size) > 35 ? '1.2rem' : '0.85rem', 
        fontWeight: 800, 
        color: 'white', 
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        {companyName ? companyName[0].toUpperCase() : <User size={parseInt(size) * 0.5} />}
      </div>
    );
  }
  
  return (
    <img 
      src={finalSrc} 
      alt={companyName} 
      onError={() => setImgError(true)}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: isCircular ? '50%' : borderRadius, 
        objectFit: 'contain', // Logoların kesilmemesi için contain daha iyi
        padding: '2px',
        border: '1px solid rgba(255,255,255,0.1)', 
        flexShrink: 0,
        backgroundColor: 'white' // Çoğu logo beyaz arka planda daha iyi durur
      }} 
    />
  );
}
