# Ubersuggest snapshot ingest testleri

## 1. Doğrulama testi (DB gerekmez)

```bash
node test/ubersuggest/validation.test.mjs
```

Payload doğrulamayı, null korumayı, tekilleştirmeyi ve enum eşlemeyi kontrol eder.

## 2. Entegrasyon testi (gerçek DB gerekir)

```bash
# DATABASE_URL ortamda yoksa .env / .env.local dosyasından okunur
$env:DATABASE_URL="postgresql://..."   # PowerShell
node test/ubersuggest/ingest.test.mjs
```

Test kendi geçici müşterisini (`__ubersuggest_test__`) ve `ubersuggest-ingest-test.invalid`
domainini kullanır, sonunda müşteriyi siler (snapshot'lar cascade ile gider). Mevcut müşteri
verilerine dokunmaz.

Doğruladıkları: alt kayıtların doğru snapshot'a bağlanması, eksik metriklerin null kalması,
aynı `snapshotDate` için duplicate açılmaması, farklı tarihin ayrı satır olması, alt kayıt
yazımı patladığında transaction'ın geri alınması, bilinmeyen `clientId`'nin reddedilmesi.

## 3. Endpoint'i elle deneme

```bash
curl -X POST http://localhost:3000/api/integrations/ubersuggest/snapshots \
  -H "Authorization: Bearer $UBERSUGGEST_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"clientId":7,"domain":"ornek.com","snapshotDate":"2026-09-01","overview":{"organicKeywordsCount":128}}'
```

`UBERSUGGEST_INGEST_SECRET` tanımlı değilse endpoint 503 `INGEST_SECRET_NOT_CONFIGURED` döner.
