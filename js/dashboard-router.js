import { auth, db } from "./main.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const profileSnap = await getDoc(doc(db, "users", user.uid));
  if (!profileSnap.exists()) {
    window.location.href = "login.html";
    return;
  }

  const data = profileSnap.data();
  const roles = data.roles || (data.role ? [data.role] : []);

  if (roles.length === 0) {
    window.location.href = "login.html";
    return;
  }

  // ✅ Si tiene un rol => entra directo
  if (roles.length === 1) {
    const r = roles[0];
    sessionStorage.setItem("activeRole", r);

    if (r === "doctor") window.location.href = "dashboard-doctor.html";
    if (r === "teacher") window.location.href = "dashboard-teacher.html";
    if (r === "parent") window.location.href = "dashboard-parent.html";
    return;
  }

  // ✅ Si tiene varios => elegir
  window.location.href = "choose-role.html";
});