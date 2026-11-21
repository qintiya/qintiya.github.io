import html
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime, timezone

BASE_URL = "https://qintiya.github.io/"
MAX_PAGES = 200
OUTPUT_XML = "sitemap.xml"
OUTPUT_HTML = "sitemap.html"


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    clean_path = parsed.path if parsed.path else "/"
    return f"{parsed.scheme}://{parsed.netloc}{clean_path}".rstrip("/") + ("/" if clean_path == "/" else "")


def crawl_site(start_url: str, max_pages: int = 200):
    domain = urlparse(start_url).netloc
    visited = set()
    queue = [normalize_url(start_url)]
    pages = []

    headers = {"User-Agent": "Mozilla/5.0 (compatible; QintiyaSitemapBot/1.0)"}

    while queue and len(visited) < max_pages:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)

        try:
            resp = requests.get(current, headers=headers, timeout=10)
            content_type = resp.headers.get("Content-Type", "")
            if resp.status_code != 200 or "text/html" not in content_type:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag and title_tag.get_text(strip=True) else current

            meta_desc = soup.find("meta", attrs={"name": "description"})
            desc = ""
            if meta_desc and meta_desc.get("content"):
                desc = meta_desc["content"].strip()
            else:
                first_p = soup.find("p")
                desc = first_p.get_text(" ", strip=True)[:140] if first_p else title

            pages.append({
                "url": current,
                "title": title,
                "desc": desc,
                "lastmod": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            })

            for link in soup.find_all("a", href=True):
                href = link["href"].strip()
                if href.startswith(("mailto:", "tel:", "javascript:", "#")):
                    continue
                full_url = normalize_url(urljoin(current, href))
                parsed_full = urlparse(full_url)
                if parsed_full.netloc == domain and full_url not in visited and full_url not in queue:
                    # Abaikan file aset umum
                    if not parsed_full.path.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js", ".pdf", ".zip")):
                        queue.append(full_url)

        except requests.RequestException as err:
            print(f"[Skip] {current} -> {err}")

    return pages


def write_xml(pages, filename=OUTPUT_XML):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for p in pages:
        lines.extend([
            "  <url>",
            f"    <loc>{html.escape(p['url'])}</loc>",
            f"    <lastmod>{p['lastmod']}</lastmod>",
            "    <changefreq>weekly</changefreq>",
            "    <priority>0.8</priority>",
            "  </url>",
        ])
    lines.append("</urlset>")

    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Berhasil membuat {filename} ({len(pages)} URL)")


