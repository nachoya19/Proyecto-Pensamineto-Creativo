/**
 * @file dashboard-doctor.js
 * @description Controller for the Doctor's Dashboard.
 * Allows doctors to invite users, manage students, assign students to teachers/parents,
 * and create/view records.
 */

import { auth, db } from "./main.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");

// Invite Section
const inviteForm = document.getElementById("inviteForm");
const inviteEmail = document.getElementById("inviteEmail");
const inviteRole = document.getElementById("inviteRole");
const inviteMsg = document.getElementById("inviteMsg");

// Student Section
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentMsg = document.getElementById("studentMsg");

// Assignment Section
const assignForm = document.getElementById("assignForm");
const studentSelect = document.getElementById("studentSelect");
const assignEmail = document.getElementById("assignEmail");
const assignType = document.getElementById("assignType");
const assignMsg = document.getElementById("assignMsg");

// Record Creation Section
const recordForm = document.getElementById("recordForm");
const recordStudentSelect = document.getElementById("recordStudentSelect");
const typeInput = document.getElementById("type");
const textInput = document.getElementById("text");
const recordMsg = document.getElementById("recordMsg");

// Lists
const studentsList = document.getElementById("studentsList");
const filterStudentSelect = document.getElementById("filterStudentSelect");
const recordsList = document.getElementById("recordsList");

/**
 * Displays feedback message.
 * @param {HTMLElement} el - The element to display the message in.
 * @param {string} text - Message text.
 * @param {boolean} [ok=true] - Success status.
 */
function show(el, text, ok = true) {
  el.textContent = text;
  el.className = "msg " + (ok ? "ok" : "err");
}

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str - Input string.
 * @returns {string} Escaped string.
 */
function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    sessionStorage.removeItem("activeRole");
    window.location.href = "login.html";
  } catch (err) {
    alert("Error cerrando sesión: " + err.message);
  }
});

let currentDoctorUid = null;
let unsubscribeRecords = null;

// ✅ INIT & PROTECT
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentDoctorUid = user.uid;

  // Verify 'doctor' role
  const profileSnap = await getDoc(doc(db, "users", user.uid));
  if (!profileSnap.exists()) {
    window.location.href = "login.html";
    return;
  }

  const data = profileSnap.data();
  const roles = data.roles || (data.role ? [data.role] : []);
  if (!roles.includes("doctor")) {
    window.location.href = "dashboard.html";
    return;
  }

  // ✅ LISTEN for students created by this doctor
  const qStudents = query(
    collection(db, "students"),
    where("createdByDoctorUid", "==", user.uid)
  );

  onSnapshot(qStudents, (snapshot) => {
    studentsList.innerHTML = "";
    studentSelect.innerHTML = "";
    recordStudentSelect.innerHTML = "";
    filterStudentSelect.innerHTML = "";

    if (snapshot.empty) {
      studentsList.innerHTML = `<div class="item">No has creado alumnos todavía.</div>`;

      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No hay alumnos";
      studentSelect.appendChild(opt);

      const opt2 = document.createElement("option");
      opt2.value = "";
      opt2.textContent = "No hay alumnos";
      recordStudentSelect.appendChild(opt2);

      const opt3 = document.createElement("option");
      opt3.value = "";
      opt3.textContent = "No hay alumnos";
      filterStudentSelect.appendChild(opt3);

      return;
    }

    snapshot.forEach((d) => {
      const s = d.data();
      const id = d.id;

      // Render in student list
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<b>${escapeHtml(s.fullName)}</b>`;
      studentsList.appendChild(div);

      // Add to selects
      const opt1 = document.createElement("option");
      opt1.value = id;
      opt1.textContent = s.fullName;
      studentSelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = id;
      opt2.textContent = s.fullName;
      recordStudentSelect.appendChild(opt2);

      const opt3 = document.createElement("option");
      opt3.value = id;
      opt3.textContent = s.fullName;
      filterStudentSelect.appendChild(opt3);
    });

    // Auto-select first student for filtering
    if (!filterStudentSelect.value && filterStudentSelect.options.length > 0) {
      filterStudentSelect.value = filterStudentSelect.options[0].value;
    }

    // Load records for the selected student
    startRecordsListener(filterStudentSelect.value);
  });

  // Reload records when filter changes
  filterStudentSelect.addEventListener("change", () => {
    startRecordsListener(filterStudentSelect.value);
  });
});

/**
 * Starts listening for real-time record updates for a specific student.
 * @param {string} studentId - The ID of the student.
 */
function startRecordsListener(studentId) {
  if (!studentId) {
    recordsList.innerHTML = `<div class="item">Selecciona un alumno.</div>`;
    return;
  }

  if (unsubscribeRecords) unsubscribeRecords();

  const qRec = query(
    collection(db, "records"),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );

  unsubscribeRecords = onSnapshot(qRec, (snapshot) => {
    recordsList.innerHTML = "";

    if (snapshot.empty) {
      recordsList.innerHTML = `<div class="item">No hay registros aún para este alumno.</div>`;
      return;
    }

    snapshot.forEach((d) => {
      const r = d.data();
      const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "Ahora";

      const authorRole = r.authorRole || r.createdByRole || "user";
      const authorEmail = r.authorEmail || r.createdByEmail || "";

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <b>${escapeHtml(r.type || "nota")}</b> <span class="small">(${date})</span><br>
        <span class="small">✍️ ${escapeHtml(authorRole)} - ${escapeHtml(authorEmail)}</span><br>
        ${escapeHtml(r.text || "")}
      `;
      recordsList.appendChild(div);
    });
  });
}

