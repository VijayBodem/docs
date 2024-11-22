// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7GPMdVYVq5oFaQ1NAMUYiwOvboNyxpII",
  authDomain: "docs-d1cde.firebaseapp.com",
  projectId: "docs-d1cde",
  storageBucket: "docs-d1cde.firebasestorage.app",
  messagingSenderId: "320232574932",
  appId: "1:320232574932:web:866c17e6de62e695521041",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
