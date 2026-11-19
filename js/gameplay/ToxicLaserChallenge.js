// ToxicLaserChallenge.js - Level 7 post-immunity hazard.
// Once the player reaches the immunity size, toxic bubbles stop damaging them,
// but random toxic laser guns periodically appear from either side.
export class ToxicLaserChallenge {
    constructor(game) {
        this.game = game;
        this.state = 'cooldown';
        this.cooldown = this.randomDelay();
        this.timer = 0;
        this.side = 1;
        this.y = 0;
        this.width = 74;
        this.height = 48;
        this.beamLength = 0;
        this.shootTime = 0.55;
        this.cycleHit = false;
    }

    randomDelay() { return 5 + Math.random() * 3; }
    isActiveLevel() { const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1; return level >= 7 && level <= 9 && this.game.hasToxicImmunity?.(); }

    reset() {
        this.state = 'cooldown';
        this.cooldown = this.randomDelay();
        this.timer = 0;
        this.beamLength = 0;
        this.cycleHit = false;
    }

    markHit() { this.cycleHit = true; }

    update(deltaTime) {
        if (!this.isActiveLevel()) { this.resetIfNeeded(); return; }
        const dt = deltaTime / 1000;
        this.timer += dt;
        const W = this.game.getCanvas().width;
        const H = this.game.getCanvas().height;

        if (this.state === 'cooldown') {
            this.cooldown -= dt;
            if (this.cooldown <= 0) this.beginReveal();
            return;
        }

        if (this.state === 'reveal') {
            // Gun slides in and fully reveals over 2 seconds.
            if (this.timer >= 2) {
                this.state = 'countdown';
                this.timer = 0;
            }
            return;
        }

        if (this.state === 'countdown') {
            // Two-second countdown after the gun is fully visible.
            if (this.timer >= 2) {
                this.state = 'firing';
                this.timer = 0;
                this.cycleHit = false;
                this.beamLength = W + 120;
            }
            return;
        }

        if (this.state === 'firing') {
            if (this.timer >= this.shootTime) {
                if (!this.cycleHit) this.game.emitEvent('hazardDodged', { type: 'TOXIC_LASER' });
                this.state = 'cooldown';
                this.cooldown = this.randomDelay();
                this.timer = 0;
                this.beamLength = 0;
            }
        }
    }

    resetIfNeeded() {
        if (this.state !== 'cooldown' || this.beamLength !== 0) this.reset();
    }

    beginReveal() {
        const W = this.game.getCanvas().width;
        const H = this.game.getCanvas().height;
        this.state = 'reveal';
        this.timer = 0;
        this.side = Math.random() < 0.5 ? 1 : -1;

        // Keep the laser out of the middle of the arena. It may only target
        // the upper quarter or lower quarter, leaving the center as a safe
        // movement lane for the player's large late-game fish.
        const halfGun = this.height * 0.5;
        const topMax = Math.max(halfGun, H * 0.25 - halfGun);
        const bottomMin = Math.min(H - halfGun, H * 0.75 + halfGun);
        const useTop = Math.random() < 0.5;
        if (useTop) {
            const minY = halfGun;
            const maxY = Math.max(minY, topMax);
            this.y = minY + Math.random() * (maxY - minY);
        } else {
            const minY = Math.min(bottomMin, H - halfGun);
            const maxY = H - halfGun;
            this.y = minY + Math.random() * Math.max(0, maxY - minY);
        }

        this.x = this.side > 0 ? W + this.width * 0.65 : -this.width * 0.65;
    }

    isFiring() { return this.isActiveLevel() && this.state === 'firing'; }

    collidesWithPlayer(player) {
        if (!this.isFiring()) return false;
        const p = player.getPosition();
        const W = this.game.getCanvas().width;
        // Thin horizontal beam through the gun's Y coordinate.
        const beamTop = this.y - 4;
        const beamBottom = this.y + 4;
        if (p.y + player.getSize() * 0.35 < beamTop || p.y - player.getSize() * 0.35 > beamBottom) return false;
        if (this.side > 0) return p.x > W * 0.02;
        return p.x < W * 0.98;
    }

    draw(ctx) {
        if (!this.isActiveLevel() || this.state === 'cooldown') return;
        const W = ctx.canvas.width;
        const progress = Math.min(1, this.timer / 2);
        const reveal = this.state === 'reveal' ? progress : 1;
        const gunX = this.side > 0 ? W + (this.width * 0.65) * (1 - reveal) : -(this.width * 0.65) * (1 - reveal);

        ctx.save();
        ctx.translate(gunX, this.y);
        ctx.scale(this.side, 1);

        // Warning line / aim glow.
        ctx.globalAlpha = this.state === 'firing' ? 0.95 : 0.22 + reveal * 0.35;
        ctx.strokeStyle = '#d8ff4a';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 9]);
        ctx.beginPath(); ctx.moveTo(-this.width * 0.35, 0); ctx.lineTo(-W, 0); ctx.stroke();
        ctx.setLineDash([]);

        // Toxic gun body.
        ctx.globalAlpha = 0.95;
        ctx.shadowBlur = 20; ctx.shadowColor = '#9dff32';
        ctx.fillStyle = '#18321e';
        ctx.strokeStyle = '#9dff32';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-this.width * 0.45, -this.height / 2, this.width * 0.9, this.height, 10); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#79c83a';
        ctx.beginPath(); ctx.roundRect(-this.width * 0.18, -this.height * 0.26, this.width * 0.48, this.height * 0.52, 6); ctx.fill();
        ctx.fillStyle = '#dfff83';
        ctx.beginPath(); ctx.arc(this.width * 0.2, 0, 8 + Math.sin(performance.now() * 0.01) * 1.5, 0, Math.PI * 2); ctx.fill();

        if (this.state === 'countdown') {
            const left = Math.max(0, Math.ceil(2 - this.timer));
            ctx.fillStyle = '#ffffff'; ctx.font = '900 16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(String(left), 0, -this.height * 0.78);
            ctx.fillStyle = '#d8ff4a'; ctx.font = '700 9px Arial'; ctx.fillText('TOXIC LASER', 0, this.height * 0.82);
        }

        ctx.restore();

        if (this.state === 'firing') {
            const startX = this.side > 0 ? W : 0;
            const endX = this.side > 0 ? 0 : W;
            ctx.save();
            ctx.globalAlpha = 0.28;
            ctx.strokeStyle = '#b9ff35'; ctx.lineWidth = 15; ctx.shadowBlur = 25; ctx.shadowColor = '#8dff24';
            ctx.beginPath(); ctx.moveTo(startX, this.y); ctx.lineTo(endX, this.y); ctx.stroke();
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = '#f4ffbc'; ctx.lineWidth = 2.5; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.moveTo(startX, this.y); ctx.lineTo(endX, this.y); ctx.stroke();
            ctx.restore();
        }
    }
}
