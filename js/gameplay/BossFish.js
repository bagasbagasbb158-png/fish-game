// BossFish.js - Represents the boss fish
import { GameConfig } from '../data/GameConfig.js';
import { EnemyFishRenderer } from './EnemyFishRenderer.js';

export class BossFish {
    constructor(game, x, y, speedX, size = GameConfig.BOSS_SIZE, stage = 1) {
        this.game = game;
        this.size = size;
        this.stage = stage;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = 0;
        const level = game.getLevelSystem?.().getCurrentLevel?.() || 1;
        this.color = level === 10 ? (stage === 4 ? '#8e6cff' : stage === 3 ? '#d0b6ff' : stage === 2 ? '#62d7ff' : '#9d8cff') : level === 9 && stage === 3 ? '#c8ff4a' : level === 8 && stage === 2 ? '#b6ff2e' : level >= 7 ? '#7dff37' : level === 6 && stage === 3 ? '#ff6a00' : ((level === 4 || level === 5 || level === 6) && stage === 1) ? '#d43b16' : level === 5 && stage === 2 ? '#5a0808' : stage === 3 ? '#26124d' : stage === 2 ? '#6b1f8f' : GameConfig.BOSS_COLOR;
        this.species = level === 10 ? (stage === 4 ? 'god_of_abyss' : stage === 3 ? 'abyss_emperor' : stage === 2 ? 'void_leviathan' : 'abyssal_warden') : level === 9 && stage === 3 ? 'toxic_god_fish' : level === 9 && stage === 2 ? 'toxic_waste_colossus' : level === 8 && stage === 2 ? 'toxic_waste_colossus' : level >= 7 ? 'toxic_waste_titan' : level === 6 && stage === 3 ? 'inferno_god_fish' : ((level === 4 || level === 5 || level === 6) && stage === 1) ? 'inferno_tyrant' : level === 5 && stage === 2 ? 'inferno_colossus' : stage === 3 ? 'ancient_leviathan' : stage === 2 ? 'abyssal_leviathan' : 'abyssal_monster';
        this.level = level;

        // Animation
        this.tailPhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.bobAmplitude = GameConfig.BOSS_BOBBING_AMPLITUDE;

        // Final-level bosses use a hit-based vulnerability cycle. Their physical
        // sizes remain unchanged from the original Level 10 design.
        this.maxHits = level === 10 ? (stage === 2 ? 4 : stage === 3 ? 8 : stage === 4 ? 15 : 1) : 1;
        this.hitsTaken = 0;
        this.dizzyTimer = 0;
        this.attackCooldown = 0;
        this.baseSpeedX = speedX;
        this.combatClock = Math.random() * 2.5;
        this.attackActive = false;
        this.vulnerabilityTimer = 0;
        this.attackCooldown = 3.0 + Math.random() * 1.5;
        this.attackDuration = 1.35;
        this.vulnerabilityDuration = 1.8;
        // Level 10 late bosses use a repeated vulnerable/dizzy opening.
        // The boss size is intentionally NOT changed here.
        this.dizzyTimer = 0;
        this.hitCount = 0;
        this.requiredHits = level === 10 && stage === 2 ? 4 : level === 10 && stage === 3 ? 8 : level === 10 && stage === 4 ? 15 : 1;
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;
        if (this.dizzyTimer > 0) {
            this.dizzyTimer = Math.max(0, this.dizzyTimer - dt);
            this.attackActive = false;
            this.vulnerabilityTimer = 0;
            this.speedX = this.baseSpeedX * 0.05;
        }
        const width = this.game.getCanvas().width;
        const height = this.game.getCanvas().height;

        if (this.dizzyTimer > 0) {
            // Boss remains stunned briefly after each successful player hit.
        } else if (this.level === 10 && this.stage >= 2) {
            this.combatClock += dt;
            if (this.vulnerabilityTimer > 0) {
                this.vulnerabilityTimer = Math.max(0, this.vulnerabilityTimer - dt);
                this.attackActive = false;
                this.speedX = this.baseSpeedX * 0.18;
            } else if (this.attackActive) {
                this.attackCooldown = 0;
                this.attackDuration -= dt;
                this.speedX = this.baseSpeedX * (1.65 + this.stage * 0.08);
                if (this.attackDuration <= 0) {
                    this.attackActive = false;
                    this.vulnerabilityTimer = this.vulnerabilityDuration + this.stage * 0.12;
                    this.attackDuration = 1.35;
                }
            } else {
                this.attackCooldown -= dt;
                this.speedX = this.baseSpeedX * 0.55;
                if (this.attackCooldown <= 0) {
                    this.attackActive = true;
                    this.attackDuration = 1.35 + this.stage * 0.08;
                    this.attackCooldown = 5.2 - Math.min(1.2, this.stage * 0.18) + Math.random() * 1.4;
                }
            }
        } else {
            this.speedX = this.baseSpeedX;
        }

        this.x += this.speedX;
        if (this.x < -this.size / 2) this.x = width + this.size / 2;
        else if (this.x > width + this.size / 2) this.x = -this.size / 2;

        this.y += (Math.random() - 0.5) * 0.3;
        if (this.y < this.size / 2) { this.y = this.size / 2; }
        else if (this.y > height - this.size / 2) { this.y = height - this.size / 2; }
    }