def write_html(pages, filename=OUTPUT_HTML):
    cards_html = []
    for idx, p in enumerate(pages, start=1):
        safe_url = html.escape(p["url"])
        safe_title = html.escape(p["title"])
        safe_desc = html.escape(p["desc"])
        speech_text = html.escape(f"{p['title']}. {p['desc']}")
        cards_html.append(f"""
        <article class="card" data-search="{html.escape((p['title'] + ' ' + p['desc'] + ' ' + p['url']).lower())}">
          <div class="card-top">
            <span class="badge">#{idx}</span>
            <span class="date">{p['lastmod']}</span>
          </div>
          <h2 class="card-title"><a href="{safe_url}" target="_blank" rel="noopener noreferrer">{safe_title}</a></h2>
          <p class="card-desc">{safe_desc}</p>
          <div class="card-url">{safe_url}</div>
          <div class="card-actions">
            <a class="btn btn-primary" href="{safe_url}" target="_blank" rel="noopener noreferrer" data-i18n="visit">Buka Halaman</a>
            <button type="button" class="btn btn-audio" onclick="speakText(this, `{speech_text}`)">
              🔊 <span data-i18n="listen">Dengarkan</span>
            </button>
          </div>
        </article>
        """)

    html_content = f"""<!DOCTYPE html>
<html lang="id" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sitemap</title><meta content='ca-pub-5407249785989200' name='google-adsense-account'/><script async='async' crossorigin='anonymous' src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5407249785989200'/>
     <script async='async' custom-element='amp-auto-ads' src='https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js'>
     </script><meta content='TpufMzu2Lm0-sEKEqVrEAxhVCdMJojkl9TlO0Fff064' name='google-site-verification'/>
<meta content='gbPa2MRABFiJSWv4hIj24aNn2MTRfi7W96fncHPziHI' name='google-site-verification'/>
  <style>
    :root {{
      --bg: #0b1020;
      --surface: #121930;
      --surface-2: #192342;
      --text: #eef2ff;
      --muted: #9fb0d6;
      --border: rgba(255, 255, 255, 0.1);
      --accent: #6366f1;
      --accent-2: #22d3ee;
      --shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }}
    html[data-theme="light"] {{
      --bg: #f4f7fb;
      --surface: #ffffff;
      --surface-2: #eef2f8;
      --text: #0f172a;
      --muted: #475569;
      --border: rgba(15, 23, 42, 0.12);
      --accent: #4f46e5;
      --accent-2: #0284c7;
      --shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 45%), var(--bg);
      color: var(--text);
      min-height: 100vh;
      transition: background 0.25s ease, color 0.25s ease;
    }}
    .container {{
      max-width: 1160px;
      margin: 0 auto;
      padding: 28px 18px 60px;
    }}
    header {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }}
    .top-bar {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }}
    h1 {{
      margin: 0;
      font-size: clamp(1.4rem, 3vw, 2.1rem);
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .subtitle {{
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }}
    .controls {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }}
    select, input, button, a.btn {{
      font: inherit;
    }}
    select, input {{
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      outline: none;
    }}
    input {{
      flex: 1 1 260px;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      cursor: pointer;
      text-decoration: none;
      color: var(--text);
      background: var(--surface-2);
      transition: transform 0.15s ease, opacity 0.2s ease, background 0.2s ease;
    }}
    .btn:hover {{ transform: translateY(-1px); }}
    .btn-primary {{
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
      border: none;
      font-weight: 600;
    }}
    .btn-audio.playing {{
      background: #10b981;
      color: #fff;
      border-color: transparent;
    }}
    .stats {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.88rem;
      color: var(--muted);
    }}
    .grid {{
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 18px;
    }}
    .card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }}
    .card-top {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--muted);
    }}
    .badge {{
      background: var(--surface-2);
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
    }}
    .card-title {{
      margin: 0;
      font-size: 1.08rem;
      line-height: 1.35;
    }}
    .card-title a {{
      color: var(--text);
      text-decoration: none;
    }}
    .card-title a:hover {{
      color: var(--accent-2);
    }}
    .card-desc {{
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }}
    .card-url {{
      font-size: 0.78rem;
      color: var(--accent-2);
      word-break: break-all;
    }}
    .card-actions {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }}
    #google_translate_element {{
      min-height: 32px;
    }}
    @media (max-width: 600px) {{
      header {{ padding: 18px; }}
      .controls {{ width: 100%; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="top-bar">
        <div>
          <h1 data-i18n="title">Peta Situs — qintiya.github.io</h1>
          <p class="subtitle" data-i18n="subtitle">Daftar halaman otomatis, responsif, multi-bahasa &amp; audio.</p>
        </div>
        <div class="controls">
          <select id="langSelect" aria-label="Language" onchange="changeLanguage(this.value)">
            <option value="id">🇮🇩 Indonesia</option>
            <option value="en">🇺🇸 English</option>
            <option value="ja">🇯🇵 日本語</option>
          </select>
          <button type="button" class="btn" id="themeBtn" onclick="toggleTheme()">🌙 <span data-i18n="theme">Mode Terang</span></button>
          <button type="button" class="btn" onclick="stopSpeech()">⏹️ <span data-i18n="stopAudio">Stop Audio</span></button>
        </div>
      </div>

      <div class="controls">
        <input type="search" id="searchInput" placeholder="Cari judul, deskripsi, atau URL..." oninput="filterCards()" />
        <a class="btn" href="sitemap.xml" target="_blank">XML Sitemap</a>
        <div id="google_translate_element"></div>
      </div>

      <div class="stats">
        <span><strong id="visibleCount">{len(pages)}</strong> / {len(pages)} <span data-i18n="pagesFound">halaman</span></span>
        <span>•</span>
        <span>Updated: {datetime.now(timezone.utc).strftime("%Y-%m-%d")}</span>
      </div>
    </header>

    <main class="grid" id="cardsGrid">
      {''.join(cards_html)}
    </main>
  </div>

  <script>
    const i18nMap = {{
      id: {{
        title: "Peta Situs — qintiya.github.io",
        subtitle: "Daftar halaman otomatis, responsif, multi-bahasa & audio.",
        theme: "Mode Terang",
        stopAudio: "Stop Audio",
        pagesFound: "halaman",
        visit: "Buka Halaman",
        listen: "Dengarkan",
        searchPlaceholder: "Cari judul, deskripsi, atau URL...",
        ttsLang: "id-ID"
      }},
      en: {{
        title: "Sitemap — qintiya.github.io",
        subtitle: "Automatic page index, responsive, multi-language & audio.",
        theme: "Light Mode",
        stopAudio: "Stop Audio",
        pagesFound: "pages",
        visit: "Open Page",
        listen: "Listen",
        searchPlaceholder: "Search title, description, or URL...",
        ttsLang: "en-US"
      }},
      ja: {{
        title: "サイトマップ — qintiya.github.io",
        subtitle: "自動生成ページ一覧・レスポンシブ・多言語・音声再生対応",
        theme: "ライトモード",
        stopAudio: "音声停止",
        pagesFound: "ページ",
        visit: "ページを開く",
        listen: "聴く",
        searchPlaceholder: "タイトル・説明・URLを検索...",
        ttsLang: "ja-JP"
      }}
    }};

    let currentLang = localStorage.getItem("site_lang") || "id";
    let activeAudioBtn = null;

    function applyTranslations(lang) {{
      const dict = i18nMap[lang] || i18nMap.id;
      document.querySelectorAll("[data-i18n]").forEach(el => {{
        const key = el.getAttribute("data-i18n");
        if (dict[key]) el.textContent = dict[key];
      }});
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.placeholder = dict.searchPlaceholder;
      document.documentElement.lang = lang;
    }}

    function changeLanguage(lang) {{
      currentLang = lang;
      localStorage.setItem("site_lang", lang);
      applyTranslations(lang);
      // Sinkronkan dengan Google Translate combo jika sudah termuat
      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect) {{
        gtSelect.value = lang;
        gtSelect.dispatchEvent(new Event("change"));
      }}
    }}

    function setTheme(theme) {{
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("site_theme", theme);
      const btn = document.getElementById("themeBtn");
      if (btn) {{
        btn.innerHTML = theme === "dark"
          ? '☀️ <span data-i18n="theme">Mode Terang</span>'
          : '🌙 <span data-i18n="theme">Mode Gelap</span>';
        applyTranslations(currentLang);
      }}
    }}

    function toggleTheme() {{
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    }}

    function filterCards() {{
      const q = document.getElementById("searchInput").value.trim().toLowerCase();
      const cards = document.querySelectorAll(".card");
      let shown = 0;
      cards.forEach(card => {{
        const hay = card.getAttribute("data-search") || "";
        const match = !q || hay.includes(q);
        card.style.display = match ? "" : "none";
        if (match) shown++;
      }});
      document.getElementById("visibleCount").textContent = shown;
    }}

    function stopSpeech() {{
      if ("speechSynthesis" in window) {{
        window.speechSynthesis.cancel();
      }}
      if (activeAudioBtn) {{
        activeAudioBtn.classList.remove("playing");
        activeAudioBtn = null;
      }}
    }}

    function speakText(btn, text) {{
      if (!("speechSynthesis" in window)) {{
        alert("Browser kamu belum mendukung Web Speech API.");
        return;
      }}
      const wasSame = activeAudioBtn === btn && window.speechSynthesis.speaking;
      stopSpeech();
      if (wasSame) return;

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = (i18nMap[currentLang] && i18nMap[currentLang].ttsLang) || "id-ID";
      utter.rate = 1.0;
      activeAudioBtn = btn;
      btn.classList.add("playing");

      utter.onend = () => {{
        btn.classList.remove("playing");
        if (activeAudioBtn === btn) activeAudioBtn = null;
      }};
      utter.onerror = () => {{
        btn.classList.remove("playing");
        if (activeAudioBtn === btn) activeAudioBtn = null;
      }};

      window.speechSynthesis.speak(utter);
    }}

    function googleTranslateElementInit() {{
      new google.translate.TranslateElement({{
        pageLanguage: "id",
        includedLanguages: "id,en,ja,ko,ms,ar,fr,de,es",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      }}, "google_translate_element");
    }}

    // Inisialisasi awal
    const savedTheme = localStorage.getItem("site_theme") || "dark";
    setTheme(savedTheme);
    document.getElementById("langSelect").value = currentLang;
    applyTranslations(currentLang);
  </script>
  <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</body>
</html>
"""

    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Berhasil membuat {filename}")


if __name__ == "__main__":
    found_pages = crawl_site(BASE_URL, max_pages=MAX_PAGES)
    if not found_pages:
        found_pages = [{
            "url": BASE_URL,
            "title": "Qintiya GitHub Pages",
            "desc": "Halaman utama situs qintiya.github.io",
            "lastmod": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }]
    write_xml(found_pages)
    write_html(found_pages)
