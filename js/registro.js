import { auth, db } from "./main.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const form = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const modeInput = document.getElementById("mode");
const msg = document.getElementById("msg");

document.getElementById("goLogin").addEventListener("click", () => {
  window.location.href = "login.html";
});

function show(text, ok = true) {
  msg.textContent = text;
  msg.className = "msg " + (ok ? "ok" : "err");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const password = passInput.value.trim();
  const mode = modeInput.value;

  try {
    // ✅ 1) Determinar roles
    let roles = ["doctor"]; // por defecto si es médico

    if (mode === "invited") {
      const inviteRef = doc(db, "invites", email);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists()) {
        show("❌ No hay invitación para este email.", false);
        return;
      }

      const data = inviteSnap.data();

      // ✅ Compatibilidad: invites antiguos y nuevos
      if (Array.isArray(data.roles)) {
        roles = data.roles;
      } else if (data.role) {
        roles = [data.role];
      } else {
        roles = ["parent"];
      }
    }

    // ✅ 2) Crear usuario en Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (!auth.currentUser) {
      throw new Error("No se pudo iniciar sesión tras el registro.");
    }

    // ✅ 3) Guardar perfil en Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      roles,
      createdAt: serverTimestamp(),
    });

    show("✅ Cuenta creada correctamente. Redirigiendo...", true);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 900);

  } catch (error) {
    show("❌ Error: " + error.message, false);
  }
});