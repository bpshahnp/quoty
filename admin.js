import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---- DOM refs ----
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const userEmailEl = document.getElementById("userEmail");

const quoteForm = document.getElementById("quoteForm");
const formTitle = document.getElementById("formTitle");
const formError = document.getElementById("formError");
const fieldId = document.getElementById("fieldId");
const fieldText = document.getElementById("fieldText");
const fieldAuthor = document.getElementById("fieldAuthor");
const fieldCategory = document.getElementById("fieldCategory");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const adminList = document.getElementById("adminList");

let allQuotes = [];

// ---- Auth ----
onAuthStateChanged(auth, user => {
  if (user) {
    loginCard.style.display = "none";
    dashboard.style.display = "block";
    userEmailEl.textContent = user.email;
  } else {
    loginCard.style.display = "block";
    dashboard.style.display = "none";
  }
});

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (err) {
    loginError.textContent = "Couldn't sign in — check your email and password.";
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// ---- Live quote list ----
const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
onSnapshot(q, snapshot => {
  allQuotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderList();
});

function renderList() {
  if (allQuotes.length === 0) {
    adminList.innerHTML = `<p class="meta">No quotes filed yet — add the first one above.</p>`;
    return;
  }
  adminList.innerHTML = allQuotes.map(qt => `
    <li class="admin-row">
      <div>
        <p class="quote-text">${escapeHtml(qt.text || "")}</p>
        <div class="meta">${escapeHtml(qt.author || "Unknown")} &middot; ${escapeHtml(qt.category || "uncategorized")}</div>
      </div>
      <div class="actions">
        <button data-edit="${qt.id}">Edit</button>
        <button data-delete="${qt.id}" class="danger">Delete</button>
      </div>
    </li>
  `).join("");

  adminList.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => startEdit(btn.dataset.edit));
  });
  adminList.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.delete));
  });
}

// ---- Add / edit form ----
function startEdit(id) {
  const qt = allQuotes.find(x => x.id === id);
  if (!qt) return;
  fieldId.value = qt.id;
  fieldText.value = qt.text || "";
  fieldAuthor.value = qt.author || "";
  fieldCategory.value = qt.category || "";
  formTitle.textContent = "Edit quote";
  cancelEditBtn.style.display = "inline-block";
  quoteForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  quoteForm.reset();
  fieldId.value = "";
  formTitle.textContent = "Add a quote";
  cancelEditBtn.style.display = "none";
  formError.textContent = "";
}

cancelEditBtn.addEventListener("click", resetForm);

quoteForm.addEventListener("submit", async e => {
  e.preventDefault();
  formError.textContent = "";

  const text = fieldText.value.trim();
  const author = fieldAuthor.value.trim();
  const category = fieldCategory.value.trim();

  if (!text) {
    formError.textContent = "The quote text can't be empty.";
    return;
  }

  const submitBtn = quoteForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  try {
    if (fieldId.value) {
      await updateDoc(doc(db, "quotes", fieldId.value), { text, author, category });
    } else {
      await addDoc(collection(db, "quotes"), {
        text, author, category, createdAt: serverTimestamp()
      });
    }
    resetForm();
  } catch (err) {
    formError.textContent = "Couldn't save — " + err.message;
  } finally {
    submitBtn.disabled = false;
  }
});

async function handleDelete(id) {
  if (!confirm("Delete this quote? This can't be undone.")) return;
  try {
    await deleteDoc(doc(db, "quotes", id));
  } catch (err) {
    alert("Couldn't delete: " + err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
