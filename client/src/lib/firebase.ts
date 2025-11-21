import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyD49lOlEc3jXvQurR--cW3hdVY0lwEzG4w",
    authDomain: "ecommerce-d8b9c.firebaseapp.com",
    databaseURL: "https://ecommerce-d8b9c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ecommerce-d8b9c",
    storageBucket: "ecommerce-d8b9c.firebasestorage.app",
    messagingSenderId: "149725130530",
    appId: "1:149725130530:web:5f894a39ea6b58770f7f7b",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