    // A late Level 10 boss can only be damaged during its exposed/dizzy opening.
    // After one successful hit the opening closes and the boss returns to its attack cycle.
    isVulnerable() { return this.level === 10 && this.stage >= 2 && this.vulnerabilityTimer > 0 && this.dizzyTimer <= 0; }
    isDizzy() { return this.level === 10 && this.stage >= 2 && (this.vulnerabilityTimer > 0 || this.dizzyTimer > 0); }
    isCollisionActive() { return this.level !== 10 || this.stage < 2 || this.attackActive; }
    getHitCount() { return this.hitCount; }
    getRequiredHits() { return this.requiredHits; }
    registerPlayerHit() {
        if (!this.isVulnerable()) return false;
        this.hitCount += 1;
        this.vulnerabilityTimer = 0;
        this.attackActive = false;
        // Brief post-hit stagger before the next attack cycle.
        this.dizzyTimer = 0.9;
        return this.hitCount >= this.requiredHits;
    }

    draw(ctx) {
        EnemyFishRenderer.drawBoss(ctx, this);

        // Clear final-boss vulnerability feedback.
        if (this.level === 10 && this.stage >= 2 && this.dizzyTimer > 0) {
            ctx.save();
            const pulse = 1 + Math.sin(performance.now() * 0.018) * 0.08;
            const W = this.game.getCanvas().width, H = this.game.getCanvas().height;
            const labelX = Math.max(58, Math.min(W - 58, this.x));
            const labelY = Math.max(22, Math.min(H - 22, this.y - this.size * .76));
            ctx.globalAlpha = 0.78;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.62 * pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = `900 ${Math.max(13, this.size * .095)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('DIZZY!', labelX, labelY);
            ctx.restore();
        }

        if (this.level === 10 && this.stage >= 2) {
            ctx.save();
            // Keep all boss status indicators inside the viewport even when the boss
            // spawns very close to the top/bottom edge.
            const W = this.game.getCanvas().width;
            const H = this.game.getCanvas().height;
            // Level 10 late-boss status is a HUD-like indicator: keep it fixed
            // near the top-center of the arena instead of attaching it to the
            // boss sprite. This makes the combat state readable immediately
            // even while the boss is still entering from off-screen.
            const labelX = W / 2;
            const labelY = 72;
            // During the opening the boss is visibly dizzy and is the only safe moment to attack.
            if (this.vulnerabilityTimer > 0) {
                const pulse = .75 + .25 * Math.sin(Date.now() * .012);
                ctx.globalAlpha=.9 * pulse; ctx.fillStyle='#fff7a8'; ctx.shadowBlur=18; ctx.shadowColor='#ffe36e';
                ctx.font='900 12px Arial'; ctx.textAlign='center';
                ctx.fillText(`💫 DIZZY — HIT ${this.hitCount}/${this.requiredHits} 💫`,labelX,labelY);
            } else if (this.dizzyTimer > 0) {
                ctx.globalAlpha=.95; ctx.fillStyle='#fff7a8'; ctx.shadowBlur=18; ctx.shadowColor='#ffe36e';
                ctx.font='900 12px Arial'; ctx.textAlign='center';
                ctx.fillText(`💫 STAGGERED — HIT ${this.hitCount}/${this.requiredHits} 💫`,labelX,labelY);
            } else if (this.attackActive) {
                ctx.globalAlpha=.82; ctx.fillStyle='#ff9bce'; ctx.shadowBlur=12; ctx.shadowColor='#ff4fa3';
                ctx.font='900 10px Arial'; ctx.textAlign='center'; ctx.fillText('⚠ ABYSSAL CHARGE',labelX,labelY);
            } else {
                ctx.globalAlpha=.7; ctx.fillStyle='#d9faff'; ctx.shadowBlur=8; ctx.shadowColor='#65e8ff';
                ctx.font='800 10px Arial'; ctx.textAlign='center'; ctx.fillText('PREPARE FOR NEXT ATTACK',labelX,labelY);
            }
            // Compact segmented hit meter: much faster to read than text alone
            // during a fast boss opening.
            ctx.globalAlpha=.9; ctx.fillStyle='#d9faff'; ctx.shadowBlur=8; ctx.shadowColor='#65e8ff';
            ctx.font='800 10px Arial'; ctx.textAlign='center';
            const hpY = 94;
            ctx.fillText(`BOSS HITS ${this.hitCount}/${this.requiredHits}`,labelX,hpY);
            const meterW = Math.min(250, Math.max(150, W * .28));
            const meterX = W / 2 - meterW / 2;
            const meterY = 101;
            const gap = this.requiredHits >= 12 ? 2 : 3;
            const segW = (meterW - gap * (this.requiredHits - 1)) / this.requiredHits;
            for (let i=0; i<this.requiredHits; i++) {
                ctx.fillStyle = i < this.hitCount ? '#ff79c6' : 'rgba(217,250,255,.14)';
                ctx.strokeStyle = i < this.hitCount ? '#ffd2ee' : 'rgba(217,250,255,.32)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.roundRect(meterX + i * (segW + gap), meterY, Math.max(2, segW), 5, 2); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
        }

        // White dot means the player is currently large enough to eat this boss.
        const player = this.game.getPlayer?.();
        if (player && player.getSize() >= this.size * 1.2) {
            ctx.save();
            ctx.globalAlpha = 0.98;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 14;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            const dotY = Math.max(10, Math.min(this.game.getCanvas().height - 10, this.y - this.size * 0.72));
            ctx.arc(this.x, dotY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    canBeAttacked() {
        return this.dizzyTimer <= 0 && this.attackCooldown <= 0;
    }

    takeFinalHit() {
        if (this.level !== 10 || this.stage < 2) return true;
        if (!this.canBeAttacked()) return false;
        this.hitsTaken++;
        this.attackCooldown = 1.05;
        if (this.hitsTaken >= this.maxHits) return true;
        this.dizzyTimer = 0.8;
        return false;
    }

    getHitsTaken() { return this.hitsTaken; }
    getMaxHits() { return this.maxHits; }

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