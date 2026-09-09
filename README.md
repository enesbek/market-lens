# MarketLens 🔍
### Türkiye Pazaryerleri (Trendyol & Hepsiburada) Kampanya Kârlılık ve Birim İktisadı (Unit Economics) Simülatörü

MarketLens; Trendyol ve Hepsiburada satıcılarının pazaryerleri tarafından önerilen kampanyalara (Sepette % İndirim, Flaş İndirimler, Baremli İndirimler, Kuponlar, 2. Ürüne İndirim vb.) girmeden önce, kampanyanın ürün bazında **gerçek net kârına**, **kargo baremi maliyetlerine**, **komisyon kesintilerine** ve **başa baş satış hedeflerine** etkisini şeffaf bir şekilde hesaplayan yeni nesil bir e-ticaret entegrasyon ve kârlılık simülasyon platformudur.

---

## 🚀 Öne Çıkan Özellikler

1. **Canlı What-If Kampanya Simülatörü (Playground)**
   - Satış fiyatı, alış maliyeti (COGS), desi ve indirim oranlarını anlık değiştirerek **Normal Satış vs. Kampanyalı Satış** karşılaştırması.
   - **Gider Kırılım Şelalesi**: Fiyat içerisindeki Komisyon, Kargo, Hizmet Bedeli, KDV ve Alış Maliyeti yüzdeleri.

2. **Kargo Barem Tuzağı Algılama (Free Shipping Trap Detection)**
   - Türkiye pazaryerlerinde 200 TL kargo bareminin altına inen ürünlerde aniden satıcıya binen kargo masraflarını ve kâr erimesini anında tespit eder.

3. **Başa Baş (Break-Even Elasticity) Satış Çarpanı**
   - Fiyatı %15 indirdiğinizde, eski toplam kârınızı korumak için satış hacminizi kaç katına (ör. 2.3x) ve kaç adede çıkarmanız gerektiğini hesaplar.

4. **Toplu Katalog Analizi (Batch Simulator)**
   - Trendyol veya Hepsiburada'da açılan resmi bir kampanyayı mağazadaki tüm envantere tek tıkla uygular.
   - Ürünleri **🟢 Kârlı / Uygun**, **🟡 Düşük Marjlı**, **⚠️ Barem Tuzağı** ve **🔴 Zararına Satış** olarak gruplar; CSV çıktısı verir.

5. **Akıllı Kârlılık Danışmanı (Advisor Radar)**
   - Zarar eden ve riskli barem altına inen ürünler için liste fiyatı artırma veya kampanya formatı değiştirme önerileri sunar.

6. **Pazaryeri & Tarife Entegrasyonu**
   - Trendyol ve Hepsiburada güncel kategori komisyon oranları ve anlaşmalı desi kargo tarifeleri.

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm (v9+)

### Hızlı Başlangıç

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm run install:all
   ```

2. **Geliştirme Sunucusunu Başlatın (Server & Client Birlikte):**
   ```bash
   npm run dev
   ```
   - **Frontend (Client):** `http://localhost:5173`
   - **Backend API (Server):** `http://localhost:4000`

---

## 📁 Proje Mimarisi

```
market-lens/
├── server/                      # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── engines/             # Türkiye E-Ticaret Finans Motorları
│   │   │   ├── commissionEngine.ts   # Kategori bazlı Trendyol/HB komisyon tarifeleri
│   │   │   ├── shippingEngine.ts     # Desi & Barem eşikli kargo hesaplayıcı
│   │   │   ├── taxEngine.ts          # KDV, Tevkifat ve Stopaj muhasebesi
│   │   │   └── simulationEngine.ts   # Birim İktisadı, marj ve başa baş motoru
│   │   ├── routes/              # API Uç Noktaları (Ürünler, Kampanyalar, Simülasyon)
│   │   ├── data/                # Mock mağaza envanteri ve resmi kampanya havuzu
│   │   └── index.ts             # Express sunucusu
│   └── package.json
├── client/                      # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar ve Pazaryeri Seçici
│   │   │   ├── simulator/       # Canlı What-If Hesaplayıcı ve Karşılaştırma
│   │   │   ├── campaigns/       # Toplu Kampanya Analizi ve Kampanya Havuzu
│   │   │   ├── products/        # Ürün Kataloğu ve Maliyet (COGS) Yöneticisi
│   │   │   ├── advisor/         # Barem Tuzağı ve Risk Radarı
│   │   │   └── marketplaces/    # Pazaryeri Entegrasyonları ve Komisyon Tablosu
│   │   ├── services/            # API istemcisi
│   │   ├── types/               # Tip tanımlamaları
│   │   └── App.tsx
│   └── package.json
└── package.json                 # Kök script yöneticisi
```

---

## 📊 API Uç Noktaları

| Metod | Uç Nokta | Açıklama |
|---|---|---|
| `GET` | `/api/products` | Tüm ürünleri temel birim kârlılıkları ile listeler |
| `POST` | `/api/products` | Yeni ürün ekler (fiyat, maliyet, desi, kategori) |
| `GET` | `/api/campaigns` | Pazaryeri kampanya havuzunu listeler |
| `POST` | `/api/simulate/playground` | Anlık serbest parametrelerle kampanya simülasyonu yapar |
| `POST` | `/api/simulate/batch` | Bir kampanyayı tüm envantere toplu simüle eder |
| `GET` | `/api/simulate/insights` | Mağaza geneli barem tuzaklarını ve riskleri listeler |
| `GET` | `/api/marketplaces` | Pazaryeri entegrasyon durumları ve komisyon listesini döner |
