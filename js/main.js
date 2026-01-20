/**
 * @file main.js
 * @description Initialization of Firebase services.
 * Configures and exports the Firebase App, Authentication, and Firestore instances.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/**
 * Firebase configuration object.
 * Contains keys and identifiers for the Firebase project "pensamientocreativo".
 * @constant {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyAzafZEdzi-qx3mBe8K0OWQQTFuvXOWV3k",
  authDomain: "pensamientocreativo-5be0d.firebaseapp.com",
  projectId: "pensamientocreativo-5be0d",
  storageBucket: "pensamientocreativo-5be0d.firebasestorage.app",
  messagingSenderId: "240491189904",
  appId: "1:240491189904:web:240096fa3dbe6683706a15",
};

/**
 * Initialized Firebase Application instance.
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication service instance.
 */
export const auth = getAuth(app);

/**
 * Firebase Firestore database service instance.
 */
export const db = getFirestore(app);
