// CollisionSystem.js - Handles all collision detection
import { EatEffect } from '../gameplay/EatEffect.js';
import { GameConfig } from '../data/GameConfig.js';

export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    checkAllCollisions() {
        const player = this.game.getPlayer();
        const enemies = this.game.getEnemies();
        const boss = this.game.getBoss();

        // Check player vs the 2x booster first.
        const booster = this.game.getBooster?.();
        if (booster && this.checkCircleCollision(player, booster)) {
            this.game.activateDoubleCollect();
            booster.consume();
        }

        const healthBooster = this.game.getHealthBooster?.();
        if (healthBooster && this.checkCircleCollision(player, healthBooster)) {
            if (this.game.activateHealthBooster()) healthBooster.consume();
        }

        // Check player vs enemies
        if (player.isInvulnerable()) {
            // Pickups above have already been processed; skip damage/eat collisions
            // while i-frames are active.
            return;
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.checkCircleCollision(player, enemy)) {
                if (this.canPlayerEat(player, enemy)) {
                    // Player eats enemy
                    this.handleEnemyEaten(enemy, i);
                    break;
                } else {
                    // Enemy is too big - deal one health damage and grant i-frames.
                    this.game.takeDamage('ENEMY HIT');
                    if (player.isInvulnerable()) return;
                }
            }
        }

        // Check player vs the Inferno Sea Serpent. A sufficiently large player can eat it.
        const serpent = this.game.getSeaSerpentChallenge?.();
        if (serpent && serpent.isHazardActive?.() && serpent.collidesWithPlayer(player)) {
            if (serpent.canBeEatenBy(player)) {
                this.handleSeaSerpentEaten(serpent);
            } else {
                this.game.takeDamage('SEA SERPENT');
            }
            if (player.isInvulnerable()) return;
        }

        // After toxic immunity is unlocked, the new side-mounted laser becomes the Level 7 threat.
        const toxicLaser = this.game.getToxicLaserChallenge?.();
        if (toxicLaser && toxicLaser.collidesWithPlayer(player)) {
            this.game.takeDamage('TOXIC LASER');
            if (player.isInvulnerable()) return;
        }

        // Check player vs Level 7 toxic bubbles. Each bubble deals one damage and disappears.
        const abyss = this.game.getAbyssalEndChallenge?.();
        if (abyss && abyss.collidesWithPlayer(player)) {
            this.game.takeDamage('ABYSS HAZARD');
            if (player.isInvulnerable()) return;
        }

        const toxic = this.game.getToxicWasteChallenge?.();
        if (toxic && !this.game.hasToxicImmunity?.()) {
            const bubble = toxic.collidesWithPlayer(player);
            if (bubble) {
                toxic.consumeBubble(bubble);
                this.game.takeDamage('TOXIC BUBBLE');
                if (player.isInvulnerable()) return;
            }
        }

        // Check player vs boss. In the Level 10 late-game phases, bosses only
        // have an active collision during their telegraphed attack window.
        if (boss && this.checkCircleCollision(player, boss)) {
            const lateBoss = this.game.getLevelSystem?.().getCurrentLevel?.() === 10 && boss.stage >= 2;
            if (lateBoss && !boss.isCollisionActive?.() && !boss.isVulnerable?.()) return;

            // Boss 1 keeps the classic size-based eating rule. Level 10 Boss 2–4
            // deliberately ignore player/boss size: only the required hit count matters.
            const hitBasedBoss = lateBoss && boss.stage >= 2;
            if (hitBasedBoss) {
                if (boss.isVulnerable?.()) {
                    const defeated = boss.registerPlayerHit?.();
                    this.game.emitEvent('bossHit', { boss, hit: boss.getHitCount?.() || 0, requiredHits: boss.getRequiredHits?.() || 1 });
                    if (defeated) this.game.emitEvent('bossDefeated', { boss });
                } else if (boss.isCollisionActive?.()) {
                    this.game.takeDamage('BOSS ATTACK');
                }
            } else if (this.canPlayerEat(player, boss)) {
                this.game.emitEvent('bossDefeated', { boss });
            } else {
                this.game.takeDamage('BOSS HIT');
            }
        }
    }

    checkCircleCollision(objA, objB) {
        const posA = objA.getPosition();
        const posB = objB.getPosition();
        const sizeA = objA.getSize();
        const sizeB = objB.getSize();

        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (sizeA / 2) + (sizeB / 2);

        // Slight forgiveness keeps collisions fair against visually thin/irregular
        // fish sprites without changing the gameplay size/eat rules.
        const forgiveness = GameConfig.PLAYER_COLLISION_FORGIVENESS;
        return distance < minDistance * forgiveness;
    }

    canPlayerEat(player, target) {
        return player.getSize() >= target.getSize() * 1.2;
    }

    handleEnemyEaten(enemy, index) {
        // Get enemy size before removing
        const enemySize = enemy.getSize();

        // Remove enemy from array
        this.game.getEnemies().splice(index, 1);

        // Spawn replacement enemy
        this.game.getEnemies().push(this.game.getSpawnSystem().spawnEnemy());

        // Create eating effect
        const eatEffect = new EatEffect(
            enemy.getPosition().x,
            enemy.getPosition().y,
            enemy.getColor(),
            enemySize
        );
        this.game.getEatEffects().push(eatEffect);

        // Notify player to grow
        this.game.getPlayer().eatEnemy(enemySize);

        // Emit fish eaten event for economy and other systems
        this.game.emitEvent('fishEaten', { size: enemySize, x: enemy.getPosition().x, y: enemy.getPosition().y });
    }
    handleSeaSerpentEaten(serpent) {
        const serpentSize = serpent.getSize();
        const pos = serpent.getPosition();
        serpent.consume();

        const eatEffect = new EatEffect(pos.x, pos.y, serpent.getColor(), serpentSize);
        this.game.getEatEffects().push(eatEffect);
        this.game.getPlayer().eatEnemy(serpentSize);
        this.game.emitEvent('fishEaten', { size: serpentSize, x: pos.x, y: pos.y, source: 'SEA_SERPENT' });
    }

}