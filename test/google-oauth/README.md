# Google OAuth — sıfırdan alma + test

Bu klasör **uygulamadan bağımsızdır**. Test bitince silebilirsin.

## 1) Google Cloud’da ne alacaksın?

1. [Google Cloud Console](https://console.cloud.google.com/) → projeni seç
2. **APIs & Services → Library**
   - **Google Analytics Data API** → Enable
   - **Google Search Console API** → Enable
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs’e ekle:
     - `https://developers.google.com/oauthplayground`
4. Oluşan **Client ID** ve **Client Secret**’ı kopyala  
   (Secret’ı sonra değiştirirsen refresh token’ı **yeniden** alman gerekir.)

## 2) OAuth consent screen

1. **OAuth consent screen**
2. Mümkünse **Production** (Testing’de token ~7 günde düşer)
3. Scopes (veya Playground’da seçeceğiz):
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/webmasters.readonly`
4. Testing ise kendi Gmail’ini Test users’a ekle

## 3) Refresh token’ı Playground’dan al

1. Aç: https://developers.google.com/oauthplayground/
2. Sağ üst **dişli (Settings)**
3. **Use your own OAuth credentials** işaretle
4. Az önce aldığın **Client ID** + **Client Secret** yapıştır → Close
5. Sol listeden scope seç (veya alttaki kutuya yapıştır):
   ```
   https://www.googleapis.com/auth/analytics.readonly
   https://www.googleapis.com/auth/webmasters.readonly
   ```
6. **Authorize APIs** → Google hesabını seç → izin ver
7. **Exchange authorization code for tokens**
8. Sağdaki panelden **Refresh token**’ı kopyala  
   (Access token’ı kaydetmene gerek yok.)

## 4) Bu testte nasıl dolduracaksın?

1. `credentials.example.txt` içeriğini zaten `credentials.txt` olarak açtık
2. Şunu doldur:

```txt
CLIENT_ID=xxxxx.apps.googleusercontent.com
CLIENT_SECRET=GOCSPX-xxxxx
REFRESH_TOKEN=1//xxxxx
GA4_PROPERTY_ID=123456789
```

`GA4_PROPERTY_ID` opsiyonel. Sadece token denemek için boş bırakabilirsin.  
Property ID = GA4 Admin → Property Settings → Property ID (**sadece rakam**).

## 5) Testi çalıştır

Proje kökünden:

```bash
node test/google-oauth/test-token.mjs
```

### Sonuçlar

| Çıktı | Anlamı |
|---|---|
| `Access token alındı` | Client ID + Secret + Refresh Token üçlüsü doğru |
| `invalid_grant` | Üçlü uyumsuz / token iptal / Playground kendi client’ını kullanmış |
| Token OK ama GA4 hata | Token doğru, Property ID veya hesap erişimi yanlış |
| `TÜM TESTLER BAŞARILI` | Aynı üçlüyü Dashboard Genel Ayarlar’a koy |

## 6) Uygulamaya koyarken

Dashboard → Genel Ayarlar → Google Analytics:
- Client ID
- Client Secret
- Refresh Token

Sonra müşteri sayfasında:
- GA4 Property ID
- Müşteriye özel eski `analyticsRefreshToken` varsa **boşalt** (override edip eski tokenı kullanmasın)

## Silme

Test bitince tüm klasörü sil:

```bash
# Windows PowerShell (proje kökü)
Remove-Item -Recurse -Force test\google-oauth
```
