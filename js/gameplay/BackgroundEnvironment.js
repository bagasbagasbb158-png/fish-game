// BackgroundEnvironment.js - Animated underwater scenery
export class BackgroundEnvironment {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.time = 0;
        this.generate();
    }

    generate() {
        this.items = [];
        const w = this.game.getCanvas().width;
        const h = this.game.getCanvas().height;
        const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1;
        const deep = level >= 2;
        const abyss = level >= 3;
        const inferno = level >= 4;
        const infernoFinal = level === 6;
        const toxicWaste = level >= 7 && level <= 9;
        const toxicFinal = level === 9;
        const abyssalEnd = level === 10;

        const add = (type, x, y, scale, depth = 1, phase = Math.random() * Math.PI * 2) => {
            this.items.push({ type, x, y, scale, depth, phase, seed: Math.random() * 1000 });
        };

        if (toxicWaste) {
            for(let i=0;i<Math.max(34,Math.floor(w/38));i++){
                const x=Math.random()*w, roll=Math.random();
                if(roll<.28) add('toxicKelp',x,h+10,.7+Math.random()*1.2,.45+Math.random()*.3);
                else if(roll<.5) add('wastePipe',x,h+6,.6+Math.random()*1.1,.3+Math.random()*.25);
                else if(roll<.7) add('sludgeRock',x,h+6,.6+Math.random()*1.25,.35+Math.random()*.25);
                else if(roll<.86) add('toxicVent',x,h+4,.55+Math.random()*.9,.28+Math.random()*.2);
                else add('wasteDebris',x,h-3,.45+Math.random()*.9,.2+Math.random()*.25);
            }
            // Background decoration intentionally avoids round toxic bubbles so it cannot be confused with the gameplay hazard.
            for(let i=0;i<Math.max(7,Math.floor(w/190));i++) add('toxicBarrel',Math.random()*w,55+Math.random()*Math.max(180,h-180),.45+Math.random()*.8,.12+Math.random()*.2);
            for(let i=0;i<Math.max(20,Math.floor(w/80));i++) add('toxicParticle',Math.random()*w,Math.random()*h,.25+Math.random()*.6,.12+Math.random()*.18);
            if (toxicFinal) {
                // Level 9 keeps the exact Toxic Waste biome vocabulary, but pushes it
                // into a much darker, heavily contaminated final form.
                for(let i=0;i<Math.max(10,Math.floor(w/150));i++) add('toxicTower',Math.random()*w,h+8,.65+Math.random()*1.15,.24+Math.random()*.2);
                for(let i=0;i<Math.max(18,Math.floor(w/95));i++) add('toxicMist',Math.random()*w,Math.random()*h,.35+Math.random()*.8,.10+Math.random()*.16);
                for(let i=0;i<Math.max(7,Math.floor(w/230));i++) add('hazardSign',Math.random()*w,70+Math.random()*Math.max(120,h-170),.5+Math.random()*.65,.16+Math.random()*.16);
            }
        } else if (inferno) {
            const count = Math.max(30, Math.floor(w / 46));
            for (let i=0;i<count;i++) {
                const x=Math.random()*w, roll=Math.random();
                if(roll<.28) add('lavaKelp',x,h+10,.8+Math.random()*1.1,.6+Math.random()*.3);
                else if(roll<.52) add('fireCoral',x,h+8,.6+Math.random()*1,.5+Math.random()*.35);
                else if(roll<.72) add('volcanicRock',x,h+7,.7+Math.random()*1.2,.4+Math.random()*.3);
                else if(roll<.88) add('lavaVent',x,h+5,.55+Math.random()*.8,.35+Math.random()*.3);
                else add('obsidianShell',x,h-3,.5+Math.random()*.7,.4+Math.random()*.3);
            }
            for(let i=0;i<Math.max(8,Math.floor(w/180));i++) add('emberJelly',Math.random()*w,60+Math.random()*Math.max(180,h-220),.4+Math.random()*.7,.15+Math.random()*.2);
            for(let i=0;i<Math.max(12,Math.floor(w/140));i++) add('ember',Math.random()*w,60+Math.random()*Math.max(100,h-150),.3+Math.random()*.8,.2+Math.random()*.3);
            if (infernoFinal) {
                // Final Inferno stage: denser volcanic scenery and animated magma phenomena.
                for(let i=0;i<Math.max(8,Math.floor(w/170));i++) add('magmaSpire',Math.random()*w,h+8,0.8+Math.random()*1.5,.32+Math.random()*.25);
                for(let i=0;i<Math.max(5,Math.floor(w/260));i++) add('lavaCascade',Math.random()*w,55+Math.random()*Math.max(120,h-180),.7+Math.random()*1.1,.22+Math.random()*.18);
                for(let i=0;i<Math.max(18,Math.floor(w/90));i++) add('magmaBubble',Math.random()*w,100+Math.random()*Math.max(120,h-170),.3+Math.random()*.8,.18+Math.random()*.25);
                for(let i=0;i<Math.max(16,Math.floor(w/105));i++) add('ash',Math.random()*w,Math.random()*h,.25+Math.random()*.6,.12+Math.random()*.2);
                for(let i=0;i<Math.max(4,Math.floor(w/330));i++) add('godRune',Math.random()*w,120+Math.random()*Math.max(100,h-220),.8+Math.random()*.9,.12+Math.random()*.12);
            }
        } else if (abyssalEnd) {
            for(let i=0;i<52;i++) add('abyssPillar',Math.random()*w,h+10,.75+Math.random()*1.8,.28+Math.random()*.32);
            for(let i=0;i<28;i++) add('voidCrystal',Math.random()*w,55+Math.random()*Math.max(140,h-140),.45+Math.random()*1.35,.18+Math.random()*.22);
            for(let i=0;i<20;i++) add('abyssRuin',Math.random()*w,h-4,.65+Math.random()*1.45,.22+Math.random()*.22);
            for(let i=0;i<55;i++) add('abyssMote',Math.random()*w,Math.random()*h,.25+Math.random()*1.0,.12+Math.random()*.22);
            for(let i=0;i<12;i++) add('voidPortal',Math.random()*w,50+Math.random()*Math.max(180,h-220),.55+Math.random()*1.15,.12+Math.random()*.18);
            for(let i=0;i<10;i++) add('abyssRune',Math.random()*w,70+Math.random()*Math.max(120,h-180),.55+Math.random()*1.0,.1+Math.random()*.14);
            for(let i=0;i<8;i++) add('abyssCrown',Math.random()*w,45+Math.random()*Math.max(120,h-180),.55+Math.random()*1.0,.08+Math.random()*.12);
        } else {
            const count = Math.max(abyss ? 27 : deep ? 20 : 14, Math.floor(w / (abyss ? 48 : deep ? 62 : 75)));
            for (let i = 0; i < count; i++) {
                const x = Math.random() * w; const roll = Math.random();
                if (roll < (abyss ? 0.34 : deep ? 0.38 : 0.34)) add('seaweed', x, h + 8, 0.7 + Math.random() * (abyss ? 1.25 : deep ? 1.0 : 0.8), 0.65 + Math.random() * 0.3);
                else if (roll < (abyss ? 0.55 : deep ? 0.63 : 0.58)) add('coral', x, h + 7, 0.55 + Math.random() * (abyss ? 1.2 : deep ? 0.95 : 0.75), 0.5 + Math.random() * 0.35);
                else if (roll < (abyss ? 0.72 : 0.82)) add('rock', x, h + 6, 0.65 + Math.random() * (abyss ? 1.25 : deep ? 1.05 : 0.9), 0.4 + Math.random() * 0.35);
                else add(abyss && Math.random() < 0.6 ? 'crystal' : 'shell', x, h - 3, 0.5 + Math.random() * (abyss ? 0.9 : 0.65), 0.4 + Math.random() * 0.35);
            }
            for (let i = 0; i < Math.max(abyss ? 12 : deep ? 8 : 5, Math.floor(w / (abyss ? 150 : 220))); i++) add('jelly', Math.random() * w, 60 + Math.random() * Math.max(180, h - 200), 0.35 + Math.random() * (abyss ? 0.9 : deep ? 0.65 : 0.45), 0.12 + Math.random() * 0.22);
            if (deep) {
                for (let i = 0; i < Math.max(4, Math.floor(w / 280)); i++) add('ruin', Math.random() * w, h - 5, 0.7 + Math.random() * 0.8, 0.28 + Math.random() * 0.2);
                for (let i = 0; i < Math.max(8, Math.floor(w / 150)); i++) add('glowPlant', Math.random() * w, h - 5, 0.35 + Math.random() * (abyss ? 0.8 : 0.55), 0.5 + Math.random() * 0.35);
            }
            if (abyss) {
                for (let i = 0; i < Math.max(5, Math.floor(w / 260)); i++) add('giantCoral', Math.random() * w, h + 4, 0.75 + Math.random() * 0.9, 0.45 + Math.random() * 0.3);
                for (let i = 0; i < Math.max(5, Math.floor(w / 250)); i++) add('vent', Math.random() * w, h + 3, 0.65 + Math.random() * 0.65, 0.4 + Math.random() * 0.25);
            }
        }
    }

    update(deltaTime) {
        this.time += deltaTime * 0.001;
        const h = this.game.getCanvas().height;
        for (const item of this.items) {
            if (item.type === 'jelly') {
                item.y -= deltaTime * 0.006 * item.scale;
                item.x += Math.sin(this.time * 0.7 + item.phase) * deltaTime * 0.004;
                if (item.y < -50) item.y = h + 40;
            } else if (item.type === 'magmaBubble') {
                item.y -= deltaTime * (0.010 + item.scale * 0.004);
                item.x += Math.sin(this.time * 1.4 + item.phase) * deltaTime * 0.0025;
                if (item.y < -30) { item.y = h + 30; item.x = Math.random() * this.game.getCanvas().width; }
            } else if (item.type === 'toxicBarrel') {
                item.y += Math.sin(this.time * 0.8 + item.phase) * deltaTime * 0.004;
                item.x += Math.cos(this.time * 0.55 + item.phase) * deltaTime * 0.006;
                const w=this.game.getCanvas().width;
                if(item.x < -70) item.x=w+70;
                if(item.x > w+70) item.x=-70;
            } else if (item.type === 'toxicMist') {
                item.y -= deltaTime * 0.002 * item.scale;
                item.x += Math.sin(this.time * .55 + item.phase) * deltaTime * .003;
                if(item.y < -25){ item.y = h + 25; item.x = Math.random() * this.game.getCanvas().width; }
            } else if (item.type === 'toxicTower') {
                item.y += Math.sin(this.time*.45 + item.phase) * deltaTime*.002;
                item.x += Math.cos(this.time*.3 + item.phase) * deltaTime*.003;
            } else if (item.type === 'hazardSign') {
                item.y += Math.sin(this.time*.8 + item.phase) * deltaTime*.002;
            } else if (item.type === 'toxicParticle') {
                item.y -= deltaTime * 0.003 * item.scale;
                item.x += Math.sin(this.time*1.8+item.phase)*deltaTime*.004;
                if(item.y<-10){item.y=h+10;item.x=Math.random()*this.game.getCanvas().width;}
            } else if (item.type === 'abyssMote') {
                item.y -= deltaTime * 0.0025 * item.scale;
                item.x += Math.sin(this.time*0.9+item.phase)*deltaTime*.004;
                if(item.y<-15){item.y=h+15;item.x=Math.random()*this.game.getCanvas().width;}
            } else if (item.type === 'voidPortal') {
                item.y += Math.sin(this.time*.45+item.phase)*deltaTime*.002;
            } else if (item.type === 'voidCrystal') {
                item.y += Math.sin(this.time*.7+item.phase)*deltaTime*.002;
            } else if (item.type === 'abyssPillar' || item.type === 'abyssRuin') {
                item.y += Math.sin(this.time*.35+item.phase)*deltaTime*.0015;
            } else if (item.type === 'ash') {
                item.y += deltaTime * 0.004 * item.scale;
                item.x += Math.sin(this.time * 0.8 + item.phase) * deltaTime * 0.006;
                if (item.y > h + 20) { item.y = -20; item.x = Math.random() * this.game.getCanvas().width; }
            }
        }
    }

    draw(ctx) {
        for (const item of this.items) {
            ctx.save();
            ctx.globalAlpha = item.depth;
            switch (item.type) {
                case 'abyssPillar': this.drawAbyssPillar(ctx,item); break;
                case 'voidCrystal': this.drawVoidCrystal(ctx,item); break;
                case 'abyssRuin': this.drawAbyssRuin(ctx,item); break;
                case 'abyssMote': this.drawAbyssMote(ctx,item); break;
                case 'voidPortal': this.drawVoidPortal(ctx,item); break;
                case 'abyssRune': this.drawAbyssRune(ctx,item); break;
                case 'abyssCrown': this.drawAbyssCrown(ctx,item); break;
                case 'seaweed': this.drawSeaweed(ctx, item); break;
                case 'coral': this.drawCoral(ctx, item); break;
                case 'rock': this.drawRock(ctx, item); break;
                case 'shell': this.drawShell(ctx, item); break;
                case 'jelly': this.drawJelly(ctx, item); break;
                case 'ruin': this.drawRuin(ctx, item); break;
                case 'glowPlant': this.drawGlowPlant(ctx, item); break;
                case 'crystal': this.drawCrystal(ctx, item); break;
                case 'giantCoral': this.drawGiantCoral(ctx, item); break;
                case 'vent': this.drawVent(ctx, item); break;
                case 'lavaKelp': this.drawLavaKelp(ctx,item); break;
                case 'fireCoral': this.drawFireCoral(ctx,item); break;
                case 'volcanicRock': this.drawVolcanicRock(ctx,item); break;
                case 'lavaVent': this.drawLavaVent(ctx,item); break;
                case 'obsidianShell': this.drawObsidianShell(ctx,item); break;
                case 'emberJelly': this.drawEmberJelly(ctx,item); break;
                case 'ember': this.drawEmber(ctx,item); break;
                case 'magmaSpire': this.drawMagmaSpire(ctx,item); break;
                case 'lavaCascade': this.drawLavaCascade(ctx,item); break;
                case 'magmaBubble': this.drawMagmaBubble(ctx,item); break;
                case 'ash': this.drawAsh(ctx,item); break;
                case 'godRune': this.drawGodRune(ctx,item); break;
                case 'toxicKelp': this.drawToxicKelp(ctx,item); break;
                case 'wastePipe': this.drawWastePipe(ctx,item); break;
                case 'sludgeRock': this.drawSludgeRock(ctx,item); break;
                case 'toxicVent': this.drawToxicVent(ctx,item); break;
                case 'wasteDebris': this.drawWasteDebris(ctx,item); break;
                case 'toxicBarrel': this.drawToxicBarrel(ctx,item); break;
                case 'toxicParticle': this.drawToxicParticle(ctx,item); break;
                case 'toxicTower': this.drawToxicTower(ctx,item); break;
                case 'toxicMist': this.drawToxicMist(ctx,item); break;
                case 'hazardSign': this.drawHazardSign(ctx,item); break;
            }
            ctx.restore();
        }
        const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1;
        if (level === 6) this.drawFinalInfernoAtmosphere(ctx);
        if (level === 10) this.drawAbyssalEndAtmosphere(ctx);
        if (level >= 7 && level <= 8) this.drawToxicWasteAtmosphere(ctx);
        if (level === 9) this.drawToxicFinalAtmosphere(ctx);
    }


    drawToxicKelp(ctx,item){const s=item.scale,sw=Math.sin(this.time*1.7+item.phase)*7*s;ctx.strokeStyle='#397b3f';ctx.lineWidth=5*s;ctx.lineCap='round';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(item.x+i*8*s,item.y);ctx.bezierCurveTo(item.x+i*10*s,item.y-28*s,item.x+sw+i*6*s,item.y-55*s,item.x+sw*1.2+i*11*s,item.y-88*s);ctx.stroke();}ctx.strokeStyle='#a8ff5c';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(item.x,item.y-8*s);ctx.lineTo(item.x+sw,item.y-65*s);ctx.stroke();}
    drawWastePipe(ctx,item){const s=item.scale;ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle='#263b36';ctx.strokeStyle='#58766a';ctx.lineWidth=2*s;ctx.fillRect(-18*s,-80*s,36*s,80*s);ctx.strokeRect(-18*s,-80*s,36*s,80*s);ctx.fillStyle='#1a2925';ctx.beginPath();ctx.ellipse(0,-80*s,22*s,8*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8dff4a';ctx.shadowBlur=12;ctx.shadowColor='#8dff4a';ctx.beginPath();ctx.arc(0,-82*s,7*s,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.restore();}
    drawSludgeRock(ctx,item){const s=item.scale;ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle='#203f35';ctx.beginPath();ctx.moveTo(-35*s,0);ctx.lineTo(-22*s,-35*s);ctx.lineTo(0,-50*s);ctx.lineTo(30*s,-30*s);ctx.lineTo(38*s,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#4d8063';ctx.stroke();ctx.fillStyle='#b8ff3d';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc((-12+i*12)*s,-(15+i%2*8)*s,4*s,0,Math.PI*2);ctx.fill();}ctx.restore();}
    drawToxicVent(ctx,item){const s=item.scale;ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle='#183a2f';ctx.beginPath();ctx.ellipse(0,-8*s,28*s,10*s,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#70a56f';ctx.stroke();ctx.fillStyle='rgba(160,255,80,.45)';for(let i=0;i<4;i++){const a=this.time*.7+i;ctx.beginPath();ctx.arc(Math.cos(a)*12*s,-25*s-Math.sin(a)*10*s,5*s,0,Math.PI*2);ctx.fill();}ctx.restore();}
    drawWasteDebris(ctx,item){const s=item.scale;ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.phase);ctx.fillStyle='#32453f';ctx.fillRect(-22*s,-8*s,44*s,12*s);ctx.fillStyle='#1f6b50';ctx.fillRect(-8*s,-25*s,18*s,10*s);ctx.restore();}
    drawToxicBarrel(ctx,item){
        const s=item.scale;
        const bob=Math.sin(this.time*1.1+item.phase)*5*s;
        const tilt=Math.sin(this.time*.65+item.phase)*.12;
        ctx.save();
        ctx.translate(item.x,item.y+bob);
        ctx.rotate(tilt);
        ctx.shadowBlur=10; ctx.shadowColor='rgba(108,255,66,.35)';
        ctx.fillStyle='#33483f'; ctx.strokeStyle='#7aa87b'; ctx.lineWidth=2*s;
        ctx.beginPath(); ctx.roundRect(-24*s,-15*s,48*s,30*s,6*s); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#4f6a5a';
        for(let x=-15;x<=15;x+=15){ctx.fillRect((x-2)*s,-15*s,4*s,30*s);}
        ctx.fillStyle='#9dff42'; ctx.globalAlpha=.8;
        ctx.fillRect(-18*s,-7*s,36*s,10*s);
        ctx.fillStyle='#102018'; ctx.globalAlpha=1;
        ctx.font=`${Math.max(9,12*s)}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('☣',0,-2*s);
        ctx.strokeStyle='rgba(210,255,160,.55)'; ctx.lineWidth=1*s;
        ctx.beginPath(); ctx.ellipse(0,-15*s,24*s,6*s,0,0,Math.PI*2); ctx.stroke();
        ctx.restore();
    }
    drawToxicParticle(ctx,item){const s=item.scale;ctx.fillStyle='#b8ff3d';ctx.shadowBlur=8;ctx.shadowColor='#8dff4a';ctx.beginPath();ctx.arc(item.x,item.y,2.5*s,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}


    drawToxicWasteAtmosphere(ctx) {
        const w=ctx.canvas.width, h=ctx.canvas.height;
        const t=this.time;
        ctx.save();
        const glow=ctx.createRadialGradient(w*.5,h*.72,20,w*.5,h*.72,Math.max(w,h)*.8);
        glow.addColorStop(0,'rgba(122,255,55,.09)'); glow.addColorStop(.5,'rgba(46,180,84,.035)'); glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
        ctx.globalAlpha=.08;
        ctx.strokeStyle='#9dff42'; ctx.lineWidth=2;
        for(let i=0;i<7;i++){const x=(i+.5)*w/7+Math.sin(t*.25+i)*22;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x-50,h*.35,x+25,h);ctx.stroke();}
        ctx.globalAlpha=.06; ctx.fillStyle='#b8ff3d';
        for(let i=0;i<10;i++){const x=(i*137+t*18)%w,y=(i*83+t*9)%h;ctx.beginPath();ctx.arc(x,y,18+8*Math.sin(t*2+i),0,Math.PI*2);ctx.fill();}
        ctx.restore();
    }

    drawToxicTower(ctx,item){
        const s=item.scale, pulse=1+Math.sin(this.time*2+item.phase)*.04;
        ctx.save(); ctx.translate(item.x,item.y); ctx.scale(pulse,pulse);
        ctx.fillStyle='#101b18'; ctx.strokeStyle='#375443'; ctx.lineWidth=2*s;
        ctx.beginPath(); ctx.moveTo(-24*s,0); ctx.lineTo(-18*s,-75*s); ctx.lineTo(-8*s,-108*s); ctx.lineTo(10*s,-82*s); ctx.lineTo(25*s,0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#8cff35'; ctx.globalAlpha=.55; ctx.shadowBlur=18; ctx.shadowColor='#79ff32';
        ctx.fillRect(-5*s,-68*s,9*s,45*s); ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.restore();
    }
    drawToxicMist(ctx,item){
        const s=item.scale;
        ctx.save(); ctx.globalAlpha=.22;
        const g=ctx.createRadialGradient(item.x,item.y,0,item.x,item.y,35*s);
        g.addColorStop(0,'#c7ff5a'); g.addColorStop(1,'rgba(64,255,72,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(item.x,item.y,35*s,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    drawHazardSign(ctx,item){
        const s=item.scale, pulse=.8+Math.sin(this.time*2+item.phase)*.15;
        ctx.save(); ctx.translate(item.x,item.y); ctx.globalAlpha=.65*pulse;
        ctx.fillStyle='#18231e'; ctx.strokeStyle='#b7ff4d'; ctx.lineWidth=2*s;
        ctx.beginPath(); ctx.roundRect(-30*s,-20*s,60*s,40*s,5*s); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#dfff75'; ctx.font=`900 ${22*s}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('☣',0,1*s); ctx.restore();
    }

    drawToxicFinalAtmosphere(ctx){
        const w=ctx.canvas.width,h=ctx.canvas.height,t=this.time;
        ctx.save();
        const dark=ctx.createLinearGradient(0,0,0,h);
        dark.addColorStop(0,'rgba(0,4,3,.34)'); dark.addColorStop(.52,'rgba(0,9,6,.20)'); dark.addColorStop(1,'rgba(0,0,0,.46)');
        ctx.fillStyle=dark; ctx.fillRect(0,0,w,h);
        const toxic=ctx.createRadialGradient(w*.5,h*.68,20,w*.5,h*.68,Math.max(w,h)*.85);
        toxic.addColorStop(0,'rgba(113,255,39,.12)'); toxic.addColorStop(.45,'rgba(32,150,53,.045)'); toxic.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=toxic; ctx.fillRect(0,0,w,h);
        ctx.globalAlpha=.13; ctx.strokeStyle='#9dff42'; ctx.lineWidth=2;
        for(let i=0;i<12;i++){ const x=(i+.5)*w/12+Math.sin(t*.32+i)*28; ctx.beginPath(); ctx.moveTo(x,0); ctx.bezierCurveTo(x-70,h*.28,x+55,h*.65,x-10,h); ctx.stroke(); }
        ctx.globalAlpha=.07; ctx.fillStyle='#d5ff6a';
        for(let i=0;i<18;i++){ const x=(i*97+t*14)%w,y=(i*53+t*11)%h,r=10+7*Math.sin(t*1.7+i); ctx.beginPath();ctx.arc(x,y,Math.max(3,r),0,Math.PI*2);ctx.fill(); }
        ctx.restore();
    }

    drawSeaweed(ctx, item) {
        const s = item.scale;
        const sway = Math.sin(this.time * 1.5 + item.phase) * 8 * s;
        ctx.lineCap = 'round';
        ctx.lineWidth = 5 * s;
        ctx.strokeStyle = '#126b58';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(item.x + i * 8 * s, item.y);
            ctx.bezierCurveTo(item.x + i * 10 * s, item.y - 25 * s, item.x + sway + i * 7 * s, item.y - 48 * s, item.x + sway * 0.8 + i * 12 * s, item.y - 82 * s);
            ctx.stroke();
        }
        ctx.lineWidth = 2 * s;
        ctx.strokeStyle = '#1d9878';
        ctx.beginPath();
        ctx.moveTo(item.x + sway * 0.15, item.y - 10 * s);
        ctx.quadraticCurveTo(item.x + sway, item.y - 35 * s, item.x + sway * 1.2, item.y - 65 * s);
        ctx.stroke();
    }

    drawCoral(ctx, item) {
        const s = item.scale;
        const sway = Math.sin(this.time * 1.1 + item.phase) * 3 * s;
        ctx.fillStyle = '#a65d72';
        ctx.strokeStyle = '#713f54';
        ctx.lineWidth = Math.max(1, 1.5 * s);
        ctx.beginPath();
        ctx.moveTo(item.x - 28 * s, item.y);
        ctx.lineTo(item.x - 20 * s, item.y - 25 * s);
        ctx.lineTo(item.x - 12 * s + sway, item.y - 48 * s);
        ctx.lineTo(item.x - 5 * s, item.y - 30 * s);
        ctx.lineTo(item.x + 2 * s + sway, item.y - 60 * s);
        ctx.lineTo(item.x + 10 * s, item.y - 34 * s);
        ctx.lineTo(item.x + 21 * s + sway, item.y - 52 * s);
        ctx.lineTo(item.x + 29 * s, item.y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(item.x + (i - 2) * 10 * s, item.y - (20 + (i % 2) * 12) * s, 3 * s, 0, Math.PI * 2);
            ctx.fillStyle = '#d98aa0'; ctx.fill();
        }
    }

    drawRock(ctx, item) {
        const s = item.scale;
        ctx.fillStyle = '#43566a';
        ctx.strokeStyle = '#293b4d';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(item.x - 32 * s, item.y);
        ctx.quadraticCurveTo(item.x - 30 * s, item.y - 25 * s, item.x - 8 * s, item.y - 29 * s);
        ctx.quadraticCurveTo(item.x + 15 * s, item.y - 37 * s, item.x + 31 * s, item.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#668097';
        ctx.beginPath(); ctx.ellipse(item.x - 8 * s, item.y - 18 * s, 8 * s, 4 * s, -0.2, 0, Math.PI * 2); ctx.fill();
    }

    drawShell(ctx, item) {
        const s = item.scale;
        ctx.fillStyle = '#d5b49b';
        ctx.strokeStyle = '#8e6e5b';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(item.x - 18 * s, item.y);
        ctx.quadraticCurveTo(item.x, item.y - 30 * s, item.x + 18 * s, item.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(item.x, item.y - 2 * s); ctx.lineTo(item.x + i * 6 * s, item.y - 22 * s); ctx.stroke();
        }
    }

    drawJelly(ctx, item) {
        const s = item.scale;
        const bob = Math.sin(this.time * 1.4 + item.phase) * 4 * s;
        const x = item.x + bob;
        ctx.fillStyle = '#7ec9d4';
        ctx.strokeStyle = '#a6edf0';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(x, item.y, 17 * s, Math.PI, 0);
        ctx.lineTo(x + 17 * s, item.y + 9 * s);
        ctx.quadraticCurveTo(x, item.y + 3 * s, x - 17 * s, item.y + 9 * s);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.globalAlpha *= 0.7;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 6 * s, item.y + 7 * s);
            ctx.quadraticCurveTo(x + i * 7 * s + Math.sin(this.time * 2 + i) * 4 * s, item.y + 22 * s, x + i * 5 * s, item.y + 36 * s);
            ctx.stroke();
        }
    }

    drawRuin(ctx, item) {
        const s = item.scale;
        const x = item.x, y = item.y;
        ctx.fillStyle = '#263746';
        ctx.strokeStyle = '#182630';
        ctx.lineWidth = Math.max(1, 2 * s);
        // Broken stone pillars / ancient reef ruin.
        ctx.fillRect(x - 32 * s, y - 42 * s, 14 * s, 42 * s);
        ctx.fillRect(x + 15 * s, y - 62 * s, 15 * s, 62 * s);
        ctx.beginPath();
        ctx.moveTo(x - 38 * s, y - 42 * s);
        ctx.lineTo(x - 10 * s, y - 42 * s);
        ctx.lineTo(x - 5 * s, y - 30 * s);
        ctx.lineTo(x - 36 * s, y - 30 * s);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8 * s, y - 62 * s);
        ctx.lineTo(x + 38 * s, y - 62 * s);
        ctx.lineTo(x + 42 * s, y - 50 * s);
        ctx.lineTo(x + 10 * s, y - 50 * s);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    drawGlowPlant(ctx, item) {
        const s = item.scale;
        const sway = Math.sin(this.time * 1.25 + item.phase) * 7 * s;
        const x = item.x;
        ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 5 * s, item.y);
            ctx.quadraticCurveTo(x + sway + i * 9 * s, item.y - 22 * s, x + sway * 0.6 + i * 12 * s, item.y - 48 * s);
            ctx.strokeStyle = i === 0 ? '#58e6d0' : '#3db5a8';
            ctx.lineWidth = 3 * s;
            ctx.shadowBlur = 9 * s;
            ctx.shadowColor = '#4ee9d5';
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#a0fff2';
        ctx.beginPath(); ctx.arc(x + sway * 0.6, item.y - 50 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    }


    drawCrystal(ctx, item) {
        const s = item.scale;
        const sway = Math.sin(this.time * 0.9 + item.phase) * 2 * s;
        ctx.save();
        ctx.translate(item.x + sway, item.y);
        ctx.fillStyle = '#6346a3'; ctx.strokeStyle = '#a98cff'; ctx.lineWidth = Math.max(1, 1.5 * s);
        for (let i = -2; i <= 2; i++) {
            const h = (28 + (i + 2) * 8) * s;
            ctx.beginPath();
            ctx.moveTo(i * 9 * s, 0);
            ctx.lineTo(i * 9 * s - 7 * s, -h);
            ctx.lineTo(i * 9 * s + 2 * s, -h - 7 * s);
            ctx.lineTo(i * 9 * s + 9 * s, -8 * s);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
    }

    drawGiantCoral(ctx, item) {
        const s = item.scale;
        const sway = Math.sin(this.time * 0.8 + item.phase) * 4 * s;
        ctx.save(); ctx.translate(item.x, item.y);
        ctx.strokeStyle = '#6f3f91'; ctx.fillStyle = '#9c5cc7'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 10 * s, 0);
            ctx.bezierCurveTo(i * 13 * s, -22 * s, i * 7 * s + sway, -42 * s, i * 15 * s + sway, -72 * s);
            ctx.stroke();
            ctx.fillStyle = '#c47be8';
            ctx.beginPath(); ctx.arc(i * 15 * s + sway, -73 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawVent(ctx, item) {
        const s = item.scale;
        ctx.save(); ctx.translate(item.x, item.y);
        ctx.fillStyle = '#29263d'; ctx.strokeStyle = '#4e4a68'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.ellipse(0, 0, 26 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(180,120,255,0.18)';
        ctx.beginPath(); ctx.arc(0, -7 * s, 15 * s, 0, Math.PI * 2); ctx.fill();
        for (let i = -2; i <= 2; i++) {
            const rise = ((this.time * 16 + i * 13 + item.seed) % 45);
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#b99cff';
            ctx.beginPath(); ctx.arc(i * 7 * s, -15 * s - rise * s, (2 + Math.sin(i + this.time) * 0.5) * s, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawLavaKelp(ctx,i){const s=i.scale,sw=Math.sin(this.time*1.8+i.phase)*10*s;ctx.lineCap='round';for(let n=-1;n<=1;n++){ctx.beginPath();ctx.moveTo(i.x+n*9*s,i.y);ctx.bezierCurveTo(i.x+sw+n*10*s,i.y-35*s,i.x+sw*.5+n*14*s,i.y-75*s,i.x+sw+n*20*s,i.y-115*s);ctx.strokeStyle=n===0?'#9c2f14':'#5f2118';ctx.lineWidth=6*s;ctx.stroke();}}
    drawFireCoral(ctx,i){const s=i.scale,sw=Math.sin(this.time+i.phase)*3*s;ctx.fillStyle='#b92b18';ctx.strokeStyle='#ff7043';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(i.x-30*s,i.y);for(let n=0;n<6;n++){const x=i.x+(-25+n*10)*s,hh=(35+(n%3)*18)*s;ctx.lineTo(x+sw,i.y-hh);ctx.lineTo(x+8*s,i.y-hh*.55);}ctx.lineTo(i.x+30*s,i.y);ctx.closePath();ctx.fill();ctx.stroke();}
    drawVolcanicRock(ctx,i){const s=i.scale;ctx.fillStyle='#17151a';ctx.strokeStyle='#5d2a22';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(i.x-34*s,i.y);ctx.lineTo(i.x-24*s,i.y-28*s);ctx.lineTo(i.x-5*s,i.y-40*s);ctx.lineTo(i.x+17*s,i.y-27*s);ctx.lineTo(i.x+34*s,i.y);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ff4d1a';ctx.beginPath();ctx.moveTo(i.x-14*s,i.y-25*s);ctx.lineTo(i.x,i.y-8*s);ctx.lineTo(i.x+12*s,i.y-22*s);ctx.stroke();}
    drawLavaVent(ctx,i){const s=i.scale;ctx.fillStyle='#24171b';ctx.beginPath();ctx.ellipse(i.x,i.y,32*s,10*s,0,0,Math.PI*2);ctx.fill();for(let n=-2;n<=2;n++){ctx.fillStyle='#ff6d00';ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(i.x+n*9*s+Math.sin(this.time*2+n)*4*s,i.y-12*s-Math.abs(Math.sin(this.time*1.5+n))*22*s,4*s,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    drawObsidianShell(ctx,i){const s=i.scale;ctx.fillStyle='#27212c';ctx.strokeStyle='#ff7043';ctx.lineWidth=1.5*s;ctx.beginPath();ctx.moveTo(i.x-20*s,i.y);ctx.quadraticCurveTo(i.x,i.y-34*s,i.x+20*s,i.y);ctx.closePath();ctx.fill();ctx.stroke();}
    drawEmberJelly(ctx,i){const s=i.scale,b=Math.sin(this.time*1.6+i.phase)*5*s,x=i.x+b,y=i.y;ctx.fillStyle='#ff5a36';ctx.strokeStyle='#ffc857';ctx.lineWidth=1.5*s;ctx.beginPath();ctx.arc(x,y,18*s,Math.PI,0);ctx.lineTo(x+18*s,y+9*s);ctx.quadraticCurveTo(x,y+3*s,x-18*s,y+9*s);ctx.closePath();ctx.fill();ctx.stroke();for(let n=-2;n<=2;n++){ctx.beginPath();ctx.moveTo(x+n*6*s,y+7*s);ctx.quadraticCurveTo(x+n*7*s+Math.sin(this.time*2+n)*5*s,y+25*s,x+n*5*s,y+40*s);ctx.strokeStyle='#ff9f43';ctx.stroke();}}
    drawEmber(ctx,i){const s=i.scale,x=i.x+Math.sin(this.time*.8+i.phase)*12*s,y=i.y-(this.time*24%140);ctx.fillStyle='#ffb300';ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(x,y,3*s,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}


    drawMagmaSpire(ctx, i) {
        const s=i.scale, x=i.x, y=i.y;
        ctx.fillStyle='#09090d'; ctx.strokeStyle='#3b1110'; ctx.lineWidth=2*s;
        ctx.beginPath(); ctx.moveTo(x-42*s,y); ctx.lineTo(x-28*s,y-55*s); ctx.lineTo(x-10*s,y-92*s); ctx.lineTo(x+2*s,y-48*s); ctx.lineTo(x+18*s,y-112*s); ctx.lineTo(x+32*s,y-62*s); ctx.lineTo(x+48*s,y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle='#ff3d00'; ctx.globalAlpha=.7; ctx.lineWidth=3*s;
        for(let n=0;n<3;n++){ctx.beginPath();ctx.moveTo(x+(-22+n*18)*s,y-8*s);ctx.lineTo(x+(-12+n*16)*s,y-45*s);ctx.lineTo(x+(-3+n*13)*s,y-78*s);ctx.stroke();}
    }

    drawLavaCascade(ctx, i) {
        const s=i.scale, x=i.x, y=i.y, pulse=.65+.35*Math.sin(this.time*3+i.phase);
        ctx.save(); ctx.globalAlpha=.22+.16*pulse;
        const g=ctx.createLinearGradient(x,y-80*s,x,y+70*s); g.addColorStop(0,'#ffcc33'); g.addColorStop(.35,'#ff5a00'); g.addColorStop(1,'#8b1600'); ctx.fillStyle=g;
        ctx.beginPath(); ctx.moveTo(x-12*s,y-70*s); ctx.quadraticCurveTo(x+8*s,y-20*s,x-4*s,y+70*s); ctx.lineTo(x+18*s,y+70*s); ctx.quadraticCurveTo(x+26*s,y-15*s,x+9*s,y-70*s); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='#ffb300'; ctx.globalAlpha=.55; ctx.lineWidth=2*s; ctx.stroke(); ctx.restore();
    }

    drawMagmaBubble(ctx, i) {
        const s=i.scale, pulse=1+Math.sin(this.time*3.2+i.phase)*.18;
        ctx.save(); ctx.globalAlpha=.35; ctx.shadowBlur=10*s; ctx.shadowColor='#ff4b00'; ctx.fillStyle='#ff6a00'; ctx.beginPath(); ctx.arc(i.x,i.y,5*s*pulse,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=.8; ctx.fillStyle='#ffd34d'; ctx.beginPath(); ctx.arc(i.x-1*s,i.y-1*s,2*s,0,Math.PI*2); ctx.fill(); ctx.restore();
    }

    drawAsh(ctx, i) {
        const pulse=.45+.25*Math.sin(this.time*2+i.phase); ctx.globalAlpha=.25+pulse*.35; ctx.fillStyle='#ffb07a';
        ctx.beginPath(); ctx.arc(i.x,i.y,2.2*i.scale,0,Math.PI*2); ctx.fill();
    }

    drawGodRune(ctx, i) {
        const s=i.scale, pulse=.55+.45*Math.sin(this.time*2+i.phase);
        ctx.save(); ctx.globalAlpha=.08+.08*pulse; ctx.strokeStyle='#ff8a00'; ctx.lineWidth=2*s; ctx.shadowBlur=18*s; ctx.shadowColor='#ff3d00';
        ctx.beginPath(); ctx.arc(i.x,i.y,28*s,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i.x-18*s,i.y); ctx.lineTo(i.x,i.y-18*s); ctx.lineTo(i.x+18*s,i.y); ctx.lineTo(i.x,i.y+18*s); ctx.closePath(); ctx.stroke();
        ctx.restore();
    }

    drawAbyssPillar(ctx,i){const s=i.scale,p=.5+.5*Math.sin(this.time*1.2+i.phase);ctx.save();ctx.translate(i.x,i.y);ctx.fillStyle='#090817';ctx.strokeStyle='#5d48a5';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(-30*s,0);ctx.lineTo(-22*s,-85*s);ctx.lineTo(-8*s,-125*s);ctx.lineTo(5*s,-75*s);ctx.lineTo(20*s,-105*s);ctx.lineTo(34*s,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.35+.2*p;ctx.strokeStyle='#9c7cff';ctx.lineWidth=3*s;ctx.beginPath();ctx.moveTo(-8*s,-8*s);ctx.lineTo(2*s,-55*s);ctx.lineTo(13*s,-88*s);ctx.stroke();ctx.restore();}
    drawVoidCrystal(ctx,i){const s=i.scale,p=.6+.4*Math.sin(this.time*2+i.phase);ctx.save();ctx.translate(i.x,i.y);ctx.rotate(Math.sin(this.time*.6+i.phase)*.08);ctx.shadowBlur=18*s;ctx.shadowColor='#8e6cff';ctx.fillStyle='#30206b';ctx.strokeStyle='#c4b2ff';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(0,-32*s);ctx.lineTo(15*s,-8*s);ctx.lineTo(9*s,28*s);ctx.lineTo(-8*s,35*s);ctx.lineTo(-16*s,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.45*p;ctx.fillStyle='#e5ddff';ctx.beginPath();ctx.arc(-5*s,-10*s,4*s,0,Math.PI*2);ctx.fill();ctx.restore();}
    drawAbyssRuin(ctx,i){const s=i.scale;ctx.save();ctx.translate(i.x,i.y);ctx.fillStyle='#111022';ctx.strokeStyle='#51457c';ctx.lineWidth=2*s;ctx.fillRect(-38*s,-50*s,76*s,50*s);for(let n=-2;n<=2;n++){ctx.fillRect((n*12-4)*s,-70*s,8*s,20*s);}ctx.strokeRect(-38*s,-50*s,76*s,50*s);ctx.restore();}
    drawAbyssMote(ctx,i){const r=2.2*i.scale;ctx.save();ctx.globalAlpha=.35+.3*Math.sin(this.time*3+i.phase);ctx.fillStyle='#c7b8ff';ctx.shadowBlur=10;ctx.shadowColor='#7d63ff';ctx.beginPath();ctx.arc(i.x,i.y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
    drawVoidPortal(ctx,i){const s=i.scale,p=.55+.45*Math.sin(this.time*1.7+i.phase);ctx.save();ctx.translate(i.x,i.y);ctx.rotate(this.time*.18);ctx.globalAlpha=.18+.12*p;ctx.strokeStyle='#8c6bff';ctx.shadowBlur=24*s;ctx.shadowColor='#684cff';ctx.lineWidth=4*s;ctx.beginPath();ctx.ellipse(0,0,30*s,48*s,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.45;ctx.lineWidth=1.5*s;ctx.beginPath();ctx.ellipse(0,0,18*s,31*s,0,0,Math.PI*2);ctx.stroke();ctx.restore();}

    drawAbyssalEndAtmosphere(ctx) {
        const w=this.game.getCanvas().width,h=this.game.getCanvas().height,t=this.time,stage=this.game.bossStage||0;
        ctx.save();
        const pulse=.5+.5*Math.sin(t*2.2+stage);
        const v=ctx.createRadialGradient(w*.5,h*.46,10,w*.5,h*.46,Math.max(w,h)*.82);
        v.addColorStop(0,`rgba(132,96,255,${.075+.025*pulse})`);v.addColorStop(.3,'rgba(40,18,100,.2)');v.addColorStop(.68,'rgba(7,3,25,.5)');v.addColorStop(1,'rgba(0,0,3,.9)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h);
        // Deep abyss rings, reacting to boss progression.
        ctx.globalAlpha=.055+.018*stage;ctx.strokeStyle='#b69cff';ctx.lineWidth=2;
        for(let i=0;i<9;i++){const rr=Math.min(w,h)*(.12+i*.105)+Math.sin(t*.5+i)*6;ctx.beginPath();ctx.arc(w*.5,h*.5,rr,0,Math.PI*2);ctx.stroke();}
        // Vertical god-rays and drifting void curtains.
        ctx.globalAlpha=.045+.012*stage;ctx.strokeStyle='#7e63ff';ctx.lineWidth=3;
        for(let i=-3;i<11;i++){const x=i*w/7+Math.sin(t*.22+i)*40;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x-90,h*.32,x+70,h*.68,x-35,h);ctx.stroke();}
        // Dense star-like motes.
        ctx.globalAlpha=.24+.04*stage;ctx.fillStyle='#eee8ff';
        for(let i=0;i<58;i++){const a=i*.73+t*(.12+(i%4)*.018),rr=Math.min(w,h)*(.18+(i%9)*.075);const x=w*.5+Math.cos(a)*rr,y=h*.5+Math.sin(a)*rr*.64;const r=1+(i%4)*.6;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
        // Final-stage eclipse/vortex core.
        if(stage>=3){ctx.globalAlpha=.12+.05*pulse;ctx.shadowBlur=35;ctx.shadowColor='#9b72ff';ctx.strokeStyle='#d9ccff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.5,h*.5,Math.min(w,h)*(.17+.015*Math.sin(t)),0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
        if(stage>=4){ctx.globalAlpha=.07+.04*pulse;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(w*.5,h*.5,Math.min(w,h)*.11,0,Math.PI*2);ctx.fill();}
        ctx.restore();
    }

    drawFinalInfernoAtmosphere(ctx) {
        const w=this.game.getCanvas().width, h=this.game.getCanvas().height;
        const pulse=.5+.5*Math.sin(this.time*1.7);
        ctx.save();
        // Dark final-boss vignette.
        const vignette=ctx.createRadialGradient(w/2,h*.48,Math.min(w,h)*.08,w/2,h*.48,Math.max(w,h)*.72);
        vignette.addColorStop(0,'rgba(255,74,0,0.015)'); vignette.addColorStop(.65,'rgba(30,0,0,0.16)'); vignette.addColorStop(1,'rgba(0,0,0,0.52)');
        ctx.fillStyle=vignette; ctx.fillRect(0,0,w,h);
        // Huge moving magma glow from the seafloor.
        const floor=ctx.createLinearGradient(0,h*.72,0,h); floor.addColorStop(0,'rgba(255,42,0,0)'); floor.addColorStop(.62,'rgba(255,55,0,'+(0.06+0.05*pulse)+')'); floor.addColorStop(1,'rgba(255,145,0,'+(0.18+0.09*pulse)+')');
        ctx.fillStyle=floor; ctx.fillRect(0,h*.62,w,h*.38);
        // Animated heat waves.
        ctx.globalAlpha=.045+.025*pulse; ctx.strokeStyle='#ff7a00'; ctx.lineWidth=3;
        for(let i=0;i<7;i++){ const yy=h*.62+i*30+Math.sin(this.time*2+i)*9; ctx.beginPath(); for(let x=0;x<=w;x+=18){const y=yy+Math.sin(x*.012+this.time*1.8+i)*7; if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);} ctx.stroke(); }
        // Final-stage lava storm particles.
        ctx.globalAlpha=.35; ctx.fillStyle='#ff7a00';
        for(let i=0;i<22;i++){ const x=(i*97+this.time*24)%w; const y=(i*53+Math.sin(this.time*1.5+i)*30+h*.08)%h; const r=1+(i%3); ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill(); }
        ctx.restore();
    }

}
