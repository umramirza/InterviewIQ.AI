import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-f9b98.firebaseapp.com",
  projectId: "interviewiq-f9b98",
  storageBucket: "interviewiq-f9b98.firebasestorage.app",
  messagingSenderId: "198476509343",
  appId: "1:198476509343:web:531eb59a1300b241c932aa"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth, provider}