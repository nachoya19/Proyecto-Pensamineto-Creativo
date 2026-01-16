import { auth } from "./main.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// ELEMENTOS HTML
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const messageBox = document.getElementById("messageBox");

// FUNCIÓN PARA MENSAJES
function showMessage(text, type) {
  messageBox.style.display = "block";
  messageBox.textContent = text;
  messageBox.className = "message " + type;
}

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("✅ Login correcto. Bienvenido!", "success");
    window.location.href = "dashboard.html";

    // window.location.href = "dashboard.html";
  } catch (error) {
    showMessage("❌ Error: " + error.message, "error");
  }
});

// REGISTRAR USUARIO
registerBtn.addEventListener("click", () => {
  window.location.href = "registro.html";
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("✅ Sesión cerrada.", "success");
  } catch (error) {
    showMessage("❌ Error al cerrar sesión: " + error.message, "error");
  }
});

// DETECTAR SESIÓN ACTIVA
onAuthStateChanged(auth, (user) => {
  if (user) {
    showMessage("✅ Sesión activa: " + user.email, "success");
  } else {
    showMessage("🔒 No hay sesión activa.", "error");
  }
});