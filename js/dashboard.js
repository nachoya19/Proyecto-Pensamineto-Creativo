/**
 * @file dashboard.js
 * @description Generic dashboard logic for displaying global records.
 * Currently serves as a basic view or fallback dashboard.
 */

import { auth, db } from "./main.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// DOM Elements
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const recordForm = document.getElementById("recordForm");
const typeInput = document.getElementById("type");
const textInput = document.getElementById("text");

const recordsList = document.getElementById("recordsList");
const statusBox = document.getElementById("statusBox");

/**
 * Displays a status message to the user.
 * @param {string} text - The message text.
 * @param {boolean} [ok=true] - Whether the message is success (true) or error (false).
 */
function showStatus(text, ok = true) {
  statusBox.textContent = text;
  statusBox.className = "status " + (ok ? "ok" : "err");
}

/**
 * Creates a DOM element representing a record.
 * @param {Object} docData - The record data from Firestore.
 * @returns {HTMLElement} The constructed div element.
 */
function renderRecord(docData) {
  const div = document.createElement("div");
  div.className = "item";

  const date = docData.createdAt?.toDate ? docData.createdAt.toDate() : null;
  const dateText = date ? date.toLocaleString() : "Ahora";

  div.innerHTML = `
    <div class="item-top">
      <span class="badge">${docData.type}</span>
      <span>${dateText}</span>
    </div>
    <div class="item-text">${docData.text}</div>
  `;

  return div;
}

let unsubscribeRecords = null;

// ✅ PROTECT DASHBOARD & INIT
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // User logged in
  userEmail.textContent = user.email;
  showStatus("✅ Sesión activa. Puedes registrar observaciones.", true);

  // Listen for real-time updates
  const colRef = collection(db, "records");

  // Query last 20 records globally (system-wide)
  const q = query(colRef, orderBy("createdAt", "desc"), limit(20));

  if (unsubscribeRecords) unsubscribeRecords();

  unsubscribeRecords = onSnapshot(q, (snapshot) => {
    recordsList.innerHTML = "";

    if (snapshot.empty) {
      recordsList.innerHTML = `<div class="item">No hay registros todavía.</div>`;
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      recordsList.appendChild(renderRecord(data));
    });
  });
});

// ✅ SAVE RECORD
recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showStatus("❌ No hay sesión. Vuelve al login.", false);
    return;
  }

  const type = typeInput.value;
  const text = textInput.value.trim();

  if (!text) {
    showStatus("⚠️ Escribe una descripción.", false);
    return;
  }

  try {
    await addDoc(collection(db, "records"), {
      type,
      text,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByEmail: user.email,
    });

    textInput.value = "";
    showStatus("✅ Registro guardado correctamente.", true);
  } catch (error) {
    showStatus("❌ Error guardando registro: " + error.message, false);
  }
});

// ✅ LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    showStatus("❌ Error al cerrar sesión: " + error.message, false);
  }
});
