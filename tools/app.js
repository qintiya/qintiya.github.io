/* AWDEV application controller */

(function () {
  const data = window.AWDEV_DATA;
  const tools = window.AWDEV_TOOLS;

  const dialog = document.getElementById("toolDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogCategory = document.getElementById("dialogCategory");
  const searchInput = document.getElementById("toolSearch");
  let activeCategory = "All";

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("awdevTheme", theme);

    const toggle = document.getElementById("themeToggle");
    toggle.textContent = theme === "dark" ? "☀" : "☾";
    toggle.setAttribute("aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function initializeTheme() {
    const saved = localStorage.getItem("awdevTheme");
    const preferred = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(saved || preferred);
  }

  function toolCard(item) {
    const [name, category, description, icon, id] = item;

    return `
      <article class="tool-card" data-name="${escapeHTML(name.toLowerCase())}"
               data-category="${escapeHTML(category)}">
        <div class="tool-card-top">
          <span class="tool-icon" aria-hidden="true">${escapeHTML(icon)}</span>
          <span class="tool-category">${escapeHTML(category)}</span>
        </div>
        <h3>${escapeHTML(name)}</h3>
        <p>${escapeHTML(description)}</p>
        <button class="button button-secondary open-tool"
                type="button" data-id="${escapeHTML(id)}"
                data-name="${escapeHTML(name)}"
                data-category="${escapeHTML(category)}">
          Open Tool
        </button>
      </article>
    `;
  }

  function renderDeveloperTools(query = "") {
    const grid = document.getElementById("developerToolGrid");
    const normalizedQuery = query.trim().toLowerCase();

    const items = data.developerTools.filter(([name, category]) => {
      const matchesCategory =
        activeCategory === "All" || category === activeCategory;
      const matchesSearch =
        !normalizedQuery ||
        name.toLowerCase().includes(normalizedQuery) ||
        category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    grid.innerHTML = items.length
      ? items.map(toolCard).join("")
      : `<p class="no-results">No matching developer tools found.</p>`;
  }

  function renderCategoryFilters() {
    const filterRow = document.getElementById("categoryFilters");
    const mainCategories = [
      "All", "Developer Tools", "HTML & CSS", "Code Editor", "Web Tools",
      "Generator", "Web Security", "SEO & Performance", "Color Palette"
    ];

    filterRow.innerHTML = mainCategories.map(category => `
      <button class="filter-chip ${category === "All" ? "active" : ""}"
              type="button" data-category="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </button>
    `).join("");

    filterRow.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      activeCategory = button.dataset.category;
      filterRow.querySelectorAll(".filter-chip")
        .forEach(chip => chip.classList.remove("active"));
      button.classList.add("active");
      renderDeveloperTools(searchInput.value);
    });
  }

  function renderIslamicTools(query = "") {
    const grid = document.getElementById("islamicToolGrid");
    const normalizedQuery = query.trim().toLowerCase();

    const items = data.islamicTools.filter(([name, category]) => {
      if (!normalizedQuery) return true;
      return name.toLowerCase().includes(normalizedQuery)
        || category.toLowerCase().includes(normalizedQuery);
    });

    grid.innerHTML = items.length
      ? items.map(toolCard).join("")
      : `<p class="no-results">No matching Islamic tools found.</p>`;
  }

  function resourceCard([name, url]) {
    return `
      <a class="resource-card" href="${escapeHTML(url)}"
         target="_blank" rel="noopener noreferrer">
        <span>${escapeHTML(name)}</span>
        <span aria-hidden="true">↗</span>
      </a>
    `;
  }

  function openTool(button) {
    dialogTitle.textContent = button.dataset.name;
    dialogCategory.textContent = button.dataset.category;
    tools.open(button.dataset.id);
    dialog.showModal();
  }

  function initializeEventListeners() {
    document.getElementById("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      setTheme(current === "dark" ? "light" : "dark");
    });

    document.getElementById("menuToggle").addEventListener("click", event => {
      const nav = document.getElementById("primaryNav");
      const open = nav.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });

    document.getElementById("dialogClose").addEventListener("click", () =>
      dialog.close()
    );

    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener("click", event => {
      const button = event.target.closest(".open-tool");
      if (button) openTool(button);

      if (event.target.closest("a[href^='#']")) {
        document.getElementById("primaryNav").classList.remove("open");
        document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
      }
    });

    searchInput.addEventListener("input", () => {
      renderDeveloperTools(searchInput.value);
      renderIslamicTools(searchInput.value);
    });

    document.getElementById("contactForm").addEventListener("submit", event => {
      event.preventEvent();
      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
      const subject = encodeURIComponent(`AWDEV contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);

      window.location.href =
        `mailto:hello@awdev.eu.org?subject=${subject}&body=${body}`;
    });
  }

  function initialize() {
    initializeTheme();
    renderCategoryFilters();
    renderDeveloperTools();
    renderIslamicTools();

    document.getElementById("learningGrid").innerHTML =
      data.learning.map(resourceCard).join("");
    document.getElementById("partnersGrid").innerHTML =
      data.partners.map(resourceCard).join("");

    document.getElementById("currentYear").textContent =
      String(new Date().getFullYear());

    initializeEventListeners();
  }

  initialize();
})();

function openTool(button) {
  dialogTitle.textContent = button.dataset.name;
  dialogCategory.textContent = button.dataset.category;

  const id = button.dataset.id;

  if (window.AWDEV_DEVELOPER?.ids.includes(id)) {
    window.AWDEV_DEVELOPER.open(id);
  } else if (window.AWDEV_ISLAMIC?.ids.includes(id)) {
    window.AWDEV_ISLAMIC.open(id);
  } else {
    tools.open(id);
  }

  dialog.showModal();
}
const selectedTool = new URLSearchParams(window.location.search).get("id");

if (selectedTool) {
  const matchingCard = document.querySelector(
    `.open-tool[data-id="${CSS.escape(selectedTool)}"]`
  );

  if (matchingCard) {
    requestAnimationFrame(() => matchingCard.click());
  }
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem("awdevTheme", isDark ? "light" : "dark");
});
