from pathlib import Path
import json
import shutil
import textwrap

# Folder output situs.
OUTPUT = Path("awdev-site")
(OUTPUT / "assets").mkdir(parents=True, exist_ok=True)

# Daftar kategori artikel dan direktori tools.
categories = [
    "HTML & CSS", "JavaScript", "Frontend", "Backend", "Source Code",
    "Code Snippet", "Web Tools", "Code Editor", "Generator",
    "Developer Tools", "Web Apps", "UI/UX Design", "Web Design",
    "Color Palette", "Icons & Fonts", "Visual Assets",
    "Video & Multimedia", "Open Source", "GitHub", "Cloud & Hosting",
    "Web Security", "SEO & Performance", "Tutorials", "E-Learning",
    "Tips & Tricks", "Documentation", "Resources", "Projects",
    "Tech News", "Community",
]

developer_tools = [
    "HTML/CSS/JS Minifier", "Code Beautifier / Formatter",
    "Live HTML/CSS/JS Editor", "JSON Validator & Viewer",
    "Regex Tester", "Base64 Encoder / Decoder", "URL Encoder / Decoder",
    "HTML Entity Encoder / Decoder", "Color Picker & Palette Generator",
    "CSS Gradient Generator", "CSS Box Shadow Generator",
    "CSS Border Radius Generator", "Glassmorphism CSS Generator",
    "CSS Grid / Flexbox Generator", "Favicon Generator", "Meta Tag Generator",
    "Robots.txt Generator", "XML Sitemap Generator", "UTM Link Builder",
    "Parse HTML Tool", "Word & Character Counter", "Case Converter",
    "Lorem Ipsum Generator", "Text Diff Checker",
    "Markdown to HTML Converter", "QR Code Generator",
    "Strong Password Generator", "Hash Generator (MD5, SHA-256)",
    "Image Compressor & Resizer", "Unix Timestamp Converter",
]

islamic_tools = [
    "Automatic Prayer Times", "Qibla Direction Finder",
    "Digital Al-Qur'an & Translation", "Al-Qur'an Audio Recitation (Murottal)",
    "Zakat al-Mal Calculator", "Zakat al-Fitr Calculator",
    "Income / Professional Zakat Calculator",
    "Gold & Silver Zakat Calculator",
    "Islamic Inheritance Calculator (Faraidh)",
    "Gregorian to Hijri Date Converter",
    "Hijri Calendar & Islamic Holidays", "Digital Tasbih (Dhikr Counter)",
    "Daily Duas & Morning/Evening Adhkar", "Asmaul Husna (99 Names of Allah)",
    "Al-Qur'an Verse & Keyword Search", "Hadith Search Engine",
    "Missed Prayer (Qadha) Tracker", "Missed Fasting & Fidyah Calculator",
    "Ramadan Imsakiyah Schedule", "Ramadan & Eid Countdown",
    "Islamic Quote & Greeting Card Generator",
    "Online Arabic Virtual Keyboard",
    "Latin to Arabic Transliteration Tool",
    "Real-Time Zakat Nisab Calculator", "Interactive Hajj & Umrah Guide",
    "Al-Qur'an Khatam Tracker",
    "Daily Worship Tracker (Mutaba'ah Yaumiyah)",
    "Islamic Baby Names Directory", "Qurbani & Share Calculator",
    "Nearby Mosque Locator",
]

learning_sites = [
    ("freeCodeCamp", "https://freecodecamp.org"),
    ("W3Schools", "https://w3schools.com"),
    ("MDN Web Docs", "https://developer.mozilla.org"),
    ("The Odin Project", "https://theodinproject.com"),
    ("Codecademy", "https://codecademy.com"),
    ("Coursera", "https://coursera.org"),
    ("edX", "https://edx.org"),
    ("Udemy", "https://udemy.com"),
    ("Khan Academy", "https://khanacademy.org"),
    ("CS50 Harvard", "https://cs50.harvard.edu"),
    ("LeetCode", "https://leetcode.com"),
    ("HackerRank", "https://hackerrank.com"),
    ("Exercism", "https://exercism.org"),
    ("SoloLearn", "https://sololearn.com"),
    ("Frontend Mentor", "https://frontendmentor.io"),
    ("CSS-Tricks", "https://css-tricks.com"),
    ("GeeksforGeeks", "https://geeksforgeeks.org"),
    ("Roadmap.sh", "https://roadmap.sh"),
    ("Scrimba", "https://scrimba.com"),
    ("Pluralsight", "https://pluralsight.com"),
]

