import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDM6u8p-_ofDxCxwJqmncB8BjB4zAArycc",
    authDomain: "ai-finance-b81e3.firebaseapp.com",
    projectId: "ai-finance-b81e3",
    storageBucket: "ai-finance-b81e3.appspot.com",
    messagingSenderId: "64076452702",
    appId: "1:64076452702:web:733d65b7bca29e0aeab5cf",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
