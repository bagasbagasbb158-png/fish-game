import { GameConfig } from '../data/GameConfig.js';

// ProgressionSystem.js - Handles XP and levels
export class ProgressionSystem {
    constructor(game) {
        this.game = game;
        // Load from save system or use defaults
        this.xp = this.game.getSaveSystem().get('xp');
        this.level = this.game.getSaveSystem().get('level');

        // Ensure values are valid numbers
        if (typeof this.xp !== 'number' || isNaN(this.xp)) this.xp = 0;
        if (typeof this.level !== 'number' || isNaN(this.level) || this.level < 1) this.level = 1;
    }

    getXPForNextLevel() {
        return GameConfig.XP_BASE_REQUIREMENT + ((this.level - 1) * GameConfig.XP_LEVEL_INCREMENT);
    }

    getXPProgress() {
        return {
            current: this.xp,
            needed: this.getXPForNextLevel(),
            percentage: Math.min(100, (this.xp / this.getXPForNextLevel()) * 100)
        };
    }

    addXP(amount) {
        if (amount <= 0) return;

        this.xp += amount;
        this.game.getSaveSystem().set('xp', this.xp);

        // Check for level up (handle multiple level ups)
        let levelUps = 0;
        const oldLevel = this.level;

        while (this.xp >= this.getXPForNextLevel()) {
            this.levelUpInternal();
            levelUps++;
        }

        if (levelUps > 0) {
            this.game.getSaveSystem().set('level', this.level);
            this.game.emitEvent('levelUp', {
                oldLevel: oldLevel,
                newLevel: this.level
            });
        }

        this.game.emitEvent('progressionChanged', { xp: this.xp, level: this.level });
    }

    levelUpInternal() {
        // Carry over excess XP
        const xpNeeded = this.getXPForNextLevel();
        this.xp = this.xp - xpNeeded;
        this.level++;

        // Ensure XP doesn't go negative (shouldn't happen with while loop condition, but safety)
        if (this.xp < 0) this.xp = 0;
    }

    getLevel() {
        return this.level;
    }

    getXP() {
        return this.xp;
    }

    // Note: reset() is not used in gameplay to preserve progression
    // It's only used for save system reset
    reset() {
        this.xp = 0;
        this.level = 1;
        this.game.getSaveSystem().set('xp', this.xp);
        this.game.getSaveSystem().set('level', this.level);
        this.game.emitEvent('progressionChanged', { xp: this.xp, level: this.level });
    }
}