partners = [
    ("Product Hunt", "https://producthunt.com"),
    ("AlternativeTo", "https://alternativeto.net"),
    ("SaaSHub", "https://saashub.com"),
    ("Indie Hackers", "https://indiehackers.com"),
    ("BetaList", "https://betalist.com"),
    ("GitHub", "https://github.com"),
    ("DEV Community", "https://dev.to"),
    ("Hashnode", "https://hashnode.com"),
    ("CodePen", "https://codepen.io"),
    ("StackShare", "https://stackshare.io"),
    ("Petani Kode", "https://petanikode.com"),
    ("Dicoding", "https://dicoding.com"),
    ("CodePolitan", "https://codepolitan.com"),
    ("Kelas Terbuka", "https://youtube.com"),
    ("Niagahoster", "https://niagahoster.co.id"),
    ("DomaiNesia", "https://domainesia.com"),
    ("IDCloudHost", "https://idcloudhost.com"),
    ("DigitalOcean", "https://digitalocean.com"),
    ("Cloudflare", "https://cloudflare.com"),
    ("Quran.com", "https://quran.com"),
    ("Muslim Pro", "https://muslimpro.com"),
    ("Rumaysho", "https://rumaysho.com"),
    ("NU Online", "https://nu.or.id"),
    ("BAZNAS", "https://baznas.go.id"),
]

# Data situs ditulis sebagai JSON yang valid dan dibaca oleh app.js.
data_js = (
    "window.AWDEV_DATA = "
    + json.dumps(
        {
            "categories": categories,
            "developerTools": developer_tools,
            "islamicTools": islamic_tools,
            "learningSites": learning_sites,
            "partners": partners,
        },
        ensure_ascii=False,
        indent=2,
    )
    + ";\n"
)

index_html = r"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f7fb">
  <meta name="description" content="AWDEV offers free online developer tools, Islamic utilities, and coding resources.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://awdev.eu.org/">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="AWDEV — Free Developer Tools & Islamic Utilities">
  <meta property="og:description" content="Explore free developer tools, Islamic utilities, and coding resources.">
  <meta property="og:url" content="https://awdev.eu.org/">
  <meta property="og:type" content="website">
  <meta name="google-adsense-account" content="ca-pub-5407249785989200">
  <meta name="google-site-verification" content="gbPa2MRABFiJSWv4hIj24aNn2MTRfi7W96fncHPziHI">
  <title>AWDEV — Free Developer Tools & Islamic Utilities</title>

  <!-- AdSense loader: include once per page. -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5407249785989200" crossorigin="anonymous"></script>
  <!-- Google Tag Manager script provided for this site. -->
  <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-PMLF34B9"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
  </script>

  <link rel="stylesheet" href="/style.css">
  <script defer src="/data.js"></script>
  <script defer src="/app.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="AWDEV home">
        <span class="brand-mark" aria-hidden="true">A</span><span>AW<span class="accent">DEV</span></span>
      </a>
      <button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="nav">☰</button>
      <nav id="nav" class="nav" aria-label="Main navigation">
        <a href="#home">Home</a><a href="#developer-tools">Web Tools</a>
        <a href="#islamic-tools">Islamic Tools</a><a href="#learn">Learn</a>
        <a href="#partners">Partners</a><a href="/pages/about.html">About</a>
      </nav>
      <div class="header-actions">
        <label class="sr-only" for="toolSearch">Search tools</label>
        <input id="toolSearch" type="search" placeholder="Search tools…">
        <button id="themeToggle" class="icon-button" type="button" aria-label="Toggle theme">☾</button>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="hero" id="home">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow">TOOLS · LEARNING · COMMUNITY</p>
          <h1>Build better. Learn freely. <span class="accent">Do good.</span></h1>
          <p class="lead">Practical web tools, thoughtful Islamic utilities, and trusted learning resources — free to explore.</p>
          <div class="actions">
            <a class="button primary" href="#developer-tools">Explore Tools</a>
            <a class="button secondary" href="#learn">Learn Coding</a>
          </div>
          <div class="stats"><span><b>60</b> Free tools</span><span><b>30</b> Categories</span><span><b>Open</b> For everyone</span></div>
        </div>
        <div class="hero-card" aria-label="Code example">
          <div class="window-dots">● <i>●</i> <em>●</em><span>awdev.eu.org</span></div>
          <pre><code><b>const</b> ideas = [
  <i>"build"</i>,
  <i>"learn"</i>,
  <i>"share"</i>
];

