// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-real-estate-30d91.firebaseapp.com",
  projectId: "mern-real-estate-30d91",
  storageBucket: "mern-real-estate-30d91.appspot.com",
  messagingSenderId: "722456017309",
  appId: "1:722456017309:web:21d06ae0bfb17488381774"
};

// Initialize Firebase and export it to use it in other files
export const app = initializeApp(firebaseConfig);