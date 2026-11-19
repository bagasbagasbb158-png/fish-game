// DoubleCollectBooster.js - collectible 2x bubble that enters from outside the frame.
export class DoubleCollectBooster {
    constructor(game) {
        this.game = game;
        this.radius = 23;
        const width = game.getCanvas().width;
        const height = game.getCanvas().height;
        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -this.radius * 2 : width + this.radius * 2;
        this.y = 90 + Math.random() * Math.max(1, height - 180);
        this.speedX = this.fromLeft ? 0.75 + Math.random() * 0.55 : -(0.75 + Math.random() * 0.55);
        this.speedY = (Math.random() - 0.5) * 0.18;
        this.phase = Math.random() * Math.PI * 2;
        this.life = 0;
        this.maxLife = 7;
        this.consumed = false;
    }

    update(deltaTime) {
        if (this.consumed) return false;
        this.life += deltaTime / 1000;
        const t = performance.now() * 0.001;
        this.x += this.speedX;
        this.y += this.speedY + Math.sin(t * 2.2 + this.phase) * 0.28;
        const width = this.game.getCanvas().width;
        const height = this.game.getCanvas().height;
        if (this.life >= this.maxLife) return false;
        if (this.y < 60) this.y = 60;
        if (this.y > height - 60) this.y = height - 60;
        return this.x > -this.radius * 3 && this.x < width + this.radius * 3;
    }

    consume() { this.consumed = true; }

    getPosition() { return { x: this.x, y: this.y }; }
    getSize() { return this.radius * 2; }

    draw(ctx) {
        if (this.consumed) return;
        const pulse = 1 + Math.sin(performance.now() * 0.006 + this.phase) * 0.06;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(pulse, pulse);
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgba(180,235,255,0.32)';
        ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.max(14, this.radius * 0.72)}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('2×', 0, 1);
        ctx.restore();
    }
}
