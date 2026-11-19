// LevelSystem.js - Handles selected/unlocked game levels
import { LevelData, getLevelData } from '../data/LevelData.js';

export class LevelSystem {
    constructor(game) {
        this.game = game;
        this.currentLevel = Math.max(1, Math.min(LevelData.TOTAL_LEVELS, game.getSaveSystem().get('currentLevel') || 1));
        this.unlockedLevel = Math.max(1, Math.min(LevelData.TOTAL_LEVELS, game.getSaveSystem().get('unlockedLevel') || 1));
    }

    getCurrentLevel() { return this.currentLevel; }
    getUnlockedLevel() { return this.unlockedLevel; }
    getTotalLevels() { return LevelData.TOTAL_LEVELS; }
    getLevelData(level = this.currentLevel) { return getLevelData(level); }

    selectLevel(level) {
        level = Number(level);
        if (level < 1 || level > this.unlockedLevel) return false;
        this.currentLevel = level;
        this.game.getSaveSystem().set('currentLevel', level);
        return true;
    }

    unlockNextLevel() {
        const next = Math.min(LevelData.TOTAL_LEVELS, this.currentLevel + 1);
        if (next > this.unlockedLevel) {
            this.unlockedLevel = next;
            this.game.getSaveSystem().set('unlockedLevel', this.unlockedLevel);
        }
        return this.unlockedLevel;
    }

    getAllLevels() { return LevelData.levels; }
}
