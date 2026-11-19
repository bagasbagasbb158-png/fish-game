// Game.js - Central game controller
import { GameConfig } from '../data/GameConfig.js';
import { GameState } from './GameState.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { Player } from '../gameplay/Player.js';
import { BossFish } from '../gameplay/BossFish.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { SkinSystem } from '../systems/SkinSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { BackgroundEnvironment } from '../gameplay/BackgroundEnvironment.js';
import { LevelSystem } from '../systems/LevelSystem.js';
import { SeaSerpentChallenge } from '../gameplay/SeaSerpentChallenge.js';
import { DoubleCollectBooster } from '../gameplay/DoubleCollectBooster.js';
import { HealthBooster } from '../gameplay/HealthBooster.js';
import { ToxicWasteChallenge } from '../gameplay/ToxicWasteChallenge.js';
import { ToxicLaserChallenge } from '../gameplay/ToxicLaserChallenge.js';
import { AbyssalEndChallenge } from '../gameplay/AbyssalEndChallenge.js';
import { FinalEnding } from '../gameplay/FinalEnding.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseX = null;
        this.mouseY = null;
        this.enemies = [];
        this.boss = null;
        this.bossSpawned = false;
        this.bossStage = 0;
        this.levelTransitionPending = false;
        this.runHadGameOver = false;
        this.finalEnding?.reset?.();
        this.booster = null;
        this.boosterSpawnTimer = 10 + Math.random() * 5;
        this.doubleCollectTimer = 0;
        this.healthBooster = null;
        this.healthBoosterSpawnTimer = 16 + Math.random() * 10;
        this.health = GameConfig.PLAYER_MAX_HEALTH;
        this.cameraShakeTimer = 0;
        this.cameraShakeStrength = 0;
        this.damageFlashTimer = 0;
        // Per-run arcade stats / feeding streak. These never replace persistent progression.
        this.runFishEaten = 0;
        this.runMaxSize = GameConfig.PLAYER_START_SIZE;
        this.runDamageTaken = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.runBestCombo = 0;
        this.eatEffects = [];
        this.bubbles = [];
        this.particles = [];
        this.listeners = {};
        this.lastWidth = 0;
        this.lastHeight = 0;

        this.gameState = new GameState();
        this.saveSystem = new SaveSystem();
        this.scoreSystem = new ScoreSystem(this);
        this.timerSystem = new TimerSystem(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.economySystem = new EconomySystem(this);
        this.achievementSystem = new AchievementSystem(this);

        // SkinSystem must exist before Player is constructed because Player.reset()
        // immediately reads the currently equipped skin.
        this.skinSystem = new SkinSystem(this);
        this.levelSystem = new LevelSystem(this);

        this.spawnSystem = new SpawnSystem(this);
        this.collisionSystem = new CollisionSystem(this);
        this.uiManager = new UIManager(this);
        this.on('achievementUnlocked', (achievement) => {
            this.uiManager.showAchievementNotification?.(achievement);
        });
        this.backgroundEnvironment = new BackgroundEnvironment(this);
        this.seaSerpentChallenge = new SeaSerpentChallenge(this);
        this.toxicWasteChallenge = new ToxicWasteChallenge(this);
        this.toxicLaserChallenge = new ToxicLaserChallenge(this);
        this.abyssalEndChallenge = new AbyssalEndChallenge(this);
        this.finalEnding = new FinalEnding(this);
        this.player = new Player(this);

        this.registerEvents();
        this.resize();
        this.resetGame();
        this.gameState.setCurrent(this.gameState.states.MENU);

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const hx = this.mouseX * scaleX, hy = this.mouseY * scaleY;
            this.uiManager.updateHover?.(hx, hy);
        });

        // One click router for the game. main.js intentionally has no click
        // handler, so clicking SHOP/Achievements cannot accidentally start a game.
        this.canvas.addEventListener('wheel', (event) => {
            if (this.gameState.getCurrent() === this.gameState.states.SHOP) {
                event.preventDefault();
                this.uiManager.handleShopWheel(event.deltaY);
            } else if (this.gameState.getCurrent() === this.gameState.states.ACHIEVEMENTS) {
                event.preventDefault();
                this.uiManager.handleAchievementsWheel(event.deltaY);
            }
        }, { passive: false });

        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;
            if (this.finalEnding?.isActive?.()) {
                this.finalEnding.handleClick?.(clickX, clickY);
                return;
            }
            const state = this.gameState.getCurrent();

            if (state === this.gameState.states.MENU) {
                this.handleMenuClick(clickX, clickY);
            } else if (state === this.gameState.states.SHOP) {
                this.handleShopClick(clickX, clickY);
            } else if (state === this.gameState.states.ACHIEVEMENTS) {
                this.handleAchievementsClick(clickX, clickY);
            } else if (state === this.gameState.states.LEVEL_SELECT) {
                this.handleLevelSelectClick(clickX, clickY);
            } else if (state === this.gameState.states.PLAYING) {
                if (this.uiManager.tutorialActive) {
                    this.uiManager.handleTutorialClick(clickX, clickY);
                    return;
                }
                this.handlePlayingClick(clickX, clickY);
            } else if (state === this.gameState.states.PAUSED) {
                this.handlePausedClick(clickX, clickY);
            } else if (state === this.gameState.states.GAMEOVER || state === this.gameState.states.WON) {
                this.handleEndScreenClick(clickX, clickY);
            }
        });
        this.canvas.addEventListener('pointerdown', () => {
            this.uiManager.setPressedButton?.(this.uiManager.hoveredButton);
        });
        window.addEventListener('pointerup', () => {
            this.uiManager.setPressedButton?.(null);
        });
    }

    registerEvents() {
        this.on('fishEaten', (data) => {
            const collectMultiplier = this.getCollectMultiplier();

            // Feeding streak: consecutive meals within a short window build a
            // capped score multiplier. This rewards active hunting without making
            // one lucky chain dominate the entire run.
            this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
            this.comboTimer = GameConfig.COMBO_WINDOW;
            this.runBestCombo = Math.max(this.runBestCombo, this.combo);
            const savedBestCombo = this.saveSystem.get('bestCombo') || 0;
            if (this.runBestCombo > savedBestCombo) this.saveSystem.set('bestCombo', this.runBestCombo);

            // Risk reward: eating prey close to the 1.2x safe threshold is more
            // dangerous, so it earns a modest extra score bonus.
            const playerSize = Math.max(1, this.player.getSize());
            const ratio = playerSize / Math.max(1, data.size);
            const risk = Math.max(0, Math.min(1, (ratio - 1.2) / 1.8));
            const riskBonus = GameConfig.RISK_SCORE_MAX_BONUS * (1 - risk);
            const comboMultiplier = Math.min(
                GameConfig.COMBO_MAX_MULTIPLIER,
                1 + Math.max(0, this.combo - 1) * GameConfig.COMBO_STEP
            );
            const points = Math.max(1, Math.floor(
                data.size * GameConfig.SCORE_MULTIPLIER * collectMultiplier * comboMultiplier * (1 + riskBonus)
            ));
            this.scoreSystem.addScore(points);
            this.runFishEaten++;
            this.saveSystem.incrementTotalFishEaten();
            this.economySystem.onFishEaten({ ...data, multiplier: collectMultiplier });

            // Award XP based on enemy size tier
            let xpReward = 0;
            const size = data.size;

            if (size < GameConfig.ENEMY_SIZE_TIERS[0].sizeMax) { // Tiny
                xpReward = GameConfig.TINY_XP;
            } else if (size < GameConfig.ENEMY_SIZE_TIERS[1].sizeMax) { // Small
                xpReward = GameConfig.SMALL_XP;
            } else if (size < GameConfig.ENEMY_SIZE_TIERS[2].sizeMax) { // Medium
                xpReward = GameConfig.MEDIUM_XP;
            } else if (size < GameConfig.ENEMY_SIZE_TIERS[3].sizeMax) { // Large
                xpReward = GameConfig.LARGE_XP;
            } else { // Huge
                xpReward = GameConfig.HUGE_XP;
            }

            this.progressionSystem.addXP(xpReward * collectMultiplier);
            this.achievementSystem.checkFishEaten();
            this.uiManager.showCoinFeedback(
                Math.max(GameConfig.COIN_REWARD_BASE, Math.floor(data.size * GameConfig.COIN_REWARD_SIZE_MULTIPLIER * collectMultiplier)),
                data.x ?? this.player.x,
                data.y ?? this.player.y
            );
            this.uiManager.showXPFeedback(xpReward * collectMultiplier, data.x ?? this.player.x, data.y ?? this.player.y);
        });

        this.on('bossHit', (data) => {
            const hit = data.hit || 0;
            const total = data.requiredHits || 1;
            this.uiManager.startBossMessage(`⚡ BOSS HIT ${hit}/${total} — ${hit >= total ? 'DEFEATED!' : 'IT RECOVERS!'}`);
        });

        this.on('bossDefeated', () => {
            this.economySystem.onBossDefeated();
            this.progressionSystem.addXP(GameConfig.BOSS_XP);
            this.uiManager.showXPFeedback(GameConfig.BOSS_XP, this.player.x, this.player.y);

            const level = this.levelSystem.getCurrentLevel();
            const levelData = this.levelSystem.getLevelData();
            // Multi-boss levels continue until every configured boss is defeated.
            if (this.bossStage < levelData.bossCount) {
                const nextStage = this.bossStage + 1;
                this.boss = null;
                const nextTime = nextStage === 2 ? levelData.boss2Time : nextStage === 3 ? levelData.boss3Time : levelData.boss4Time;
                const label = level === 10 && nextStage === 4 ? 'GOD OF THE ABYSS' : level === 10 && nextStage === 3 ? 'ABYSS EMPEROR' : level === 10 && nextStage === 2 ? 'VOID LEVIATHAN' : level === 10 && nextStage === 1 ? 'ABYSSAL WARDEN' : level === 9 && nextStage === 3 ? 'TOXIC GOD FISH' : level === 9 && nextStage === 2 ? 'TOXIC WASTE COLOSSUS' : level === 8 && nextStage === 2 ? 'TOXIC WASTE COLOSSUS' : level === 6 && nextStage === 3 ? 'INFERNO GOD FISH' : level === 5 && nextStage === 2 ? 'INFERNO COLOSSUS' : nextStage === 2 ? 'ABYSSAL BOSS' : 'ANCIENT LEVIATHAN';
                const seconds = String(nextTime).padStart(2, '0');
                this.uiManager.startBossMessage(`BOSS ${this.bossStage} DEFEATED! ${label} ARRIVES AT 00:${seconds}`);
                return;
            }

            this.levelTransitionPending = true;
            const completedLevel = this.levelSystem.getCurrentLevel();
            this.saveSystem.incrementTotalWins();
            this.emitEvent('levelCompleted', {
                level: completedLevel,
                survivalTime: this.timerSystem.getElapsedTime(),
                damageTaken: this.runDamageTaken,
                fishEaten: this.runFishEaten,
                maxSize: this.runMaxSize,
                bestCombo: this.runBestCombo,
                score: this.scoreSystem.getScore()
            });
            this.achievementSystem.checkFishEaten();
            this.achievementSystem.checkGameWon({ withoutGameOver: !this.runHadGameOver });

            // Level 10 does not show the normal victory panel. The final boss defeat
            // hands control to a dedicated cinematic ending sequence instead.
            if (level === 10 && this.bossStage === 4) {
                this.gameState.setCurrent(this.gameState.states.WON);
                this.finalEnding.start();
                return;
            }

            this.gameState.setCurrent(this.gameState.states.WON);
            if (this.levelSystem.getCurrentLevel() < this.levelSystem.getTotalLevels()) this.levelSystem.unlockNextLevel();
        });

        this.on('levelUp', (data) => {
            this.uiManager.showLevelUpNotification(data.newLevel);
            this.achievementSystem.checkPlayerLevel(data.newLevel);
        });

        this.on('skinPurchased', (data) => {
            this.uiManager.showPurchaseFeedback(`Purchased! ${data.skinId}`);
        });

        this.on('skinEquipped', (data) => {
            this.uiManager.showPurchaseFeedback(`Equipped! ${data.skinId}`);
            this.player.updateColor();
        });

        this.on('gameWon', () => {
            // Kept for compatibility with other systems. Boss victory is finalized
            // by the bossDefeated handler so multi-boss levels can continue.
        });

        this.on('gameOver', () => {
            if (this.gameState.is(this.gameState.states.PLAYING)) {
                this.gameState.setCurrent(this.gameState.states.GAMEOVER);
            }
        });
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback);
    }

    emitEvent(eventName, data) {
        const callbacks = this.listeners[eventName] || [];
        for (const callback of callbacks) {
            try {
                callback(data);
            } catch (error) {
                // An optional event/UI listener must never terminate the main game loop.
                console.error(`[HUNGER FISH] ${eventName} listener failed:`, error);
            }
        }
    }

    handleMenuClick(clickX, clickY) {
        // Check if start button was clicked
        if (this.uiManager.startButtonArea &&
            clickX >= this.uiManager.startButtonArea.x &&
            clickX <= this.uiManager.startButtonArea.x + this.uiManager.startButtonArea.width &&
            clickY >= this.uiManager.startButtonArea.y &&
            clickY <= this.uiManager.startButtonArea.y + this.uiManager.startButtonArea.height) {
            this.startGame();
            return;
        }

        // Check if shop button was clicked
        if (this.uiManager.shopButtonArea &&
            clickX >= this.uiManager.shopButtonArea.x &&
            clickX <= this.uiManager.shopButtonArea.x + this.uiManager.shopButtonArea.width &&
            clickY >= this.uiManager.shopButtonArea.y &&
            clickY <= this.uiManager.shopButtonArea.y + this.uiManager.shopButtonArea.height) {
            this.gameState.setCurrent(this.gameState.states.SHOP);
            return;
        }

        // Check if achievements button was clicked
        if (this.uiManager.achievementsButtonArea &&
            clickX >= this.uiManager.achievementsButtonArea.x &&
            clickX <= this.uiManager.achievementsButtonArea.x + this.uiManager.achievementsButtonArea.width &&
            clickY >= this.uiManager.achievementsButtonArea.y &&
            clickY <= this.uiManager.achievementsButtonArea.y + this.uiManager.achievementsButtonArea.height) {
            this.gameState.setCurrent(this.gameState.states.ACHIEVEMENTS);
            return;
        }

        if (this.uiManager.levelButtonArea &&
            clickX >= this.uiManager.levelButtonArea.x &&
            clickX <= this.uiManager.levelButtonArea.x + this.uiManager.levelButtonArea.width &&
            clickY >= this.uiManager.levelButtonArea.y &&
            clickY <= this.uiManager.levelButtonArea.y + this.uiManager.levelButtonArea.height) {
            this.gameState.setCurrent(this.gameState.states.LEVEL_SELECT);
            return;
        }
    }

    handlePlayingClick(clickX, clickY) {
        const area = this.uiManager.pauseButtonArea;
        if (area && clickX >= area.x && clickX <= area.x + area.width &&
            clickY >= area.y && clickY <= area.y + area.height) {
            this.gameState.setCurrent(this.gameState.states.PAUSED);
            return;
        }
    }

    handlePausedClick(clickX, clickY) {
        const resume = this.uiManager.pauseResumeButtonArea;
        if (resume && clickX >= resume.x && clickX <= resume.x + resume.width &&
            clickY >= resume.y && clickY <= resume.y + resume.height) {
            this.gameState.setCurrent(this.gameState.states.PLAYING);
            return;
        }

        const menu = this.uiManager.pauseMenuButtonArea;
        if (menu && clickX >= menu.x && clickX <= menu.x + menu.width &&
            clickY >= menu.y && clickY <= menu.y + menu.height) {
            this.gameState.setCurrent(this.gameState.states.MENU);
            return;
        }
    }

    handleEndScreenClick(clickX, clickY) {
        const restart = this.uiManager.restartButtonArea;
        const menu = this.uiManager.endMenuButtonArea;
        const next = this.uiManager.nextLevelButtonArea;

        if (restart && clickX >= restart.x && clickX <= restart.x + restart.width &&
            clickY >= restart.y && clickY <= restart.y + restart.height) {
            this.startGame(this.levelSystem.getCurrentLevel());
            return;
        }
        if (menu && clickX >= menu.x && clickX <= menu.x + menu.width && clickY >= menu.y && clickY <= menu.y + menu.height) {
            this.gameState.setCurrent(this.gameState.states.MENU);
            return;
        }
        if (next && clickX >= next.x && clickX <= next.x + next.width && clickY >= next.y && clickY <= next.y + next.height) {
            const nextLevel = this.levelSystem.getCurrentLevel() + 1;
            if (nextLevel <= this.levelSystem.getUnlockedLevel()) {
                this.levelSystem.selectLevel(nextLevel);
                this.startGame(nextLevel);
            }
        }
    }

    handleLevelSelectClick(clickX, clickY) {
        const back = this.uiManager.levelSelectBackButtonArea;
        if (back && clickX >= back.x && clickX <= back.x + back.width && clickY >= back.y && clickY <= back.y + back.height) {
            this.gameState.setCurrent(this.gameState.states.MENU);
            return;
        }
        for (const [level, area] of this.uiManager.levelHitAreas.entries()) {
            if (clickX >= area.x && clickX <= area.x + area.width && clickY >= area.y && clickY <= area.y + area.height) {
                if (this.levelSystem.selectLevel(level)) this.startGame(level);
                return;
            }
        }
    }

    handleAchievementsClick(clickX, clickY) {
        const area = this.uiManager.achievementsBackButtonArea;
        if (area && clickX >= area.x && clickX <= area.x + area.width &&
            clickY >= area.y && clickY <= area.y + area.height) {
            this.gameState.setCurrent(this.gameState.states.MENU);
        }
    }

    handleShopClick(clickX, clickY) {
        // Check if back button was clicked
        if (this.uiManager.backButtonArea &&
            clickX >= this.uiManager.backButtonArea.x &&
            clickX <= this.uiManager.backButtonArea.x + this.uiManager.backButtonArea.width &&
            clickY >= this.uiManager.backButtonArea.y &&
            clickY <= this.uiManager.backButtonArea.y + this.uiManager.backButtonArea.height) {
            this.gameState.setCurrent(this.gameState.states.MENU);
            return;
        }

        // Check skin card buttons
        const skins = this.getSkinSystem().getAvailableSkins();
        for (const skin of skins) {
            const area = this.uiManager.shopSkinHitAreas.get(skin.id);
            if (!area || !area.actionable) continue;
            if (clickX >= area.x && clickX <= area.x + area.width &&
                clickY >= area.y && clickY <= area.y + area.height) {
                if (this.getSkinSystem().isOwned(skin.id)) {
                    this.getSkinSystem().equipSkin(skin.id);
                } else if (this.getSkinSystem().canPurchase(skin.id)) {
                    this.getSkinSystem().purchaseSkin(skin.id);
                }
                return;
            }
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.max(420, window.innerHeight);
        this.lastWidth = this.canvas.width;
        this.lastHeight = this.canvas.height;
        this.player?.constrainToBounds(this.canvas.width, this.canvas.height);
    }

    startGame(level = this.levelSystem.getCurrentLevel()) {
        this.levelSystem.selectLevel(level);
        this.resetGame();
        this.uiManager.pauseButtonArea = null;
        this.uiManager.pauseResumeButtonArea = null;
        this.uiManager.pauseMenuButtonArea = null;
        this.gameState.setCurrent(this.gameState.states.PLAYING);
        this.runHadGameOver = false;
        this.saveSystem.incrementTotalGamesPlayed();
        this.achievementSystem.checkAll?.();

        // Show the first tutorial for each zone once per page/session.
        this.uiManager.startTutorial(level);
    }

    resetGame() {
        // Event listeners intentionally persist across runs; do not reset this.listeners here.
        this.player?.reset();
        this.mouseX = null;
        this.mouseY = null;
        this.scoreSystem?.reset();
        this.timerSystem?.reset();
        this.enemies.length = 0;
        this.eatEffects.length = 0;
        this.boss = null;
        this.bossSpawned = false;
        this.bossStage = 0;
        this.levelTransitionPending = false;
        this.finalEnding?.reset?.();
        this.booster = null;
        this.boosterSpawnTimer = 10 + Math.random() * 5;
        this.doubleCollectTimer = 0;
        this.healthBooster = null;
        this.healthBoosterSpawnTimer = 16 + Math.random() * 10;
        this.health = GameConfig.PLAYER_MAX_HEALTH;
        this.cameraShakeTimer = 0;
        this.cameraShakeStrength = 0;
        this.damageFlashTimer = 0;
        this.runFishEaten = 0;
        this.runMaxSize = GameConfig.PLAYER_START_SIZE;
        this.runDamageTaken = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.runBestCombo = 0;
        this.initEnvironment();
        this.backgroundEnvironment?.generate();
        this.seaSerpentChallenge?.reset();
        this.toxicWasteChallenge?.reset();
        this.toxicLaserChallenge?.reset();
        this.abyssalEndChallenge?.reset();
        if (this.spawnSystem) this.spawnSystem.spawnInitialEnemies();
    }

    initEnvironment() {
        this.bubbles.length = 0;
        this.particles.length = 0;

        for (let i = 0; i < GameConfig.BUBBLE_COUNT; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 2 + Math.random() * 3,
                speed: 12 + Math.random() * 35,
                alpha: 0.2 + Math.random() * 0.35
            });
        }

        for (let i = 0; i < GameConfig.PARTICLE_COUNT; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0.5 + Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                alpha: 0.08 + Math.random() * 0.18
            });
        }
    }

    updateEnvironment(deltaTime) {
        const dt = deltaTime / 1000;
        for (const bubble of this.bubbles) {
            bubble.y -= bubble.speed * dt;
            if (bubble.y < -bubble.radius) {
                bubble.y = this.canvas.height + bubble.radius;
                bubble.x = Math.random() * this.canvas.width;
            }
        }
        for (const particle of this.particles) {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        }
    }

    update(deltaTime) {
        this.damageFlashTimer = Math.max(0, this.damageFlashTimer - deltaTime / 1000);
        if (this.finalEnding?.isActive()) {
            this.finalEnding.update(deltaTime);
            return;
        }
        if (!this.gameState.is(this.gameState.states.PLAYING)) return;
        if (this.uiManager?.tutorialActive) return;

        this.timerSystem.update(deltaTime);

        if (this.cameraShakeTimer > 0) {
            this.cameraShakeTimer = Math.max(0, this.cameraShakeTimer - deltaTime / 1000);
            this.cameraShakeStrength = GameConfig.CAMERA_SHAKE_STRENGTH * (this.cameraShakeTimer / GameConfig.CAMERA_SHAKE_DURATION);
        } else {
            this.cameraShakeStrength = 0;
        }
        this.updateEnvironment(deltaTime);
        this.backgroundEnvironment?.update(deltaTime);
        this.seaSerpentChallenge?.update(deltaTime);
        this.player.update(deltaTime);
        this.runMaxSize = Math.max(this.runMaxSize, this.player.getSize());
        this.achievementSystem.update?.();
        if (this.comboTimer > 0) {
            this.comboTimer = Math.max(0, this.comboTimer - deltaTime / 1000);
            if (this.comboTimer <= 0) this.combo = 0;
        }

        for (const enemy of this.enemies) enemy.update(deltaTime);
        this.spawnSystem.update();

        // Global 2x booster: a new bubble appears randomly every 10-15 seconds.
        if (this.booster) {
            if (!this.booster.update(deltaTime)) this.booster = null;
        }
        if (!this.booster) {
            this.boosterSpawnTimer -= deltaTime / 1000;
            if (this.boosterSpawnTimer <= 0) {
                this.booster = new DoubleCollectBooster(this);
                this.boosterSpawnTimer = 10 + Math.random() * 5;
            }
        }
        if (this.doubleCollectTimer > 0) {
            this.doubleCollectTimer = Math.max(0, this.doubleCollectTimer - deltaTime / 1000);
        }

        // Floating +1 HP booster. It only spawns while the player can actually gain health.
        if (this.healthBooster) {
            if (!this.healthBooster.update(deltaTime)) this.healthBooster = null;
        }
        if (!this.healthBooster && this.health < GameConfig.PLAYER_MAX_HEALTH) {
            this.healthBoosterSpawnTimer -= deltaTime / 1000;
            if (this.healthBoosterSpawnTimer <= 0) {
                this.healthBooster = new HealthBooster(this);
                this.healthBoosterSpawnTimer = 16 + Math.random() * 10;
            }
        }

        const elapsed = this.timerSystem.getElapsedTime();
        const levelData = this.levelSystem.getLevelData();
        if (!this.boss && this.bossStage === 0 && elapsed >= levelData.boss1Time) {
            this.spawnBoss(1);
        } else if (!this.boss && this.bossStage === 1 && levelData.bossCount >= 2 && elapsed >= levelData.boss2Time) {
            this.spawnBoss(2);
        } else if (!this.boss && this.bossStage === 2 && levelData.bossCount >= 3 && elapsed >= levelData.boss3Time) {
            this.spawnBoss(3);
        } else if (!this.boss && this.bossStage === 3 && levelData.bossCount >= 4 && elapsed >= levelData.boss4Time) {
            this.spawnBoss(4);
        }
        if (this.boss) this.boss.update(deltaTime);
        this.toxicWasteChallenge?.update(deltaTime);
        this.toxicLaserChallenge?.update(deltaTime);
        this.abyssalEndChallenge?.update(deltaTime);

        for (let i = this.eatEffects.length - 1; i >= 0; i--) {
            if (!this.eatEffects[i].update(deltaTime)) this.eatEffects.splice(i, 1);
        }

        this.collisionSystem.checkAllCollisions();
    }

    spawnBoss(stage = 1) {
        const level = this.levelSystem.getCurrentLevel();
        const size = level === 10 && stage === 4 ? GameConfig.BOSS10_SIZE : level === 10 && stage === 3 ? GameConfig.BOSS3_SIZE + 100 : level === 10 && stage === 2 ? GameConfig.BOSS8_SIZE : level === 10 && stage === 1 ? GameConfig.BOSS7_SIZE : level === 7 && stage === 1 ? GameConfig.BOSS7_SIZE : level === 9 && stage === 3 ? GameConfig.BOSS9_SIZE : level === 9 && stage === 2 ? GameConfig.BOSS8_SIZE : level === 9 && stage === 1 ? GameConfig.BOSS7_SIZE : level === 8 && stage === 2 ? GameConfig.BOSS8_SIZE : level === 8 && stage === 1 ? GameConfig.BOSS7_SIZE : level === 6 && stage === 3 ? GameConfig.BOSS6_SIZE : (level === 4 || level === 5 || level === 6) && stage === 1 ? GameConfig.BOSS4_SIZE : level === 5 && stage === 2 ? GameConfig.BOSS5_SIZE : stage === 3 ? GameConfig.BOSS3_SIZE : stage === 2 ? GameConfig.BOSS2_SIZE : GameConfig.BOSS_SIZE;
        const fromLeft = Math.random() < 0.5;
        const x = fromLeft ? -size / 2 : this.canvas.width + size / 2;
        const y = size / 2 + Math.random() * Math.max(1, this.canvas.height - size);
        const speedX = fromLeft ? GameConfig.BOSS_SPEED : -GameConfig.BOSS_SPEED;
        this.boss = new BossFish(this, x, y, speedX, size, stage);
        this.bossStage = stage;
        this.bossSpawned = true;
        const message = level === 10 && stage === 4 ? 'THE GOD OF THE ABYSS HAS AWAKENED!' : level === 10 && stage === 3 ? 'THE ABYSS EMPEROR HAS AWAKENED!' : level === 10 && stage === 2 ? 'THE VOID LEVIATHAN HAS AWAKENED!' : level === 10 && stage === 1 ? 'THE ABYSSAL WARDEN HAS AWAKENED!' : level === 9 && stage === 3 ? 'THE TOXIC GOD FISH HAS AWAKENED!' : level === 9 && stage === 2 ? 'THE TOXIC WASTE COLOSSUS HAS AWAKENED!' : level === 8 && stage === 2 ? 'THE TOXIC WASTE COLOSSUS HAS AWAKENED!' : level >= 7 && stage === 1 ? 'THE TOXIC WASTE TITAN HAS AWAKENED!' : level === 6 && stage === 3 ? 'THE INFERNO GOD FISH HAS AWAKENED!' : level === 5 && stage === 2 ? 'THE INFERNO COLOSSUS HAS AWAKENED!' : level === 4 || level === 5 || (level === 6 && stage === 1) ? 'THE INFERNO TYRANT HAS AWAKENED!' : stage === 3 ? 'THE ANCIENT LEVIATHAN HAS AWAKENED!' : stage === 2 ? 'THE ABYSSAL BOSS HAS APPEARED!' : 'A MASSIVE FISH HAS APPEARED!';
        this.uiManager.startBossMessage(message);
        this.emitEvent('bossSpawned', { boss: this.boss, stage });
    }

    draw() {
        if (this.finalEnding?.isActive()) {
            this.finalEnding.draw(this.ctx);
            return;
        }
        if (this.gameState.is(this.gameState.states.MENU)) {
            this.drawBackground();
            this.backgroundEnvironment?.draw(this.ctx);
            this.drawEnvironment();
            this.uiManager.draw(this.ctx);
            return;
        }

        // Camera shake affects the game world, while the HUD stays stable.
        this.ctx.save();
        if (this.cameraShakeStrength > 0) {
            const angle = Math.random() * Math.PI * 2;
            const amount = this.cameraShakeStrength;
            this.ctx.translate(Math.cos(angle) * amount, Math.sin(angle) * amount);
        }
        this.drawBackground();
        this.backgroundEnvironment?.draw(this.ctx);
        this.drawEnvironment();
        for (const enemy of this.enemies) enemy.draw(this.ctx);
        if (this.boss) this.boss.draw(this.ctx);
        for (const effect of this.eatEffects) effect.draw(this.ctx);
        this.player.draw(this.ctx);
        this.booster?.draw(this.ctx);
        this.healthBooster?.draw(this.ctx);
        this.seaSerpentChallenge?.draw(this.ctx);
        this.toxicWasteChallenge?.draw(this.ctx);
        this.toxicLaserChallenge?.draw(this.ctx);
        this.abyssalEndChallenge?.draw(this.ctx);
        this.ctx.restore();

        this.uiManager.draw(this.ctx);
        this.drawDoubleCollectStatus();
        this.drawAimFeedback();
        this.drawDamageFlash();
    }

    drawBackground() {
        const level = this.levelSystem?.getCurrentLevel?.() || 1;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (level === 10) {
            const stage = this.bossStage || 0;
            gradient.addColorStop(0, stage >= 4 ? '#010106' : stage >= 3 ? '#02020c' : '#02020d');
            gradient.addColorStop(0.28, stage >= 4 ? '#12072a' : '#09061d');
            gradient.addColorStop(0.62, stage >= 4 ? '#220b3b' : '#12072a');
            gradient.addColorStop(1, '#010105');
        } else if (level === 9) {
            gradient.addColorStop(0, '#010604');
            gradient.addColorStop(0.28, '#06130a');
            gradient.addColorStop(0.62, '#041008');
            gradient.addColorStop(1, '#000201');
        } else if (level >= 7 && level <= 8) {
            gradient.addColorStop(0, '#06130d');
            gradient.addColorStop(0.3, '#102d1d');
            gradient.addColorStop(0.62, '#0b2017');
            gradient.addColorStop(1, '#020805');
        } else if (level === 6) {
            gradient.addColorStop(0, '#120303');
            gradient.addColorStop(0.28, '#220605');
            gradient.addColorStop(0.58, '#160306');
            gradient.addColorStop(1, '#030102');
        } else if (level >= 3) {
            gradient.addColorStop(0, '#071d3b');
            gradient.addColorStop(0.42, '#17134a');
            gradient.addColorStop(1, '#05040f');
        } else if (level >= 2) {
            gradient.addColorStop(0, '#063b63');
            gradient.addColorStop(0.48, '#062d58');
            gradient.addColorStop(1, '#020b1d');
        } else {
            gradient.addColorStop(0, '#003b66');
            gradient.addColorStop(0.5, '#002b5e');
            gradient.addColorStop(1, '#000d1a');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Soft underwater light rays, stronger in the shallow first level.
        this.ctx.save();
        this.ctx.globalAlpha = level === 10 ? 0.018 : level >= 7 && level <= 8 ? 0.028 : level === 6 ? 0.035 : level >= 3 ? 0.022 : level >= 2 ? 0.035 : 0.055;
        this.ctx.fillStyle = level === 10 ? '#a78bff' : level >= 7 && level <= 8 ? '#8dff4a' : level === 6 ? '#ff5a1f' : level >= 3 ? '#9b7cff' : '#8de8ff';
        for (let i = -2; i < 9; i++) {
            const x = i * 190 + Math.sin(performance.now() * 0.00015 + i) * 25;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x + 90, 0);
            this.ctx.lineTo(x + 220, this.canvas.height);
            this.ctx.lineTo(x + 130, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawEnvironment() {
        for (const bubble of this.bubbles) {
            this.ctx.save();
            this.ctx.globalAlpha = bubble.alpha;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    getSpawnSystem() { return this.spawnSystem; }
    getBooster() { return this.booster; }
    getCollectMultiplier() { return this.doubleCollectTimer > 0 ? 2 : 1; }
    activateDoubleCollect() {
        this.doubleCollectTimer = 7;
        this.emitEvent('doubleBoosterCollected');
        this.uiManager.showPurchaseFeedback?.('2× COLLECT ACTIVE!');
    }
    activateHealthBooster() {
        if (this.health >= GameConfig.PLAYER_MAX_HEALTH) return false;
        this.health = Math.min(GameConfig.PLAYER_MAX_HEALTH, this.health + 1);
        this.emitEvent('healthBoosterCollected');
        this.uiManager.showPurchaseFeedback?.('+1 HEALTH!');
        return true;
    }

    getHealthBooster() { return this.healthBooster; }
    drawDoubleCollectStatus() {
        if (this.getCollectMultiplier() !== 2) return;
        const seconds = Math.ceil(this.doubleCollectTimer);
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(80,190,255,0.22)';
        this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        this.ctx.lineWidth = 1.5;
        const w = 155, h = 32, x = this.canvas.width / 2 - w / 2, y = 18;
        this.ctx.beginPath(); this.ctx.roundRect(x,y,w,h,16); this.ctx.fill(); this.ctx.stroke();
        this.ctx.fillStyle = '#fff'; this.ctx.font = '900 16px Arial'; this.ctx.textAlign='center'; this.ctx.textBaseline='middle';
        this.ctx.fillText(`2× COLLECT • ${seconds}s`, this.canvas.width/2, y+h/2);
        this.ctx.restore();
    }

    drawAimFeedback() {
        if (this.mouseX === null || this.mouseY === null) return;
        if (!this.gameState.is(this.gameState.states.PLAYING)) return;
        const player = this.player;
        let mode = 'neutral';
        const enemies = this.enemies || [];
        let nearest = Infinity;
        for (const enemy of enemies) {
            const dx = enemy.x - this.mouseX, dy = enemy.y - this.mouseY;
            const d = Math.hypot(dx, dy);
            if (d < nearest) {
                nearest = d;
                mode = player.getSize() >= enemy.getSize() * 1.2 ? 'edible' : 'danger';
            }
        }
        const radius = Math.max(10, Math.min(20, player.getSize() * 0.11));
        this.ctx.save();
        this.ctx.globalAlpha = 0.52;
        this.ctx.strokeStyle = mode === 'edible' ? '#7dffd7' : mode === 'danger' ? '#ff8b8b' : '#d8f5ff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath(); this.ctx.arc(this.mouseX, this.mouseY, radius, 0, Math.PI * 2); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(this.mouseX, this.mouseY, 2.2, 0, Math.PI * 2); this.ctx.fillStyle = this.ctx.strokeStyle; this.ctx.fill();
        this.ctx.restore();
    }

    drawDamageFlash() {
        if (this.damageFlashTimer <= 0) return;
        const alpha = Math.min(0.22, (this.damageFlashTimer / 0.24) * 0.22);
        const w = this.canvas.width, h = this.canvas.height;
        const g = this.ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.2,w/2,h/2,Math.max(w,h)*0.72);
        g.addColorStop(0, 'rgba(255,0,0,0)');
        g.addColorStop(0.72, `rgba(255,40,40,${alpha * 0.35})`);
        g.addColorStop(1, `rgba(255,0,0,${alpha})`);
        this.ctx.save(); this.ctx.fillStyle=g; this.ctx.fillRect(0,0,w,h); this.ctx.restore();
    }

    getCanvas() { return this.canvas; }
    getGameState() { return this.gameState; }
    takeDamage(source = 'DANGER') {
        if (!this.gameState.is(this.gameState.states.PLAYING)) return false;
        if (this.player.isInvulnerable()) return false;

        this.health = Math.max(0, this.health - 1);
        this.runDamageTaken++;
        this.emitEvent('damageTaken', { source, remainingHealth: this.health });
        if (source === 'SEA SERPENT') this.seaSerpentChallenge?.markHit?.();
        if (source === 'TOXIC LASER') this.toxicLaserChallenge?.markHit?.();
        this.player.setInvulnerable(GameConfig.PLAYER_DAMAGE_INVULNERABILITY);
        this.cameraShakeTimer = GameConfig.CAMERA_SHAKE_DURATION;
        this.cameraShakeStrength = GameConfig.CAMERA_SHAKE_STRENGTH;
        this.damageFlashTimer = 0.24;
        this.uiManager.showDamageFeedback?.(source, this.health);

        if (this.health <= 0) {
            this.runHadGameOver = true;
            this.emitEvent('gameOver');
        }
        return true;
    }

    getHealth() { return this.health; }
    getCombo() { return this.combo; }
    getComboTimer() { return this.comboTimer; }
    getRunStats() {
        return {
            fishEaten: this.runFishEaten,
            maxSize: this.runMaxSize,
            bestCombo: this.runBestCombo,
            damageTaken: this.runDamageTaken,
            survivalTime: this.timerSystem.getElapsedTime(),
            score: this.scoreSystem.getScore()
        };
    }
    getCameraShakeStrength() { return this.cameraShakeStrength; }
    getToxicImmunityProgress() {
        const size = this.player?.getSize?.() || 0;
        return Math.min(1, size / GameConfig.TOXIC_IMMUNITY_SIZE);
    }
    hasToxicImmunity() {
        const level = this.levelSystem?.getCurrentLevel?.() || 1; return level >= 7 && level <= 9 && this.getToxicImmunityProgress() >= 1;
    }

    getPlayer() { return this.player; }
    getEnemies() { return this.enemies; }
    getBoss() { return this.boss; }
    getSeaSerpentChallenge() { return this.seaSerpentChallenge; }
    getToxicWasteChallenge() { return this.toxicWasteChallenge; }
    getToxicLaserChallenge() { return this.toxicLaserChallenge; }
    getAbyssalEndChallenge() { return this.abyssalEndChallenge; }
    getEatEffects() { return this.eatEffects; }
    getSaveSystem() { return this.saveSystem; }
    getScoreSystem() { return this.scoreSystem; }
    getTimerSystem() { return this.timerSystem; }
    getEconomySystem() { return this.economySystem; }
    getProgressionSystem() { return this.progressionSystem; }
    getAchievementSystem() { return this.achievementSystem; }
    getSkinSystem() { return this.skinSystem; }
    getLevelSystem() { return this.levelSystem; }
}
