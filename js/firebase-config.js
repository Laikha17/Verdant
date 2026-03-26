import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, getDocs, updateDoc, increment, addDoc, serverTimestamp, writeBatch, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw3v36LdOJwGMJaz5S4XcWnNU0fWtYDKs",
  authDomain: "verdant-d9d31.firebaseapp.com",
  projectId: "verdant-d9d31",
  storageBucket: "verdant-d9d31.firebasestorage.app",
  messagingSenderId: "436266438871",
  appId: "1:436266438871:web:f992ee2f40e537af8de092"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot, 
    getDocs, 
    updateDoc, 
    increment, 
    addDoc, 
    serverTimestamp, 
    writeBatch,
    query,
    orderBy
};