<span>// useful tools, made simple</span></code></pre>
        </div>
      </div>
    </section>

    <div class="container ad-wrap">
      <!-- ADSENSE SLOT 1 -->
      <ins class="adsbygoogle ad-unit" style="display:block"
        data-ad-client="ca-pub-5407249785989200" data-ad-slot="3805519345"
        data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    <section class="section" id="developer-tools">
      <div class="container">
        <div class="section-title"><div><p class="eyebrow">THE TOOLBOX</p><h2>Developer & Web Tools</h2>
          <p>Small utilities for everyday building and debugging.</p></div></div>
        <div id="categoryFilters" class="filters" aria-label="Filter developer tools"></div>
        <div id="developerToolGrid" class="tool-grid"></div>
        <div class="ad-wrap">
          <!-- ADSENSE SLOT 2 -->
          <ins class="adsbygoogle ad-unit" style="display:block;text-align:center"
            data-ad-layout="in-article" data-ad-format="fluid"
            data-ad-client="ca-pub-5407249785989200" data-ad-slot="8835759835"></ins>
        </div>
      </div>
    </section>

    <section class="section tinted" id="islamic-tools">
      <div class="container">
        <div class="section-title"><div><p class="eyebrow">MINDFUL UTILITIES</p>
          <h2>Islamic Tools</h2><p>Utilities for worship, learning, and everyday planning.</p></div></div>
        <div id="islamicToolGrid" class="tool-grid"></div>
      </div>
    </section>

    <section class="section" id="learn">
      <div class="container"><div class="section-title"><div><p class="eyebrow">KEEP GROWING</p>
        <h2>Learn & Explore</h2><p>Places to practice, study, and sharpen your skills.</p></div></div>
        <div id="learningGrid" class="resource-grid"></div>
      </div>
    </section>

    <section class="section tinted" id="partners">
      <div class="container"><div class="section-title"><div><p class="eyebrow">ECOSYSTEM</p>
        <h2>Community & Partners</h2><p>Technology and Islamic learning platforms.</p></div></div>
        <div id="partnersGrid" class="resource-grid"></div>
      </div>
    </section>

    <section class="section" id="about">
      <div class="container about">
        <div><p class="eyebrow">ABOUT AWDEV</p><h2>Useful tools should be easy to reach.</h2></div>
        <div><p>AWDEV is a growing directory of browser-based developer utilities, Islamic resources, and coding education links. Our goal is to make useful resources approachable, fast, and available to everyone.</p>
          <a class="text-link" href="/pages/about.html">More about AWDEV →</a></div>
      </div>
    </section>

    <section class="section tinted" id="contact">
      <div class="container contact-grid">
        <div><p class="eyebrow">SAY HELLO</p><h2>Contact AWDEV</h2>
          <p>Send a message using your email application.</p>
          <a href="mailto:hello@awdev.eu.org">hello@awdev.eu.org</a>
        </div>
        <form id="contactForm" class="contact-form">
          <label for="contactName">Name</label><input id="contactName" required maxlength="100">
          <label for="contactEmail">Email</label><input id="contactEmail" type="email" required maxlength="200">
          <label for="contactMessage">Message</label><textarea id="contactMessage" rows="5" required maxlength="3000"></textarea>
          <button class="button primary" type="submit">Open email app</button>
          <small>This form prepares an email on your device; it does not send data to a server.</small>
        </form>
      </div>
    </section>

    <div class="container ad-wrap">
      <!-- ADSENSE SLOT 3 -->
      <ins class="adsbygoogle ad-unit" style="display:block"
        data-ad-format="autorelaxed" data-ad-client="ca-pub-5407249785989200"
        data-ad-slot="6209596494"></ins>
    </div>
  </main>

  <footer class="footer">
    <div class="container footer-grid">
      <div><a class="brand" href="/"><span class="brand-mark">A</span><span>AW<span class="accent">DEV</span></span></a>
        <p>Free tools and resources for a better web.</p></div>
      <div><b>Explore</b><a href="#developer-tools">Web tools</a><a href="#islamic-tools">Islamic tools</a><a href="#learn">Learning</a></div>
      <div><b>Information</b><a href="/pages/about.html">About</a><a href="/pages/contact.html">Contact</a>
        <a href="/pages/privacy.html">Privacy policy</a><a href="/pages/terms.html">Terms</a></div>
      <div><b>Social</b><a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
    </div>
    <div class="container copyright">© <span id="year"></span> AWDEV. All rights reserved.</div>
  </footer>

  <dialog id="toolDialog" class="dialog">
    <div class="dialog-head"><div><p id="dialogCategory" class="eyebrow">AWDEV TOOL</p><h2 id="dialogTitle"></h2></div>
      <button id="dialogClose" class="icon-button" aria-label="Close dialog">✕</button></div>
    <div id="dialogContent" class="dialog-content"></div>
  </dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <script>
    window.addEventListener('load', function () {
      document.querySelectorAll('.adsbygoogle').forEach(function () {
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
      });
    });
  </script>
