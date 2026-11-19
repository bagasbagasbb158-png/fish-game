// AchievementSystem.js - Tracks, unlocks and rewards achievements.
import { AchievementData } from '../data/AchievementData.js';

export class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = AchievementData.getAllAchievements();
        const save = this.game.getSaveSystem();
        for (const achievement of this.achievements) {
            achievement.unlocked = save.isAchievementUnlocked(achievement.id);
        }

        // Listen directly so achievement tracking stays centralized.
        game.on('fishEaten', () => this.checkAll());
        game.on('bossDefeated', () => {
            save.incrementStat('bossesDefeated');
            this.checkAll();
        });
        game.on('levelUp', data => this.checkAll(data?.newLevel));
        game.on('playerGrew', () => this.checkAll());
        game.on('damageTaken', data => {
            save.incrementStat('damageTaken');
            if (data?.source === 'TOXIC BUBBLE') save.incrementStat('toxicBubbleHits');
            this.checkAll();
        });
        game.on('hazardDodged', data => {
            if (data?.type === 'SEA_SERPENT') save.incrementStat('serpentDodged');
            if (data?.type === 'TOXIC_LASER') save.incrementStat('laserDodged');
            this.checkAll();
        });
        game.on('serpentDefeated', () => {
            save.incrementStat('serpentsDefeated');
            this.checkAll();
        });
        game.on('toxicImmunity', () => {
            save.set('toxicImmunityReached', true);
            this.checkAll();
        });
        game.on('doubleBoosterCollected', () => { save.incrementStat('doubleBoosters'); this.checkAll(); });
        game.on('healthBoosterCollected', () => { save.incrementStat('healthBoosters'); this.checkAll(); });
        game.on('coinsChanged', data => {
            if (data?.amount > 0 && data.reason !== 'achievement') save.incrementStat('coinsEarned', data.amount);
            if (data?.amount < 0) save.incrementStat('coinsSpent', Math.abs(data.amount));
            this.checkAll();
        });
        game.on('skinPurchased', () => this.checkAll());
        game.on('gameOver', () => this.checkAll());
        game.on('levelCompleted', data => this.recordLevelCompletion(data));
    }

    update() { this.checkAll(); }

    recordLevelCompletion(data = {}) {
        const save = this.game.getSaveSystem();
        const level = Number(data.level || 0);
        if (level > 0) {
            const completed = save.get('completedLevels') || [];
            if (!completed.includes(level)) {
                completed.push(level);
                save.set('completedLevels', completed);
            }
        }
        save.incrementStat('wins');
        if (data.damageTaken === 0) save.incrementStat('perfectWins');
        this.checkAll();

        // One-shot conditions that need the exact level/run time.
        for (const a of this.achievements) {
            if (a.unlocked) continue;
            const r = a.requirement;
            if (r.type === 'fastWin' && Number(data.survivalTime) > 0 && Number(data.survivalTime) < r.value) this.unlockAchievement(a.id);
            if (r.type === 'levelFastWin' && level === r.value && Number(data.survivalTime) > 0 && Number(data.survivalTime) < r.maxTime) this.unlockAchievement(a.id);
            if (r.type === 'perfectWin' && data.damageTaken === 0) this.unlockAchievement(a.id);
            if (r.type === 'levelCompleted' && level === r.value) this.unlockAchievement(a.id);
        }
        this.checkAll();
    }

    checkFishEaten() { this.checkAll(); }
    checkSizeMilestones() { this.checkAll(); }
    checkPlayerLevel() { this.checkAll(); }
    checkGameWon() { this.checkAll(); }

    checkAll() {
        const save = this.game.getSaveSystem();
        const p = this.game.getPlayer?.();
        if (p) {
            const size = p.getSize();
            const bestSize = Math.max(save.get('bestPlayerSize') || 0, size);
            if (bestSize !== save.get('bestPlayerSize')) save.set('bestPlayerSize', bestSize);
            if (size >= 150 && !save.get('toxicImmunityReached') && this.game.hasToxicImmunity?.()) {
                save.set('toxicImmunityReached', true);
                this.game.emitEvent('toxicImmunity');
            }
        }

        const values = {
            fishEaten: save.get('totalFishEaten') || 0,
            bossDefeated: save.get('bossesDefeated') || 0,
            gamesPlayed: save.get('totalGamesPlayed') || 0,
            playerLevel: Math.max(save.get('level') || 1, this.game.getProgressionSystem?.().getLevel?.() || 1),
            playerSize: save.get('bestPlayerSize') || 0,
            bestCombo: save.get('bestCombo') || 0,
            bestScore: save.get('bestScore') || 0,
            wins: save.get('wins') || save.get('totalWins') || 0,
            perfectWins: save.get('perfectWins') || 0,
            serpentDefeated: save.get('serpentsDefeated') || 0,
            serpentDodged: save.get('serpentDodged') || 0,
            toxicImmunity: save.get('toxicImmunityReached') ? 1 : 0,
            toxicHitsSurvived: save.get('toxicBubbleHits') || 0,
            laserDodged: save.get('laserDodged') || 0,
            doubleBoosters: save.get('doubleBoosters') || 0,
            healthBoosters: save.get('healthBoosters') || 0,
            coinsEarned: save.get('coinsEarned') || 0,
            coinsSpent: save.get('coinsSpent') || 0,
            skinsOwned: (save.get('ownedSkins') || []).length,
            damageTaken: save.get('damageTaken') || 0
        };

        for (const a of this.achievements) {
            if (a.unlocked) continue;
            const r = a.requirement;
            const current = values[r.type];
            if (current !== undefined && current >= r.value) this.unlockAchievement(a.id);
        }
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return false;
        achievement.unlocked = true;
        const save = this.game.getSaveSystem();
        if (!save.unlockAchievement(achievementId)) return false;

        const reward = Math.max(0, Number(achievement.reward) || 0);
        if (reward > 0) this.game.getEconomySystem().earnCoins(reward, 'achievement');
        this.game.emitEvent('achievementUnlocked', { ...achievement, reward });
        return true;
    }

    getAchievements() { return this.achievements; }
    getAllAchievements() { return this.achievements; }
}
