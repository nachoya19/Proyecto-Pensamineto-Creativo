/**
 * @file dashboard-teacher.js
 * @description Controller for the Teacher's Dashboard.
 * Allows teachers to view assigned students and create/view records.
 */

import { auth, db } from "./main.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const studentSelect = document.getElementById("studentSelect");

const recordForm = document.getElementById("recordForm");
const typeInput = document.getElementById("type");
const textInput = document.getElementById("text");

const recordsList = document.getElementById("recordsList");

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  sessionStorage.removeItem("activeRole");
  window.location.href = "login.html";
});

let currentStudentId = null;
let unsubRecords = null;

/**
 * Escapes HTML characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Renders a record item.
 * @param {Object} data
 * @returns {HTMLElement}
 */
function renderRecord(data) {
  const div = document.createElement("div");
  div.className = "item";

  const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Ahora";
  const authorRole = data.authorRole || data.createdByRole || "user";
  const authorEmail = data.authorEmail || data.createdByEmail || "";

  div.innerHTML = `
    <b>${escapeHtml(data.type || "nota")}</b> <small>(${date})</small><br>
    <small>✍️ ${escapeHtml(authorRole)} - ${escapeHtml(authorEmail)}</small><br>
    ${escapeHtml(data.text || "")}
  `;
  return div;
}

// ✅ INIT & PROTECT
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Find students where this user is in 'teachers' array
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("teachers", "array-contains", user.uid));
  const snap = await getDocs(q);

  studentSelect.innerHTML = "";

  if (snap.empty) {
    const opt = document.createElement("option");
    opt.textContent = "No tienes alumnos asignados";
    opt.value = "";
    studentSelect.appendChild(opt);
    return;
  }

  snap.forEach((doc) => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().fullName;
    studentSelect.appendChild(opt);
  });

  // Select first by default
  currentStudentId = studentSelect.value;
  loadRecords(currentStudentId);
});

// Switch student
studentSelect.addEventListener("change", () => {
  currentStudentId = studentSelect.value;
  loadRecords(currentStudentId);
});

/**
 * Loads records for a student.
 * @param {string} studentId
 */
function loadRecords(studentId) {
  if (!studentId) return;

  if (unsubRecords) unsubRecords();

  const recordsRef = collection(db, "records");
  const q = query(
    recordsRef,
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );

  unsubRecords = onSnapshot(q, (snapshot) => {
    recordsList.innerHTML = "<h2>Registros</h2>";

    if (snapshot.empty) {
      const div = document.createElement("div");
      div.className = "item";
      div.textContent = "No hay registros aún.";
      recordsList.appendChild(div);
      return;
    }

    snapshot.forEach((d) => {
      recordsList.appendChild(renderRecord(d.data()));
    });
  });
}

// ✅ CREATE RECORD
recordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentStudentId) return;

  const text = textInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "records"), {
    studentId: currentStudentId,
    type: typeInput.value,
    text,
    createdAt: serverTimestamp(),

    authorUid: auth.currentUser.uid,
    authorEmail: auth.currentUser.email,
    authorRole: "teacher",
  });

  textInput.value = "";
});
