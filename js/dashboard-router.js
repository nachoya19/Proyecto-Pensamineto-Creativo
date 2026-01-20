/**
 * @file dashboard-router.js
 * @description Handles routing logic based on user roles.
 * Redirects the user to the appropriate dashboard (Doctor, Teacher, or Parent)
 * or to the role selection screen if they have multiple roles.
 */

import { auth, db } from "./main.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/**
 * Listens for authentication state changes.
 * If the user is authenticated, checks their role in Firestore and redirects accordingly.
 */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Retrieve user profile to determine roles
  const profileSnap = await getDoc(doc(db, "users", user.uid));
  if (!profileSnap.exists()) {
    window.location.href = "login.html";
    return;
  }

  const data = profileSnap.data();
  // Support both legacy single 'role' and new 'roles' array
  const roles = data.roles || (data.role ? [data.role] : []);

  if (roles.length === 0) {
    window.location.href = "login.html";
    return;
  }

  // ✅ If single role, redirect directly
  if (roles.length === 1) {
    const r = roles[0];
    sessionStorage.setItem("activeRole", r);

    if (r === "doctor") window.location.href = "dashboard-doctor.html";
    if (r === "teacher") window.location.href = "dashboard-teacher.html";
    if (r === "parent") window.location.href = "dashboard-parent.html";
    return;
  }

  // ✅ If multiple roles, redirect to role selection screen
  window.location.href = "choose-role.html";
});
