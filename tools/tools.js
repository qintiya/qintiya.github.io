/* Interactive tool implementations */

window.AWDEV_TOOLS = {
  escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  },

  toast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(window.awdevToastTimeout);
    window.awdevToastTimeout = setTimeout(() => toast.classList.remove("visible"), 2200);
  },

  renderContainer(content) {
    document.getElementById("dialogContent").innerHTML = content;
  },

  counter() {
    this.renderContainer(`
      <label for="counterInput">Enter text</label>
      <textarea id="counterInput" class="tool-field" rows="8" placeholder="Write or paste text here…"></textarea>

      <div class="stats">
        <div><strong id="wordCount">0</strong><span>Words</span></div>
        <div><strong id="characterCount">0</strong><span>Characters</span></div>
        <div><strong id="sentenceCount">0</strong><span>Sentences</span></div>
        <div><strong id="readingTime">0 min</strong><span>Reading time</span></div>
      </div>
    `);

    const input = document.getElementById("counterInput");

    input.addEventListener("input", () => {
      const text = input.value.trim();
      const words = text ? text.match(/\S+/g).length : 0;
      const sentences = text ? (text.match(/[.!?]+(?=\s|$)/g) || []).length : 0;

      document.getElementById("wordCount").textContent = words;
      document.getElementById("characterCount").textContent = input.value.length;
      document.getElementById("sentenceCount").textContent = sentences;
      document.getElementById("readingTime").textContent =
        `${Math.max(1, Math.ceil(words / 200))} min`;
    });
  },

  password() {
    this.renderContainer(`
      <label for="passwordLength">Password length: <span id="passwordLengthValue">16</span></label>
      <input id="passwordLength" type="range" class="tool-field" min="6" max="64" value="16">

      <label><input id="passwordUppercase" type="checkbox" checked> Uppercase letters</label>
      <label><input id="passwordLowercase" type="checkbox" checked> Lowercase letters</label>
      <label><input id="passwordNumbers" type="checkbox" checked> Numbers</label>
      <label><input id="passwordSymbols" type="checkbox" checked> Symbols</label>

      <input id="passwordOutput" class="tool-field" readonly aria-label="Generated password">
      <div class="dialog-actions">
        <button id="generatePassword" class="button button-primary" type="button">Generate</button>
        <button id="copyPassword" class="button button-secondary" type="button">Copy</button>
      </div>
    `);

    const lengthInput = document.getElementById("passwordLength");
    const lengthValue = document.getElementById("passwordLengthValue");
    const output = document.getElementById("passwordOutput");

    lengthInput.addEventListener("input", () =>
      lengthValue.textContent = lengthInput.value
    );

    document.getElementById("generatePassword").addEventListener("click", () => {
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()-_=+[]{};:,.?";
      let characters = "";

      if (document.getElementById("passwordUppercase").checked) characters += uppercase;
      if (document.getElementById("passwordLowercase").checked) characters += lowercase;
      if (document.getElementById("passwordNumbers").checked) characters += numbers;
      if (document.getElementById("passwordSymbols").checked) characters += symbols;

      if (!characters) {
        this.toast("Select at least one character type");
        return;
      }

      const length = Number(lengthInput.value);
      const values = new Uint32Array(length);
      crypto.getRandomValues(values);

      output.value = Array.from(values, value =>
        characters[value % characters.length]
      ).join("");
    });

    document.getElementById("copyPassword").addEventListener("click", async () => {
      if (!output.value) return;
      await navigator.clipboard.writeText(output.value);
      this.toast("Password copied");
    });

    document.getElementById("generatePassword").click();
  },

  base64() {
    this.renderContainer(`
      <label for="base64Input">Text</label>
      <textarea id="base64Input" class="tool-field" rows="7" placeholder="Enter text…"></textarea>

      <div class="dialog-actions">
        <button id="base64Encode" class="button button-primary" type="button">Encode</button>
        <button id="base64Decode" class="button button-secondary" type="button">Decode</button>
        <button id="base64Copy" class="button button-secondary" type="button">Copy output</button>
      </div>

      <label for="base64Output">Output</label>
      <textarea id="base64Output" class="tool-field" rows="7" readonly></textarea>
    `);

    const input = document.getElementById("base64Input");
    const output = document.getElementById("base64Output");

    document.getElementById("base64Encode").addEventListener("click", () => {
      const bytes = new TextEncoder().encode(input.value);
      let binary = "";

      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }

      output.value = btoa(binary);
    });

    document.getElementById("base64Decode").addEventListener("click", () => {
      try {
        const binary = atob(input.value.trim());
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        output.value = new TextDecoder().decode(bytes);
      } catch (error) {
        this.toast("Invalid Base64 text");
      }
    });

    document.getElementById("base64Copy").addEventListener("click", async () => {
      if (!output.value) return;
      await navigator.clipboard.writeText(output.value);
      this.toast("Copied");
    });
  },

  tasbih() {
    const stored = Number(localStorage.getItem("awdevTasbih") || 0);

    this.renderContainer(`
      <div id="tasbihCount" class="counter-number">${stored}</div>
      <label for="tasbihTarget">Target</label>
      <select id="tasbihTarget" class="tool-field">
        <option value="33">33</option>
        <option value="99">99</option>
        <option value="100">100</option>
      </select>

      <div class="dialog-actions">
        <button id="tasbihIncrement" class="button button-primary" type="button">Count</button>
        <button id="tasbihReset" class="button button-secondary" type="button">Reset</button>
      </div>
    `);

    let count = stored;
    const countElement = document.getElementById("tasbihCount");

    document.getElementById("tasbihIncrement").addEventListener("click", () => {
      const target = Number(document.getElementById("tasbihTarget").value);
      count = count >= target ? 1 : count + 1;
      countElement.textContent = count;
      localStorage.setItem("awdevTasbih", String(count));

      if (navigator.vibrate) navigator.vibrate(30);
    });

    document.getElementById("tasbihReset").addEventListener("click", () => {
      count = 0;
      countElement.textContent = "0";
      localStorage.setItem("awdevTasbih", "0");
    });
  },

  open(id) {
    const implementations = {
      counter: () => this.counter(),
      password: () => this.password(),
      base64: () => this.base64(),
      tasbih: () => this.tasbih()
    };

    if (implementations[id]) {
      implementations[id]();
      return;
    }

    this.renderContainer(`
      <p>
        This utility is ready for activation as a dedicated module.
        Share a tool name to continue with its full client-side implementation.
      </p>
      <div class="tool-output">No server data is sent from this demo interface.</div>
    `);
  }
};
