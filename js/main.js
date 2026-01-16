import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzafZEdzi-qx3mBe8K0OWQQTFuvXOWV3k",
  authDomain: "pensamientocreativo-5be0d.firebaseapp.com",
  projectId: "pensamientocreativo-5be0d",
  storageBucket: "pensamientocreativo-5be0d.firebasestorage.app",
  messagingSenderId: "240491189904",
  appId: "1:240491189904:web:240096fa3dbe6683706a15",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);