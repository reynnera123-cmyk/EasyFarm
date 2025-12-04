import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1UdSJTQ-n45lspaiBTBkDO785NaplzLA",
  authDomain: "easyfarm-6892e.firebaseapp.com",
  projectId: "easyfarm-6892e",
  storageBucket: "easyfarm-6892e.firebasestorage.app",
  messagingSenderId: "991952720934",
  appId: "1:991952720934:web:3cc4471e8496085e6802e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);