</body>
</html>
"""

style_css = r"""/* AWDEV responsive design and light/dark theme */
:root{color-scheme:light;--bg:#f5f7fb;--surface:#fff;--soft:#eef2f8;--text:#172033;--muted:#657087;--line:#e0e6ef;--primary:#5b5de6;--shadow:0 12px 35px #16234112}
[data-theme=dark]{color-scheme:dark;--bg:#10131d;--surface:#191e2b;--soft:#202738;--text:#edf1fa;--muted:#a4aec2;--line:#30394c;--primary:#9293ff;--shadow:0 12px 35px #0004}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:inherit}button,input,textarea{font:inherit}.container{width:min(1120px,calc(100% - 36px));margin:auto}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.skip-link{position:absolute;left:-999px}.skip-link:focus{left:10px;z-index:20;background:var(--surface);padding:10px}
.site-header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.header-inner{min-height:72px;display:flex;align-items:center;gap:22px}.brand{display:flex;align-items:center;gap:9px;text-decoration:none;font-size:1.2rem;font-weight:850;letter-spacing:-.05em}.brand-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--primary);color:white}.accent{color:var(--primary)}.nav{display:flex;gap:18px;margin-left:auto}.nav a,.footer a{color:var(--muted);text-decoration:none;font-size:.9rem}.nav a:hover,.footer a:hover{color:var(--primary)}.header-actions{display:flex;gap:8px}.header-actions input,.contact-form input,.contact-form textarea,.tool-field{border:1px solid var(--line);border-radius:10px;padding:9px 11px;background:var(--bg);color:var(--text)}.header-actions input{width:155px}.icon-button,.menu-toggle{background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:10px;min-width:40px;min-height:40px;cursor:pointer}.menu-toggle{display:none}
.hero{padding:76px 0 64px}.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:55px;align-items:center}.eyebrow{font-size:.73rem;font-weight:800;letter-spacing:.15em;color:var(--primary);margin:0 0 9px}.hero h1{font-size:clamp(2.5rem,6vw,4.4rem);line-height:1.04;letter-spacing:-.06em;margin:0 0 20px}.lead{font-size:1.1rem;color:var(--muted);max-width:620px}.actions{display:flex;gap:12px;margin:25px 0}.button{border:1px solid var(--line);border-radius:11px;padding:10px 15px;display:inline-flex;justify-content:center;text-decoration:none;font-weight:700;cursor:pointer}.primary{background:var(--primary);border-color:var(--primary);color:white}.secondary{background:var(--surface)}.stats{display:flex;gap:25px;color:var(--muted);font-size:.88rem}.stats b{color:var(--text);margin-right:4px}.hero-card{background:#1b2238;color:#f2f5ff;border-radius:22px;box-shadow:var(--shadow);overflow:hidden;transform:rotate(1deg)}.window-dots{padding:16px 20px;border-bottom:1px solid #ffffff20;color:#fa7378}.window-dots i{color:#ffd166}.window-dots em{color:#52d29a}.window-dots span{float:right;color:#aab4cf;font-style:normal;font-size:.8rem}.hero-card pre{padding:18px 26px;font-size:1rem;line-height:1.8;overflow:auto}.hero-card code b{color:#c4a4ff}.hero-card code i{color:#a5e8b1}.hero-card code span{color:#8490a9}
.section{padding:70px 0}.tinted{background:var(--soft)}.section-title{margin-bottom:24px}.section-title h2,.about h2,.contact-grid h2{font-size:clamp(1.8rem,3vw,2.4rem);line-height:1.15;letter-spacing:-.04em;margin:0 0 8px}.section-title p:not(.eyebrow),.about p,.contact-grid p{color:var(--muted)}.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}.filter-chip{border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:30px;padding:7px 12px;cursor:pointer}.filter-chip.active{background:var(--primary);border-color:var(--primary);color:white}.tool-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.tool-card,.resource-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 5px 18px #16234108}.tool-card{min-height:176px;display:flex;flex-direction:column}.tool-card h3{font-size:1rem;margin:10px 0 4px}.tool-card p{color:var(--muted);font-size:.87rem;margin:0 0 15px}.tool-card .button{align-self:flex-start;margin-top:auto;padding:7px 11px;font-size:.85rem}.tool-icon{font-size:1.2rem}.tool-category{float:right;color:var(--muted);font-size:.73rem}.resource-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.resource-card{text-decoration:none;display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:64px;font-weight:650}.resource-card:hover{border-color:var(--primary)}.resource-card span:last-child{color:var(--primary)}.about,.contact-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:45px}.contact-form{display:grid;gap:8px}.contact-form label{font-weight:700;font-size:.9rem}.contact-form textarea{resize:vertical}.contact-form small{color:var(--muted)}.ad-wrap{min-height:110px;display:grid;place-items:center;margin:20px auto}.ad-unit{width:100%;min-height:90px}.footer{padding:42px 0 16px;background:var(--surface);border-top:1px solid var(--line)}.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:28px}.footer-grid>div{display:flex;flex-direction:column;align-items:flex-start;gap:8px}.footer-grid p{color:var(--muted);font-size:.88rem}.footer-grid b{font-size:.9rem}.copyright{border-top:1px solid var(--line);padding-top:14px;margin-top:27px;color:var(--muted);font-size:.83rem}
.dialog{width:min(620px,calc(100% - 24px));max-height:85vh;background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:var(--shadow)}.dialog::backdrop{background:#080c16aa;backdrop-filter:blur(3px)}.dialog-head{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid var(--line);padding-bottom:13px;margin-bottom:16px}.dialog-head h2{margin:0;font-size:1.4rem}.dialog-content{display:grid;gap:11px}.dialog-content label{font-size:.9rem;font-weight:700}.tool-output{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px;overflow-wrap:anywhere;white-space:pre-wrap}.dialog-content textarea{min-height:100px;resize:vertical}.counter-number{text-align:center;font-size:2rem;font-weight:800}.toast{position:fixed;bottom:18px;left:50%;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:var(--text);color:var(--bg);padding:9px 15px;border-radius:30px;transition:.2s}.toast.visible{opacity:1;transform:translate(-50%,0)}
@media(max-width:950px){.header-inner{flex-wrap:wrap;padding:10px 0}.nav{order:4;width:100%;justify-content:center}.tool-grid{grid-template-columns:repeat(2,1fr)}.resource-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:650px){.hero{padding:48px 0}.hero-grid,.about,.contact-grid{grid-template-columns:1fr;gap:26px}.hero-card{transform:none}.menu-toggle{display:block}.header-inner{gap:9px}.nav{display:none;justify-content:flex-start;flex-wrap:wrap}.nav.open{display:flex}.header-actions{margin-left:auto}.header-actions input{width:120px}.tool-grid{grid-template-columns:1fr}.resource-grid{grid-template-columns:repeat(2,1fr)}.section{padding:52px 0}.footer-grid{grid-template-columns:repeat(2,1fr)}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
"""

app_js = r"""/* AWDEV interactions and browser-side tool demos. */
(() => {
  "use strict";
  const data = window.AWDEV_DATA;
  const $ = (selector) => document.querySelector(selector);
  const toast = (message) => {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("visible"), 1800);
  };

  const descriptions = {
    "Word & Character Counter": "Count words, characters, sentences, paragraphs, and estimated reading time.",
    "Strong Password Generator": "Generate a random password in your browser.",
    "Base64 Encoder / Decoder": "Encode text to Base64 or decode Base64 back to text.",
    "Digital Tasbih (Dhikr Counter)": "Count dhikr and save your count in this browser."
  };

  const iconFor = (name) => {
    const icons = {
      "Word & Character Counter": "📝",
      "Strong Password Generator": "🔐",
      "Base64 Encoder / Decoder": "🔁",
      "Digital Tasbih (Dhikr Counter)": "📿",
      "Automatic Prayer Times": "🕌",
      "Qibla Direction Finder": "🧭",
      "JSON Validator & Viewer": "{ }",
      "Color Picker & Palette Generator": "🎨",
      "Live HTML/CSS/JS Editor": "💻"
    };
    return icons[name] || "✦";
  };

  function createToolCard(name, type) {
    const card = document.createElement("article");
    card.className = "tool-card";
    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.textContent = iconFor(name);
    const category = document.createElement("span");
    category.className = "tool-category";
    category.textContent = type === "dev" ? "Developer" : "Islamic";
    const title = document.createElement("h3");
    title.textContent = name;
    const desc = document.createElement("p");
    desc.textContent = descriptions[name] || (type === "dev"
      ? "A practical utility for your everyday web workflow."
      : "A helpful utility for worship, learning, and planning.");
    const button = document.createElement("button");
    button.className = "button primary";
    button.type = "button";
    button.textContent = "Open Tool";
    button.addEventListener("click", () => openTool(name, type));
    card.append(icon, category, title, desc, button);
    card.dataset.search = name.toLowerCase();
    return card;
  }

  function renderTools(query = "", filter = "All") {
    const devGrid = $("#developerToolGrid");
    const islamicGrid = $("#islamicToolGrid");
    devGrid.replaceChildren();
    islamicGrid.replaceChildren();
    const matches = (name) =>
      name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" || name.toLowerCase().includes(filter.toLowerCase()));
    data.developerTools.filter(matches).forEach(name => devGrid.append(createToolCard(name, "dev")));
    data.islamicTools.filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .forEach(name => islamicGrid.append(createToolCard(name, "islamic")));
    [devGrid, islamicGrid].forEach(grid => {
      if (!grid.children.length) {
        const empty = document.createElement("p");
        empty.className = "tool-card";
        empty.textContent = "No tools match your search.";
        grid.append(empty);
      }
    });
  }

  function renderResources(items, target) {
    const root = $(target);
    items.forEach(([name, url]) => {
      const link = document.createElement("a");
      link.className = "resource-card";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const label = document.createElement("span");
      label.textContent = name;
      const arrow = document.createElement("span");
      arrow.textContent = "↗";
      link.append(label, arrow);
      root.append(link);
    });
  }

  function addField(parent, labelText, element) {
    const label = document.createElement("label");
    label.textContent = labelText;
    parent.append(label, element);
    return element;
  }

  function makeInput(placeholder = "") {
    const input = document.createElement("textarea");
    input.className = "tool-field";
    input.placeholder = placeholder;
    return input;
  }

  function openTool(name, type) {
    const dialog = $("#toolDialog");
    const content = $("#dialogContent");
    $("#dialogTitle").textContent = name;
    $("#dialogCategory").textContent = type === "dev" ? "DEVELOPER TOOL" : "ISLAMIC TOOL";
    content.replaceChildren();

    if (name === "Word & Character Counter") {
      const input = addField(content, "Paste or type text", makeInput("Start typing…"));
      const output = document.createElement("div");
      output.className = "tool-output";
      const update = () => {
        const value = input.value;
        const words = value.trim() ? value.trim().split(/\s+/).length : 0;
        const sentences = (value.match(/[.!?]+/g) || []).length;
        const paragraphs = value.trim() ? value.trim().split(/\n\s*\n/).length : 0;
        output.textContent = `Words: ${words} · Characters: ${value.length} · Sentences: ${sentences} · Paragraphs: ${paragraphs} · Reading time: ${Math.max(1, Math.ceil(words / 200))} min`;
      };
      input.addEventListener("input", update);
      content.append(output);
      update();
    } else if (name === "Strong Password Generator") {
      const lengthLabel = document.createElement("label");
      lengthLabel.textContent = "Password length: ";
      const length = document.createElement("input");
      length.type = "number"; length.min = "8"; length.max = "128"; length.value = "20";
      length.className = "tool-field";
      lengthLabel.append(length);
      const output = document.createElement("div");
      output.className = "tool-output";
      const button = document.createElement("button");
      button.className = "button primary"; button.textContent = "Generate password";
      button.addEventListener("click", () => {
        const size = Math.max(8, Math.min(128, Number(length.value) || 20));
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
        const random = new Uint32Array(size);
        crypto.getRandomValues(random);
        output.textContent = Array.from(random, n => chars[n % chars.length]).join("");
      });
      const copy = document.createElement("button");
      copy.className = "button"; copy.textContent = "Copy";
      copy.addEventListener("click", async () => {
        if (output.textContent) {
          await navigator.clipboard.writeText(output.textContent);
          toast("Copied!");
        }
      });
      content.append(lengthLabel, button, output, copy);
      button.click();
    } else if (name === "Base64 Encoder / Decoder") {
      const input = addField(content, "Text or Base64", makeInput("Enter text…"));
      const output = document.createElement("div");
      output.className = "tool-output";
      const encode = document.createElement("button");
      encode.className = "button primary"; encode.textContent = "Encode";
      encode.addEventListener("click", () => {
        try { output.textContent = btoa(unescape(encodeURIComponent(input.value))); }
        catch (_) { output.textContent = "Could not encode the supplied text."; }
      });
      const decode = document.createElement("button");
      decode.className = "button"; decode.textContent = "Decode";
      decode.addEventListener("click", () => {
        try { output.textContent = decodeURIComponent(escape(atob(input.value.trim()))); }
        catch (_) { output.textContent = "Invalid Base64 input."; }
      });
      content.append(input, encode, decode, output);
    } else if (name === "Digital Tasbih (Dhikr Counter)") {
      const key = "awdev-tasbih-count";
      let count = Number(localStorage.getItem(key)) || 0;
      const number = document.createElement("div");
      number.className = "counter-number";
      const update = () => { number.textContent = String(count); localStorage.setItem(key, String(count)); };
      const increment = document.createElement("button");
      increment.className = "button primary"; increment.textContent = "Count dhikr";
      increment.addEventListener("click", () => { count += 1; update(); });
      const reset = document.createElement("button");
      reset.className = "button"; reset.textContent = "Reset";
      reset.addEventListener("click", () => { count = 0; update(); });
      content.append(number, increment, reset);
      update();
    } else {
      const note = document.createElement("p");
      note.className = "tool-output";
      note.textContent = "This tool is listed in the AWDEV directory. Its interactive implementation can be added as a separate module.";
      content.append(note);
    }

    if (!dialog.open) dialog.showModal();
  }

  // Search and category filters.
  let activeFilter = "All";
  const filters = $("#categoryFilters");
  ["All", "HTML", "CSS", "JavaScript", "SEO", "Text"].forEach(category => {
    const button = document.createElement("button");
    button.className = "filter-chip" + (category === "All" ? " active" : "");
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => {
      activeFilter = category;
      filters.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
      renderTools($("#toolSearch").value, activeFilter);
    });
    filters.append(button);
  });
  $("#toolSearch").addEventListener("input", event => renderTools(event.target.value, activeFilter));

  // Theme preference.
  const savedTheme = localStorage.getItem("awdev-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("awdev-theme", next);
  });

  // Mobile navigation and modal.
  $("#menuToggle").addEventListener("click", event => {
    const nav = $("#nav");
    const isOpen = nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  });
  $("#dialogClose").addEventListener("click", () => $("#toolDialog").close());
  $("#toolDialog").addEventListener("click", event => {
    if (event.target === $("#toolDialog")) $("#toolDialog").close();
  });

  // Contact form opens an email draft; it does not submit to a server.
  $("#contactForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#contactName").value.trim();
    const email = $("#contactEmail").value.trim();
    const message = $("#contactMessage").value.trim();
    const subject = encodeURIComponent("AWDEV website message");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    location.href = `mailto:hello@awdev.eu.org?subject=${subject}&body=${body}`;
  });

  $("#year").textContent = new Date().getFullYear();
  renderTools();
  renderResources(data.learningSites, "#learningGrid");
  renderResources(data.partners, "#partnersGrid");
})();
"""

favicon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="16" fill="#5b5de6"/>
<path d="M12 48 28 14h9l16 34H41l-3-7H26l-3 7zm17-15h6l-3-8z" fill="#fff"/>
</svg>"""

