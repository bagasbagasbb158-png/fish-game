// FinalEnding.js - cinematic ending after defeating the Level 10 final boss.
import { FishRenderer } from './FishRenderer.js';
import { EnemyFishRenderer } from './EnemyFishRenderer.js';
import { GameConfig } from '../data/GameConfig.js';

export class FinalEnding {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.time = 0;
        this.fish = [];
        this.playerSkin = null;
        this.playerNormalSize = GameConfig.PLAYER_START_SIZE;
        this.endMenuButtonArea = null;
        this.endStartButtonArea = null;
        this.playerExitX = null;
        this.playerExitY = null;
        this.playerExitComplete = false;
    }

    start() {
        if (this.active) return;
        this.active = true;
        this.time = 0;
        const player = this.game.getPlayer();
        this.playerSkin = this.game.getSkinSystem().getSkinData(this.game.getSkinSystem().getEquippedSkin());
        this.playerNormalSize = GameConfig.PLAYER_START_SIZE;
        this.endMenuButtonArea = null;
        this.endStartButtonArea = null;
        this.playerExitX = this.game.getCanvas().width / 2;
        this.playerExitY = this.game.getCanvas().height / 2;
        this.playerExitComplete = false;

        // A fresh cast of ordinary Pacific fish, rather than the giant Abyss creatures.
        const species = ['guppy', 'clownfish', 'pufferfish', 'angelfish'];
        this.fish = Array.from({ length: 14 }, (_, i) => ({
            x: Math.random() < .5 ? -30 - Math.random() * 180 : this.game.getCanvas().width + 30 + Math.random() * 180,
            y: 90 + Math.random() * (this.game.getCanvas().height - 180),
            size: 16 + Math.random() * 28,
            speed: 24 + Math.random() * 34,
            dir: i % 2 === 0 ? 1 : -1,
            species: species[i % species.length],
            color: ['#ff8a65','#4fc3f7','#ffd166','#ef6c9b'][i % 4],
            drift: Math.random() * Math.PI * 2,
            alpha: 1
        }));

        // Freeze the gameplay world. The ending owns every frame from here.
        this.game.boss = null;
        this.game.enemies.length = 0;
    }

    isActive() { return this.active; }

    reset() {
        this.active = false;
        this.time = 0;
        this.fish = [];
        this.playerSkin = null;
        this.endMenuButtonArea = null;
        this.endStartButtonArea = null;
        this.playerExitX = null;
        this.playerExitY = null;
        this.playerExitComplete = false;
    }

    update(deltaTime) {
        if (!this.active) return;
        const dt = deltaTime / 1000;
        this.time += dt;
        const W = this.game.getCanvas().width;
        const H = this.game.getCanvas().height;

        // Fish casually swim through the restored Pacific scene.
        if (this.time >= 4.0) {
            for (const f of this.fish) {
                f.x += f.dir * f.speed * dt;
                f.y += Math.sin(this.time * 1.2 + f.drift) * 8 * dt;
                if (f.dir > 0 && f.x > W + f.size * 2) f.x = -f.size * 2;
                if (f.dir < 0 && f.x < -f.size * 2) f.x = W + f.size * 2;
            }
        }

        // After a quiet pause, the restored player slowly joins the school and exits.
        // IMPORTANT: never stop this movement at a fixed timestamp. Continue until the
        // fish has actually cleared the viewport, then reveal END.
        if (this.time >= 7.4 && !this.playerExitComplete) {
            this.playerExitX = (this.playerExitX ?? W / 2);
            this.playerExitY = H / 2 + Math.sin((this.time - 7.4) * 1.5) * 16;
            this.playerExitX += W * 0.095 * dt;
            if (this.playerExitX > W + this.playerNormalSize * 2) {
                this.playerExitComplete = true;
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;
        const W = ctx.canvas.width, H = ctx.canvas.height, t = this.time;
        ctx.save();
        ctx.clearRect(0, 0, W, H);

        // 0–2s: tiny spark -> enormous dramatic white light.
        if (t < 2.0) {
            this.drawAbyssBase(ctx, W, H, t);
            this.drawPlayer(ctx, W / 2, H / 2, 1);
            const p = Math.min(1, t / 1.65);
            const radius = Math.max(7, Math.pow(p, 2.05) * Math.hypot(W, H) * .82);
            const g = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,radius);
            g.addColorStop(0,'rgba(255,255,255,1)');
            g.addColorStop(.16,'rgba(255,255,255,.99)');
            g.addColorStop(.5,'rgba(238,226,255,.75)');
            g.addColorStop(1,'rgba(255,255,255,0)');
            ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
            if (t > 1.25) {
                ctx.globalAlpha=Math.min(1,(t-1.25)/.55);
                ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
            }
            ctx.restore(); return;
        }

        // 2–4s: absolute black, with the player restored to normal size.
        if (t < 4.0) {
            ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
            this.drawPlayer(ctx,W/2,H/2,1);
            ctx.restore(); return;
        }

        // 4–7.4s: Pacific Ocean returns, slowly fading in.
        this.drawPacific(ctx,W,H,t);
        const reveal=Math.min(1,(t-4)/1.9);
        ctx.fillStyle=`rgba(0,0,0,${1-reveal})`; ctx.fillRect(0,0,W,H);
        this.drawFish(ctx,W,H);

        let px=W/2, py=H/2;
        if (t >= 7.4) { px=this.playerExitX ?? W/2; py=this.playerExitY ?? H/2; }
        this.drawPlayer(ctx,px,py,1);

        // Player slowly exits frame; keep END hidden until the exit is genuinely complete.
        if (this.playerExitComplete) {
            const a=Math.min(1,Math.max(0,(t-13.0)/1.1));
            ctx.save(); ctx.globalAlpha=a; ctx.textAlign='center';
            ctx.fillStyle='#fff'; ctx.shadowBlur=28; ctx.shadowColor='#7be8ff';
            ctx.font=`900 ${Math.min(84,W*.14)}px Arial`;
            ctx.fillText('END',W/2,H*.48);
            ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,.72)';
            ctx.font='bold 12px Arial'; ctx.fillText('THE OCEAN IS AT PEACE',W/2,H*.48+34);
            this.drawEndingButtons(ctx,W,H,a);
            ctx.restore();
        }
        ctx.restore();
    }

    drawEndingButtons(ctx,W,H,alpha) {
        if (alpha < .95) { this.endStartButtonArea=null; this.endMenuButtonArea=null; return; }
        const bw=Math.min(190,(W-70)/2), bh=46, gap=14, y=H*.67, x=(W-(bw*2+gap))/2;
        this.drawButton(ctx,x,y,bw,bh,'BACK TO START','#55d69c');
        this.drawButton(ctx,x+bw+gap,y,bw,bh,'MAIN MENU','#688390');
        this.endStartButtonArea={x,y,width:bw,height:bh};
        this.endMenuButtonArea={x:x+bw+gap,y,width:bw,height:bh};
    }

    drawButton(ctx,x,y,w,h,text,fill) {
        ctx.save(); ctx.globalAlpha=.96;
        ctx.fillStyle='rgba(3,18,28,.9)'; ctx.strokeStyle=fill; ctx.lineWidth=2;
        ctx.beginPath(); ctx.roundRect(x,y,w,h,12); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.font='900 12px Arial'; ctx.textAlign='center'; ctx.fillText(text,x+w/2,y+h/2+4);
        ctx.restore();
    }

    handleClick(x,y) {
        if (!this.active || this.time < 14.1) return false;
        const start=this.endStartButtonArea, menu=this.endMenuButtonArea;
        if (start && x>=start.x && x<=start.x+start.width && y>=start.y && y<=start.y+start.height) {
            this.active=false;
            this.game.startGame(1);
            return true;
        }
        if (menu && x>=menu.x && x<=menu.x+menu.width && y>=menu.y && y<=menu.y+menu.height) {
            this.active=false;
            this.game.resetGame();
            this.game.gameState.setCurrent(this.game.gameState.states.MENU);
            return true;
        }
        return false;
    }

    drawAbyssBase(ctx,W,H,t) {
        const g=ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0,'#010106'); g.addColorStop(.55,'#18082d'); g.addColorStop(1,'#010105');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=.28;
        for(let i=0;i<14;i++) { const x=W*(i+.5)/14; ctx.fillStyle=i%2?'#7f58ff':'#c7a8ff'; ctx.beginPath(); ctx.arc(x,H*(.2+.65*((i*.37)%1)),1.5+(i%3),0,Math.PI*2); ctx.fill(); }
    }

    drawPacific(ctx,W,H,t) {
        const g=ctx.createLinearGradient(0,0,0,H);
        g.addColorStop(0,'#54d8ef'); g.addColorStop(.42,'#1689b2'); g.addColorStop(1,'#062e55');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=.18; ctx.strokeStyle='#d7fbff'; ctx.lineWidth=1;
        for(let y=H*.18;y<H;y+=64){ctx.beginPath();ctx.moveTo(0,y+Math.sin(t+y)*8);ctx.quadraticCurveTo(W*.5,y-18,W,y+Math.cos(t*.8+y)*8);ctx.stroke();}
        ctx.globalAlpha=.55;
        for(let i=0;i<18;i++){const x=(i*97+t*(7+i%4))%(W+30)-15;const y=H-((i*71+t*(11+i%3))%(H+40));ctx.fillStyle='rgba(230,252,255,.42)';ctx.beginPath();ctx.arc(x,y,2+(i%3),0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=.9; ctx.fillStyle='#0a4b55';
        for(let i=0;i<10;i++){const x=i*W/9;ctx.beginPath();ctx.moveTo(x-35,H);ctx.quadraticCurveTo(x-20,H-90,x-6,H-40);ctx.quadraticCurveTo(x+8,H-120,x+24,H-28);ctx.lineTo(x+34,H);ctx.closePath();ctx.fill();}
        ctx.fillStyle='#e57d74';
        for(let i=0;i<7;i++){const x=W*(.06+i*.14);ctx.beginPath();ctx.arc(x,H-24,18+(i%3)*5,Math.PI,Math.PI*2);ctx.fill();}
    }

    drawFish(ctx,W,H) {
        for(const f of this.fish){
            ctx.save(); ctx.globalAlpha=f.alpha;
            EnemyFishRenderer.draw(ctx,{x:f.x,y:f.y,size:f.size,speedX:f.dir,tailPhase:f.drift,bobPhase:f.drift*.7,species:f.species,color:f.color,game:null});
            ctx.restore();
        }
    }

    drawPlayer(ctx,x,y,scale) {
        FishRenderer.draw(ctx,x,y,this.playerNormalSize*scale,this.playerSkin||{bodyColor:'#ff6b35',secondaryColor:'#ff8c42',finColor:'#ff6b35',eyeColor:'white',pupilColor:'black'},{angle:0,time:performance.now(),phase:0,animated:true});
    }
}
