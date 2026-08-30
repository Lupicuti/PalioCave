import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA7OsExdCMcb_Xgh7S8MLjA2nwMGTitaEI",
    authDomain: "paliocave.firebaseapp.com",
    projectId: "paliocave",
    storageBucket: "paliocave.firebasestorage.app",
    messagingSenderId: "107528316437",
    appId: "1:107528316437:web:abe3e3001a6c25e754501c",
    measurementId: "G-98CZV315NG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, setDoc, getDoc, onSnapshot };
