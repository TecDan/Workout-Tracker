/*/ Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);


const database = getDatabase(app);


function addExerciseCategory(categoryId, name) {
  set(ref(database, 'exerciseCategories/' + categoryId), {
    id: categoryId,
    name: name
  }).then(() => {
    console.log('Exercise category added successfully!');
  }).catch((error) => {
    console.error('Failed to add exercise category:', error);
  });
}

// Example: Adding the Chest category
addExerciseCategory('category1', 'Chest');

function testDatabase() {
  const db = getDatabase();
  set(ref(db, 'testPath'), { test: 'data' })
    .then(() => console.log('Write succeeded'))
    .catch((error) => console.error('Write failed', error));
}

testDatabase();
console.log(app);
console.log(database);
*/
