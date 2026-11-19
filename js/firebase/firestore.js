import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { db } from "./firebase.js";

function getUserDocument(userId) {
    return doc(db, "users", userId);
}

// Load player progress
export async function loadCloudProgress(userId) {
    try {
        const userRef = getUserDocument(userId);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return null;
        }

        const userData = snapshot.data();

        return userData.progress || null;

    } catch (error) {
        console.error("Failed to load cloud progress:", error);
        throw error;
    }
}

// Save player progress
export async function saveCloudProgress(user, progress) {
    try {
        const userRef = getUserDocument(user.uid);

        await setDoc(userRef, {
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            progress: progress,
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, {
            merge: true
        });

        console.log("Cloud save successful!");

    } catch (error) {
        console.error("Failed to save cloud progress:", error);
        throw error;
    }
}

// Create initial player document
export async function createCloudProfile(user, progress) {
    const userRef = getUserDocument(user.uid);

    await setDoc(userRef, {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        progress: progress,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}