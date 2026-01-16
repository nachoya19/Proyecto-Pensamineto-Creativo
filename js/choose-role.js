import { auth, db } from "./main.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const rolesContainer = document.getElementById("rolesContainer");

function goToRole(role) {
  // Guardamos el rol elegido en sessionStorage
  sessionStorage.setItem("activeRole", role);

  if (role === "doctor") window.location.href = "dashboard-doctor.html";
  if (role === "teacher") window.location.href = "dashboard-teacher.html";
  if (role === "parent") window.location.href = "dashboard-parent.html";
}

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
    // Si solo tiene 1 rol, entramos directo
    goToRole(roles[0] || "parent");
    return;
  }

  // Mostrar botones por rol
  roles.forEach((r) => rolesContainer.appendChild(roleButton(r)));
});