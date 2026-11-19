// Player.js - Player fish with smooth arcade movement and polished visual feedback.
import { GameConfig } from '../data/GameConfig.js';
import { FishRenderer } from './FishRenderer.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.x = this.game.getCanvas().width / 2;
        this.y = this.game.getCanvas().height / 2;
        this.size = GameConfig.PLAYER_START_SIZE;
        this.visualSize = this.size;
        this.speed = GameConfig.PLAYER_START_SPEED;
        this.velocityX = 0;
        this.velocityY = 0;
        this.updateColor();
        this.growthFlash = 0;
        this.growthPulse = 0;
        this.tailPhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.invulnerabilityTimer = 0;
        this.lastMoveAngle = 0;
    }

    updateColor() {
        const equippedSkinId = this.game.getSkinSystem().getEquippedSkin();
        const skinData = this.game.getSkinSystem().getSkinData(equippedSkinId);
        if (skinData) {
            this.bodyColor = skinData.bodyColor;
            this.secondaryColor = skinData.secondaryColor || skinData.bodyColor;
            this.finColor = skinData.finColor || skinData.bodyColor;
            this.eyeColor = skinData.eyeColor || 'white';
            this.pupilColor = skinData.pupilColor || 'black';
        } else {
            this.bodyColor = '#ff6b35';
            this.secondaryColor = '#ff8c42';
            this.finColor = '#ff6b35';
            this.eyeColor = 'white';
            this.pupilColor = 'black';
        }
    }

    update(deltaTime) {
        const canvas = this.game.getCanvas();
        const mouseX = this.game.mouseX !== null ? this.game.mouseX : canvas.width / 2;
        const mouseY = this.game.mouseY !== null ? this.game.mouseY : canvas.height / 2;
        const dt = Math.min(0.05, Math.max(0.001, deltaTime / 1000));
        const frameScale = deltaTime / 16.667;

        // True light inertia: the mouse defines a target velocity, while the fish
        // accelerates/decelerates into it. This keeps the responsive arcade feel
        // without making the fish feel magnetically attached to the cursor.
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const targetVX = dx * this.speed;
        const targetVY = dy * this.speed;
        const follow = 1 - Math.exp(-12 * dt);
        this.velocityX += (targetVX - this.velocityX) * follow;
        this.velocityY += (targetVY - this.velocityY) * follow;

        // Prevent tiny cursor jitter from making the fish visibly twitch.
        if (Math.abs(dx) < 1.5) this.velocityX *= 0.94;
        if (Math.abs(dy) < 1.5) this.velocityY *= 0.94;

        this.x += this.velocityX * frameScale;
        this.y += this.velocityY * frameScale;
        this.constrainToBounds(canvas.width, canvas.height);

        // Smooth visual growth: gameplay/collision size changes immediately, but
        // the rendered fish eases toward it for a satisfying growth settle.
        const growthFollow = 1 - Math.exp(-10 * dt);
        this.visualSize += (this.size - this.visualSize) * growthFollow;

        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - dt);
        }
        if (this.growthFlash > 0) this.growthFlash--;
        if (this.growthPulse > 0) this.growthPulse = Math.max(0, this.growthPulse - dt);

        const velocityMagnitude = Math.hypot(this.velocityX, this.velocityY);
        if (velocityMagnitude > 0.25) {
            // Keep horizontal facing and vertical lean as separate concepts.
            // This prevents a left-facing fish from ever becoming upside-down.
            const verticalLean = Math.max(-0.32, Math.min(0.32, this.velocityY * 0.025));
            this.lastMoveAngle = verticalLean;
        }
    }

    constrainToBounds(width, height) {
        const half = this.size / 2;
        if (this.x < half) { this.x = half; this.velocityX = Math.max(0, this.velocityX); }
        if (this.x > width - half) { this.x = width - half; this.velocityX = Math.min(0, this.velocityX); }
        if (this.y < half) { this.y = half; this.velocityY = Math.max(0, this.velocityY); }
        if (this.y > height - half) { this.y = height - half; this.velocityY = Math.min(0, this.velocityY); }
    }

    draw(ctx) {
        const skinId = this.game.getSkinSystem().getEquippedSkin();
        const skin = this.game.getSkinSystem().getSkinData(skinId);
        const activeSkin = skin || {
            id: 'classic', rarity: 'common', bodyColor: '#ff6b35', secondaryColor: '#ff8c42',
            finColor: '#ff6b35', eyeColor: 'white', pupilColor: 'black'
        };

        if (this.invulnerabilityTimer > 0) {
            const blinkPhase = Math.floor(this.invulnerabilityTimer * 10);
            if (blinkPhase % 2 === 0) return;
        }

        let scale = 1;
        if (this.growthFlash > 0) scale += (this.growthFlash / 10) * 0.14;
        if (this.growthPulse > 0) scale += Math.sin((this.growthPulse / 0.18) * Math.PI) * 0.055;

        FishRenderer.draw(ctx, this.x, this.y, this.visualSize * scale, activeSkin, {
            angle: this.lastMoveAngle,
            facingLeft: this.velocityX < -0.05,
            lean: Math.max(-0.32, Math.min(0.32, this.velocityY * 0.025)),
            time: performance.now(),
            phase: this.tailPhase,
            animated: true
        });
    }

    eatEnemy(enemySize) {
        const multiplier = this.game.getCollectMultiplier?.() || 1;
        this.size += enemySize * GameConfig.PLAYER_GROWTH_RATE * multiplier;
        const currentLevel = this.game.levelSystem?.getCurrentLevel?.() || 1;
        const maxSize = currentLevel === 10 ? GameConfig.LEVEL10_PLAYER_MAX_SIZE : Infinity;
        this.size = Math.min(this.size, maxSize);
        this.growthFlash = 10;
        this.growthPulse = 0.18;
        this.game.emitEvent('playerGrew', { size: this.size });
    }

    setInvulnerable(seconds) { this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer, seconds); }
    isInvulnerable() { return this.invulnerabilityTimer > 0; }
    getPosition() { return { x: this.x, y: this.y }; }
    getSize() { return this.size; }
}
