// main.js - Hunger Fish Entry Point

import { Game } from './core/Game.js';
import { FeedbackSystem } from './systems/FeedbackSystem.js';

import {
    signInWithGoogle,
    signOutUser,
    observeAuthState
} from './firebase/auth.js';

import {
    loadCloudProgress,
    saveCloudProgress,
    createCloudProfile
} from './firebase/firestore.js';

const GUEST_SAVE_KEY = 'fishGameSaveData_guest';

let currentUser = null;
let cloudSaveTimer = null;
let game = null;

// Generate a unique local storage key for each account
function getUserSaveKey(user) {
    return user
        ? `fishGameSaveData_user_${user.uid}`
        : GUEST_SAVE_KEY;
}

// Read progress from a specific local storage key
function readProgress(key) {
    try {
        const saved = localStorage.getItem(key);

        return saved ? JSON.parse(saved) : null;

    } catch (error) {
        console.error('Failed to read progress:', error);
        return null;
    }
}

// Write progress to a specific local storage key
function writeProgress(key, progress) {
    localStorage.setItem(
        key,
        JSON.stringify(progress)
    );
}

// Wait for Firebase authentication state
function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = observeAuthState((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Update account interface
function updateAccountUI(user) {
    const playerName = document.getElementById('playerName');
    const loginButton = document.getElementById('googleLoginBtn');
    const logoutButton = document.getElementById('googleLogoutBtn');

    if (user) {
        playerName.textContent =
            user.displayName || user.email || 'Player';

        loginButton.hidden = true;
        logoutButton.hidden = false;

    } else {
        playerName.textContent = 'Guest Player';

        loginButton.hidden = false;
        logoutButton.hidden = true;
    }
}

// Enable cloud synchronization
function enableCloudSync(user) {
    currentUser = user;

    window.__cloudSyncProgress = (progress) => {
        if (!currentUser) return;

        clearTimeout(cloudSaveTimer);

        cloudSaveTimer = setTimeout(async () => {
            try {
                await saveCloudProgress(
                    currentUser,
                    progress
                );

                console.log('Cloud save successful!');

            } catch (error) {
                console.error('Cloud sync failed:', error);
            }

        }, 1000);
    };
}

// Initialize game
async function initializeGame() {

    // 1. Identify the logged-in user
    currentUser = await waitForAuth();

    // 2. Generate an isolated storage key
    const saveKey = getUserSaveKey(currentUser);

    // 3. Tell SaveSystem which storage to use
    window.__FISH_SAVE_KEY = saveKey;

    let cloudProgress = null;

    // 4. Load cloud progress for authenticated users
    if (currentUser) {
        try {
            cloudProgress = await loadCloudProgress(
                currentUser.uid
            );

            if (cloudProgress) {
                // Cloud data belongs to this UID
                writeProgress(saveKey, cloudProgress);

                console.log('Cloud progress restored!');

            } else {
                console.log('No cloud progress found for this user.');
            }

        } catch (error) {
            console.error('Cloud load failed:', error);

            alert(
                'Unable to load cloud progress. ' +
                'Please check your internet connection.'
            );
        }
    }

    // 5. Update account UI
    updateAccountUI(currentUser);

    // 6. Initialize the game AFTER selecting the save key
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error('Canvas element not found.');
        return;
    }

    game = new Game(canvas);

    window.__game = game;
    window.__feedbackSystem = new FeedbackSystem();

    // 7. Create cloud profile if this is a new account
    if (currentUser) {
        const localProgress = readProgress(saveKey);

        try {
            if (!cloudProgress) {

                if (localProgress) {
                    // Restore this account's own local backup
                    await saveCloudProgress(
                        currentUser,
                        localProgress
                    );

                } else {
                    // Brand-new account: use clean default progress
                    await createCloudProfile(
                        currentUser,
                        game.getSaveSystem().data
                    );
                }
            }

            enableCloudSync(currentUser);

        } catch (error) {
            console.error('Cloud profile initialization failed:', error);
        }
    }

   // Start game loop
let lastTime = performance.now();

function gameLoop(timestamp) {
    const deltaTime = Math.min(
        timestamp - lastTime,
        100
    );

    lastTime = timestamp;

    // Update game
    game.update(deltaTime);
    game.draw();

    // Control account UI visibility
    const gameMeta = document.getElementById('gameMeta');

    if (gameMeta) {
        const currentState = game.getGameState().getCurrent();

        const states = game.getGameState().states;

        const hideMeta =
            currentState === states.PLAYING ||
            currentState === states.PAUSED;

        gameMeta.classList.toggle(
            'is-hidden',
            hideMeta
        );
    }

    requestAnimationFrame(gameLoop);
}

    requestAnimationFrame(gameLoop);
}

// Google Login
async function handleGoogleLogin() {

    const button = document.getElementById('googleLoginBtn');

    button.disabled = true;

    try {
        const user = await signInWithGoogle();

        const userSaveKey = getUserSaveKey(user);

        // Check whether this account already has cloud progress
        const cloudProgress = await loadCloudProgress(
            user.uid
        );

        if (cloudProgress) {

            // Existing account: always use its own cloud data
            writeProgress(userSaveKey, cloudProgress);

            console.log('Existing account progress restored!');

        } else {

            // New account: guest migration requires explicit consent
            const guestProgress = readProgress(GUEST_SAVE_KEY);

            if (guestProgress) {

                const migrateGuest = confirm(
                    'No existing save found for this Google account.\n\n' +
                    'Do you want to transfer your Guest progress?\n\n' +
                    'OK = Transfer Guest progress\n' +
                    'Cancel = Start a new game'
                );

                if (migrateGuest) {
                    writeProgress(userSaveKey, guestProgress);

                } else {
                    localStorage.removeItem(userSaveKey);
                }

            } else {
                localStorage.removeItem(userSaveKey);
            }
        }

        // Restart game with the selected account
        window.location.reload();

    } catch (error) {
        console.error('Google login failed:', error);

        alert('Google login failed: ' + error.message);

        button.disabled = false;
    }
}

// Google Logout
async function handleGoogleLogout() {

    const confirmed = confirm(
        'Are you sure you want to logout?\n\n' +
        'Your cloud progress will remain saved.'
    );

    if (!confirmed) return;

    try {
        // Flush pending save
        if (cloudSaveTimer) {
            clearTimeout(cloudSaveTimer);
        }

        if (currentUser && game) {
            const progress = game.getSaveSystem().data;

            writeProgress(
                getUserSaveKey(currentUser),
                progress
            );

            await saveCloudProgress(
                currentUser,
                progress
            );
        }

        await signOutUser();

        window.location.reload();

    } catch (error) {
        console.error('Logout failed:', error);

        alert('Logout failed: ' + error.message);
    }
}

// Start application
window.addEventListener('load', async () => {

    document
        .getElementById('googleLoginBtn')
        .addEventListener('click', handleGoogleLogin);

    document
        .getElementById('googleLogoutBtn')
        .addEventListener('click', handleGoogleLogout);

    await initializeGame();
});