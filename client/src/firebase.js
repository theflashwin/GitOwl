// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDXgtrM7GlEHCy1ML-Tg0xWoNAXC03RJUA",
    authDomain: "git-owl-a88b6.firebaseapp.com",
    projectId: "git-owl-a88b6",
    storageBucket: "git-owl-a88b6.firebasestorage.app",
    messagingSenderId: "1034756832870",
    appId: "1:1034756832870:web:115e2edd7343ae337677a7",
    measurementId: "G-3LP8J3CVW9"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
