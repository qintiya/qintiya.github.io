/* AWDEV Developer Tools — client-side tool handlers */
(function () {
  "use strict";

  const root = () => document.getElementById("dialogContent");

  function render(html, setup) {
    root().innerHTML = html;
    if (setup) setup();
  }

  function toast(message) {
    if (window.AWDEV_TOOLS?.toast) {
      window.AWDEV_TOOLS.toast(message);
    } else {
      console.info(message);
    }
  }

  function field(label, id, type = "text", value = "", extra = "") {
    return `<label for="${id}">${label}</label>
      <input id="${id}" class="tool-field" type="${type}" value="${value}" ${extra}>`;
  }

  function area(label, id, value = "", rows = 6) {
    return `<label for="${id}">${label}</label>
      <textarea id="${id}" class="tool-field" rows="${rows}">${value}</textarea>`;
  }

  function output(id = "devOutput", rows = 7) {
    return `<label for="${id}">Output</label>
      <textarea id="${id}" class="tool-field" rows="${rows}" readonly></textarea>`;
  }

  function button(id, label) {
    return `<button id="${id}" class="button button-primary" type="button">${label}</button>`;
  }

  function show(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = String(value ?? "");
  }

  function get(id) {
    return document.getElementById(id)?.value ?? "";
  }

  function copy(id) {
    const element = document.getElementById(id);
    if (!element || !element.value) return toast("Nothing to copy.");
    navigator.clipboard.writeText(element.value)
      .then(() => toast("Copied!"))
      .catch(() => {
        element.select();
        document.execCommand("copy");
        toast("Copied!");
      });
  }

  function download(name, text, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function setTextResult(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function minifier() {
    render(`
      <label for="minifyType">Code type</label>
      <select id="minifyType" class="tool-field">
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="js">JavaScript (basic)</option>
      </select>
      ${area("Source code", "minifyInput", "", 9)}
      <div class="dialog-actions">
        ${button("runMinifier", "Minify")}
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      ${output("devOutput", 9)}
      <small>Basic whitespace/comment cleanup; always review generated code before production use.</small>
    `, () => {
      document.getElementById("runMinifier").onclick = () => {
        const type = get("minifyType");
        let text = get("minifyInput");

        if (type === "html") {
          text = text.replace(/<!--[\s\S]*?-->/g, "")
            .replace(/>\s+</g, "><")
            .replace(/\s{2,}/g, " ").trim();
        } else if (type === "css") {
          text = text.replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\s*([{}:;,])\s*/g, "$1")
            .replace(/;}/g, "}")
            .replace(/\s{2,}/g, " ").trim();
        } else {
          text = text.replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/^\s*\/\/.*$/gm, "")
            .replace(/[ \t]{2,}/g, " ")
            .replace(/\s*([{};,])\s*/g, "$1")
            .trim();
        }

        show("devOutput", text);
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function formatter() {
    render(`
      <label for="formatType">Format as</label>
      <select id="formatType" class="tool-field">
        <option value="json">JSON</option>
        <option value="html">HTML / XML (basic)</option>
        <option value="css">CSS (basic)</option>
      </select>
      ${area("Source code", "formatInput", "", 9)}
      <div class="dialog-actions">
        ${button("runFormatter", "Format")}
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      ${output("devOutput", 10)}
    `, () => {
      document.getElementById("runFormatter").onclick = () => {
        const source = get("formatInput");
        const type = get("formatType");

        try {
          if (type === "json") {
            show("devOutput", JSON.stringify(JSON.parse(source), null, 2));
            return;
          }

          let indent = 0;
          const tokens = type === "css"
            ? source.replace(/[{}]/g, "\n$&\n").split("\n")
            : source.replace(/></g, ">\n<").split("\n");

          const result = tokens.map(line => {
            const item = line.trim();
            if (!item) return "";
            if (/^(}|<\/)/.test(item)) indent = Math.max(0, indent - 1);
            const formatted = "  ".repeat(indent) + item;
            if (/[{>]$/.test(item) && !/^<\//.test(item)) indent++;
            return formatted;
          }).filter(Boolean).join("\n");

          show("devOutput", result);
        } catch (error) {
          show("devOutput", `Format error: ${error.message}`);
        }
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function editor() {
    render(`
      <label for="editorHtml">HTML</label>
      <textarea id="editorHtml" class="tool-field" rows="6"><h1>Hello AWDEV</h1><p>Edit the HTML or CSS to preview.</p></textarea>
      <label for="editorCss">CSS</label>
      <textarea id="editorCss" class="tool-field" rows="5">body { font-family: sans-serif; padding: 2rem; color: #172033; } h1 { color: #5b5de6; }</textarea>
      <label for="editorJs">JavaScript (optional)</label>
      <textarea id="editorJs" class="tool-field" rows="4"></textarea>
      <div class="dialog-actions">
        <button id="updatePreview" class="button button-primary" type="button">Update preview</button>
        <button id="downloadEditorHtml" class="button button-secondary" type="button">Download HTML</button>
      </div>
      <iframe id="editorPreview" title="Code preview"
        sandbox="allow-scripts"
        style="width:100%;height:240px;background:white;border:1px solid var(--line);border-radius:10px"></iframe>
      <small>Preview runs in a sandboxed frame. Do not paste untrusted scripts.</small>
    `, () => {
      const update = () => {
        const html = get("editorHtml");
        const css = get("editorCss").replace(/<\/style/gi, "<\\/style");
        const js = get("editorJs").replace(/<\/script/gi, "<\\/script");
        document.getElementById("editorPreview").srcdoc =
          `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
      };

      document.getElementById("updatePreview").onclick = update;
      ["editorHtml", "editorCss", "editorJs"].forEach(id =>
        document.getElementById(id).addEventListener("input", update)
      );
      document.getElementById("downloadEditorHtml").onclick = () => {
        download("awdev-editor.html",
          `<!doctype html><html><head><meta charset="utf-8"><style>${get("editorCss")}</style></head><body>${get("editorHtml")}<script>${get("editorJs")}<\/script></body></html>`,
          "text/html;charset=utf-8");
      };
      update();
    });
  }

  function jsonTool() {
    render(`
      ${area("JSON input", "jsonInput", '{"name":"AWDEV","tools":30}', 9)}
      <div class="dialog-actions">
        ${button("validateJson", "Validate & format")}
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      ${output("devOutput", 9)}
      <pre id="jsonTree" class="tool-output" aria-label="JSON tree"></pre>
    `, () => {
      document.getElementById("validateJson").onclick = () => {
        try {
          const value = JSON.parse(get("jsonInput"));
          show("devOutput", JSON.stringify(value, null, 2));
          setTextResult("jsonTree", JSON.stringify(value, null, 2));
          toast("Valid JSON");
        } catch (error) {
          show("devOutput", `Invalid JSON: ${error.message}`);
          setTextResult("jsonTree", "");
        }
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function regex() {
    render(`
      ${field("Pattern", "regexPattern", "text", "\\\\bAWDEV\\\\b")}
      ${field("Flags", "regexFlags", "text", "gi", 'placeholder="g, i, m, s, u, y"')}
      ${area("Test text", "regexInput", "AWDEV offers developer tools.", 7)}
      ${button("runRegex", "Test pattern")}
      ${output("devOutput", 5)}
      <pre id="regexHighlight" class="tool-output"></pre>
    `, () => {
      document.getElementById("runRegex").onclick = () => {
        try {
          const regex = new RegExp(get("regexPattern"), get("regexFlags"));
          const text = get("regexInput");
          const matches = [...text.matchAll(regex)];
          show("devOutput", matches.length
            ? matches.map(match => `${match[0]} (index ${match.index})`).join("\n")
            : "No matches found.");
          const escaped = text.replace(/[&<>"']/g, char =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
          setTextResult("regexHighlight", escaped);
        } catch (error) {
          show("devOutput", `Regex error: ${error.message}`);
        }
      };
    });
  }

  function base64() {
    render(`
      ${area("Text", "base64Input", "", 7)}
      <div class="dialog-actions">
        ${button("encodeBase64", "Encode")}
        <button id="decodeBase64" class="button button-secondary" type="button">Decode</button>
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      ${output("devOutput", 7)}
      <label for="base64File">Or encode a file</label>
      <input id="base64File" class="tool-field" type="file">
    `, () => {
      document.getElementById("encodeBase64").onclick = () => {
        const bytes = new TextEncoder().encode(get("base64Input"));
        let binary = "";
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        show("devOutput", btoa(binary));
      };

      document.getElementById("decodeBase64").onclick = () => {
        try {
          const binary = atob(get("base64Input").trim());
          const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
          show("devOutput", new TextDecoder().decode(bytes));
        } catch {
          show("devOutput", "Invalid Base64 input.");
        }
      };

      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
      document.getElementById("base64File").onchange = event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => show("devOutput", String(reader.result).split(",")[1] || "");
        reader.readAsDataURL(file);
      };
    });
  }

  function urlTool() {
    render(`
      ${area("Input", "urlInput", "", 6)}
      <div class="dialog-actions">
        ${button("urlEncode", "Encode")}
        <button id="urlDecode" class="button button-secondary" type="button">Decode</button>
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      ${output()}
    `, () => {
      document.getElementById("urlEncode").onclick = () => show("devOutput", encodeURIComponent(get("urlInput")));
      document.getElementById("urlDecode").onclick = () => {
        try { show("devOutput", decodeURIComponent(get("urlInput"))); }
        catch { show("devOutput", "Invalid URL-encoded input."); }
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function entities() {
    render(`
      ${area("Input", "entityInput", '<p>AWDEV & "tools"</p>', 6)}
      <div class="dialog-actions">
        ${button("encodeEntities", "Encode HTML")}
        <button id="decodeEntities" class="button button-secondary" type="button">Decode HTML</button>
      </div>
      ${output()}
    `, () => {
      document.getElementById("encodeEntities").onclick = () => {
        show("devOutput", get("entityInput").replace(/[&<>"']/g, char =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])));
      };
      document.getElementById("decodeEntities").onclick = () => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = get("entityInput");
        show("devOutput", textarea.value);
      };
    });
  }

  function color() {
    render(`
      <label for="colorInput">Choose color</label>
      <input id="colorInput" class="tool-field" type="color" value="#5b5de6">
      <div id="colorSwatch" style="height:100px;border-radius:12px"></div>
      ${output("devOutput", 4)}
      <div id="colorPalette" class="dialog-actions"></div>
    `, () => {
      const picker = document.getElementById("colorInput");
      const update = () => {
        const hex = picker.value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        document.getElementById("colorSwatch").style.background = hex;
        show("devOutput", `${hex.toUpperCase()}\nRGB: ${r}, ${g}, ${b}\nHSL is approximated by browser color conversion.`);
        const palette = [0, 30, 60, 180, 210].map(offset =>
          `hsl(${(offset + Math.round((r / 255) * 360)) % 360} 65% 52%)`);
        document.getElementById("colorPalette").innerHTML = palette.map(value =>
          `<span class="tool-output" style="background:${value};color:white">${value}</span>`
        ).join("");
      };
      picker.addEventListener("input", update);
      update();
    });
  }

  function gradient() {
    render(`
      ${field("First color", "gradientA", "color", "#5b5de6")}
      ${field("Second color", "gradientB", "color", "#12a889")}
      ${field("Angle", "gradientAngle", "number", "135", 'min="0" max="360"')}
      <label for="gradientType">Type</label>
      <select id="gradientType" class="tool-field">
        <option value="linear">Linear</option><option value="radial">Radial</option>
      </select>
      <div id="gradientPreview" style="height:160px;border-radius:12px"></div>
      ${output("devOutput", 3)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy CSS</button>
    `, () => {
      const update = () => {
        const type = get("gradientType");
        const css = type === "linear"
          ? `linear-gradient(${get("gradientAngle")}deg, ${get("gradientA")}, ${get("gradientB")})`
          : `radial-gradient(circle, ${get("gradientA")}, ${get("gradientB")})`;
        document.getElementById("gradientPreview").style.background = css;
        show("devOutput", `background: ${css};`);
      };
      ["gradientA", "gradientB", "gradientAngle", "gradientType"].forEach(id =>
        document.getElementById(id).addEventListener("input", update));
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
      update();
    });
  }

  function shadow() {
    render(`
      ${field("Horizontal offset", "shadowX", "range", "8", 'min="-40" max="40"')}
      ${field("Vertical offset", "shadowY", "range", "12", 'min="-40" max="40"')}
      ${field("Blur", "shadowBlur", "range", "30", 'min="0" max="100"')}
      ${field("Spread", "shadowSpread", "range", "0", 'min="-30" max="30"')}
      <div id="shadowPreview" style="height:110px;width:160px;margin:25px auto;background:#fff;border-radius:12px"></div>
      ${output("devOutput", 3)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy CSS</button>
    `, () => {
      const update = () => {
        const css = `${get("shadowX")}px ${get("shadowY")}px ${get("shadowBlur")}px ${get("shadowSpread")}px rgba(0,0,0,.25)`;
        document.getElementById("shadowPreview").style.boxShadow = css;
        show("devOutput", `box-shadow: ${css};`);
      };
      ["shadowX", "shadowY", "shadowBlur", "shadowSpread"].forEach(id =>
        document.getElementById(id).addEventListener("input", update));
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
      update();
    });
  }

  function radius() {
    render(`
      ${[["Top left", 0], ["Top right", 1], ["Bottom right", 2], ["Bottom left", 3]]
        .map(([label, index]) => field(label, `radius${index}`, "range", "20", 'min="0" max="100"')).join("")}
      <div id="radiusPreview" style="height:130px;width:160px;margin:20px auto;background:var(--primary)"></div>
      ${output("devOutput", 3)}
    `, () => {
      const update = () => {
        const values = [0, 1, 2, 3].map(index => `${get(`radius${index}`)}px`);
        document.getElementById("radiusPreview").style.borderRadius = values.join(" ");
        show("devOutput", `border-radius: ${values.join(" ")};`);
      };
      [0, 1, 2, 3].forEach(index =>
        document.getElementById(`radius${index}`).addEventListener("input", update));
      update();
    });
  }

  function glass() {
    render(`
      ${field("Blur (px)", "glassBlur", "range", "12", 'min="0" max="30"')}
      ${field("Opacity (%)", "glassOpacity", "range", "25", 'min="1" max="100"')}
      <div style="padding:25px;background:linear-gradient(135deg,#62a9ed,#9655c9);border-radius:12px">
        <div id="glassCard" style="height:90px;border:1px solid rgba(255,255,255,.4);border-radius:12px"></div>
      </div>
      ${output("devOutput", 4)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy CSS</button>
    `, () => {
      const update = () => {
        const css = `background: rgba(255,255,255,${Number(get("glassOpacity")) / 100});\nbackdrop-filter: blur(${get("glassBlur")}px);\n-webkit-backdrop-filter: blur(${get("glassBlur")}px);\nborder: 1px solid rgba(255,255,255,.4);`;
        document.getElementById("glassCard").style.cssText = css;
        show("devOutput", css);
      };
      ["glassBlur", "glassOpacity"].forEach(id =>
        document.getElementById(id).addEventListener("input", update));
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
      update();
    });
  }

  function layout() {
    render(`
      <label for="layoutMode">Layout</label>
      <select id="layoutMode" class="tool-field">
        <option value="grid">CSS Grid</option><option value="flex">Flexbox</option>
      </select>
      ${field("Columns / items", "layoutCount", "number", "3", 'min="1" max="12"')}
      <div id="layoutPreview" style="min-height:150px;gap:8px"></div>
      ${output("devOutput", 5)}
    `, () => {
      const update = () => {
        const mode = get("layoutMode");
        const count = Math.max(1, Math.min(12, Number(get("layoutCount")) || 1));
        const preview = document.getElementById("layoutPreview");
        preview.innerHTML = "";
        preview.style.display = mode === "grid" ? "grid" : "flex";
        preview.style.gridTemplateColumns = mode === "grid" ? `repeat(${count},1fr)` : "";
        preview.style.flexWrap = mode === "flex" ? "wrap" : "";
        for (let i = 0; i < count; i++) {
          const box = document.createElement("div");
          box.style.cssText = "min-height:50px;min-width:40px;background:var(--primary);border-radius:8px";
          preview.appendChild(box);
        }
        show("devOutput", mode === "grid"
          ? `display: grid;\ngrid-template-columns: repeat(${count}, 1fr);\ngap: 8px;`
          : `display: flex;\nflex-wrap: wrap;\ngap: 8px;`);
      };
      ["layoutMode", "layoutCount"].forEach(id =>
        document.getElementById(id).addEventListener("input", update));
      update();
    });
  }

  function favicon() {
    render(`
      <label for="faviconFile">Choose an image</label>
      <input id="faviconFile" class="tool-field" type="file" accept="image/*">
      <div id="faviconPreview" class="dialog-actions"></div>
      <small>Creates PNG icons at 16×16, 32×32, and 180×180. Download each size separately.</small>
    `, () => {
      document.getElementById("faviconFile").onchange = event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const image = new Image();
        image.onload = () => {
          const holder = document.getElementById("faviconPreview");
          holder.innerHTML = "";
          [16, 32, 180].forEach(size => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            canvas.getContext("2d").drawImage(image, 0, 0, size, size);
            const link = document.createElement("a");
            link.className = "button button-secondary";
            link.textContent = `Download ${size}×${size}`;
            link.download = `favicon-${size}.png`;
            link.href = canvas.toDataURL("image/png");
            holder.appendChild(link);
          });
          URL.revokeObjectURL(image.src);
        };
        image.src = URL.createObjectURL(file);
      };
    });
  }

  function meta() {
    render(`
      ${field("Page title", "metaTitle", "text", "AWDEV")}
      ${field("Description", "metaDescription", "text", "Free online developer tools and resources.")}
      ${field("Canonical URL", "metaUrl", "url", "https://awdev.eu.org/tools/")}
      ${field("Preview image URL", "metaImage", "url", "https://awdev.eu.org/tools/awdev.jpg")}
      ${button("makeMeta", "Generate tags")}
      ${output("devOutput", 12)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
    `, () => {
      document.getElementById("makeMeta").onclick = () => {
        const esc = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
        const title = esc(get("metaTitle"));
        const description = esc(get("metaDescription"));
        const url = esc(get("metaUrl"));
        const image = esc(get("metaImage"));
        show("devOutput", `<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">`);
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function robots() {
    render(`
      ${field("User-agent", "robotsAgent", "text", "*")}
      ${field("Disallow path", "robotsDisallow", "text", "")}
      ${field("Allow path", "robotsAllow", "text", "/")}
      ${field("Sitemap URL (optional)", "robotsSitemap", "url", "https://awdev.eu.org/sitemap.xml")}
      ${button("makeRobots", "Generate robots.txt")}
      ${output()}
      <button id="downloadRobots" class="button button-secondary" type="button">Download robots.txt</button>
    `, () => {
      document.getElementById("makeRobots").onclick = () => {
        const lines = [
          `User-agent: ${get("robotsAgent") || "*"}`,
          `Allow: ${get("robotsAllow") || "/"}`,
          ...(get("robotsDisallow") ? [`Disallow: ${get("robotsDisallow")}`] : []),
          ...(get("robotsSitemap") ? ["", `Sitemap: ${get("robotsSitemap")}`] : [])
        ];
        show("devOutput", lines.join("\n"));
      };
      document.getElementById("downloadRobots").onclick = () => download("robots.txt", get("devOutput"));
    });
  }

  function sitemap() {
    render(`
      ${area("One absolute URL per line", "sitemapUrls", "https://awdev.eu.org/tools/", 8)}
      ${button("makeSitemap", "Generate XML sitemap")}
      ${output("devOutput", 10)}
      <button id="downloadSitemap" class="button button-secondary" type="button">Download sitemap.xml</button>
    `, () => {
      document.getElementById("makeSitemap").onclick = () => {
        const urls = get("sitemapUrls").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        if (urls.some(url => !/^https?:\/\//i.test(url))) {
          return show("devOutput", "Every URL must begin with http:// or https://");
        }
        const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        show("devOutput", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join("\n")}\n</urlset>`);
      };
      document.getElementById("downloadSitemap").onclick = () =>
        download("sitemap.xml", get("devOutput"), "application/xml;charset=utf-8");
    });
  }

  function utm() {
    render(`
      ${field("Destination URL", "utmUrl", "url", "https://example.com")}
      ${field("Campaign source", "utmSource")}
      ${field("Campaign medium", "utmMedium")}
      ${field("Campaign name", "utmCampaign")}
      ${field("Campaign term (optional)", "utmTerm")}
      ${field("Campaign content (optional)", "utmContent")}
      ${button("makeUtm", "Build URL")}
      ${output("devOutput", 4)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
    `, () => {
      document.getElementById("makeUtm").onclick = () => {
        try {
          const url = new URL(get("utmUrl"));
          [["utm_source", "utmSource"], ["utm_medium", "utmMedium"],
           ["utm_campaign", "utmCampaign"], ["utm_term", "utmTerm"],
           ["utm_content", "utmContent"]].forEach(([param, id]) => {
            if (get(id).trim()) url.searchParams.set(param, get(id).trim());
          });
          show("devOutput", url.toString());
        } catch {
          show("devOutput", "Enter a valid destination URL.");
        }
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function parseHtml() {
    render(`
      ${area("HTML input", "parseInput", "", 7)}
      ${button("parseHtml", "Escape HTML")}
      ${output()}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
    `, () => {
      document.getElementById("parseHtml").onclick = () => {
        show("devOutput", get("parseInput").replace(/[&<>"']/g, char =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])));
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function counter() {
    render(`
      ${area("Text to count", "counterInput", "", 8)}
      <div id="counterStats" class="tool-output" aria-live="polite">
        Words: 0 · Characters: 0 · Sentences: 0 · Paragraphs: 0 · Reading time: 0 min
      </div>
    `, () => {
      document.getElementById("counterInput").oninput = () => {
        const text = get("counterInput");
        const trimmed = text.trim();
        const words = trimmed ? trimmed.match(/\S+/g).length : 0;
        const sentences = (text.match(/[.!?]+(?=\s|$)/g) || []).length;
        const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;
        setTextResult("counterStats",
          `Words: ${words} · Characters: ${text.length} · Sentences: ${sentences} · Paragraphs: ${paragraphs} · Reading time: ${words ? Math.max(1, Math.ceil(words / 200)) : 0} min`);
      };
    });
  }

  function caseTool() {
    render(`
      ${area("Text", "caseInput", "", 6)}
      <label for="caseType">Conversion</label>
      <select id="caseType" class="tool-field">
        <option value="upper">UPPERCASE</option><option value="lower">lowercase</option>
        <option value="title">Title Case</option><option value="camel">camelCase</option>
        <option value="snake">snake_case</option>
      </select>
      ${button("convertCase", "Convert")}
      ${output()}
    `, () => {
      document.getElementById("convertCase").onclick = () => {
        const text = get("caseInput");
        const words = text.trim().split(/[\s_-]+/).filter(Boolean);
        const type = get("caseType");
        const result = type === "upper" ? text.toUpperCase()
          : type === "lower" ? text.toLowerCase()
          : type === "title" ? text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
          : type === "snake" ? words.map(word => word.toLowerCase()).join("_")
          : words.map((word, index) => index ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join("");
        show("devOutput", result);
      };
    });
  }

  function lorem() {
    const sample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vitae sem at urna bibendum efficitur. Sed facilisis, neque at commodo aliquet, erat lorem tincidunt est.";
    render(`
      ${field("Number of paragraphs", "loremCount", "number", "3", 'min="1" max="30"')}
      ${button("makeLorem", "Generate")}
      ${output("devOutput", 10)}
      <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
    `, () => {
      document.getElementById("makeLorem").onclick = () => {
        const count = Math.max(1, Math.min(30, Number(get("loremCount")) || 1));
        show("devOutput", Array.from({ length: count }, () => sample).join("\n\n"));
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
    });
  }

  function diff() {
    render(`
      ${area("Original text", "diffA", "", 7)}
      ${area("Changed text", "diffB", "", 7)}
      ${button("compareText", "Compare lines")}
      <pre id="diffOutput" class="tool-output"></pre>
    `, () => {
      document.getElementById("compareText").onclick = () => {
        const a = get("diffA").split(/\r?\n/);
        const b = get("diffB").split(/\r?\n/);
        const max = Math.max(a.length, b.length);
        const lines = [];
        for (let i = 0; i < max; i++) {
          if (a[i] === b[i]) lines.push(`  ${a[i] ?? ""}`);
          else {
            if (a[i] !== undefined) lines.push(`- ${a[i]}`);
            if (b[i] !== undefined) lines.push(`+ ${b[i]}`);
          }
        }
        setTextResult("diffOutput", lines.join("\n"));
      };
    });
  }

  function markdown() {
    render(`
      ${area("Markdown", "markdownInput", "# Hello AWDEV\\n\\nWrite **bold** text and a [link](https://example.com).", 8)}
      ${button("convertMarkdown", "Convert to HTML")}
      ${output("devOutput", 8)}
      <div id="markdownPreview" class="tool-output"></div>
    `, () => {
      document.getElementById("convertMarkdown").onclick = () => {
        const escape = value => value.replace(/[&<>"']/g, char =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
        let html = escape(get("markdownInput"));
        html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
          .replace(/^## (.+)$/gm, "<h2>$1</h2>")
          .replace(/^# (.+)$/gm, "<h1>$1</h1>")
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
          .replace(/\n/g, "<br>");
        show("devOutput", html);
        document.getElementById("markdownPreview").innerHTML = html;
      };
    });
  }

  function qr() {
    render(`
      ${field("Text or URL", "qrText", "text", "https://awdev.eu.org/tools/")}
      ${field("QR size (pixels)", "qrSize", "number", "280", 'min="100" max="1000"')}
      ${button("makeQr", "Generate QR code")}
      <div id="qrResult" style="text-align:center"></div>
      <button id="downloadQr" class="button button-secondary" type="button">Download PNG</button>
      <small>QR image generation uses the public QRServer service; the text is sent to that service.</small>
    `, () => {
      document.getElementById("makeQr").onclick = () => {
        const text = get("qrText").trim();
        if (!text) return toast("Enter text or a URL.");
        const size = Math.max(100, Math.min(1000, Number(get("qrSize")) || 280));
        const img = document.createElement("img");
        img.id = "qrImage";
        img.alt = "Generated QR code";
        img.width = size;
        img.height = size;
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
        document.getElementById("qrResult").replaceChildren(img);
      };
      document.getElementById("downloadQr").onclick = async () => {
        const img = document.getElementById("qrImage");
        if (!img) return toast("Generate a QR code first.");
        try {
          const response = await fetch(img.src);
          if (!response.ok) throw new Error();
          const blob = await response.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "awdev-qr.png";
          link.click();
          URL.revokeObjectURL(link.href);
        } catch {
          open(img.src, "_blank");
          toast("Opened QR image; save it from the new tab.");
        }
      };
    });
  }

  function password() {
    render(`
      ${field("Password length", "passwordLength", "range", "16", 'min="6" max="64"')}
      <span id="passwordLengthLabel">16</span>
      <label><input id="pwLower" type="checkbox" checked> Lowercase</label>
      <label><input id="pwUpper" type="checkbox" checked> Uppercase</label>
      <label><input id="pwNumbers" type="checkbox" checked> Numbers</label>
      <label><input id="pwSymbols" type="checkbox" checked> Symbols</label>
      <label for="devOutput">Generated password</label>
      <input id="devOutput" class="tool-field" readonly>
      <div class="dialog-actions">
        ${button("generatePassword", "Generate")}
        <button id="copyDevOutput" class="button button-secondary" type="button">Copy</button>
      </div>
      <small>Generated in this browser using the Web Crypto random generator.</small>
    `, () => {
      const length = document.getElementById("passwordLength");
      length.oninput = () => setTextResult("passwordLengthLabel", length.value);
      document.getElementById("generatePassword").onclick = () => {
        let chars = "";
        if (document.getElementById("pwLower").checked) chars += "abcdefghijklmnopqrstuvwxyz";
        if (document.getElementById("pwUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (document.getElementById("pwNumbers").checked) chars += "0123456789";
        if (document.getElementById("pwSymbols").checked) chars += "!@#$%^&*()-_=+[]{}?";
        if (!chars) return toast("Select at least one character set.");
        const random = new Uint32Array(Number(length.value));
        crypto.getRandomValues(random);
        show("devOutput", [...random].map(value => chars[value % chars.length]).join(""));
      };
      document.getElementById("copyDevOutput").onclick = () => copy("devOutput");
      document.getElementById("generatePassword").click();
    });
  }

  function hash() {
    render(`
      ${area("Text to hash", "hashInput", "", 6)}
      <label for="hashAlgorithm">Algorithm</label>
      <select id="hashAlgorithm" class="tool-field">
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-384">SHA-384</option>
        <option value="SHA-512">SHA-512</option>
      </select>
      ${button("makeHash", "Generate hash")}
      ${output("devOutput", 4)}
      <small>Web Crypto provides SHA hashes, not MD5. This tool deliberately does not implement MD5.</small>
    `, () => {
      document.getElementById("makeHash").onclick = async () => {
        if (!crypto.subtle) return show("devOutput", "Web Crypto is unavailable. Use HTTPS or localhost.");
        try {
          const data = new TextEncoder().encode(get("hashInput"));
          const digest = await crypto.subtle.digest(get("hashAlgorithm"), data);
          show("devOutput", [...new Uint8Array(digest)]
            .map(byte => byte.toString(16).padStart(2, "0")).join(""));
        } catch (error) {
          show("devOutput", `Hash error: ${error.message}`);
        }
      };
    });
  }

  function image() {
    render(`
      <label for="imageFile">Choose image</label>
      <input id="imageFile" class="tool-field" type="file" accept="image/*">
      ${field("Max width (px)", "imageWidth", "number", "1200", 'min="1" max="10000"')}
      ${field("JPEG quality (%)", "imageQuality", "range", "80", 'min="10" max="100"')}
      ${button("compressImage", "Compress / resize")}
      <div id="imageResult"></div>
      <a id="downloadImage" class="button button-secondary" hidden>Download image</a>
      <small>Image processing occurs locally in your browser. JPEG output does not preserve transparency.</small>
    `, () => {
      let selectedFile;
      document.getElementById("imageFile").onchange = event => selectedFile = event.target.files?.[0];

      document.getElementById("compressImage").onclick = () => {
        if (!selectedFile) return toast("Choose an image first.");
        const image = new Image();
        image.onload = () => {
          const maxWidth = Math.max(1, Number(get("imageWidth")) || image.width);
          const scale = Math.min(1, maxWidth / image.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          const quality = Math.max(.1, Math.min(1, Number(get("imageQuality")) / 100));
          canvas.toBlob(blob => {
            if (!blob) return toast("Could not encode the image.");
            const url = URL.createObjectURL(blob);
            const result = document.getElementById("imageResult");
            result.innerHTML = "";
            const preview = document.createElement("img");
            preview.src = url;
            preview.alt = "Compressed image preview";
            preview.style.cssText = "max-width:100%;border-radius:10px";
            result.appendChild(preview);
            const link = document.getElementById("downloadImage");
            link.href = url;
            link.download = "awdev-compressed.jpg";
            link.hidden = false;
            link.textContent = `Download JPEG (${Math.round(blob.size / 1024)} KB)`;
          }, "image/jpeg", quality);
          URL.revokeObjectURL(image.src);
        };
        image.onerror = () => toast("The selected file could not be opened as an image.");
        image.src = URL.createObjectURL(selectedFile);
      };
    });
  }

  function timestamp() {
    render(`
      ${field("Unix timestamp (seconds or milliseconds), or date", "timestampInput", "text", String(Math.floor(Date.now() / 1000)))}
      ${button("convertTimestamp", "Convert")}
      ${output("devOutput", 5)}
      <button id="useCurrentTime" class="button button-secondary" type="button">Use current time</button>
    `, () => {
      document.getElementById("convertTimestamp").onclick = () => {
        const value = get("timestampInput").trim();
        let date;
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          const number = Number(value);
          date = new Date(Math.abs(number) < 1e12 ? number * 1000 : number);
        } else {
          date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) return show("devOutput", "Invalid timestamp or date.");
        show("devOutput", `Local: ${date.toLocaleString()}\nUTC: ${date.toUTCString()}\nUnix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}`);
      };
      document.getElementById("useCurrentTime").onclick = () => {
        show("timestampInput", String(Math.floor(Date.now() / 1000)));
        document.getElementById("convertTimestamp").click();
      };
      document.getElementById("convertTimestamp").click();
    });
  }

  const handlers = {
    minifier, formatter, editor, json: jsonTool, regex, base64, url, entities,
    color, gradient, shadow, radius, glass, layout, favicon, meta, robots,
    sitemap, utm, parse: parseHtml, counter, case: caseTool, lorem, diff,
    markdown, qr, password, hash, image, timestamp
  };

  window.AWDEV_DEVELOPER = {
    ids: Object.keys(handlers),
    open(id) {
      const handler = handlers[id];
      if (!handler) {
        render("<p>Developer tool is not configured.</p>");
        return false;
      }
      handler();
      return true;
    }
  };
})();
