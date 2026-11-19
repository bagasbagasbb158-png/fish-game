// HealthBooster.js - collectible floating health bubble.
export class HealthBooster {
    constructor(game) {
        this.game = game;
        this.radius = 23;
        const width = game.getCanvas().width;
        const height = game.getCanvas().height;
        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -this.radius * 2 : width + this.radius * 2;
        this.y = 90 + Math.random() * Math.max(1, height - 180);
        this.speedX = this.fromLeft ? 0.75 + Math.random() * 0.55 : -(0.75 + Math.random() * 0.55);
        this.phase = Math.random() * Math.PI * 2;
        this.life = 0;
        this.maxLife = 9;
        this.consumed = false;
    }
    update(deltaTime) {
        if (this.consumed) return false;
        this.life += deltaTime / 1000;
        const t = performance.now() * 0.001;
        this.x += this.speedX;
        this.y += Math.sin(t * 2.1 + this.phase) * 0.32;
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
        ctx.save(); ctx.translate(this.x, this.y); ctx.scale(pulse, pulse);
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255,92,120,.95)';
        ctx.globalAlpha = .9; ctx.fillStyle = 'rgba(255,115,140,.24)';
        ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,235,240,.98)'; ctx.lineWidth = 2.2; ctx.stroke();
        ctx.fillStyle = '#ff6b7a'; ctx.font = `900 ${Math.max(16, this.radius * .78)}px Arial`;
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('+1',0,1);
        ctx.fillStyle='#fff'; ctx.font='900 8px Arial'; ctx.fillText('HP',0,-this.radius*.62);
        ctx.restore();
    }
}
