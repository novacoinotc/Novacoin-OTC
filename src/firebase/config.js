import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRotNLZEsf5P4eBgUSK9mLUETMXQwROgs",
  authDomain: "novacoin-v1.firebaseapp.com",
  projectId: "novacoin-v1",
  storageBucket: "novacoin-v1.appspot.com",
  messagingSenderId: "412235210603",
  appId: "1:412235210603:web:e85cde4dff78c13f2f762e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };