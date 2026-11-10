(() => {
  const data = window.BOOKSHELF;
  const library = document.querySelector("#library");
  const filtersEl = document.querySelector("#filters");
  const drawer = document.querySelector("#drawer");
  const backdrop = document.querySelector("#backdrop");
  const drawerBody = document.querySelector("#drawer-body");

  const SPINE_COLORS = [
    "#3d2c29",
    "#24352f",
    "#1b2a41",
    "#4a3428",
    "#2c2438",
    "#2a211c",
    "#1f2430",
    "#3a2f1f",
  ];

  const statusLabel = {
    unread: "未读",
    reading: "在读",
    done: "已读",
  };

  let activeFilter = "全部";

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderHero() {
    const p = data.persona;
    document.querySelector("#hero-sub").textContent = p.subtitle;
    document.querySelector("#hero-title").textContent = p.title;
    document.querySelector("#hero-lead").textContent = p.summary;
    document.querySelector("#stats").innerHTML = p.stats
      .map((s) => `<div class="stat"><strong>${s.value}</strong><span>${s.label}</span></div>`)
      .join("");
    const tags = document.querySelector("#tags");
    if (tags) tags.innerHTML = "";
  }

  function filterOptions() {
    const genres = [...new Set(data.books.map((b) => b.genre))];
    return ["全部", ...genres];
  }

  function renderFilters() {
    filtersEl.innerHTML = filterOptions()
      .map(
        (g) =>
          `<button class="chip ${g === activeFilter ? "active" : ""}" data-filter="${g}" type="button">${g}</button>`,
      )
      .join("");
  }

  function visibleBooks() {
    if (activeFilter === "全部") return data.books;
    return data.books.filter((b) => b.genre === activeFilter);
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function spinesFor(book, color) {
    const count = Math.max(1, Number(book.volumes) || 1);
    const parts = [
      `<img class="cover-face" src="${book.cover}" alt="${escapeHtml(book.title)}" loading="lazy" />`,
    ];
    for (let i = 1; i < count; i += 1) {
      parts.push(
        `<span class="spine" style="background:${color}">${escapeHtml(book.title)}</span>`,
      );
    }
    return `<div class="book-stack">${parts.join("")}</div>`;
  }

  function bookButton(book, idx) {
    const color = SPINE_COLORS[idx % SPINE_COLORS.length];
    return `
      <button class="book" type="button" data-id="${book.id}" aria-label="${escapeHtml(book.title)}">
        ${spinesFor(book, color)}
        <div class="book-caption">
          ${escapeHtml(book.title)}
          <small>${escapeHtml(book.author)}</small>
        </div>
      </button>
    `;
  }

  function renderLibrary() {
    const books = visibleBooks();
    const shelves = chunk(books, 5);
    library.innerHTML = `
      <div class="case">
        <div class="case-label">
          <h2>书架</h2>
          <span>${books.length} 部 · ${books.reduce((n, b) => n + (b.volumes || 1), 0)} 册</span>
        </div>
        ${
          shelves.length
            ? shelves
                .map(
                  (row, i) => `
            <div class="shelf">
              <div class="shelf-row">
                ${row.map((b, j) => bookButton(b, i * 5 + j)).join("")}
              </div>
              <div class="shelf-plank"></div>
            </div>`,
                )
                .join("")
            : `<p class="empty">这层暂时空着</p>`
        }
      </div>
    `;
  }

  function openDrawer(id) {
    const book = data.books.find((b) => b.id === id);
    if (!book) return;
    const extras = (book.extraCovers || [])
      .map((src) => `<img class="drawer-cover" src="${src}" alt="" />`)
      .join("");
    drawerBody.innerHTML = `
      <div class="drawer-cover-wrap">
        <img class="drawer-cover" src="${book.cover}" alt="${escapeHtml(book.title)}" />
        ${extras}
      </div>
      <h2>${escapeHtml(book.title)}</h2>
      <p class="sub">${escapeHtml(book.author)} · ${book.volumes} 册 · ${escapeHtml(book.genre)} · ${statusLabel[book.status] || ""}</p>
      <section>
        <h3>简介</h3>
        <p class="blurb">${escapeHtml(book.blurb)}</p>
      </section>
    `;
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    renderFilters();
    renderLibrary();
  });

  library.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    openDrawer(card.dataset.id);
  });

  document.querySelector("#close-drawer").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  renderHero();
  renderFilters();
  renderLibrary();
})();
