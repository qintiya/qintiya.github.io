/* AWDEV tool helpers, demo tools, and module router */
(function () {
  "use strict";

  function getDialogContent() {
    return document.getElementById("dialogContent");
  }

  function showToast(message) {
    const element = document.getElementById("toast");
    if (!element) {
      console.info(message);
      return;
    }

    element.textContent = message;
    element.classList.add("visible");
    clearTimeout(window.awdevToastTimeout);
    window.awdevToastTimeout = setTimeout(
      () => element.classList.remove("visible"),
      2200
    );
  }

  function renderContainer(html) {
    const element = getDialogContent();
    if (!element) {
      console.error('Elemen dengan id="dialogContent" tidak ditemukan.');
      return false;
    }

    element.innerHTML = html;
    return true;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        if (!copied) throw new Error("Copy failed");
      }

      showToast("Copied!");
    } catch (error) {
      showToast("Tidak dapat menyalin. Coba pilih dan salin teks secara manual.");
    }
  }

  function readTasbihCount() {
    try {
      return Math.max(0, Number(localStorage.getItem("awdevTasbih")) || 0);
    } catch {
      return 0;
    }
  }

  function saveTasbihCount(value) {
    try {
      localStorage.setItem("awdevTasbih", String(value));
    } catch {
      showToast("Penyimpanan lokal tidak tersedia.");
    }
  }

  function counter() {
    if (!renderContainer(`
      <label for="counterInput">Enter text</label>
      <textarea id="counterInput" class="tool-field" rows="8"
        placeholder="Write or paste text here…"></textarea>

      <div class="stats">
        <div><strong id="wordCount">0</strong><span>Words</span></div>
        <div><strong id="characterCount">0</strong><span>Characters</span></div>
        <div><strong id="sentenceCount">0</strong><span>Sentences</span></div>
        <div><strong id="readingTime">0 min</strong><span>Reading time</span></div>
      </div>
    `)) return;

    const input = document.getElementById("counterInput");

    input.addEventListener("input", () => {
      const value = input.value;
      const trimmed = value.trim();
      const words = trimmed ? trimmed.match(/\S+/g).length : 0;
      const sentences = trimmed
        ? (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length
        : 0;
      const minutes = words ? Math.ceil(words / 200) : 0;

      document.getElementById("wordCount").textContent = String(words);
      document.getElementById("characterCount").textContent = String(value.length);
      document.getElementById("sentenceCount").textContent = String(sentences);
      document.getElementById("readingTime").textContent = `${minutes} min`;
    });
  }

  function password() {
    if (!renderContainer(`
      <label for="passwordLength">
        Password length: <span id="passwordLengthValue">16</span>
      </label>
      <input id="passwordLength" type="range" class="tool-field"
        min="6" max="64" value="16">

      <label><input id="passwordUppercase" type="checkbox" checked> Uppercase letters</label>
      <label><input id="passwordLowercase" type="checkbox" checked> Lowercase letters</label>
      <label><input id="passwordNumbers" type="checkbox" checked> Numbers</label>
      <label><input id="passwordSymbols" type="checkbox" checked> Symbols</label>

      <label for="passwordOutput">Generated password</label>
      <input id="passwordOutput" class="tool-field" readonly>

      <div class="dialog-actions">
        <button id="generatePassword" class="button button-primary" type="button">Generate</button>
        <button id="copyPassword" class="button button-secondary" type="button">Copy</button>
      </div>
    `)) return;

    const lengthInput = document.getElementById("passwordLength");
    const output = document.getElementById("passwordOutput");

    lengthInput.addEventListener("input", () => {
      document.getElementById("passwordLengthValue").textContent =
        lengthInput.value;
    });

    document.getElementById("generatePassword").addEventListener("click", () => {
      if (!window.crypto?.getRandomValues) {
        showToast("Secure password generation is not supported in this browser.");
        return;
      }

      const characterSets = [];

      if (document.getElementById("passwordUppercase").checked) {
        characterSets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      }
      if (document.getElementById("passwordLowercase").checked) {
        characterSets.push("abcdefghijklmnopqrstuvwxyz");
      }
      if (document.getElementById("passwordNumbers").checked) {
        characterSets.push("0123456789");
      }
      if (document.getElementById("passwordSymbols").checked) {
        characterSets.push("!@#$%^&*()-_=+[]{};:,.?");
      }

      if (!characterSets.length) {
        showToast("Select at least one character type.");
        return;
      }

      const allCharacters = characterSets.join("");
      const length = Number(lengthInput.value);
      const randomValues = new Uint32Array(length + characterSets.length);
      crypto.getRandomValues(randomValues);

      // Ensure at least one character from every selected character set.
      const result = characterSets.map((set, index) =>
        set[randomValues[index] % set.length]
      );

      for (let index = result.length; index < length; index++) {
        result.push(allCharacters[randomValues[index] % allCharacters.length]);
      }

      // Shuffle the generated characters.
      for (let index = result.length - 1; index > 0; index--) {
        const randomIndex = randomValues[index] % (index + 1);
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
      }

      output.value = result.join("");
    });

    document.getElementById("copyPassword").addEventListener("click", () => {
      if (output.value) copyText(output.value);
      else showToast("Generate a password first.");
    });

    document.getElementById("generatePassword").click();
  }

  function base64() {
    if (!renderContainer(`
      <label for="base64Input">Text</label>
      <textarea id="base64Input" class="tool-field" rows="7"
        placeholder="Enter text…"></textarea>

      <div class="dialog-actions">
        <button id="base64Encode" class="button button-primary" type="button">Encode</button>
        <button id="base64Decode" class="button button-secondary" type="button">Decode</button>
        <button id="base64Copy" class="button button-secondary" type="button">Copy output</button>
      </div>

      <label for="base64Output">Output</label>
      <textarea id="base64Output" class="tool-field" rows="7" readonly></textarea>
    `)) return;

    const input = document.getElementById("base64Input");
    const output = document.getElementById("base64Output");

    document.getElementById("base64Encode").addEventListener("click", () => {
      try {
        const bytes = new TextEncoder().encode(input.value);
        let binary = "";
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        output.value = btoa(binary);
      } catch {
        showToast("Could not encode the text.");
      }
    });

    document.getElementById("base64Decode").addEventListener("click", () => {
      try {
        const binary = atob(input.value.trim());
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        output.value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        output.value = "";
        showToast("Invalid Base64 or invalid UTF-8 input.");
      }
    });

    document.getElementById("base64Copy").addEventListener("click", () => {
      if (output.value) copyText(output.value);
      else showToast("There is no output to copy.");
    });
  }

  function tasbih() {
    let count = readTasbihCount();

    if (!renderContainer(`
      <div id="tasbihCount" class="counter-number">${count}</div>

      <label for="tasbihTarget">Target</label>
      <select id="tasbihTarget" class="tool-field">
        <option value="33">33</option>
        <option value="99">99</option>
        <option value="100">100</option>
        <option value="0">No automatic reset</option>
      </select>

      <div class="dialog-actions">
        <button id="tasbihIncrement" class="button button-primary" type="button">Count</button>
        <button id="tasbihReset" class="button button-secondary" type="button">Reset</button>
      </div>
      <small>Count is saved in this browser on this device.</small>
    `)) return;

    const countElement = document.getElementById("tasbihCount");

    document.getElementById("tasbihIncrement").addEventListener("click", () => {
      const target = Number(document.getElementById("tasbihTarget").value);
      count = target && count >= target ? 1 : count + 1;
      countElement.textContent = String(count);
      saveTasbihCount(count);

      if (navigator.vibrate) navigator.vibrate(25);
    });

    document.getElementById("tasbihReset").addEventListener("click", () => {
      count = 0;
      countElement.textContent = "0";
      saveTasbihCount(0);
    });
  }

  function hasId(module, id) {
    return Boolean(module && Array.isArray(module.ids) && module.ids.includes(id));
  }

  function runModule(module, id) {
    if (!hasId(module, id) || typeof module.open !== "function") return false;

    const result = module.open(id);

    // Batch 1's open() may not return a value even when it handled the ID.
    return result !== false;
  }

  window.AWDEV_TOOLS = {
    escapeHtml(value) {
      const element = document.createElement("div");
      element.textContent = String(value ?? "");
      return element.innerHTML;
    },

    toast: showToast,
    renderContainer,

    counter,
    password,
    base64,
    tasbih,

    open(id) {
      const toolId = String(id || "").trim();

      if (!toolId) {
        renderContainer("<p>Tool ID is missing.</p>");
        return false;
      }

      try {
        // Route each tool to the module that owns its ID.
        if (hasId(window.AWDEV_DEVELOPER, toolId)) {
          return runModule(window.AWDEV_DEVELOPER, toolId);
        }

        if (hasId(window.AWDEV_DEVELOPER_BATCH2, toolId)) {
          return runModule(window.AWDEV_DEVELOPER_BATCH2, toolId);
        }

        if (hasId(window.AWDEV_ISLAMIC, toolId)) {
          return runModule(window.AWDEV_ISLAMIC, toolId);
        }

        // Local demo tools if a corresponding module does not claim the ID.
        const localTools = { counter, password, base64, tasbih };
        if (localTools[toolId]) {
          localTools[toolId]();
          return true;
        }

        renderContainer(`
          <p>Tool <strong>${this.escapeHtml(toolId)}</strong> belum terdaftar.</p>
          <p>Periksa ID tool di data.js dan pastikan modul JavaScript-nya dimuat.</p>
        `);
        return false;
      } catch (error) {
        console.error(`AWDEV tool "${toolId}" failed:`, error);
        renderContainer(`
          <p>Tool gagal dijalankan.</p>
          <p>Periksa Console browser untuk detail error.</p>
        `);
        return false;
      }
    }
  };
})();
