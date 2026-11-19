// SkinSystem.js - Handles fish skin ownership, purchasing, and equipping
import { SkinData } from '../data/SkinData.js';

export class SkinSystem {
    constructor(game) {
        this.game = game;
    }

    getAvailableSkins() {
        return SkinData.skins;
    }

    getSkinData(skinId) {
        return SkinData.getSkinById(skinId);
    }

    getSkinsByRarity(rarity) {
        return SkinData.getSkinsByRarity(rarity);
    }

    isOwned(skinId) {
        const ownedSkins = this.game.getSaveSystem().get('ownedSkins') || [];
        return ownedSkins.includes(skinId);
    }

    isEquipped(skinId) {
        const equippedSkin = this.game.getSaveSystem().get('equippedSkin');
        return equippedSkin === skinId;
    }

    canPurchase(skinId) {
        const skinData = this.getSkinData(skinId);
        if (!skinData) return false;

        // Check if already owned
        if (this.isOwned(skinId)) return false;

        // Check level requirement
        const playerLevel = this.game.getProgressionSystem().getLevel();
        if (playerLevel < skinData.requiredLevel) return false;

        // Check coin requirement
        const coins = this.game.getEconomySystem().getCoins();
        if (coins < skinData.price) return false;

        return true;
    }

    purchaseSkin(skinId) {
        if (!this.canPurchase(skinId)) return false;

        const skinData = this.getSkinData(skinId);
        if (!skinData) return false;

        // Spend coins
        const economySystem = this.game.getEconomySystem();
        if (!economySystem.spendCoins(skinData.price)) return false;

        // Mark as owned
        const saveSystem = this.game.getSaveSystem();
        const ownedSkins = saveSystem.get('ownedSkins') || [];
        if (!ownedSkins.includes(skinId)) {
            ownedSkins.push(skinId);
            saveSystem.set('ownedSkins', ownedSkins);
        }

        // Emit event for purchase feedback
        this.game.emitEvent('skinPurchased', {
            skinId: skinId,
            price: skinData.price
        });

        return true;
    }

    equipSkin(skinId) {
        // Check if owned
        if (!this.isOwned(skinId)) return false;

        // Equip the skin
        const saveSystem = this.game.getSaveSystem();
        saveSystem.set('equippedSkin', skinId);

        // Emit event for equip feedback
        this.game.emitEvent('skinEquipped', {
            skinId: skinId
        });

        return true;
    }

    getEquippedSkin() {
        return this.game.getSaveSystem().get('equippedSkin') || "classic";
    }

    getOwnedSkins() {
        return this.game.getSaveSystem().get('ownedSkins') || ["classic"];
    }
}