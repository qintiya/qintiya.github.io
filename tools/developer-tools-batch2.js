(function () {
  "use strict";

  const content = () => document.getElementById("dialogContent");

  function render(html, setup) {
    content().innerHTML = html;
    setup?.();
  }

  function toast(message) {
    window.AWDEV_TOOLS?.toast
      ? window.AWDEV_TOOLS.toast(message)
      : console.log(message);
  }

  function input(label, id, type = "text", value = "") {
    return `<label for="${id}">${label}</label>
      <input id="${id}" class="tool-field" type="${type}" value="${value}">`;
  }

  function textarea(label, id, value = "", rows = 7) {
    return `<label for="${id}">${label}</label>
      <textarea id="${id}" class="tool-field" rows="${rows}">${value}</textarea>`;
  }

  function output(id = "batchOutput", rows = 7) {
    return `<label for="${id}">Output</label>
      <textarea id="${id}" class="tool-field" rows="${rows}" readonly></textarea>`;
  }

  function copy(id) {
    const element = document.getElementById(id);
    if (!element?.value) return toast("No output to copy.");
    navigator.clipboard.writeText(element.value)
      .then(() => toast("Copied!"))
      .catch(() => toast("Unable to access the clipboard."));
  }

  function download(filename, contentType, text) {
    const url = URL.createObjectURL(
      new Blob([text], { type: contentType })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function favicon() {
    render(`
      <label for="faviconFile">Upload an image</label>
      <input id="faviconFile" class="tool-field" type="file" accept="image/*">
      <div id="faviconOutput" class="dialog-actions"></div>
    `, () => {
      document.getElementById("faviconFile").onchange = event => {
        const file = event.target.files[0];
        if (!file) return;

        const image = new Image();
        image.onload = () => {
          const result = document.getElementById("faviconOutput");
          result.innerHTML = "";

          [16, 32, 180].forEach(size => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            canvas.getContext("2d").drawImage(image, 0, 0, size, size);

            const link = document.createElement("a");
            link.className = "button button-secondary";
            link.download = `favicon-${size}.png`;
            link.href = canvas.toDataURL("image/png");
            link.textContent = `Download ${size}×${size}`;
            result.appendChild(link);
          });

          URL.revokeObjectURL(image.src);
        };

        image.src = URL.createObjectURL(file);
      };
    });
  }

  function robots() {
    render(`
      ${input("User-agent", "robotsAgent", "text", "*")}
      ${input("Disallow path", "robotsDisallow")}
      ${input("Allow path", "robotsAllow", "text", "/")}
      ${input("Sitemap URL", "robotsSitemap", "url",
        "https://awdev.eu.org/sitemap.xml")}
      <button id="generateRobots" class="button button-primary" type="button">Generate</button>
      ${output()}
    `, () => {
      document.getElementById("generateRobots").onclick = () => {
        const agent = document.getElementById("robotsAgent").value || "*";
        const allow = document.getElementById("robotsAllow").value;
        const disallow = document.getElementById("robotsDisallow").value;
        const sitemap = document.getElementById("robotsSitemap").value;
        document.getElementById("batchOutput").value =
          `User-agent: ${agent}\n` +
          (allow ? `Allow: ${allow}\n` : "") +
          (disallow ? `Disallow: ${disallow}\n` : "") +
          (sitemap ? `\nSitemap: ${sitemap}\n` : "");
      };
    });
  }

  function sitemap() {
    render(`
      ${textarea("Absolute URLs, one per line", "sitemapUrls",
        "https://awdev.eu.org/tools/", 9)}
      <div class="dialog-actions">
        <button id="generateSitemap" class="button button-primary" type="button">Generate</button>
        <button id="downloadSitemap" class="button button-secondary" type="button">Download</button>
      </div>
      ${output("batchOutput", 10)}
    `, () => {
      document.getElementById("generateSitemap").onclick = () => {
        const urls = document.getElementById("sitemapUrls").value
          .split(/\r?\n/)
          .map(url => url.trim())
          .filter(url => /^https?:\/\//i.test(url));

        document.getElementById("batchOutput").value =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map(url =>
            `  <url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`
          ).join("\n") +
          `\n</urlset>`;
      };

      document.getElementById("downloadSitemap").onclick = () => {
        const text = document.getElementById("batchOutput").value;
        if (text) download("sitemap.xml", "application/xml", text);
      };
    });
  }

  function utm() {
    render(`
      ${input("Destination URL", "utmUrl", "url",
        "https://awdev.eu.org/tools/")}
      ${input("Source", "utmSource", "text", "newsletter")}
      ${input("Medium", "utmMedium", "text", "email")}
      ${input("Campaign", "utmCampaign", "text", "awdev-launch")}
      ${input("Term", "utmTerm")}
      ${input("Content", "utmContent")}
      <button id="generateUtm" class="button button-primary" type="button">Build URL</button>
      ${output("batchOutput", 4)}
    `, () => {
      document.getElementById("generateUtm").onclick = () => {
        try {
          const url = new URL(document.getElementById("utmUrl").value);
          [
            ["utm_source", "utmSource"],
            ["utm_medium", "utmMedium"],
            ["utm_campaign", "utmCampaign"],
            ["utm_term", "utmTerm"],
            ["utm_content", "utmContent"]
          ].forEach(([parameter, id]) => {
            const value = document.getElementById(id).value.trim();
            if (value) url.searchParams.set(parameter, value);
          });
          document.getElementById("batchOutput").value = url.toString();
        } catch {
          document.getElementById("batchOutput").value =
            "Enter a valid destination URL.";
        }
      };
    });
  }

  function parseHtml() {
    render(`
      ${textarea("HTML input", "parseInput", "<p>Hello & welcome</p>", 8)}
      <div class="dialog-actions">
        <button id="escapeHtml" class="button button-primary" type="button">Escape</button>
        <button id="unescapeHtml" class="button button-secondary" type="button">Unescape</button>
      </div>
      ${output()}
    `, () => {
      document.getElementById("escapeHtml").onclick = () => {
        document.getElementById("batchOutput").value =
          document.getElementById("parseInput").value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
      };

      document.getElementById("unescapeHtml").onclick = () => {
        const element = document.createElement("textarea");
        element.innerHTML = document.getElementById("parseInput").value;
        document.getElementById("batchOutput").value = element.value;
      };
    });
  }

  function counter() {
    render(`
      ${textarea("Text", "counterText", "", 9)}
      <div id="counterResult" class="tool-output">
        0 words · 0 characters · 0 sentences · 0 paragraphs · 0-minute reading time
      </div>
    `, () => {
      document.getElementById("counterText").oninput = event => {
        const text = event.target.value;
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const characters = text.length;
        const sentences = trimmed
          ? (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length
          : 0;
        const paragraphs = trimmed
          ? trimmed.split(/\n\s*\n/).filter(Boolean).length
          : 0;

        document.getElementById("counterResult").textContent =
          `${words} words · ${characters} characters · ${sentences} sentences · ` +
          `${paragraphs} paragraphs · ${words ? Math.max(1, Math.ceil(words / 200)) : 0}-minute reading time`;
      };
    });
  }

  function caseConverter() {
    render(`
      ${textarea("Text", "caseText", "hello awdev tools", 7)}
      <label for="caseType">Conversion</label>
      <select id="caseType" class="tool-field">
        <option value="upper">UPPERCASE</option>
        <option value="lower">lowercase</option>
        <option value="title">Title Case</option>
        <option value="camel">camelCase</option>
        <option value="snake">snake_case</option>
      </select>
      <button id="convertCase" class="button button-primary" type="button">Convert</button>
      ${output()}
    `, () => {
      document.getElementById("convertCase").onclick = () => {
        const text = document.getElementById("caseText").value;
        const type = document.getElementById("caseType").value;
        const words = text.trim().split(/[\s_-]+/).filter(Boolean);
        let result = "";

        if (type === "upper") result = text.toUpperCase();
        if (type === "lower") result = text.toLowerCase();
        if (type === "title") {
          result = text.toLowerCase().replace(/\b\w/g,
            character => character.toUpper());
        }
        if (type === "snake") {
          result = words.map(word => word.toLowerCase()).join("_");
        }
        if (type === "camel") {
          result = words.map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpper() + word.slice(1).toLower()
          ).join("");
        }

        document.getElementById("batchOutput").value = result;
      };
    });
  }

  function lorem() {
    const sample =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

    render(`
      ${input("Paragraph count", "loremCount", "number", "3")}
      <button id="generateLorem" class="button button-primary" type="button">Generate</button>
      ${output("batchOutput", 12)}
    `, () => {
      document.getElementById("generateLorem").onclick = () => {
        const count = Math.max(
          1,
          Math.min(50, Number(document.getElementById("loremCount").value) || 1)
        );
        document.getElementById("batchOutput").value =
          Array.from({ length: count }, () =>
            sample.repeat(7).trim()
          ).join("\n\n");
      };
    });
  }

  function diff() {
    render(`
      ${textarea("Original text", "diffOriginal", "", 7)}
      ${textarea("Changed text", "diffChanged", "", 7)}
      <button id="compareDiff" class="button button-primary" type="button">Compare</button>
      <pre id="diffResult" class="tool-output"></pre>
    `, () => {
      document.getElementById("compareDiff").onclick = () => {
        const original = document.getElementById("diffOriginal").value.split(/\r?\n/);
        const changed = document.getElementById("diffChanged").value.split(/\r?\n/);
        const rows = [];
        const length = Math.max(original.length, changed.length);

        for (let index = 0; index < length; index++) {
          if (original[index] === changed[index]) {
            rows.push(`  ${original[index] ?? ""}`);
          } else {
            if (original[index] !== undefined) rows.push(`- ${original[index]}`);
            if (changed[index] !== undefined) rows.push(`+ ${changed[index]}`);
          }
        }

        document.getElementById("diffResult").textContent = rows.join("\n");
      };
    });
  }

  function markdown() {
    render(`
      ${textarea("Markdown", "markdownText",
        "# AWDEV\n\nThis is **bold** and [a link](https://awdev.eu.org).", 8)}
      <button id="convertMarkdown" class="button button-primary" type="button">Convert</button>
      ${output("batchOutput", 8)}
      <div id="markdownPreview" class="tool-output"></div>
    `, () => {
      document.getElementById("convertMarkdown").onclick = () => {
        let html = document.getElementById("markdownText").value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");

        html = html
          .replace(/^### (.+)$/gm, "<h3>$1</h3>")
          .replace(/^## (.+)$/gm, "<h2>$1</h2>")
          .replace(/^# (.+)$/gm, "<h1>$1</h1>")
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener">$1</a>')
          .replace(/\n/g, "<br>");

        document.getElementById("batchOutput").value = html;
        document.getElementById("markdownPreview").innerHTML = html;
      };
    });
  }

  function qr() {
    render(`
      ${input("Text or URL", "qrText", "text", "https://awdev.eu.org/tools/")}
      ${input("Size", "qrSize", "number", "300")}
      <button id="generateQr" class="button button-primary" type="button">Generate</button>
      <div id="qrResult" style="text-align:center"></div>
      <small>The text is sent to a public QR image service.</small>
    `, () => {
      document.getElementById("generateQr").onclick = () => {
        const text = document.getElementById("qrText").value.trim();
        if (!text) return toast("Enter text or a URL.");

        const size = Math.max(
          100,
          Math.min(1000, Number(document.getElementById("qrSize").value) || 300)
        );

        const image = document.createElement("img");
        image.src =
          `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=` +
          encodeURIComponent(text);
        image.alt = "Generated QR code";
        image.width = size;
        image.height = size;
        document.getElementById("qrResult").replaceChildren(image);
      };
    });
  }

  function password() {
    render(`
      ${input("Length", "passwordLength", "range", "16")}
      <label><input id="pwUpper" type="checkbox" checked> Uppercase</label>
      <label><input id="pwLower" type="checkbox" checked> Lowercase</label>
      <label><input id="pwNumber" type="checkbox" checked> Numbers</label>
      <label><input id="pwSymbol" type="checkbox" checked> Symbols</label>
      ${output("batchOutput", 3)}
      <div class="dialog-actions">
        <button id="generatePassword" class="button button-primary" type="button">Generate</button>
        <button id="copyPassword" class="button button-secondary" type="button">Copy</button>
      </div>
    `, () => {
      document.getElementById("passwordLength").min = "6";
      document.getElementById("passwordLength").max = "64";

      document.getElementById("generatePassword").onclick = () => {
        let characters = "";
        if (document.getElementById("pwUpper").checked) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (document.getElementById("pwLower").checked) characters += "abcdefghijklmnopqrstuvwxyz";
        if (document.getElementById("pwNumber").checked) characters += "0123456789";
        if (document.getElementById("pwSymbol").checked) characters += "!@#$%^&*()-_=+[]{}?";
        if (!characters) return toast("Select at least one character type.");

        const length = Number(document.getElementById("passwordLength").value);
        const random = new Uint32Array(length);
        crypto.getRandomValues(random);
        document.getElementById("batchOutput").value =
          [...random].map(value => characters[value % characters.length]).join("");
      };

      document.getElementById("copyPassword").onclick = () => copy("batchOutput");
    });
  }

  async function hashText(text, algorithm) {
    if (!crypto.subtle) throw new Error("Web Crypto requires HTTPS or localhost.");
    const digest = await crypto.subtle.digest(
      algorithm,
      new TextEncoder().encode(text)
    );
    return [...new Uint8Array(digest)]
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function hash() {
    render(`
      ${textarea("Text", "hashText", "", 7)}
      <label for="hashAlgorithm">Algorithm</label>
      <select id="hashAlgorithm" class="tool-field">
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-384">SHA-384</option>
        <option value="SHA-512">SHA-512</option>
      </select>
      <button id="generateHash" class="button button-primary" type="button">Generate</button>
      ${output("batchOutput", 4)}
      <small>Browser Web Crypto does not provide MD5.</small>
    `, () => {
      document.getElementById("generateHash").onclick = async () => {
        try {
          const text = document.getElementById("hashText").value;
          const algorithm =
            document.getElementById("hashAlgorithm").value;
          document.getElementById("batchOutput").value =
            await hashText(text, algorithm);
        } catch (error) {
          document.getElementById("batchOutput").value =
            `Hash error: ${error.message}`;
        }
      };
    });
  }

  function image() {
    render(`
      <label for="imageFile">Choose an image</label>
      <input id="imageFile" class="tool-field" type="file" accept="image/*">
      ${input("Maximum width", "imageWidth", "number", "1200")}
      ${input("JPEG quality (%)", "imageQuality", "number", "80")}
      <button id="processImage" class="button button-primary" type="button">Process</button>
      <div id="imagePreview"></div>
      <a id="imageDownload" class="button button-secondary" hidden>Download JPEG</a>
    `, () => {
      let selectedFile = null;
      document.getElementById("imageFile").onchange = event => {
        selectedFile = event.target.files[0] || null;
      };

      document.getElementById("processImage").onclick = () => {
        if (!selectedFile) return toast("Choose an image first.");

        const image = new Image();
        image.onload = () => {
          const maxWidth = Math.max(
            1,
            Number(document.getElementById("imageWidth").value) || image.width
          );
          const scale = Math.min(1, maxWidth / image.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          canvas.getContext("2d").drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const quality = Math.max(
            0.1,
            Math.min(
              1,
              (Number(document.getElementById("imageQuality").value) || 80) / 100
            )
          );

          canvas.toBlob(blob => {
            if (!blob) return toast("Unable to process this image.");
            const url = URL.createObjectURL(blob);

            const preview = document.createElement("img");
            preview.src = url;
            preview.alt = "Processed image preview";
            preview.style.cssText = "max-width:100%;border-radius:10px";
            document.getElementById("imagePreview").replaceChildren(preview);

            const download = document.getElementById("imageDownload");
            download.hidden = false;
            download.href = url;
            download.download = "awdev-image.jpg";
            download.textContent =
              `Download JPEG (${Math.round(blob.size / 1024)} KB)`;
          }, "image/jpeg", quality);

          URL.revokeObjectURL(image.src);
        };

        image.onerror = () => toast("The image could not be decoded.");
        image.src = URL.createObjectURL(selectedFile);
      };
    });
  }

  function timestamp() {
    render(`
      ${input("Unix timestamp or date",
        "timestampInput", "text", String(Math.floor(Date.now() / 1000)))}
      <div class="dialog-actions">
        <button id="convertTimestamp" class="button button-primary" type="button">Convert</button>
        <button id="currentTimestamp" class="button button-secondary" type="button">Now</button>
      </div>
      ${output("batchOutput", 5)}
    `, () => {
      document.getElementById("convertTimestamp").onclick = () => {
        const value = document.getElementById("timestampInput").value.trim();
        let date;

        if (/^-?\d+$/.test(value)) {
          const number = Number(value);
          date = new Date(number < 100000000000 ? number * 1000 : number);
        } else {
          date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) {
          document.getElementById("batchOutput").value =
            "Invalid timestamp or date.";
          return;
        }

        document.getElementById("batchOutput").value =
          `Local: ${date.toLocaleString()}\n` +
          `UTC: ${date.toUTCString()}\n` +
          `Unix seconds: ${Math.floor(date.getTime() / 1000)}\n` +
          `Unix milliseconds: ${date.getTime()}`;
      };

      document.getElementById("currentTimestamp").onclick = () => {
        document.getElementById("timestampInput").value =
          String(Math.floor(Date.now() / 1000));
        document.getElementById("convertTimestamp").click();
      };
    });
  }

  const handlers = {
    favicon,
    robots,
    sitemap,
    utm,
    parse: parseHtml,
    counter,
    case: caseConverter,
    lorem,
    diff,
    markdown,
    qr,
    password,
    hash,
    image,
    timestamp
  };

  window.AWDEV_DEVELOPER_BATCH2 = {
    ids: Object.keys(handlers),
    open(id) {
      if (!handlers[id]) return false;
      handlers[id]();
      return true;
    }
  };
})();
