'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function ClientLogo({ logoUrl, companyName, size = '40px', borderRadius = '8px', isCircular = false }) {
  const [imgError, setImgError] = useState(0); // 0: ok, 1: clearbit failed, 2: google failed
  
  // URL bir resim mi yoksa web sitesi mi kontrol et
  let finalSrc = logoUrl;
  
  if (logoUrl && imgError < 2) {
    // Başına https:// ekleyerek URL'yi normalize et (eğer yoksa)
    let normalizedUrl = logoUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const isDirectImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(normalizedUrl.split('?')[0]);
    
    if (!isDirectImage) {
      try {
        const urlObj = new URL(normalizedUrl);
        const domain = urlObj.hostname.replace('www.', '');
        
        // Instagram Kontrolü
        if (domain.includes('instagram.com')) {
          const username = urlObj.pathname.split('/').filter(p => p).pop();
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
        const lowerUrl = logoUrl.toLowerCase();
        if (lowerUrl.includes('instagram.com')) {
          const parts = lowerUrl.split('/');
          const username = parts[parts.length - 1] || parts[parts.length - 2];
          finalSrc = `https://unavatar.io/instagram/${username}`;
        } else {
          const cleanDomain = logoUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
          finalSrc = imgError === 0 
            ? `https://logo.clearbit.com/${cleanDomain}` 
            : `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
        }
      }
    } else {
      finalSrc = normalizedUrl;
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
    <img 
      key={finalSrc} // Link değişince resmi yeniden yükle
      src={finalSrc} 
      alt={companyName} 
      onError={() => setImgError(prev => prev + 1)}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: isCircular ? '50%' : borderRadius, 
        objectFit: 'contain', 
        padding: '2px',
        border: '1px solid rgba(255,255,255,0.1)', 
        flexShrink: 0,
        backgroundColor: 'white'
      }} 
    />
  );
}
