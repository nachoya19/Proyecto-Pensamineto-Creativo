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

// ELEMENTOS
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const recordForm = document.getElementById("recordForm");
const typeInput = document.getElementById("type");
const textInput = document.getElementById("text");

const recordsList = document.getElementById("recordsList");
const statusBox = document.getElementById("statusBox");

// MENSAJES
function showStatus(text, ok = true) {
  statusBox.textContent = text;
  statusBox.className = "status " + (ok ? "ok" : "err");
}

// Pintar items
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

// ✅ PROTEGER DASHBOARD
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Usuario logueado ✅
  userEmail.textContent = user.email;
  showStatus("✅ Sesión activa. Puedes registrar observaciones.", true);

  // Escuchar registros en tiempo real del usuario
  const colRef = collection(db, "records");

  // Para alfa: mostramos últimos 20 (globales del sistema)
  // Si quieres que sean privados por usuario, filtramos por uid.
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

// ✅ GUARDAR REGISTRO
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

// ✅ CERRAR SESIÓN
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    showStatus("❌ Error al cerrar sesión: " + error.message, false);
  }
});