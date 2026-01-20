/**
 * @file login.js
 * @description Handles user authentication (Login).
 */

import { auth } from "./main.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// HTML ELEMENTS
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const messageBox = document.getElementById("messageBox");

/**
 * Displays a feedback message to the user.
 * @param {string} text - The message content.
 * @param {string} type - The message type ('success' or 'error').
 */
function showMessage(text, type) {
  messageBox.style.display = "block";
  messageBox.textContent = text;
  messageBox.className = "message " + type;
}

// LOGIN EVENT
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("✅ Login correcto. Bienvenido!", "success");
    // Redirect to dashboard router which handles role-based redirection
    window.location.href = "dashboard.html";
  } catch (error) {
    showMessage("❌ Error: " + error.message, "error");
  }
});

// REDIRECT TO REGISTER
registerBtn.addEventListener("click", () => {
  window.location.href = "registro.html";
});

// LOGOUT EVENT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("✅ Sesión cerrada.", "success");
  } catch (error) {
    showMessage("❌ Error al cerrar sesión: " + error.message, "error");
  }
});

// SESSION LISTENER
onAuthStateChanged(auth, (user) => {
  if (user) {
    showMessage("✅ Sesión activa: " + user.email, "success");
  } else {
    showMessage("🔒 No hay sesión activa.", "error");
  }
});
