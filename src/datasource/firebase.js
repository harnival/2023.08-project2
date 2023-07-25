import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyCsNJnVVExrSm0CHOpX2C-12FkaoOu6dH4",
  authDomain: "project2-caeb8.firebaseapp.com",
  projectId: "project2-caeb8",
  storageBucket: "project2-caeb8.appspot.com",
  messagingSenderId: "592853366822",
  appId: "1:592853366822:web:f8850c2eef74545728cee7"
};

const app = initializeApp(firebaseConfig);
const useFirestore = getFirestore(app);

export default useFirestore;