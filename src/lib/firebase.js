// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtHOq5r4ITkB_lzc78YkjomvDvB4eCvd0",
    authDomain: "fir-98549.firebaseapp.com",
    projectId: "fir-98549",
    storageBucket: "fir-98549.firebasestorage.app",
    messagingSenderId: "196076769266",
    appId: "1:196076769266:web:9a03d4e8b380122455e56b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };