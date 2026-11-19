// SpawnSystem.js - Enemies enter from outside the screen and are replenished safely.
import { GameConfig } from '../data/GameConfig.js';
import { EnemyFish } from '../gameplay/EnemyFish.js';

export class SpawnSystem {
    constructor(game) {
        this.game = game;
    }

    spawnEnemy(options = {}) {
        return new EnemyFish(this.game, { entering: true, ...options });
    }

    spawnInitialEnemies() {
        const enemies = this.game.getEnemies();
        enemies.length = 0;
        // Guarantee a readable opening food chain: at least three initial fish are
        // definitely edible. The rest use the dynamic player-size composition.
        for (let i = 0; i < GameConfig.STARTING_ENEMY_COUNT; i++) {
            enemies.push(this.spawnEnemy({ initial: true, forceEdible: i < Math.min(GameConfig.INITIAL_EDIBLE_ENEMY_COUNT, GameConfig.STARTING_ENEMY_COUNT) }));
        }
    }

    update() {
        const enemies = this.game.getEnemies();
        const width = this.game.getCanvas().width;

        // Fish leave through the opposite side instead of wrapping/teleporting.
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            // Entering fish start fully outside the viewport. Do not cull them
            // while they are still approaching the screen, otherwise every
            // initial/replacement fish is deleted on its very first update.
            const hasEntered = enemy.hasEnteredFrame === true;
            if (hasEntered && (enemy.x < -enemy.size * 1.6 || enemy.x > width + enemy.size * 1.6)) {
                enemies.splice(i, 1);
            }
        }

        while (enemies.length < GameConfig.STARTING_ENEMY_COUNT) {
            enemies.push(this.spawnEnemy());
        }
    }

    // Note: Boss spawning is handled by Game via level timers.
}
