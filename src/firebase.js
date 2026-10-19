import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBD_mkyWbqVcCb-IYOQDjBqiA1JEp4W4eY",
    authDomain: "mehdi-studio.firebaseapp.com",
    projectId: "mehdi-studio",
    storageBucket: "mehdi-studio.firebasestorage.app",
    messagingSenderId: "1006250334818",
    appId: "1:1006250334818:web:512f742cbce101f6cc8f3b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);