# Tulis file proyek.
files = {
    "index.html": index_html,
    "style.css": style_css,
    "app.js": app_js,
    "data.js": data_js,
    "robots.txt": "User-agent: *\nAllow: /\nSitemap: https://awdev.eu.org/sitemap.xml\n",
    "ads.txt": "google.com, pub-5407249785989200, DIRECT, f08c47fec0942fa0\n",
    "assets/favicon.svg": favicon_svg,
    "google-site-verification": "google-site-verification: googled2bd44ef72717048.html\n",
}

for relative_path, content in files.items():
    path = OUTPUT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

# Buat halaman statis dasar.
page_template = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-5407249785989200">
  <meta name="google-site-verification" content="gbPa2MRABFiJSWv4hIj24aNn2MTRfi7W96fncHPziHI">
  <title>{title} | AWDEV</title>
  <link rel="canonical" href="https://awdev.eu.org/pages/{slug}.html">
  <link rel="stylesheet" href="/style.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5407249785989200" crossorigin="anonymous"></script>
</head>
<body>
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="/"><span class="brand-mark">A</span><span>AW<span class="accent">DEV</span></span></a>
    <nav class="nav"><a href="/">Home</a><a href="/#developer-tools">Web Tools</a><a href="/#islamic-tools">Islamic Tools</a></nav>
  </div></header>
  <main class="section"><article class="container legal-card">
    <p class="eyebrow">AWDEV · INFORMATION</p><h1>{title}</h1>
    {content}
    <p><a class="button primary" href="/">Back to home</a></p>
  </article></main>
  <footer class="footer"><div class="container copyright">© AWDEV</div></footer>
