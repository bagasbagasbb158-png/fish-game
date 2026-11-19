// SaveSystem.js - Handles saving and loading game data using localStorage
import { GameConfig } from '../data/GameConfig.js';

export class SaveSystem {
    constructor() {
    this.saveKey =
        window.__FISH_SAVE_KEY || 'fishGameSaveData_guest';
        this.defaultData = {
            coins: 0,
            level: 1,
            xp: 0,
            bestScore: 0,
            bestCombo: 0,
            totalFishEaten: 0,
            totalGamesPlayed: 0,
            totalWins: 0,
            unlockedAchievements: [],
            purchasedUpgrades: [],
            ownedSkins: ["classic"],
            equippedSkin: "classic",
            currentLevel: 1,
            unlockedLevel: 1,
            bossesDefeated: 0,
            wins: 0,
            perfectWins: 0,
            bestPlayerSize: 0,
            damageTaken: 0,
            toxicBubbleHits: 0,
            serpentDodged: 0,
            serpentsDefeated: 0,
            laserDodged: 0,
            doubleBoosters: 0,
            healthBoosters: 0,
            coinsEarned: 0,
            coinsSpent: 0,
            completedLevels: [],
            toxicImmunityReached: false
        };
        this.data = { ...this.defaultData };
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                this.data = { ...this.defaultData, ...parsed };
            } else {
                this.data = { ...this.defaultData };
            }
        } catch (e) {
            console.error('Failed to load save data, using defaults', e);
            this.data = { ...this.defaultData };
        }
    }

   save() {
    try {
        localStorage.setItem(
            this.saveKey,
            JSON.stringify(this.data)
        );

        if (window.__cloudSyncProgress) {
            window.__cloudSyncProgress(this.data);
        }

    } catch (e) {
        console.error('Failed to save game data', e);
    }
}

    reset() {
        this.data = { ...this.defaultData };
        this.save();
    }

    // Getters and setters for specific data
    get(key) {
        return this.data[key];
    }

    set(key, value) {
        if (this.data.hasOwnProperty(key)) {
            this.data[key] = value;
            this.save();
        } else {
            console.warn(`Attempted to set unknown save key: ${key}`);
        }
    }

    // Helper methods for common operations
    addCoins(amount) {
        this.set('coins', this.get('coins') + amount);
    }

    spendCoins(amount) {
        const current = this.get('coins');
        if (current >= amount) {
            this.set('coins', current - amount);
            return true;
        }
        return false;
    }

    addXP(amount) {
        this.set('xp', this.get('xp') + amount);
    }

    setLevel(level) {
        this.set('level', level);
    }

    incrementTotalFishEaten() {
        this.set('totalFishEaten', this.get('totalFishEaten') + 1);
    }

    incrementTotalGamesPlayed() {
        this.set('totalGamesPlayed', this.get('totalGamesPlayed') + 1);
    }

    incrementTotalWins() {
        this.set('totalWins', this.get('totalWins') + 1);
    }


    incrementStat(key, amount = 1) {
        const current = Number(this.get(key) || 0);
        this.set(key, current + amount);
    }

    unlockAchievement(achievementId) {
        const unlocked = this.get('unlockedAchievements');
        if (!unlocked.includes(achievementId)) {
            unlocked.push(achievementId);
            this.set('unlockedAchievements', unlocked);
            return true; // newly unlocked
        }
        return false; // already unlocked
    }

    isAchievementUnlocked(achievementId) {
        return this.get('unlockedAchievements').includes(achievementId);
    }
}