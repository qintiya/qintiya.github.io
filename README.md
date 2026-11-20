# AWDEV — Web Development, Free Online Tools, Islamic Utilities, Multimedia Gallery & Tech/Islamic Blog

Dokumentasi arsitektur proyek **AWDEV** yang modular, siap produksi, modern, dan ramah SEO. Platform ini menggabungkan utilitas web berbasis peramban (*client-side*), perangkat ibadah & utilitas Islami, galeri multimedia interaktif (30 gambar & 30 video), direktori pembelajaran & mitra ekosistem, monetisasi Google AdSense, serta arsip blog SEO berskala besar (30 kategori × 30 artikel = 900 entri terindeks dan *template* artikel panjang 3.000 kata).

---

## Ringkasan Fitur & Arsitektur

* **Identitas & Navigasi Global:** Logo SVG kustom **AWDEV**, *sticky navbar* dengan *dropdown* multi-level, pengalih multi-bahasa (`id`, `en`, `ar` dengan dukungan *Right-to-Left* / RTL otomatis untuk bahasa Arab), *Dark/Light Mode* tersimpan di `localStorage`, serta pemutar audio global (*floating audio bar* & *Text-to-Speech* `speechSynthesis`).
* **Monetisasi Google AdSense:** Skrip utama di `<head>` serta **3 slot iklan terstruktur** per halaman (`Slot 1: Top / Below Header`, `Slot 2: In-Article / Mid-Content`, `Slot 3: Bottom / Above Footer`) dengan wadah CSS anti-*Cumulative Layout Shift* (CLS).
* **Galeri Multimedia Interaktif:** **30 kartu gambar** (dengan *lightbox preview*, judul, deskripsi, tombol *Share*, dan *Copy Link/Prompt* + *toast* `"Copied!"`) serta **30 kartu video** (pemutar HTML5 / *embed* responsif, judul, deskripsi, tombol *Share*, dan *Copy Video URL* + *toast*).
* **Katalog & Mesin Tools Aktif:**
  * **35 Developer, Network & Utility Tools** (mencakup *Code Editor*, *DNS Web Checker* via `https://dns.google`, *Maps Finder* & *Maps Country Finder* via Leaflet/OpenStreetMap & REST Countries API, *Hash Generator* via `crypto.subtle`, *Canvas* *Favicon/Image Compressor/QR/Calligraphy*, dll.).
  * **36 Islamic Tools & Utilities** (mencakup *Arabic Keyboard*, *Calligraphy Tools*, *Mosque Finder* & *Maps School Islamic Finder*, *Log your daily prayers*, *Zakat*, *Automatic Prayer Times* via Aladhan API, *Qibla Direction Finder*, *Digital Al-Qur'an & Translation* + *Murottal* via Al-Qur'an Cloud API, *Faraidh*, *Gregorian-Hijri Converter*, *Digital Tasbih*, *Hajj & Umrah Guide*, *Qurbani*, dll.).
* **Blog SEO (30 Kategori × 30 Artikel = 900 Struktur Artikel):** Arsip kategori dinamis dan *template* artikel 3.000 kata lengkap dengan metadata SEO, JSON-LD `Article` + `FAQPage`, *Table of Contents* (TOC) otomatis dari `<h2>`/`<h3>`, tabel perbandingan, blok kode dengan tombol *Copy*, 3 slot AdSense, akordion FAQ, *Related Posts*, dan tombol *Share*.
* **Halaman Wajib & Direktori Ekosistem:** *Home*, *About Us*, *Tools Directory*, *Contact Us*, *Privacy Policy*, *Terms & Conditions*, *Custom 404 Page*, **20 situs E-Learning**, dan **24 Partners**.

---

## Struktur Direktori Proyek

```text
awdev/
├── README.md
├── index.html
├── article-template.html
├── 404.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── tools-engine.js
│       ├── islamic-engine.js
│       └── blog-data.js
└── pages/
    ├── about.html
    ├── tools-directory.html
    ├── contact.html
    ├── privacy-policy.html
    └── terms-and-conditions.html
