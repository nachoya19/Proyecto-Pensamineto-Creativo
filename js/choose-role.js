/**
 * @file choose-role.js
 * @description Handles role selection for users with multiple roles.
 * Renders buttons for each role the user possesses.
 */

import { auth, db } from "./main.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const rolesContainer = document.getElementById("rolesContainer");

/**
 * Redirects the user to the selected dashboard.
 * @param {string} role - The selected role ('doctor', 'teacher', 'parent').
 */
function goToRole(role) {
  // Store active role in session
  sessionStorage.setItem("activeRole", role);

  if (role === "doctor") window.location.href = "dashboard-doctor.html";
  if (role === "teacher") window.location.href = "dashboard-teacher.html";
  if (role === "parent") window.location.href = "dashboard-parent.html";
}

/**
 * Creates a button element for a specific role.
 * @param {string} role - The role name.
 * @returns {HTMLButtonElement} The button element.
 */
function roleButton(role) {
  const btn = document.createElement("button");
  btn.textContent =
    role === "doctor" ? "🧠 Entrar como Médico" :
    role === "teacher" ? "🧑‍🏫 Entrar como Profesor" :
    "👨‍👩‍👧 Entrar como Padre/Madre";

  btn.className =
    role === "doctor" ? "doctor" :
    role === "teacher" ? "teacher" :
    "parent";

  btn.addEventListener("click", () => goToRole(role));
  return btn;
}

// ✅ INIT
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    window.location.href = "login.html";
    return;
  }

  const data = snap.data();
  const roles = data.roles || (data.role ? [data.role] : []);

  rolesContainer.innerHTML = "";

  if (roles.length <= 1) {
    // If only one role, redirect immediately (fallback if router logic didn't catch it)
    goToRole(roles[0] || "parent");
    return;
  }

  // Show buttons for each role
  roles.forEach((r) => rolesContainer.appendChild(roleButton(r)));
});
