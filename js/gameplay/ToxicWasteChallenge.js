// ToxicWasteChallenge.js - Level 7 hazard: toxic bubbles rise from below at random positions/scales.
export class ToxicWasteChallenge {
    constructor(game) {
        this.game = game;
        this.bubbles = [];
        this.spawnTimer = 0.8 + Math.random() * 1.2;
        this.time = 0;
    }
    isActiveLevel() { const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1; return level >= 7 && level <= 9; }
    reset() { this.bubbles.length = 0; this.spawnTimer = 0.8 + Math.random() * 1.2; }
    spawnBubble() {
        const H=this.game.getCanvas().height, W=this.game.getCanvas().width;
        const radius=10+Math.random()*18;
        this.bubbles.push({x:radius+Math.random()*Math.max(1,W-radius*2), y:H+radius+Math.random()*45, radius, speed:0.55+Math.random()*0.95, phase:Math.random()*Math.PI*2, wobble:.5+Math.random()*1.4, spin:Math.random()*Math.PI*2});
    }
    update(deltaTime) {
        if (!this.isActiveLevel()) { this.bubbles.length=0; return; }
        const dt=deltaTime/1000; this.time+=dt;
        this.spawnTimer-=dt;
        if(this.spawnTimer<=0){ this.spawnBubble(); this.spawnTimer=1+Math.random(); }
        const W=this.game.getCanvas().width;
        for(let i=this.bubbles.length-1;i>=0;i--){
            const b=this.bubbles[i]; b.y-=b.speed*60*dt; b.x+=Math.sin(this.time*b.wobble+b.phase)*18*dt; b.spin+=dt;
            if(b.y < -b.radius*2 || b.x < -b.radius*2 || b.x > W+b.radius*2) this.bubbles.splice(i,1);
        }
    }
    collidesWithPlayer(player) {
        if(!this.isActiveLevel()) return null;
        const p=player.getPosition();
        for(const b of this.bubbles){
            const dx=p.x-b.x, dy=p.y-b.y;
            if(Math.sqrt(dx*dx+dy*dy) < player.getSize()*.5+b.radius*.72) return b;
        }
        return null;
    }
    consumeBubble(b){ const i=this.bubbles.indexOf(b); if(i>=0)this.bubbles.splice(i,1); }
    draw(ctx){
        if(!this.isActiveLevel()) return;
        ctx.save();
        for(const b of this.bubbles){
            const pulse=1+Math.sin(this.time*4+b.phase)*.08;
            ctx.save(); ctx.translate(b.x,b.y); ctx.scale(pulse,pulse);
            ctx.globalAlpha=.22; ctx.fillStyle='#b8ff3d'; ctx.shadowBlur=20; ctx.shadowColor='#7dff37'; ctx.beginPath();ctx.arc(0,0,b.radius*1.25,0,Math.PI*2);ctx.fill();
            ctx.globalAlpha=.5; ctx.fillStyle='rgba(145,255,65,.35)';ctx.beginPath();ctx.arc(0,0,b.radius,0,Math.PI*2);ctx.fill();
            ctx.globalAlpha=.95; ctx.strokeStyle='#d9ff75';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,b.radius,0,Math.PI*2);ctx.stroke();
            ctx.fillStyle='rgba(235,255,180,.9)';ctx.beginPath();ctx.arc(-b.radius*.28,-b.radius*.3,b.radius*.2,0,Math.PI*2);ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}
