'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function ClientLogo({ logoUrl, companyName, size = '80px', borderRadius = '8px', isCircular = false }) {
  const [imgError, setImgError] = useState(0); // 0: ok, 1: clearbit failed, 2: google failed
  
  // URL bir resim mi yoksa web sitesi mi kontrol et
  let finalSrc = logoUrl;
  
  if (logoUrl && imgError < 2) {
    // URL bir resim mi yoksa web sitesi mi kontrol et
    let normalizedUrl = logoUrl.trim();
    
    // Eğer nokta (.) veya @ içermiyorsa muhtemelen geçerli bir link/alan adı değildir
    if (!normalizedUrl.includes('.') && !normalizedUrl.startsWith('@')) {
      setImgError(2); // Doğrudan fallback'e düşür
    }
    else if (normalizedUrl.startsWith('@')) {
      const username = normalizedUrl.substring(1);
      if (imgError === 0) {
        finalSrc = `https://unavatar.io/instagram/${username}`;
      } else {
        // Instagram username için favicon denemeye gerek yok, doğrudan fallback'e düş
        setImgError(2);
      }
    } 
    else {
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const isDirectImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(normalizedUrl.split('?')[0]);
      
      if (!isDirectImage) {
        try {
          const urlObj = new URL(normalizedUrl);
          const domain = urlObj.hostname.replace('www.', '');
          
          if (domain.includes('instagram.com')) {
            const username = urlObj.pathname.split('/').filter(p => p && p !== 'reels' && p !== 'p').pop();
            if (username) {
              finalSrc = `https://unavatar.io/instagram/${username}`;
            }
          } 
          else if (imgError === 0) {
            finalSrc = `https://logo.clearbit.com/${domain}`;
          } else {
            finalSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          }
        } catch (e) {
          const cleanDomain = normalizedUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
          if (cleanDomain.includes('.')) {
            finalSrc = imgError === 0 
              ? `https://logo.clearbit.com/${cleanDomain}` 
              : `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
          } else {
            setImgError(2);
          }
        }
      } else {
        finalSrc = normalizedUrl;
      }
    }
  }

  if (!logoUrl || imgError >= 2) {
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
    <div style={{
      width: size,
      height: size,
      borderRadius: isCircular ? '50%' : borderRadius,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <img 
        key={finalSrc} 
        src={finalSrc} 
        alt={companyName} 
        onError={() => setImgError(prev => prev + 1)}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain', 
          padding: '2px',
          display: imgError > 0 ? 'none' : 'block' // İlk deneme başarısızsa resmi gizle
        }} 
      />
    </div>
  );
}
