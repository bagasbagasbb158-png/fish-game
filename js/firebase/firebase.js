import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCNo8-zGM3eBzYqDQoYFhsykiHzVSu4Y7c",
    authDomain: "hunger-fish-4da22.firebaseapp.com",
    projectId: "hunger-fish-4da22",
    storageBucket: "hunger-fish-4da22.firebasestorage.app",
    messagingSenderId: "1002989928085",
    appId: "1:1002989928085:web:18286e3a11026b982fa59c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);