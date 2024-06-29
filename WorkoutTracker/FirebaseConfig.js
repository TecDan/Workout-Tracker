// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdZiNZVwKEaGWLWiZUqoRFTcBY6oVZQjM",
  authDomain: "workout-tracker-d30d1.firebaseapp.com",
  databaseURL: "https://workout-tracker-d30d1-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "workout-tracker-d30d1",
  storageBucket: "workout-tracker-d30d1.appspot.com",
  messagingSenderId: "96774870151",
  appId: "1:96774870151:web:d203913b473ef9578d5422",
  measurementId: "G-MCMHYFVFJ6"
};

let app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]; // Initialize Firebase
const auth = getAuth(app); // Initialize Firebase Auth
const database = getDatabase(app); // Initialize Firebase Database

// Export each service separately
export { app, auth, database };