</body></html>
"""

pages = {
    "about": (
        "About Us",
        "<p>AWDEV is a directory of browser-based developer utilities, Islamic resources, and coding education links. Our goal is to make practical resources easy to discover.</p>",
    ),
    "contact": (
        "Contact Us",
        '<p>Email: <a href="mailto:hello@awdev.eu.org">hello@awdev.eu.org</a></p>',
    ),
    "privacy": (
        "Privacy Policy",
        "<p>Some preferences and demo tool data may be stored locally in your browser. External links and advertising providers have their own privacy policies. Do not enter sensitive information into public tools.</p>",
    ),
    "terms": (
        "Terms & Conditions",
        "<p>AWDEV tools and information are provided for general educational use. Verify important technical, financial, legal, and religious decisions with qualified sources.</p>",
    ),
}

for slug, (title, content) in pages.items():
    page_path = OUTPUT / "pages" / f"{slug}.html"
    page_path.parent.mkdir(parents=True, exist_ok=True)
    page_path.write_text(
        page_template.format(slug=slug, title=title, content=content),
        encoding="utf-8",
    )

# Halaman 404 statis.
(OUTPUT / "404.html").write_text(
    page_template.format(
        slug="404",
        title="Page not found",
        content="<p>The page you requested could not be found.</p>",
    ),
    encoding="utf-8",
)

# Sitemap statis untuk domain.
urls = [
    "https://awdev.eu.org/",
    *[f"https://awdev.eu.org/pages/{slug}.html" for slug in pages],
]
sitemap_body = "\n".join(
    f"  <url><loc>{url}</loc></url>" for url in urls
)
(OUTPUT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    f"{sitemap_body}\n"
    "</urlset>\n",
    encoding="utf-8",
)

# Salin aset milik pemilik situs jika tersedia di folder skrip.
for asset_name in ("awdev.jpg", "favicon.ico"):
    source = Path(asset_name)
    if source.is_file():
        shutil.copy2(source, OUTPUT / asset_name)
    else:
        print(f"Info: {asset_name} tidak ditemukan; lewati penyalinan.")

readme = """# AWDEV static website

## Menjalankan lokal
Jalankan server statis dari folder ini, misalnya:

```bash
python -m http.server 8000
