// Level 10 - Abyssal End: multi-layer final journey hazard system.
export class AbyssalEndChallenge {
    constructor(game) {
        this.game = game;
        this.time = 0;
        this.cooldown = 3.5;
        this.hazards = [];
        this.shards = [];
        this.vortex = null;
        this.flash = 0;
        this.safeCorridor = { y: 0, height: 0, targetY: 0, moveTimer: 4.5, active: false };
    }
    isActiveLevel() { return (this.game.getLevelSystem?.().getCurrentLevel?.() || 1) === 10; }
    reset() { this.time=0; this.cooldown=3.5; this.hazards=[]; this.shards=[]; this.vortex=null; this.flash=0; this.safeCorridor={y:0,height:0,targetY:0,moveTimer:4.5,active:false}; }
    intensity() {
        const stage = this.game.bossStage || 0;
        return Math.min(1.65, 1 + stage * 0.18 + Math.min(.2, this.time / 180));
    }
    update(deltaTime) {
        if (!this.isActiveLevel()) { this.reset(); return; }
        const dt=deltaTime/1000; this.time+=dt; this.flash=Math.max(0,this.flash-dt);
        const mult=this.intensity();
        this.updateSafeCorridor(dt);
        this.cooldown-=dt;
        if(this.cooldown<=0){
            this.spawnPattern(mult);
            this.cooldown=Math.max(2.15, (3.8+Math.random()*2.4)/mult);
        }
        for(let i=this.hazards.length-1;i>=0;i--){
            const h=this.hazards[i]; h.t+=dt;
            if(h.t>=h.warning+h.active){this.hazards.splice(i,1);continue;}
        }
        for(let i=this.shards.length-1;i>=0;i--){
            const s=this.shards[i]; s.y+=s.speed*dt; s.x+=Math.sin(this.time*3+s.phase)*18*dt; s.life-=dt;
            if(s.y>s.maxY||s.life<=0)this.shards.splice(i,1);
        }
        if(this.vortex){
            this.vortex.t+=dt;
            this.vortex.x+=Math.cos(this.vortex.phase+this.vortex.t*.8)*12*dt;
            this.vortex.y+=Math.sin(this.vortex.phase+this.vortex.t*.7)*10*dt;
            if(this.vortex.t>this.vortex.life)this.vortex=null;
        }
    }
    updateSafeCorridor(dt) {
        const player = this.game.getPlayer?.();
        const lateGame = (this.game.bossStage || 0) >= 2 || (player?.getSize?.() || 0) >= 250;
        if (!lateGame) { this.safeCorridor.active = false; return; }
        const H = this.game.getCanvas().height;
        const corridor = this.safeCorridor;
        corridor.active = true;
        corridor.height = Math.max(H * 0.28, Math.min(H * 0.42, (player?.getSize?.() || 250) * 1.05));
        corridor.moveTimer -= dt;
        if (corridor.moveTimer <= 0 || !corridor.targetY) {
            corridor.targetY = H * (0.28 + Math.random() * 0.44);
            corridor.moveTimer = 5.0 + Math.random() * 2.0;
        }
        const maxY = H - corridor.height / 2 - 18;
        const minY = corridor.height / 2 + 18;
        corridor.y += (Math.max(minY, Math.min(maxY, corridor.targetY)) - corridor.y) * Math.min(1, dt * 1.8);
    }
    isPlayerInSafeCorridor(player) {
        if (!this.safeCorridor.active) return false;
        const p=player.getPosition();
        return Math.abs(p.y-this.safeCorridor.y) <= this.safeCorridor.height/2;
    }
    spawnPattern(mult){
        const W=this.game.getCanvas().width,H=this.game.getCanvas().height;
        const roll=Math.random();
        if(roll<.28){
            // Twin cross-current lanes: top/bottom safe space alternates every pattern.
            const y= Math.random()<.5 ? H*(.16+Math.random()*.08) : H*(.76+Math.random()*.08);
            this.hazards.push({type:'surge',y,side:Math.random()<.5?-1:1,t:0,warning:1.15/Math.min(mult,1.4),active:.95});
            if(mult>1.22 && Math.random()<.45){
                const y2=y<H*.5?H*(.74+Math.random()*.08):H*(.16+Math.random()*.08);
                this.hazards.push({type:'surge',y:y2,side:-1,t:.25,warning:1.25,active:.8});
            }
        } else if(roll<.52){
            const y= Math.random()<.5 ? H*(.14+Math.random()*.1) : H*(.76+Math.random()*.1);
            this.hazards.push({type:'beam',y,t:0,warning:1.7/Math.min(mult,1.45),active:.68});
        } else if(roll<.76){
            this.vortex={x:W*(.22+Math.random()*.56),y:H*(.2+Math.random()*.6),r:42+Math.random()*24,t:0,life:3.8+Math.random()*1.2,phase:Math.random()*Math.PI*2};
        } else {
            const count=mult>1.3?5:3;
            for(let i=0;i<count;i++)this.shards.push({x:W*(.08+.84*Math.random()),y:-30-Math.random()*80,speed:150+Math.random()*120,maxY:H+40,life:5,phase:Math.random()*6.28});
        }
        // From Boss 2 onward the arena can layer a second telegraphed threat.
        const stage=this.game.bossStage||0;
        if(stage>=2 && Math.random()<Math.min(.72,.28+stage*.12)){
            if(Math.random()<.5){
                const y=stage>=4 ? H*(.18+Math.random()*.64) : (Math.random()<.5?H*.22:H*.78);
                this.hazards.push({type:'beam',y,t:.35,warning:.95,active:.62});
            } else if(!this.vortex){
                this.vortex={x:W*(.2+.6*Math.random()),y:H*(.2+.6*Math.random()),r:34+Math.random()*30,t:0,life:2.8+Math.random()*1.8,phase:Math.random()*Math.PI*2};
            }
        }
        // Final God Fight: a small shard ring occasionally closes the safe space.
        if(stage>=4 && Math.random()<.42){
            const count=7;
            for(let i=0;i<count;i++){const a=i*Math.PI*2/count;this.shards.push({x:W*.5+Math.cos(a)*W*.34,y:H*.5+Math.sin(a)*H*.28,speed:0,maxY:H+999,life:1.6,phase:a});}
        }
        this.flash=.12;
    }
    collidesWithPlayer(player){
        if(!this.isActiveLevel())return false;
        const p=player.getPosition(), r=player.getSize()/2;
        const protectedByCurrent = this.isPlayerInSafeCorridor(player);
        for(const h of this.hazards){
            if(h.t<h.warning||h.t>=h.warning+h.active)continue;
            if(protectedByCurrent) continue;
            if(Math.abs(p.y-h.y)<r*.28+18)return true;
        }
        for(const s of this.shards){
            if(protectedByCurrent) break;
            const dx=p.x-s.x,dy=p.y-s.y;if(dx*dx+dy*dy<(r+9)*(r+9))return true;
        }
        if(this.vortex && !protectedByCurrent){const dx=p.x-this.vortex.x,dy=p.y-this.vortex.y;const d=Math.hypot(dx,dy);if(d<r+this.vortex.r*.55)return true;}
        return false;
    }
    getTelegraphState() {
        // A small, centralized readout keeps the hazard language consistent and
        // gives the player a readable state even when the actual hazard is near
        // the edge of the viewport.
        for (const h of this.hazards) {
            if (h.t < h.warning) {
                return { type: h.type, phase: 'warning', remaining: Math.max(0, h.warning - h.t) };
            }
        }
        if (this.vortex && this.vortex.t < 0.8) {
            return { type: 'vortex', phase: 'warning', remaining: Math.max(0, 0.8 - this.vortex.t) };
        }
        if (this.shards.length) {
            const imminent = this.shards.some(s => s.speed > 0 && s.y < this.game.getCanvas().height * 0.18);
            if (imminent) return { type: 'shards', phase: 'warning', remaining: 0.9 };
        }
        return null;
    }

