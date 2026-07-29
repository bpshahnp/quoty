import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const grid = document.getElementById("catalogGrid");
const tabsEl = document.getElementById("drawerTabs");
const searchInput = document.getElementById("searchInput");
const countEl = document.getElementById("catalogCount");

let allQuotes = [];
let activeCategory = "all";

function renderTabs() {
  const categories = Array.from(
    new Set(allQuotes.map(q => q.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const tabs = ["all", ...categories];
  tabsEl.innerHTML = tabs.map(cat => `
    <button class="drawer-tab ${cat === activeCategory ? "active" : ""}" data-cat="${escapeAttr(cat)}">
      ${cat === "all" ? "All quotes" : escapeHtml(cat)}
    </button>
  `).join("");

  tabsEl.querySelectorAll(".drawer-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderTabs();
      renderGrid();
    });
  });
}

function renderGrid() {
  const term = searchInput.value.trim().toLowerCase();

  const filtered = allQuotes.filter(q => {
    const matchesCategory = activeCategory === "all" || q.category === activeCategory;
    const matchesSearch = !term ||
      (q.text || "").toLowerCase().includes(term) ||
      (q.author || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  countEl.textContent = `${filtered.length} of ${allQuotes.length} quotes filed`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No quotes filed under this heading yet.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((q, i) => `
    <article class="card">
      <div class="card-id">Q &middot; ${String(i + 1).padStart(3, "0")}</div>
      <p class="card-quote">${escapeHtml(q.text || "")}</p>
      <div class="card-footer">
        <span class="card-author">${escapeHtml(q.author || "Unknown")}</span>
        ${q.category ? `<span class="card-tag">${escapeHtml(q.category)}</span>` : ""}
      </div>
    </article>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

searchInput.addEventListener("input", renderGrid);

const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
onSnapshot(q, snapshot => {
  allQuotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTabs();
  renderGrid();
}, err => {
  grid.innerHTML = `<div class="empty-state">Couldn't load quotes: ${escapeHtml(err.message)}</div>`;
});
