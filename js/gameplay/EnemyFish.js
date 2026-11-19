// EnemyFish.js - Represents an enemy fish
import { GameConfig } from '../data/GameConfig.js';
import { EnemyFishRenderer } from './EnemyFishRenderer.js';

export class EnemyFish {
    constructor(game, options = {}) {
        this.game = game;
        this.entering = options.entering !== false;
        this.initialSpawn = options.initial === true;
        this.spawnOptions = options;
        this.hasEnteredFrame = false;
        this.init();
    }

    init() {
        // Select tier based on weights
        const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1;
        const tierPool = level >= 4 && level <= 6 ? GameConfig.INFERNO_ENEMY_SIZE_TIERS : level >= 7 && level <= 9 ? GameConfig.TOXIC_ENEMY_SIZE_TIERS : level === 10 ? GameConfig.ABYSS_ENEMY_SIZE_TIERS : GameConfig.ENEMY_SIZE_TIERS;
        const playerSize = this.game.getPlayer?.()?.getSize?.() || GameConfig.PLAYER_START_SIZE;
        const tier = this.selectWeightedTier(tierPool, playerSize, this.spawnOptions);

        // Set properties from tier
        this.size = tier.sizeMin + Math.random() * (tier.sizeMax - tier.sizeMin);
        this.speedX = (tier.speedMin + Math.random() * (tier.speedMax - tier.speedMin)) * (Math.random() < 0.5 ? -1 : 1);
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.color = tier.color;
        this.tierName = tier.name;
        this.species = tier.species || 'guppy';

        // Every enemy enters from outside the frame. No mid-screen teleport spawns.
        const width = this.game.getCanvas().width;
        const height = this.game.getCanvas().height;
        const fromLeft = Math.random() < 0.5;
        const entryGap = this.initialSpawn ? 4 + Math.random() * 12 : 50 + Math.random() * 120;
        this.x = fromLeft ? -this.size - entryGap : width + this.size + entryGap;

        // Avoid spawning an entering fish directly on the player's current lane.
        // A few attempts are enough to create breathing room without making spawn
        // selection deterministic or freezing the system on unusual canvas sizes.
        const player = this.game.getPlayer?.();
        const playerY = player?.getPosition?.().y ?? height / 2;
        const lanePadding = Math.max(70, player?.getSize?.() * 1.35 || 70);
        let spawnY = this.size / 2 + Math.random() * Math.max(1, height - this.size);
        for (let attempt = 0; attempt < 8 && Math.abs(spawnY - playerY) < lanePadding; attempt++) {
            spawnY = this.size / 2 + Math.random() * Math.max(1, height - this.size);
        }
        this.y = spawnY;
        const baseSpeed = Math.abs(this.speedX);
        // Initial fish enter a little faster so the arena is alive immediately;
        // replacement fish keep their authored species speed.
        this.normalSpeedX = baseSpeed;
        this.entrySpeedMultiplier = this.initialSpawn ? GameConfig.INITIAL_ENEMY_ENTRY_SPEED_MULTIPLIER : 1;
        this.speedX = (fromLeft ? baseSpeed : -baseSpeed) * this.entrySpeedMultiplier;

        // Animation
        this.tailPhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    selectWeightedTier(tiers, playerSize = GameConfig.PLAYER_START_SIZE, options = {}) {
        // Keep a healthy food chain: early game should reliably present prey the
        // player can eat, while still allowing danger to exist.
        const edibleMax = playerSize / 1.2;
        let candidates = tiers.filter(t => t.sizeMin <= edibleMax * 1.05);
        if (!candidates.length) candidates = [tiers[0]];
        if (options.forceEdible) {
            const edible = tiers.filter(t => t.sizeMax <= edibleMax);
            if (edible.length) candidates = edible;
        }
        // When the player is large, keep the full pool so dangerous fish remain
        // relevant instead of making the game artificially safe.
        if (!options.forceEdible && playerSize >= 70) candidates = tiers;
        let totalWeight = 0;
        for (const tier of candidates) {
            totalWeight += tier.weight;
        }
        let random = Math.random() * totalWeight;
        for (const tier of candidates) {
            if (random < tier.weight) {
                return tier;
            }
            random -= tier.weight;
        }
        return candidates[0] || tiers[0]; // fallback
    }

    update(deltaTime) {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // No horizontal wrapping: SpawnSystem removes fish only after they fully
        // clear the viewport, preventing teleportation and preserving natural entry/exit.
        const width = this.game.getCanvas().width;
        if (!this.hasEnteredFrame && this.x >= -this.size && this.x <= width + this.size) {
            this.hasEnteredFrame = true;
            this.speedX = Math.sign(this.speedX || 1) * this.normalSpeedX;
        }

        // Vertical bouncing
        const height = this.game.getCanvas().height;
        if (this.y < this.size / 2) {
            this.y = this.size / 2;
            this.speedY = Math.abs(this.speedY);
        } else if (this.y > height - this.size / 2) {
            this.y = height - this.size / 2;
            this.speedY = -Math.abs(this.speedY);
        }
    }

    draw(ctx) {
        EnemyFishRenderer.draw(ctx, this);
    }

    // Getters for collision detection
    getPosition() {
        return { x: this.x, y: this.y };
    }

    getSize() {
        return this.size;
    }

    getColor() {
        return this.color;
    }
}