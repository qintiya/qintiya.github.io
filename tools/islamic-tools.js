/* AWDEV Islamic tools — client-side utilities and public API helpers.
   Financial and inheritance results are estimates, not religious rulings. */
(function () {
  "use strict";

  const content = () => document.getElementById("dialogContent");
  const toast = message => {
    if (window.AWDEV_TOOLS?.toast) {
      window.AWDEV_TOOLS.toast(message);
      return;
    }
    window.alert(message);
  };

  function render(html, setup) {
    content().innerHTML = html;
    if (setup) setup();
  }

  function field(label, id, type = "text", value = "", extra = "") {
    return `
      <label for="${id}">${label}</label>
      <input id="${id}" class="tool-field" type="${type}"
        value="${value}" ${extra}>
    `;
  }

  function area(label, id, value = "", rows = 5) {
    return `
      <label for="${id}">${label}</label>
      <textarea id="${id}" class="tool-field" rows="${rows}">${value}</textarea>
    `;
  }

  function button(id, text = "Calculate") {
    return `<button id="${id}" class="button button-primary" type="button">${text}</button>`;
  }

  function output(id = "islamicOutput") {
    return `<div id="${id}" class="tool-output" aria-live="polite"></div>`;
  }

  function show(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(text);
  }

  function number(id) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : 0;
  }

  async function getJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }

  function externalSearch(query, site = "") {
    const search = site ? `site:${site} ${query}` : query;
    return `https://www.google.com/search?q=${encodeURIComponent(search)}`;
  }

  function openLink(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function hijriDate(date = new Date()) {
    try {
      return new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
        day: "numeric", month: "long", year: "numeric"
      }).format(date);
    } catch {
      return "Hijri date is not supported by this browser.";
    }
  }

  function renderBasicCalculator(title, fields, formula, note = "") {
    render(`
      ${fields}
      ${button("islamicCalculate")}
      ${output()}
      <small>${note}</small>
    `, () => {
      document.getElementById("islamicCalculate").addEventListener("click", () => {
        try {
          show("islamicOutput", formula());
        } catch (error) {
          show("islamicOutput", error.message || "Unable to calculate.");
        }
      });
    });
  }

  const handlers = {
    /* Prayer times: Aladhan API, with manual latitude/longitude. */
    prayer() {
      render(`
        ${field("Latitude", "prayerLat", "number", "21.4225", 'step="any"')}
        ${field("Longitude", "prayerLon", "number", "39.8262", 'step="any"')}
        ${field("Date (optional)", "prayerDate", "date")}
        ${button("getPrayerTimes", "Get prayer times")}
        ${output()}
        <button id="usePrayerLocation" class="button button-secondary" type="button">Use my location</button>
        <small>Times are provided by Aladhan. Confirm calculation settings for your location.</small>
      `, () => {
        document.getElementById("usePrayerLocation").onclick = () => {
          if (!navigator.geolocation) return toast("Geolocation is not available.");
          navigator.geolocation.getCurrentPosition(position => {
            document.getElementById("prayerLat").value = position.coords.latitude;
            document.getElementById("prayerLon").value = position.coords.longitude;
          }, () => toast("Location permission was not granted."));
        };

        document.getElementById("getPrayerTimes").onclick = async () => {
          try {
            const lat = number("prayerLat");
            const lon = number("prayerLon");
            const date = document.getElementById("prayerDate").value;
            const datePart = date
              ? new Date(`${date}T12:00:00`).toLocaleDateString("en-GB").replaceAll("/", "-")
              : new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
            const data = await getJSON(
              `https://api.aladhan.com/v1/timings/${datePart}?latitude=${lat}&longitude=${lon}`
            );
            const times = data.data.timings;
            show("islamicOutput", Object.entries(times)
              .filter(([key]) => ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(key))
              .map(([key, value]) => `${key}: ${value}`).join("\n"));
          } catch {
            show("islamicOutput", "Could not load prayer times. Check your connection and coordinates.");
          }
        };
      });
    },

    /* Qibla bearing from user-entered coordinates. */
    qibla() {
      render(`
        ${field("Latitude", "qiblaLat", "number", "", 'step="any" placeholder="e.g. -6.2"')}
        ${field("Longitude", "qiblaLon", "number", "", 'step="any" placeholder="e.g. 106.8"')}
        ${button("calculateQibla")}
        ${output()}
        <button id="useQiblaLocation" class="button button-secondary" type="button">Use my location</button>
      `, () => {
        document.getElementById("useQiblaLocation").onclick = () => {
          if (!navigator.geolocation) return toast("Geolocation is not available.");
          navigator.geolocation.getCurrentPosition(position => {
            document.getElementById("qiblaLat").value = position.coords.latitude;
            document.getElementById("qiblaLon").value = position.coords.longitude;
          }, () => toast("Location permission was not granted."));
        };

        document.getElementById("calculateQibla").onclick = () => {
          const lat = number("qiblaLat") * Math.PI / 180;
          const lon = number("qiblaLon") * Math.PI / 180;
          const kaabaLat = 21.4225 * Math.PI / 180;
          const kaabaLon = 39.8262 * Math.PI / 180;
          const deltaLon = kaabaLon - lon;
          const y = Math.sin(deltaLon);
          const x = Math.cos(lat) * Math.tan(kaabaLat) -
                    Math.sin(lat) * Math.cos(deltaLon);
          const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
          show("islamicOutput", `Approximate Qibla bearing: ${bearing.toFixed(1)}° from true north.`);
        };
      });
    },

    /* Read a surah from the AlQuran Cloud API. */
    quran() {
      render(`
        ${field("Surah number (1–114)", "quranSurah", "number", "1", 'min="1" max="114"')}
        <label for="quranEdition">Translation edition</label>
        <select id="quranEdition" class="tool-field">
          <option value="en.asad">English (Muhammad Asad)</option>
          <option value="en.sahih">English (Saheeh International)</option>
          <option value="id.indonesian">Indonesian</option>
        </select>
        ${button("loadSurah", "Load surah")}
        ${output()}
      `, () => {
        document.getElementById("loadSurah").onclick = async () => {
          try {
            const surah = Math.max(1, Math.min(114, number("quranSurah")));
            const edition = document.getElementById("quranEdition").value;
            const [arabic, translation] = await Promise.all([
              getJSON(`https://api.alquran.cloud/v1/surah/${surah}/quran-uthmani`),
              getJSON(`https://api.alquran.cloud/v1/surah/${surah}/${edition}`)
            ]);
            const rows = arabic.data.ayahs.map((ayah, index) =>
              `${ayah.numberInSurah}. ${ayah.text}\n${translation.data.ayahs[index]?.text || ""}`
            );
            show("islamicOutput", `${arabic.data.name}\n\n${rows.join("\n\n")}`);
          } catch {
            show("islamicOutput", "Unable to load the surah. Please try again later.");
          }
        };
      });
    },

    /* Surah recitation audio. */
    quranAudio() {
      render(`
        ${field("Surah number (1–114)", "audioSurah", "number", "1", 'min="1" max="114"')}
        ${button("loadAudio", "Load recitation")}
        ${output()}
        <audio id="quranPlayer" controls preload="none" style="width:100%"></audio>
        <small>Audio stream uses the AlQuran Cloud API and requires an internet connection.</small>
      `, () => {
        document.getElementById("loadAudio").onclick = async () => {
          try {
            const surah = Math.max(1, Math.min(114, number("audioSurah")));
            const data = await getJSON(`https://api.alquran.cloud/v1/surah/${surah}/ar.alafasy`);
            const first = data.data.ayahs[0];
            const player = document.getElementById("quranPlayer");
            player.src = first.audio;
            player.load();
            show("islamicOutput", `Loaded ${data.data.name}. This player starts from the first ayah.`);
          } catch {
            show("islamicOutput", "Audio could not be loaded.");
          }
        };
      });
    },

    /* Zakat al-mal estimate at 2.5% for eligible wealth. */
    zakatMal() {
      renderBasicCalculator("Zakat al-Mal", `
        ${field("Eligible zakatable wealth", "zakatWealth", "number", "0", 'min="0" step="any"')}
        ${field("Nisab threshold (enter local value)", "zakatNisab", "number", "0", 'min="0" step="any"')}
      `, () => {
        const wealth = number("zakatWealth");
        const nisab = number("zakatNisab");
        if (nisab <= 0) return "Enter a nisab threshold for your location.";
        return wealth >= nisab
          ? `Estimated amount at 2.5%: ${(wealth * 0.025).toFixed(2)}`
          : "Wealth is below the entered nisab threshold.";
      }, "Illustrative estimate only. Eligibility, lunar year, and nisab treatment can vary.");
    },

    zakatFitr() {
      renderBasicCalculator("Zakat al-Fitr", `
        ${field("Number of people", "fitrPeople", "number", "1", 'min="0" step="1"')}
        ${field("Amount per person in local currency", "fitrRate", "number", "0", 'min="0" step="any"')}
      `, () => `Estimated total: ${(number("fitrPeople") * number("fitrRate")).toFixed(2)}`,
      "Use the amount set by your local authority.");
    },

    zakatIncome() {
      renderBasicCalculator("Income zakat estimate", `
        ${field("Monthly income", "incomeAmount", "number", "0", 'min="0" step="any"')}
        ${field("Monthly necessary expenses", "incomeExpenses", "number", "0", 'min="0" step="any"')}
        ${field("Annual nisab threshold", "incomeNisab", "number", "0", 'min="0" step="any"')}
      `, () => {
        const annualSurplus = Math.max(0, number("incomeAmount") - number("incomeExpenses")) * 12;
        if (number("incomeNisab") <= 0) return "Enter a nisab threshold.";
        return annualSurplus >= number("incomeNisab")
          ? `Illustrative 2.5% estimate on annual surplus: ${(annualSurplus * 0.025).toFixed(2)}`
          : `Annual surplus estimate: ${annualSurplus.toFixed(2)}; below entered nisab.`;
      }, "Methods for income zakat differ. Confirm the method with a qualified local authority.");
    },

    zakatMetal() {
      renderBasicCalculator("Gold & silver zakat estimate", `
        ${field("Gold value", "goldValue", "number", "0", 'min="0" step="any"')}
        ${field("Silver value", "silverValue", "number", "0", 'min="0" step="any"')}
        ${field("Other zakatable assets", "metalOther", "number", "0", 'min="0" step="any"')}
        ${field("Nisab threshold (local currency)", "metalNisab", "number", "0", 'min="0" step="any"')}
      `, () => {
        const total = number("goldValue") + number("silverValue") + number("metalOther");
        const nisab = number("metalNisab");
        if (nisab <= 0) return "Enter a nisab threshold.";
        return total >= nisab
          ? `Combined entered value: ${total.toFixed(2)}\nIllustrative 2.5% estimate: ${(total * .025).toFixed(2)}`
          : `Combined entered value (${total.toFixed(2)}) is below entered nisab.`;
      }, "Scholarly approaches to combining gold, silver, and other assets may differ.");
    },

    inheritance() {
      renderBasicCalculator("Inheritance estimate", `
        ${field("Estate after debts and bequests", "estateValue", "number", "0", 'min="0" step="any"')}
        ${field("Number of sons", "heirSons", "number", "0", 'min="0" step="1"')}
        ${field("Number of daughters", "heirDaughters", "number", "0", 'min="0" step="1"')}
        ${field("Spouse share (enter fraction, e.g. 0.125)", "spouseFraction", "number", "0", 'min="0" max="1" step="any"')}
      `, () => {
        const estate = number("estateValue");
        const sons = Math.floor(number("heirSons"));
        const daughters = Math.floor(number("heirDaughters"));
        const spouseFraction = number("spouseFraction");
        if (spouseFraction < 0 || spouseFraction > 1) return "Spouse fraction must be between 0 and 1.";
        const remainder = estate * (1 - spouseFraction);
        const units = sons * 2 + daughters;
        if (!units) return `Spouse allocation entered: ${(estate * spouseFraction).toFixed(2)}. Add children for the simplified remainder estimate.`;
        return `Spouse entered share: ${(estate * spouseFraction).toFixed(2)}\nRemaining pool: ${remainder.toFixed(2)}\nEach son (2 units): ${(remainder * 2 / units).toFixed(2)}\nEach daughter (1 unit): ${(remainder / units).toFixed(2)}`;
      }, "Simplified illustration only. It does not account for all heirs, exclusions, or legal conditions. Consult a qualified faraidh specialist.");
    },

    dateConverter() {
      render(`
        ${field("Gregorian date", "gregorianDate", "date", new Date().toISOString().slice(0, 10))}
        ${button("convertHijri", "Convert date")}
        ${output()}
      `, () => {
        document.getElementById("convertHijri").onclick = () => {
          const date = new Date(`${document.getElementById("gregorianDate").value}T12:00:00`);
          show("islamicOutput", Number.isNaN(date.getTime()) ? "Enter a valid date." : hijriDate(date));
        };
      });
    },

    hijriCalendar() {
      render(`
        ${field("Gregorian month", "calendarMonth", "month", new Date().toISOString().slice(0, 7))}
        ${button("showHijriMonth", "Show month")}
        ${output()}
      `, () => {
        document.getElementById("showHijriMonth").onclick = () => {
          const value = document.getElementById("calendarMonth").value;
          if (!value) return show("islamicOutput", "Select a month.");
          const [year, month] = value.split("-").map(Number);
          const days = new Date(year, month, 0).getDate();
          const rows = [];
          for (let day = 1; day <= days; day++) {
            const date = new Date(year, month - 1, day, 12);
            rows.push(`${date.toLocaleDateString()}: ${hijriDate(date)}`);
          }
          show("islamicOutput", rows.join("\n"));
        };
      });
    },

    tasbih() {
      const storageKey = "awdevTasbih";
      const stored = Number(localStorage.getItem(storageKey) || 0);
      render(`
        <div id="tasbihValue" class="counter-number">${stored}</div>
        <label for="tasbihTargetSelect">Cycle target</label>
        <select id="tasbihTargetSelect" class="tool-field">
          <option value="33">33</option><option value="99">99</option>
          <option value="100">100</option><option value="0">No reset target</option>
        </select>
        <div class="dialog-actions">
          <button id="tasbihCountButton" class="button button-primary" type="button">Count dhikr</button>
          <button id="tasbihResetButton" class="button button-secondary" type="button">Reset</button>
        </div>
        <small>Count is saved on this device using local storage.</small>
      `, () => {
        let count = stored;
        document.getElementById("tasbihCountButton").onclick = () => {
          const target = Number(document.getElementById("tasbihTargetSelect").value);
          count = target && count >= target ? 1 : count + 1;
          show("tasbihValue", count);
          localStorage.setItem(storageKey, String(count));
          if (navigator.vibrate) navigator.vibrate(25);
        };
        document.getElementById("tasbihResetButton").onclick = () => {
          count = 0;
          show("tasbihValue", 0);
          localStorage.setItem(storageKey, "0");
        };
      });
    },

    adhkar() {
      render(`
        <p>Select a remembrance, then use the counter to track repetitions.</p>
        <label for="adhkarSelect">Dhikr</label>
        <select id="adhkarSelect" class="tool-field">
          <option value="سُبْحَانَ اللَّهِ">سُبْحَانَ اللَّهِ — SubhanAllah</option>
          <option value="الْحَمْدُ لِلَّهِ">الْحَمْدُ لِلَّهِ — Alhamdulillah</option>
          <option value="اللَّهُ أَكْبَرُ">اللَّهُ أَكْبَرُ — Allahu Akbar</option>
          <option value="أَسْتَغْفِرُ اللَّهَ">أَسْتَغْفِرُ اللَّهَ — Astaghfirullah</option>
        </select>
        <div id="adhkarValue" class="counter-number">0</div>
        <button id="adhkarCount" class="button button-primary" type="button">Count</button>
        ${output("adhkarText")}
      `, () => {
        let count = 0;
        document.getElementById("adhkarCount").onclick = () => {
          count++;
          show("adhkarValue", count);
          show("adhkarText", document.getElementById("adhkarSelect").value);
        };
      });
    },

    asmaulHusna() {
      render(`
        ${field("Search names", "asmaSearch", "search", "", 'placeholder="Search Arabic, transliteration, or meaning"')}
        ${button("loadAsma", "Load Asmaul Husna")}
        ${output()}
        <small>Names and translations can vary by source. Review religious content with trusted references.</small>
      `, () => {
        document.getElementById("loadAsma").onclick = async () => {
          try {
            const result = await getJSON("https://api.aladhan.com/v1/asmaAlHusna");
            const entries = result.data || [];
            const query = document.getElementById("asmaSearch").value.trim().toLowerCase();
            const filtered = entries.filter(item =>
              JSON.stringify(item).toLowerCase().includes(query)
            );
            show("islamicOutput", filtered.map(item =>
              `${item.number || ""}. ${item.name || ""} — ${item.transliteration || ""} — ${item.en?.meaning || item.meaning || ""}`
            ).join("\n") || "No results.");
          } catch {
            show("islamicOutput", "Could not load the names API. Check your connection.");
          }
        };
      });
    },

    verseSearch() {
      render(`
        ${field("Search a translated keyword or phrase", "verseQuery", "search", "", 'placeholder="mercy"')}
        <label for="verseLanguage">Language</label>
        <select id="verseLanguage" class="tool-field">
          <option value="en">English</option><option value="id">Indonesian</option>
        </select>
        ${button("searchVerses", "Search verses")}
        ${output()}
      `, () => {
        document.getElementById("searchVerses").onclick = async () => {
          const query = document.getElementById("verseQuery").value.trim();
          if (!query) return show("islamicOutput", "Enter a search phrase.");
          try {
            const language = document.getElementById("verseLanguage").value;
            const edition = language === "id" ? "id.indonesian" : "en.sahih";
            const result = await getJSON(
              `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`
            );
            show("islamicOutput", (result.data.matches || []).slice(0, 30)
              .map(item => `${item.surah.englishName} ${item.numberInSurah}: ${item.text}`)
              .join("\n\n") || "No matching verses found.");
          } catch {
            show("islamicOutput", "Search failed. Try another term or check your connection.");
          }
        };
      });
    },

    hadith() {
      render(`
        ${field("Search hadith topic or phrase", "hadithQuery", "search", "", 'placeholder="intention"')}
        <div class="dialog-actions">
          <button id="searchHadithWeb" class="button button-primary" type="button">Search trusted websites</button>
          <button id="searchHadithApi" class="button button-secondary" type="button">Search Sunnah.com</button>
        </div>
        ${output()}
        <small>This opens external search results; AWDEV does not verify or authenticate hadith.</small>
      `, () => {
        document.getElementById("searchHadithWeb").onclick = () => {
          const query = document.getElementById("hadithQuery").value.trim();
          if (!query) return toast("Enter a search phrase.");
          openLink(externalSearch(query, "sunnah.com"));
        };
        document.getElementById("searchHadithApi").onclick = () => {
          const query = document.getElementById("hadithQuery").value.trim();
          if (!query) return toast("Enter a search phrase.");
          openLink(`https://sunnah.com/search?q=${encodeURIComponent(query)}`);
        };
      });
    },

    qadhaPrayer() {
      render(`
        ${field("Estimated missed prayers", "qadhaTotal", "number", "0", 'min="0" step="1"')}
        ${field("Prayers completed", "qadhaDone", "number", "0", 'min="0" step="1"')}
        ${button("saveQadha", "Save progress")}
        ${output()}
      `, () => {
        const key = "awdevQadhaPrayer";
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        if (saved.total) document.getElementById("qadhaTotal").value = saved.total;
        if (saved.done) document.getElementById("qadhaDone").value = saved.done;

        document.getElementById("saveQadha").onclick = () => {
          const total = Math.max(0, Math.floor(number("qadhaTotal")));
          const done = Math.max(0, Math.floor(number("qadhaDone")));
          localStorage.setItem(key, JSON.stringify({ total, done }));
          show("islamicOutput", `Remaining: ${Math.max(0, total - done)} of ${total}`);
          toast("Progress saved on this device.");
        };
      });
    },

    fidyah() {
      renderBasicCalculator("Missed fasting & fidyah estimate", `
        ${field("Missed fasting days", "fidyahDays", "number", "0", 'min="0" step="1"')}
        ${field("Fidyah amount per day (local currency)", "fidyahRate", "number", "0", 'min="0" step="any"')}
      `, () => `Illustrative total: ${(number("fidyahDays") * number("fidyahRate")).toFixed(2)}`,
      "Rates and rulings vary. Confirm the amount with a qualified local authority.");
    },

    imsakiyah() {
      render(`
        ${field("Latitude", "imsakLat", "number", "Jakarta", 'step="any"')}
        ${field("Longitude", "imsakLon", "number", "106.8456", 'step="any"')}
        ${field("Date", "imsakDate", "date", new Date().toISOString().slice(0, 10))}
        ${button("loadImsak", "Load schedule")}
        ${output()}
        <small>Aladhan timings are used as a planning aid; check local Ramadan schedules.</small>
      `, () => {
        document.getElementById("loadImsak").onclick = async () => {
          try {
            const date = document.getElementById("imsakDate").value;
            const datePart = date
              ? new Date(`${date}T12:00:00`).toLocaleDateString("en-GB").replaceAll("/", "-")
              : "";
            const url = `https://api.aladhan.com/v1/timings/${datePart}?latitude=${number("imsakLat")}&longitude=${number("imsakLon")}`;
            const result = await getJSON(url);
            const t = result.data.timings;
            show("islamicOutput",
              `Date: ${result.data.date.readable}\nImsak: ${t.Imsak}\nFajr: ${t.Fajr}\nSunrise: ${t.Sunrise}\nDhuhr: ${t.Dhuhr}\nAsr: ${t.Asr}\nMaghrib / Iftar: ${t.Maghrib}\nIsha: ${t.Isha}`);
          } catch {
            show("islamicOutput", "Could not load schedule. Check coordinates and connection.");
          }
        };
      });
    },

    countdown() {
      render(`
        <label for="countdownEvent">Occasion</label>
        <select id="countdownEvent" class="tool-field">
          <option value="ramadan">Ramadan (estimated date)</option>
          <option value="eid">Eid al-Fitr (estimated date)</option>
          <option value="adha">Eid al-Adha (estimated date)</option>
        </select>
        ${field("Target date", "countdownDate", "date", "")}
        ${button("calculateCountdown", "Calculate")}
        ${output()}
        <small>Dates are entered by you because Islamic dates may vary by moon sighting and location.</small>
      `, () => {
        const selector = document.getElementById("countdownEvent");
        const dateInput = document.getElementById("countdownDate");
        const setSuggestedDate = () => {
          const year = new Date().getFullYear() + 1;
          const monthDay = { ramadan: "03-01", eid: "03-30", adha: "06-06" }[selector.value];
          dateInput.value = `${year}-${monthDay}`;
        };
        selector.onchange = setSuggestedDate;
        setSuggestedDate();

        document.getElementById("calculateCountdown").onclick = () => {
          const target = new Date(`${dateInput.value}T00:00:00`);
          if (Number.isNaN(target.getTime())) return show("islamicOutput", "Choose a valid date.");
          const days = Math.ceil((target - new Date()) / 86400000);
          show("islamicOutput", days >= 0 ? `${days} days remaining.` : `${Math.abs(days)} days since that date.`);
        };
      });
    },

    greetingCard() {
      render(`
        ${field("Greeting", "greetingText", "text", "Eid Mubarak")}
        ${field("Name or message", "greetingName", "text", "May peace and blessings be with you")}
        <label for="greetingColor">Background color</label>
        <input id="greetingColor" class="tool-field" type="color" value="#126b56">
        ${button("makeGreetingCard", "Create card")}
        <canvas id="greetingCanvas" width="900" height="500"
          style="width:100%;border-radius:12px;background:#126b56"></canvas>
        <button id="downloadGreeting" class="button button-secondary" type="button">Download PNG</button>
      `, () => {
        const draw = () => {
          const canvas = document.getElementById("greetingCanvas");
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = document.getElementById("greetingColor").value;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.font = "bold 58px sans-serif";
          ctx.fillText(document.getElementById("greetingText").value.slice(0, 45), 450, 220);
          ctx.font = "28px sans-serif";
          ctx.fillText(document.getElementById("greetingName").value.slice(0, 80), 450, 285);
          ctx.font = "40px serif";
          ctx.fillText("☾  ✦  ☾", 450, 120);
        };
        document.getElementById("makeGreetingCard").onclick = draw;
        document.getElementById("downloadGreeting").onclick = () => {
          draw();
          const link = document.createElement("a");
          link.download = "awdev-islamic-greeting.png";
          link.href = document.getElementById("greetingCanvas").toDataURL("image/png");
          link.click();
        };
        draw();
      });
    },

    arabicKeyboard() {
      const chars = ["ا","أ","إ","آ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ؤ","ي","ئ","ء","ة","ى","َ","ً","ُ","ٌ","ِ","ٍ","ْ","ّ"];
      render(`
        ${area("Arabic text", "arabicInput", "", 4)}
        <div class="dialog-actions" id="arabicKeys"></div>
        <div class="dialog-actions">
          <button id="arabicSpace" class="button button-secondary" type="button">Space</button>
          <button id="arabicBackspace" class="button button-secondary" type="button">Backspace</button>
          <button id="arabicCopy" class="button button-primary" type="button">Copy</button>
        </div>
      `, () => {
        const keys = document.getElementById("arabicKeys");
        keys.innerHTML = chars.map(char =>
          `<button class="button button-secondary arabic-key" type="button">${char}</button>`
        ).join("");
        keys.onclick = event => {
          const key = event.target.closest(".arabic-key");
          if (key) document.getElementById("arabicInput").value += key.textContent;
        };
        document.getElementById("arabicSpace").onclick = () =>
          document.getElementById("arabicInput").value += " ";
        document.getElementById("arabicBackspace").onclick = () => {
          const input = document.getElementById("arabicInput");
          input.value = [...input.value].slice(0, -1).join("");
        };
        document.getElementById("arabicCopy").onclick = async () => {
          await navigator.clipboard.writeText(document.getElementById("arabicInput").value);
          toast("Copied!");
        };
      });
    },

    transliteration() {
      const map = {
        aa:"ا",a:"ا",b:"ب",t:"ت",th:"ث",j:"ج",h:"ه",kh:"خ",d:"د",dh:"ذ",
        r:"ر",z:"ز",s:"س",sh:"ش",ṣ:"ص",ḍ:"ض",ṭ:"ط",ẓ:"ظ",`'`:"ء",
        gh:"غ",f:"ف",q:"ق",k:"ك",l:"ل",m:"م",n:"ن",w:"و",y:"ي"
      };
      render(`
        ${area("Latin transliteration (basic approximation)", "latinInput", "", 4)}
        ${button("convertLatin", "Convert")}
        ${area("Arabic output", "arabicOutput", "", 4)}
        <small>This simple character mapping is not a scholarly transliteration system.</small>
      `, () => {
        document.getElementById("convertLatin").onclick = () => {
          let text = document.getElementById("latinInput").value.toLowerCase();
          const keys = Object.keys(map).sort((a, b) => b.length - a.length);
          for (const key of keys) text = text.replaceAll(key, map[key]);
          document.getElementById("arabicOutput").value = text;
        };
      });
    },

    nisab() {
      renderBasicCalculator("Nisab estimate", `
        ${field("Gold price per gram", "nisabGoldPrice", "number", "0", 'min="0" step="any"')}
        ${field("Gold nisab grams (commonly entered locally)", "nisabGoldGrams", "number", "85", 'min="0" step="any"')}
        ${field("Silver price per gram", "nisabSilverPrice", "number", "0", 'min="0" step="any"')}
        ${field("Silver nisab grams (commonly entered locally)", "nisabSilverGrams", "number", "595", 'min="0" step="any"')}
      `, () => {
        const gold = number("nisabGoldPrice") * number("nisabGoldGrams");
        const silver = number("nisabSilverPrice") * number("nisabSilverGrams");
        return `Gold-based estimate: ${gold.toFixed(2)}\nSilver-based estimate: ${silver.toFixed(2)}\nEnter current local metal prices; the calculation is not a live price feed.`;
      }, "Nisab standards and chosen metal can vary. Confirm the applicable method locally.");
    },

    hajjGuide() {
      const steps = [
        "1. Prepare, learn the rites, and enter ihram at the appropriate miqat.",
        "2. Recite the talbiyah and observe the rules of ihram.",
        "3. Perform tawaf and sa'i according to the type of pilgrimage.",
        "4. On the days of Hajj, follow the prescribed sequence of rites.",
        "5. Complete the required rites and consult a qualified guide for details."
      ];
      render(`
        <ol>${steps.map(step => `<li>${step}</li>`).join("")}</ol>
        <p><strong>Talbiyah:</strong> لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ</p>
        <button id="readTalbiyah" class="button button-primary" type="button">Listen to talbiyah text</button>
        <small>This is a brief orientation, not a complete fiqh guide. Follow an accredited Hajj authority.</small>
      `, () => {
        document.getElementById("readTalbiyah").onclick = () => {
          if (!("speechSynthesis" in window)) return toast("Text-to-speech is not supported.");
          const utterance = new SpeechSynthesisUtterance(
            "Labbayka Allahumma labbayk, labbayka la shareeka laka labbayk"
          );
          utterance.lang = "ar";
          speechSynthesis.cancel();
          speechSynthesis.speak(utterance);
        };
      });
    },

    khatam() {
      const key = "awdevKhatam";
      render(`
        ${field("Juz completed", "khatamDone", "number", "0", 'min="0" max="30" step="1"')}
        ${field("Target days", "khatamDays", "number", "30", 'min="1" step="1"')}
        ${button("saveKhatam", "Save plan")}
        ${output()}
      `, () => {
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        if (saved.done != null) document.getElementById("khatamDone").value = saved.done;
        if (saved.days) document.getElementById("khatamDays").value = saved.days;
        document.getElementById("saveKhatam").onclick = () => {
          const done = Math.max(0, Math.min(30, Math.floor(number("khatamDone"))));
          const days = Math.max(1, Math.floor(number("khatamDays")));
          const remaining = 30 - done;
          localStorage.setItem(key, JSON.stringify({ done, days }));
          show("islamicOutput",
            `Remaining: ${remaining} juz\nSuggested pace: ${Math.ceil(remaining / days)} juz per day`);
          toast("Plan saved on this device.");
        };
      });
    },

    worshipTracker() {
      const key = `awdevWorship-${new Date().toISOString().slice(0, 10)}`;
      const items = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Qur'an reading", "Morning adhkar", "Evening adhkar"];
      render(`
        <p>Daily checklist — saved on this device.</p>
        <div id="worshipChecks">
          ${items.map((item, index) => `
            <label style="display:block;padding:7px">
              <input type="checkbox" data-worship="${index}"> ${item}
            </label>
          `).join("")}
        </div>
        ${output()}
      `, () => {
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        const checks = [...document.querySelectorAll("[data-worship]")];
        checks.forEach((checkbox, index) => {
          checkbox.checked = Boolean(saved[index]);
          checkbox.onchange = () => {
            const values = checks.map(input => input.checked);
            localStorage.setItem(key, JSON.stringify(values));
            const total = values.filter(Boolean).length;
            show("islamicOutput", `Completed ${total} of ${items.length} checklist items today.`);
          };
        });
        show("islamicOutput", `Completed ${saved.filter(Boolean).length} of ${items.length} checklist items today.`);
      });
    },

    babyNames() {
      const names = [
        ["Aminah","Female","Trustworthy, faithful"], ["Aisha","Female","Living, prosperous"],
        ["Maryam","Female","A revered name"], ["Noor","Any","Light"],
        ["Hana","Female","Happiness"], ["Zayn","Male","Beauty, grace"],
        ["Yusuf","Male","Name of a prophet"], ["Ibrahim","Male","Name of a prophet"],
        ["Rayyan","Male","A gate of Paradise in Islamic tradition"], ["Omar","Male","Flourishing, long-lived"],
        ["Huda","Female","Guidance"], ["Salma","Female","Peaceful, safe"],
        ["Amir","Male","Leader, prince"], ["Layla","Female","Night"],
        ["Adam","Male","Name of a prophet"]
      ];
      render(`
        ${field("Search name or meaning", "babyNameSearch", "search", "")}
        ${output()}
        <small>Meanings can vary by language and source; verify names with trusted references.</small>
      `, () => {
        const input = document.getElementById("babyNameSearch");
        const update = () => {
          const query = input.value.toLowerCase();
          show("islamicOutput", names
            .filter(row => row.join(" ").toLowerCase().includes(query))
            .map(([name, gender, meaning]) => `${name} (${gender}) — ${meaning}`)
            .join("\n") || "No names found.");
        };
        input.addEventListener("input", update);
        update();
      });
    },

    qurbani() {
      renderBasicCalculator("Qurbani share estimator", `
        <label for="animalType">Animal</label>
        <select id="animalType" class="tool-field">
          <option value="7">Cow/camel — up to 7 shares (common planning estimate)</option>
          <option value="1">Sheep/goat — 1 share (common planning estimate)</option>
        </select>
        ${field("Number of participants", "qurbaniPeople", "number", "1", 'min="1" step="1"')}
        ${field("Total meat weight (kg, optional)", "qurbaniWeight", "number", "0", 'min="0" step="any"')}
      `, () => {
        const capacity = Number(document.getElementById("animalType").value);
        const people = Math.max(1, Math.floor(number("qurbaniPeople")));
        const weight = number("qurbaniWeight");
        return `Suggested animal units: ${Math.ceil(people / capacity)}\nParticipants per unit: up to ${capacity}\n${weight > 0 ? `Equal illustrative meat share: ${(weight / people).toFixed(2)} kg per participant` : "Enter meat weight to estimate equal portions."}`;
      }, "This is a planning calculator, not a ruling on eligibility or distribution.");
    },

    mosque() {
      render(`
        ${field("Latitude", "mosqueLat", "number", "", 'step="any" placeholder="Use location or enter coordinates"')}
        ${field("Longitude", "mosqueLon", "number", "", 'step="any"')}
        ${field("Search radius (meters, max 10000)", "mosqueRadius", "number", "3000", 'min="100" max="10000"')}
        <div class="dialog-actions">
          <button id="findMosques" class="button button-primary" type="button">Find mosques</button>
          <button id="useMosqueLocation" class="button button-secondary" type="button">Use my location</button>
        </div>
        ${output()}
        <small>Uses OpenStreetMap Overpass. Availability and map data depend on third parties.</small>
      `, () => {
        document.getElementById("useMosqueLocation").onclick = () => {
          if (!navigator.geolocation) return toast("Geolocation is not available.");
          navigator.geolocation.getCurrentPosition(position => {
            document.getElementById("mosqueLat").value = position.coords.latitude;
            document.getElementById("mosqueLon").value = position.coords.longitude;
          }, () => toast("Location permission was not granted."));
        };

        document.getElementById("findMosques").onclick = async () => {
          const lat = number("mosqueLat");
          const lon = number("mosqueLon");
          const radius = Math.max(100, Math.min(10000, number("mosqueRadius")));
          if (!lat && !lon) return show("islamicOutput", "Enter coordinates or use your location.");

          const query = `[out:json][timeout:20];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon}););out center 20;`;
          try {
            const response = await fetch("https://overpass-api.de/api/interpreter", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
              body: `data=${encodeURIComponent(query)}`
            });
            if (!response.ok) throw new Error("Overpass unavailable");
            const data = await response.json();
            const rows = (data.elements || []).map(item => {
              const tags = item.tags || {};
              const name = tags.name || "Mosque / Muslim place of worship";
              const latitude = item.lat ?? item.center?.lat;
              const longitude = item.lon ?? item.center?.lon;
              const map = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
              return `${name}\n${map}`;
            });
            show("islamicOutput", rows.join("\n\n") || "No results found in this radius.");
          } catch {
            show("islamicOutput", "The map service is unavailable. Try again later.");
          }
        };
      });
    }
  };

  /* Small tools that use a common external search or local interface. */
  handlers.adhkar ||= handlers.adhkar;

  const delegated = {
    prayer: handlers.prayer,
    qibla: handlers.qibla,
    quran: handlers.quran,
    quranAudio: handlers.quranAudio,
    zakatMal: handlers.zakatMal,
    zakatFitr: handlers.zakatFitr,
    zakatIncome: handlers.zakatIncome,
    zakatMetal: handlers.zakatMetal,
    inheritance: handlers.inheritance,
    dateConverter: handlers.dateConverter,
    hijriCalendar: handlers.hijriCalendar,
    tasbih: handlers.tasbih,
    adhkar: handlers.adhkar,
    asmaulHusna: handlers.asmaulHusna,
    verseSearch: handlers.verseSearch,
    hadith: handlers.hadith,
    qadhaPrayer: handlers.qadhaPrayer,
    fidyah: handlers.fidyah,
    imsakiyah: handlers.imsakiyah,
    countdown: handlers.countdown,
    greetingCard: handlers.greetingCard,
    arabicKeyboard: handlers.arabicKeyboard,
    transliteration: handlers.transliteration,
    nisab: handlers.nisab,
    hajjGuide: handlers.hajjGuide,
    khatam: handlers.khatam,
    worshipTracker: handlers.worshipTracker,
    babyNames: handlers.babyNames,
    qurbani: handlers.qurbani,
    mosque: handlers.mosque
  };

  window.AWDEV_ISLAMIC = {
    ids: Object.keys(delegated),
    open(id) {
      const handler = delegated[id];
      if (!handler) {
        render(`<p>This Islamic tool is not configured.</p>`);
        return false;
      }
      handler();
      return true;
    }
  };
})();