    draw(ctx){
        if(!this.isActiveLevel())return;
        const W=ctx.canvas.width,H=ctx.canvas.height,t=this.time;
        ctx.save();

        // Consistent, fixed-position telegraph HUD: the player never has to
        // chase a warning attached to a moving hazard.
        const telegraph = this.getTelegraphState();
        if (telegraph) {
            const label = telegraph.type === 'beam' ? 'VOID BEAM' :
                telegraph.type === 'surge' ? 'ABYSSAL SURGE' :
                telegraph.type === 'vortex' ? 'VOID VORTEX' : 'VOID SHARDS';
            const remain = telegraph.remaining.toFixed(1);
            ctx.save();
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = 'rgba(7,3,22,.78)';
            ctx.strokeStyle = '#d8c8ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(W/2-112, 118, 224, 28, 10); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f3eaff';
            ctx.font = '900 10px Arial'; ctx.textAlign = 'center';
            ctx.fillText(`⚠ ${label} — ${remain}s`, W/2, 136);
            ctx.restore();
        }
        if (this.safeCorridor.active) {
            const c=this.safeCorridor;
            const pulse=.5+.5*Math.sin(t*3.2);
            ctx.save();
            ctx.globalAlpha=.07+.025*pulse;
            const g=ctx.createLinearGradient(0,c.y-c.height/2,0,c.y+c.height/2);
            g.addColorStop(0,'rgba(110,235,255,0)'); g.addColorStop(.5,'rgba(110,235,255,.75)'); g.addColorStop(1,'rgba(110,235,255,0)');
            ctx.fillStyle=g; ctx.fillRect(0,c.y-c.height/2,W,c.height);
            ctx.globalAlpha=.5+.15*pulse; ctx.strokeStyle='#8be9ff'; ctx.lineWidth=2; ctx.setLineDash([16,12]);
            ctx.beginPath(); ctx.moveTo(0,c.y-c.height/2); ctx.lineTo(W,c.y-c.height/2); ctx.moveTo(0,c.y+c.height/2); ctx.lineTo(W,c.y+c.height/2); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle='#b9f5ff'; ctx.font='900 10px Arial'; ctx.textAlign='center';
            ctx.fillText('ABYSS CURRENT • SAFE ROUTE',W/2,c.y-c.height/2+16);
            ctx.restore();
        }
        // Persistent abyss energy grid: communicates danger without looking like a normal bubble.
        ctx.globalAlpha=.055;ctx.strokeStyle='#9b7cff';ctx.lineWidth=1;
        for(let x=0;x<W;x+=90){ctx.beginPath();ctx.moveTo(x+Math.sin(t*.7+x)*10,0);ctx.lineTo(x+Math.cos(t*.55+x)*18,H);ctx.stroke();}
        for(const h of this.hazards){
            const warn=h.t<h.warning, p=Math.min(1,Math.max(0,(h.t-h.warning)/h.active));
            const remain = warn ? Math.max(0, h.warning - h.t) : 0;
            if (warn) {
                // Large directional telegraph so the player has time to read the attack.
                ctx.save();
                const topLane = h.y < H * .5;
                ctx.globalAlpha = .22 + .18 * Math.sin(t * 8);
                ctx.fillStyle = '#f0dcff';
                ctx.font = '900 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(topLane ? '▼ MOVE AWAY FROM TOP LANE' : '▲ MOVE AWAY FROM BOTTOM LANE', W/2, topLane ? 58 : H-42);
                ctx.globalAlpha = .5 + .2 * Math.sin(t * 9);
                ctx.strokeStyle = '#f4dfff'; ctx.lineWidth = 2;
                const ay = topLane ? 72 : H-62;
                const dir = topLane ? 1 : -1;
                for (let k=0;k<5;k++) {
                    const ax = W*.22 + k*W*.14;
                    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + dir*18);
                    ctx.lineTo(ax-5, ay + dir*11); ctx.moveTo(ax, ay + dir*18); ctx.lineTo(ax+5, ay + dir*11); ctx.stroke();
                }
                ctx.fillStyle='#ffffff'; ctx.font='900 10px Arial';
                ctx.fillText(`${h.type==='beam'?'VOID BEAM':'ABYSSAL SURGE'} • ${remain.toFixed(1)}s`, W/2, topLane ? 91 : H-25);
                ctx.restore();
            }
            const pulse=.5+.5*Math.sin(t*10);
            ctx.save();ctx.translate(0,h.y);
            ctx.fillStyle=warn?'rgba(150,115,255,.07)':'rgba(255,70,145,.16)';ctx.fillRect(0,-26,W,52);
            ctx.setLineDash(warn?[14,12]:[]);ctx.strokeStyle=warn?'rgba(208,190,255,.55)':'rgba(255,120,220,.95)';ctx.lineWidth=warn?2:3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.stroke();ctx.setLineDash([]);
            if(warn){ctx.globalAlpha=.65+.25*pulse;ctx.fillStyle='#d9ccff';ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillText(h.type==='beam'?'VOID BEAM INCOMING':'ABYSSAL SURGE INCOMING',W/2,-34);}
            else {ctx.globalAlpha=.35;ctx.strokeStyle='#fff';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.stroke();ctx.globalAlpha=.95;ctx.strokeStyle='#f2dfff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.stroke();}
            ctx.restore();
        }
        if(this.vortex){
            const v=this.vortex, pulse=1+.1*Math.sin(t*5);
            ctx.save(); ctx.globalAlpha=.5+.2*Math.sin(t*7); ctx.fillStyle='#f4eaff'; ctx.font='900 10px Arial'; ctx.textAlign='center'; ctx.fillText('⚠ ABYSSAL VORTEX • KEEP CLEAR',v.x,Math.max(28,v.y-v.r-18)); ctx.restore();
            ctx.save();ctx.translate(v.x,v.y);ctx.globalAlpha=.3;ctx.shadowBlur=30;ctx.shadowColor='#8d65ff';
            const g=ctx.createRadialGradient(0,0,4,0,0,v.r*1.7);g.addColorStop(0,'rgba(245,235,255,.55)');g.addColorStop(.3,'rgba(132,86,255,.22)');g.addColorStop(1,'rgba(20,5,70,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,v.r*1.7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
            for(let i=0;i<4;i++){ctx.save();ctx.rotate(t*(.7+i*.16)+i*1.5);ctx.strokeStyle=i%2?'#b79cff':'#f1e9ff';ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.scale(1,.42);ctx.beginPath();ctx.arc(0,0,v.r*(.65+i*.15)*pulse,0,Math.PI*2);ctx.stroke();ctx.restore();}
            ctx.restore();
        }
        if(this.shards.length){
            ctx.save(); ctx.globalAlpha=.48+.16*Math.sin(t*8); ctx.fillStyle='#f4dfff'; ctx.font='900 10px Arial'; ctx.textAlign='center'; ctx.fillText('⚠ VOID SHARDS INCOMING • WATCH THE SKY',W/2,28); ctx.restore();
        }
        // Void Shards: solid, fully filled crystal silhouettes. Keep the whole
        // shard opaque so it reads as an actual hazard instead of a transparent
        // frame with a tiny pink dot in the middle.
        for(const s of this.shards){
            ctx.save();
            ctx.translate(s.x,s.y);
            ctx.rotate(Math.sin(t*2+s.phase)*.4);
            const pulse = .92 + .08*Math.sin(t*7+s.phase);
            ctx.scale(pulse,pulse);
            ctx.shadowBlur=18;
            ctx.shadowColor='#ff4fa3';
            const grad=ctx.createLinearGradient(0,-17,0,18);
            grad.addColorStop(0,'#f6e7ff');
            grad.addColorStop(.32,'#d8b8ff');
            grad.addColorStop(.7,'#b96cff');
            grad.addColorStop(1,'#ff4fa3');
            ctx.fillStyle=grad;
            ctx.beginPath();
            ctx.moveTo(0,-19);
            ctx.lineTo(10,5);
            ctx.lineTo(4,18);
            ctx.lineTo(0,22);
            ctx.lineTo(-4,18);
            ctx.lineTo(-10,5);
            ctx.closePath();
            ctx.fill();
            // Bright inner facet, still filled rather than a hollow outline.
            ctx.globalAlpha=.55;
            ctx.fillStyle='#ffffff';
            ctx.beginPath();
            ctx.moveTo(0,-13);
            ctx.lineTo(4,5);
            ctx.lineTo(0,12);
            ctx.lineTo(-3,5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        if(this.flash>0){ctx.globalAlpha=this.flash*.7;ctx.fillStyle='#b68cff';ctx.fillRect(0,0,W,H);}
        ctx.restore();
    }
}
