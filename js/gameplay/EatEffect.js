// EatEffect.js - Represents the eating particle effect
export class EatEffect {
    constructor(x, y, color, sourceSize = 30) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.sourceSize = sourceSize;
        this.impactScale = Math.max(0.7, Math.min(2.2, sourceSize / 30));
        this.ringRadius = Math.max(6, sourceSize * 0.18);
        this.ringLife = 1.0;
        this.particles = [];
        this.life = 1.0; // 1.0 to 0.0
        this.maxLife = 0.5; // seconds
        // Create particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3; // 2-5 px/frame
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 2, // 1-3 pixels
                life: 1.0
            });
        }
    }

    update(deltaTime) {
        this.life -= deltaTime / 1000;
        this.ringLife = this.life; // deltaTime in milliseconds
        if (this.life <= 0) {
            return false; // dead
        }

        // Update particles
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98; // slight drag
            p.vy *= 0.98;
            p.life -= deltaTime / 300; // particles fade faster
            if (p.life <= 0) {
                p.life = 0;
            }
        }
        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}