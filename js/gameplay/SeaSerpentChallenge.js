// SeaSerpentChallenge.js - Unavoidable environmental hazard for Inferno levels (Level 4+).
export class SeaSerpentChallenge {
    constructor(game) {
        this.game = game;
        this.state = 'cooldown';
        this.cooldown = this.randomDelay();
        this.warningTime = 1.35;
        this.chargeTime = 1.15;
        this.timer = 0;
        this.y = 0;
        this.height = 150;
        this.direction = 1;
        this.x = 0;
        this.length = 0;
        this.active = false;
        this.cycleHit = false;
    }

    randomDelay() { return 4 + Math.random() * 4; }

    reset() {
        this.state = 'cooldown';
        this.cooldown = this.randomDelay();
        this.timer = 0;
        this.active = false;
        this.cycleHit = false;
    }

    update(deltaTime) {
        if (![4, 5, 6].includes(this.game.getLevelSystem?.().getCurrentLevel?.() || 1)) return;
        const dt = deltaTime / 1000;
        this.timer += dt;
        const W = this.game.getCanvas().width;
        const H = this.game.getCanvas().height;

        if (this.state === 'cooldown') {
            this.cooldown -= dt;
            if (this.cooldown <= 0) this.beginWarning();
            return;
        }
        if (this.state === 'warning') {
            if (this.timer >= this.warningTime) this.beginCharge();
            return;
        }
        if (this.state === 'charge') {
            const speed = (W + this.length * 2) / this.chargeTime;
            this.x += this.direction * speed * dt;
            if ((this.direction > 0 && this.x > W + this.length) || (this.direction < 0 && this.x < -this.length)) {
                if (!this.cycleHit) this.game.emitEvent('hazardDodged', { type: 'SEA_SERPENT' });
                this.state = 'cooldown';
                this.cooldown = this.randomDelay();
                this.timer = 0;
                this.active = false;
            }
        }
    }

    beginWarning() {
        const H = this.game.getCanvas().height;
        this.state = 'warning';
        this.timer = 0;
        this.y = this.height / 2 + Math.random() * Math.max(1, H - this.height);
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.length = Math.max(180, this.game.getCanvas().width * 0.34);
        this.active = false;
        this.cycleHit = false;
    }

    beginCharge() {
        const W = this.game.getCanvas().width;
        this.state = 'charge';
        this.timer = 0;
        this.active = true;
        this.cycleHit = false;
        this.x = this.direction > 0 ? -this.length : W + this.length;
    }

    isHazardActive() { return this.active; }

    getPosition() { return { x: this.x, y: this.y }; }

    // Effective size used for eatability. The serpent is long, but its gameplay
    // size stays readable so a sufficiently grown player can eventually eat it.
    getSize() { return this.height * 1.15; }

    getColor() { return '#d63a16'; }

    canBeEatenBy(player) {
        return this.active && player.getSize() >= this.getSize() * 1.2;
    }

    markHit() { this.cycleHit = true; }

    consume() {
        this.game.emitEvent('serpentDefeated');
        this.state = 'cooldown';
        this.cooldown = this.randomDelay();
        this.timer = 0;
        this.active = false;
        this.cycleHit = false;
    }

    collidesWithPlayer(player) {
        if (!this.active) return false;
        const px = player.getPosition().x;
        const py = player.getPosition().y;
        const half = this.height * 0.5;
        if (Math.abs(py - this.y) > half + player.getSize() * 0.4) return false;
        return Math.abs(px - this.x) < this.length * 0.58 + player.getSize() * 0.45;
    }

    draw(ctx) {
        if (![4, 5, 6].includes(this.game.getLevelSystem?.().getCurrentLevel?.() || 1) || this.state === 'cooldown') return;
        const W = ctx.canvas.width;
        if (this.state === 'warning') {
            ctx.save();
            const pulse = 0.12 + Math.sin(this.timer * 12) * 0.05;
            ctx.fillStyle = `rgba(255, 70, 20, ${Math.max(.05,pulse)})`;
            ctx.fillRect(0, this.y - this.height / 2, W, this.height);
            ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 4;
            ctx.setLineDash([18, 12]);
            ctx.strokeRect(8, this.y - this.height / 2, W - 16, this.height);
            ctx.setLineDash([]);
            ctx.fillStyle = '#ffcc80'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center';
            ctx.fillText('⚠ SEA SERPENT INCOMING ⚠', W / 2, this.y - 12);
            ctx.font = 'bold 16px Arial'; ctx.fillStyle = '#fff';
            ctx.fillText('DANGER ZONE — MOVE OUT!', W / 2, this.y + 18);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);
        const wave = performance.now() * 0.006;
        // Long armored serpent body.
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#5b1010'; ctx.lineWidth = 58;
        ctx.beginPath(); ctx.moveTo(-this.length * .8, Math.sin(wave)*8); ctx.bezierCurveTo(-this.length*.4,-35,this.length*.25,35,this.length*.8,0); ctx.stroke();
        ctx.strokeStyle = '#d63a16'; ctx.lineWidth = 45;
        ctx.beginPath(); ctx.moveTo(-this.length * .8, Math.sin(wave)*8); ctx.bezierCurveTo(-this.length*.4,-35,this.length*.25,35,this.length*.8,0); ctx.stroke();
        // Spines.
        ctx.fillStyle = '#ffb300';
        for(let i=-6;i<=6;i++) { const x=i*this.length*.12; const yy=Math.sin(wave+x*.03)*12; ctx.beginPath();ctx.moveTo(x,yy-20);ctx.lineTo(x+10,yy-55);ctx.lineTo(x+24,yy-18);ctx.closePath();ctx.fill(); }
        // Head and jaws.
        const hx=this.length*.82;
        ctx.fillStyle='#8f180f';ctx.beginPath();ctx.ellipse(hx,0,55,42,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#250604';ctx.beginPath();ctx.moveTo(hx+35,-8);ctx.quadraticCurveTo(hx+70,0,hx+35,12);ctx.closePath();ctx.fill();
        ctx.fillStyle='#fff3d0';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(hx+30+i*8,-2);ctx.lineTo(hx+34+i*8,14);ctx.lineTo(hx+39+i*8,-2);ctx.closePath();ctx.fill();}
        ctx.fillStyle='#ffe082';ctx.shadowBlur=15;ctx.shadowColor='#ff6d00';ctx.beginPath();ctx.arc(hx+20,-18,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;

        // White eatability indicator: only appears when the player is large enough.
        const player = this.game.getPlayer?.();
        if (player && this.canBeEatenBy(player)) {
            ctx.save();
            ctx.globalAlpha = 0.98;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath(); ctx.arc(hx, -this.height * 0.72, 7, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}
