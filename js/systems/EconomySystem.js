// EconomySystem.js - Handles in-game currency
import { GameConfig } from '../data/GameConfig.js';

export class EconomySystem {
    constructor(game) {
        this.game = game;
        // Coins are loaded from SaveSystem
    }

    // Add coins to the player's total
    earnCoins(amount, reason) {
        if (amount <= 0) {
            console.warn('Attempt to earn non-positive coins:', amount);
            return;
        }
        const currentCoins = this.game.getSaveSystem().get('coins');
        const newTotal = currentCoins + amount;
        this.game.getSaveSystem().set('coins', newTotal);
        this.game.emitEvent('coinsChanged', {
            amount: amount,
            total: newTotal,
            reason: reason
        });
    }

    // Spend coins if the player has enough
    spendCoins(amount) {
        if (amount <= 0) {
            console.warn('Attempt to spend non-positive coins:', amount);
            return false;
        }
        const currentCoins = this.game.getSaveSystem().get('coins');
        if (currentCoins >= amount) {
            const newTotal = currentCoins - amount;
            this.game.getSaveSystem().set('coins', newTotal);
            this.game.emitEvent('coinsChanged', {
                amount: -amount, // negative indicates spending
                total: newTotal,
                reason: 'spent'
            });
            return true;
        }
        return false;
    }

    // Check if the player can afford a certain amount
    canAfford(amount) {
        if (amount <= 0) return false;
        return this.game.getSaveSystem().get('coins') >= amount;
    }

    // Get current coin count
    getCoins() {
        return this.game.getSaveSystem().get('coins');
    }

    // Event handlers - called by Game.emitEvent
    onFishEaten(data) {
        // Calculate coin reward based on enemy size
        const size = data.size;
        const multiplier = data.multiplier || 1;
        const coins = Math.max(
            GameConfig.COIN_REWARD_BASE,
            Math.floor(size * GameConfig.COIN_REWARD_SIZE_MULTIPLIER * multiplier)
        );
        this.earnCoins(coins, 'fishEaten');
    }

    onBossDefeated(data) {
        // Award boss coin reward
        this.earnCoins(GameConfig.BOSS_COIN_REWARD, 'bossDefeated');
    }
}