// ✅ INVITE USER
inviteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const email = inviteEmail.value.trim().toLowerCase();
    const role = inviteRole.value;

    await setDoc(doc(db, "invites", email), {
      email,
      roles: [role],
      createdAt: serverTimestamp(),
      createdByDoctorUid: auth.currentUser.uid,
    });

    show(inviteMsg, "✅ Invitación creada. Esa persona ya puede registrarse.", true);
    inviteEmail.value = "";
  } catch (err) {
    show(inviteMsg, "❌ Error: " + err.message, false);
  }
});

// ✅ CREATE STUDENT
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const name = studentName.value.trim();

    const docRef = await addDoc(collection(db, "students"), {
      fullName: name,
      createdAt: serverTimestamp(),
      createdByDoctorUid: auth.currentUser.uid,
      parents: [],
      teachers: [],
    });

    show(studentMsg, "✅ Alumno creado correctamente ✅ (" + docRef.id + ")", true);
    studentName.value = "";
  } catch (err) {
    show(studentMsg, "❌ Error: " + err.message, false);
  }
});

// ✅ ASSIGN USER TO STUDENT
assignForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const studentId = studentSelect.value;
    const email = assignEmail.value.trim().toLowerCase();
    const type = assignType.value; // 'teachers' or 'parents'

    if (!studentId) {
      show(assignMsg, "❌ No hay alumno seleccionado.", false);
      return;
    }

    // Find user by email
    const usersRef = collection(db, "users");
    const qUser = query(usersRef, where("email", "==", email));
    const snap = await getDocs(qUser);

    if (snap.empty) {
      show(assignMsg, "❌ Ese email no está registrado todavía.", false);
      return;
    }

    const uid = snap.docs[0].id;

    // Add uid to student's teachers/parents array
    await updateDoc(doc(db, "students", studentId), {
      [type]: arrayUnion(uid),
    });

    show(assignMsg, "✅ Asignación hecha correctamente.", true);
    assignEmail.value = "";
  } catch (err) {
    show(assignMsg, "❌ Error: " + err.message, false);
  }
});

// ✅ CREATE RECORD
recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const studentId = recordStudentSelect.value;
    const text = textInput.value.trim();
    const type = typeInput.value;

    if (!studentId) {
      show(recordMsg, "❌ Selecciona un alumno.", false);
      return;
    }

    if (!text) {
      show(recordMsg, "❌ Escribe una descripción.", false);
      return;
    }

    await addDoc(collection(db, "records"), {
      studentId,
      type,
      text,
      createdAt: serverTimestamp(),
      authorUid: auth.currentUser.uid,
      authorEmail: auth.currentUser.email,
      authorRole: "doctor",
    });

    show(recordMsg, "✅ Registro guardado.", true);
    textInput.value = "";
  } catch (err) {
    show(recordMsg, "❌ Error: " + err.message, false);
  }
});
