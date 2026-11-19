// EnemyFishRenderer.js - Distinct species silhouettes for each enemy size tier
export class EnemyFishRenderer {
    static draw(ctx, fish) {
        const size = fish.size;
        const r = size / 2;
        const t = performance.now() * 0.001;
        const tailWave = Math.sin(t * 5 + fish.tailPhase) * 0.14;
        const bob = Math.sin(t * 2.2 + fish.bobPhase) * Math.min(1.8, size * 0.035);
        // Keep fish upright and make them face their actual horizontal swimming direction.
        // Vertical drift is only a gentle bob, never a reason to tilt/flip the fish.
        const facingLeft = fish.speedX < 0;

        ctx.save();
        ctx.translate(fish.x, fish.y + bob);
        if (facingLeft) ctx.scale(-1, 1);

        switch (fish.species) {
            case 'guppy': this.drawGuppy(ctx, r, fish.color, tailWave); break;
            case 'clownfish': this.drawClownfish(ctx, r, fish.color, tailWave); break;
            case 'pufferfish': this.drawPuffer(ctx, r, fish.color, tailWave); break;
            case 'angelfish': this.drawAngelfish(ctx, r, fish.color, tailWave); break;
            case 'shark': this.drawShark(ctx, r, fish.color, tailWave); break;
            case 'flame_tetra': this.drawFlameTetra(ctx, r, tailWave); break;
            case 'inferno_lionfish': this.drawInfernoLionfish(ctx, r, tailWave); break;
            case 'magma_angler': this.drawMagmaAngler(ctx, r, tailWave); break;
            case 'volcanic_manta': this.drawVolcanicManta(ctx, r, tailWave); break;
            case 'hellfire_moray': this.drawHellfireMoray(ctx, r, tailWave); break;
            case 'toxic_minnow': this.drawToxicMinnow(ctx, r, tailWave); break;
            case 'radioactive_piranha': this.drawRadioactivePiranha(ctx, r, tailWave); break;
            case 'mutant_angler': this.drawMutantAngler(ctx, r, tailWave); break;
            case 'sludge_ray': this.drawSludgeRay(ctx, r, tailWave); break;
            case 'wasteland_eel': this.drawWastelandEel(ctx, r, tailWave); break;
            case 'abyss_stalker': this.drawAbyssStalker(ctx, r, tailWave, fish); break;
            case 'void_eel': this.drawVoidEel(ctx, r, tailWave, fish); break;
            case 'abyss_ray': this.drawAbyssRay(ctx, r, tailWave, fish); break;
            case 'abyss_devourer': this.drawAbyssDevourer(ctx, r, tailWave, fish); break;
            case 'void_serpent': this.drawVoidSerpent(ctx, r, tailWave, fish); break;
            default: this.drawGuppy(ctx, r, fish.color, tailWave); break;
        }

        // White dot above an enemy means the player is currently large enough to eat it.
        const player = fish.game?.getPlayer?.();
        if (player) {
            const canEat = player.getSize() >= fish.getSize() * 1.2;
            ctx.save();
            // Indicator is drawn in the fish's local space, so no counter-rotation is needed.

            const indicatorY = -Math.max(r * 1.15, 12);
            ctx.globalAlpha = canEat ? 0.95 : 0.18;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = canEat ? 8 : 0;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath(); ctx.arc(0, indicatorY, Math.max(2.5, Math.min(5, r * 0.13)), 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    static drawAbyssStalker(ctx,r,wave,fish){const t=performance.now()*.001;this.drawBody(ctx,r,'#30205f',1.05,.58);ctx.fillStyle='#7658e8';ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.quadraticCurveTo(-r*1.5,-r*.75,-r*1.65,0);ctx.quadraticCurveTo(-r*1.5,r*.75,-r*.7,0);ctx.fill();for(const sy of [-1,1]){ctx.fillStyle='#a78cff';ctx.beginPath();ctx.moveTo(-r*.1,sy*r*.42);ctx.lineTo(r*.2,sy*r*1.0);ctx.lineTo(r*.42,sy*r*.35);ctx.closePath();ctx.fill();}this.drawEye(ctx,r*.62,-r*.2,r*.12);ctx.fillStyle='#d8ccff';ctx.globalAlpha=.7;for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(Math.cos(t*2+i)*r*.9,Math.sin(t*2.2+i)*r*.5,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    static drawVoidEel(ctx,r,wave,fish){const t=performance.now()*.001;ctx.strokeStyle='#7b4cff';ctx.lineWidth=Math.max(2,r*.18);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*1.25,0);ctx.bezierCurveTo(-r*.6,-r*.8,r*.15,r*.8,r*1.0,0);ctx.stroke();ctx.strokeStyle='#b89cff';ctx.lineWidth=Math.max(1,r*.04);ctx.beginPath();ctx.moveTo(-r*1.2,0);ctx.bezierCurveTo(-r*.5,-r*.7,r*.2,r*.7,r*.95,0);ctx.stroke();for(let i=0;i<4;i++){const a=t*1.2+i;ctx.fillStyle='#e5dcff';ctx.beginPath();ctx.arc(Math.cos(a)*r*.65,Math.sin(a)*r*.35,Math.max(1.5,r*.06),0,Math.PI*2);ctx.fill();}this.drawEye(ctx,r*.92,-r*.12,r*.1);}
    static drawAbyssRay(ctx,r,wave,fish){ctx.fillStyle='#26305f';ctx.beginPath();ctx.moveTo(r,0);ctx.quadraticCurveTo(0,-r*.95,-r*1.15,-r*.18);ctx.quadraticCurveTo(-r*.8,0,-r*1.15,r*.18);ctx.quadraticCurveTo(0,r*.95,r,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#6b83ff';ctx.lineWidth=Math.max(1,r*.04);ctx.stroke();ctx.fillStyle='#9c8cff';for(const sy of [-1,1]){ctx.beginPath();ctx.moveTo(-r*.2,sy*r*.2);ctx.lineTo(-r*.8,sy*r*1.0);ctx.lineTo(r*.05,sy*r*.38);ctx.closePath();ctx.fill();}this.drawEye(ctx,r*.48,-r*.18,r*.09);}
    static drawAbyssDevourer(ctx,r,wave,fish){const t=performance.now()*.001;this.drawBody(ctx,r,'#24143d',1.05,.78);ctx.fillStyle='#0b0615';ctx.beginPath();ctx.ellipse(r*.62,r*.05,r*.55,r*.42,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0e8ff';for(let i=0;i<9;i++){const a=-.4+i*.1;ctx.beginPath();ctx.moveTo(r*.35+i*r*.055,r*.1);ctx.lineTo(r*.39+i*r*.055,r*(.38+Math.sin(t+i)*.03));ctx.lineTo(r*.43+i*r*.055,r*.1);ctx.closePath();ctx.fill();}for(let i=0;i<6;i++){const a=t*.8+i;ctx.strokeStyle='#8b65ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.2+i*r*.08,-r*.5);ctx.lineTo(-r*.2+i*r*.08+Math.sin(a)*r*.08,r*.5);ctx.stroke();}this.drawEye(ctx,r*.55,-r*.3,r*.12);}
    static drawVoidSerpent(ctx,r,wave,fish){const t=performance.now()*.001;ctx.strokeStyle='#120a2c';ctx.lineWidth=r*.32;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.bezierCurveTo(-r*.7,-r*.7,r*.3,r*.7,r*1.2,0);ctx.stroke();ctx.strokeStyle='#6942c7';ctx.lineWidth=Math.max(2,r*.055);ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.bezierCurveTo(-r*.7,-r*.7,r*.3,r*.7,r*1.2,0);ctx.stroke();ctx.fillStyle='#8d70ff';for(let i=0;i<6;i++){const x=-r*.9+i*r*.32;ctx.beginPath();ctx.moveTo(x,-r*.2);ctx.lineTo(x+r*.12,-r*.5);ctx.lineTo(x+r*.22,-r*.18);ctx.closePath();ctx.fill();}this.drawEye(ctx,r*1.05,-r*.13,r*.1);ctx.fillStyle='#d8c8ff';for(let i=0;i<8;i++){const a=t*1.1+i*.8;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.1,Math.sin(a)*r*.6,2.2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

    static drawBody(ctx, r, color, scaleX = 1, scaleY = 0.68) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * scaleX, r * scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = Math.max(0.7, r * 0.035);
        ctx.stroke();
    }

    static drawEye(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + radius * 0.18, y, radius * 0.52, 0, Math.PI * 2);
        ctx.fillStyle = '#17202a';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + radius * 0.35, y - radius * 0.22, radius * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    static drawTail(ctx, r, color, width = 0.9, height = 0.65, rotation = 0) {
        ctx.save();
        ctx.translate(-r * 0.72, 0);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-r * width, -r * height, -r * 1.25, -r * height * 0.82);
        ctx.quadraticCurveTo(-r * 1.05, 0, -r * 1.25, r * height * 0.82);
        ctx.quadraticCurveTo(-r * width, r * height, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    static drawGuppy(ctx, r, color, wave) {
        this.drawTail(ctx, r, color, 0.82, 0.55, wave);
        this.drawBody(ctx, r, color, 1.05, 0.62);
        // Small dorsal fin
        ctx.beginPath();
        ctx.moveTo(-r * 0.15, -r * 0.5);
        ctx.lineTo(r * 0.12, -r * 0.9);
        ctx.lineTo(r * 0.35, -r * 0.43);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        this.drawEye(ctx, r * 0.58, -r * 0.2, Math.max(1.2, r * 0.16));
    }

    static drawClownfish(ctx, r, color, wave) {
        this.drawTail(ctx, r, '#f1f3f4', 0.86, 0.7, wave);
        this.drawBody(ctx, r, color, 1.0, 0.7);
        // White clownfish bands
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-r * 0.38, -r * 0.8, r * 0.17, r * 1.6);
        ctx.fillRect(r * 0.18, -r * 0.8, r * 0.17, r * 1.6);
        ctx.restore();
        // Black band outlines
        ctx.strokeStyle = 'rgba(20,20,20,0.65)';
        ctx.lineWidth = Math.max(0.8, r * 0.055);
        for (const x of [-r * 0.38, r * 0.35]) {
            ctx.beginPath(); ctx.moveTo(x, -r * 0.62); ctx.lineTo(x, r * 0.62); ctx.stroke();
        }
        this.drawEye(ctx, r * 0.57, -r * 0.22, Math.max(1.4, r * 0.17));
    }

    static drawPuffer(ctx, r, color, wave) {
        // Spikes make the medium fish immediately read as a puffer.
        ctx.save();
        ctx.globalAlpha = 0.92;
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            const inner = r * 0.72;
            const outer = r * 1.02;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a - 0.12) * inner, Math.sin(a - 0.12) * inner);
            ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
            ctx.lineTo(Math.cos(a + 0.12) * inner, Math.sin(a + 0.12) * inner);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.restore();
        this.drawBody(ctx, r, color, 0.86, 0.86);
        // Belly
        ctx.beginPath();
        ctx.arc(r * 0.16, r * 0.25, r * 0.43, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,236,190,0.7)';
        ctx.fill();
        this.drawEye(ctx, r * 0.48, -r * 0.28, Math.max(1.6, r * 0.17));
        this.drawTail(ctx, r, color, 0.58, 0.42, wave);
    }

    static drawAngelfish(ctx, r, color, wave) {
        this.drawTail(ctx, r, color, 0.88, 0.78, wave);
        // Tall body
        this.drawBody(ctx, r, color, 0.78, 1.0);
        // Long dorsal/ventral fins
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, -r * 0.62);
        ctx.lineTo(-r * 0.02, -r * 1.25);
        ctx.lineTo(r * 0.28, -r * 0.62);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-r * 0.22, r * 0.62);
        ctx.lineTo(r * 0.02, r * 1.18);
        ctx.lineTo(r * 0.3, r * 0.58);
        ctx.closePath();
        ctx.fill();
        // Vertical stripes
        ctx.save();
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.78, r, 0, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.42)';
        ctx.lineWidth = Math.max(1, r * 0.08);
        for (let x = -r * 0.35; x <= r * 0.35; x += r * 0.32) {
            ctx.beginPath(); ctx.moveTo(x, -r); ctx.lineTo(x, r); ctx.stroke();
        }
        ctx.restore();
        this.drawEye(ctx, r * 0.48, -r * 0.23, Math.max(1.8, r * 0.15));
    }

    static drawShark(ctx, r, color, wave) {
        // Powerful shark silhouette with dorsal fin and pointed snout.
        this.drawTail(ctx, r, color, 0.92, 0.82, wave);
        ctx.beginPath();
        ctx.moveTo(r * 0.95, 0);
        ctx.quadraticCurveTo(r * 0.55, -r * 0.68, -r * 0.45, -r * 0.52);
        ctx.quadraticCurveTo(-r * 0.92, -r * 0.36, -r * 0.78, 0);
        ctx.quadraticCurveTo(-r * 0.92, r * 0.36, -r * 0.45, r * 0.52);
        ctx.quadraticCurveTo(r * 0.55, r * 0.68, r * 0.95, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = Math.max(1, r * 0.035);
        ctx.stroke();
        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(-r * 0.05, -r * 0.48);
        ctx.lineTo(r * 0.18, -r * 1.0);
        ctx.lineTo(r * 0.38, -r * 0.4);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Gills
        ctx.strokeStyle = 'rgba(30,30,30,0.4)';
        ctx.lineWidth = Math.max(0.8, r * 0.045);
        for (let i = 0; i < 3; i++) {
            const x = r * 0.08 + i * r * 0.1;
            ctx.beginPath(); ctx.arc(x, r * 0.02, r * 0.25, Math.PI * 0.58, Math.PI * 1.08); ctx.stroke();
        }
        // Mouth
        ctx.beginPath();
        ctx.moveTo(r * 0.92, r * 0.05);
        ctx.quadraticCurveTo(r * 0.6, r * 0.25, r * 0.32, r * 0.16);
        ctx.strokeStyle = 'rgba(20,20,20,0.75)';
        ctx.lineWidth = Math.max(0.8, r * 0.035);
        ctx.stroke();
        this.drawEye(ctx, r * 0.62, -r * 0.25, Math.max(1.8, r * 0.11));
    }
    static drawFlameTetra(ctx, r, wave) {
        // Tiny: compact tetra silhouette — forked tail, deep chest and sharp dorsal.
        ctx.save();
        ctx.translate(-r * 0.72, 0);
        ctx.rotate(wave);
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-r * 1.05, -r * .58); ctx.lineTo(-r * .92, 0); ctx.lineTo(-r * 1.05, r * .58); ctx.closePath();
        ctx.fillStyle = '#7a160d'; ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(r*.85,0); ctx.quadraticCurveTo(r*.45,-r*.52,-r*.25,-r*.38);
        ctx.quadraticCurveTo(-r*.62,-r*.2,-r*.48,r*.2); ctx.quadraticCurveTo(-r*.2,r*.48,r*.85,0); ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r); g.addColorStop(0,'#ffd54a'); g.addColorStop(.45,'#ff8f00'); g.addColorStop(1,'#d84315'); ctx.fillStyle=g; ctx.fill();
        // oversized dorsal + anal fins
        ctx.fillStyle='#ff5b22';
        ctx.beginPath();ctx.moveTo(-r*.15,-r*.3);ctx.lineTo(r*.05,-r*.82);ctx.lineTo(r*.3,-r*.3);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(-r*.05,r*.25);ctx.lineTo(r*.18,r*.72);ctx.lineTo(r*.36,r*.2);ctx.closePath();ctx.fill();
        // bright lateral stripe
        ctx.strokeStyle='#fff0a6';ctx.lineWidth=Math.max(1,r*.07);ctx.beginPath();ctx.moveTo(-r*.35,0);ctx.lineTo(r*.62,0);ctx.stroke();
        this.drawEye(ctx,r*.57,-r*.16,Math.max(1.2,r*.13));
    }

    static drawInfernoLionfish(ctx, r, wave) {
        // Small: radically different spiky lionfish silhouette with fan fins.
        ctx.save();
        for(let i=0;i<12;i++){
            const a=-Math.PI*.9 + i/(11)*Math.PI*1.8;
            const len=r*(.9 + (i%2)*.18);
            ctx.beginPath();ctx.moveTo(-r*.15,-r*.25);ctx.lineTo(-r*.35+Math.cos(a)*len, Math.sin(a)*len);ctx.lineTo(r*.12,-r*.05);ctx.closePath();ctx.fillStyle=i%2?'#ff7043':'#8e1b12';ctx.fill();
        }
        ctx.restore();
        ctx.beginPath();ctx.ellipse(r*.05,0,r*.68,r*.5,0,0,Math.PI*2);ctx.fillStyle='#ff6f3d';ctx.fill();
        ctx.strokeStyle='#4d100b';ctx.lineWidth=Math.max(1,r*.055);
        for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-r*.15+i*r*.16,-r*.46);ctx.lineTo(-r*.05+i*r*.16,r*.46);ctx.stroke();}
        ctx.fillStyle='#ffb300';ctx.beginPath();ctx.moveTo(-r*.05,-r*.35);ctx.lineTo(r*.12,-r*.75);ctx.lineTo(r*.3,-r*.35);ctx.closePath();ctx.fill();
        this.drawEye(ctx,r*.5,-r*.15,Math.max(1.4,r*.15));
    }

    static drawMagmaAngler(ctx, r, wave) {
        // Medium: squat angler body, huge mouth and forehead lure.
        this.drawTail(ctx,r,'#7f1712',.55,.42,wave);
        ctx.beginPath();ctx.moveTo(r*.88,0);ctx.quadraticCurveTo(r*.5,-r*.72,-r*.4,-r*.58);ctx.quadraticCurveTo(-r*.88,-r*.4,-r*.78,r*.18);ctx.quadraticCurveTo(-r*.45,r*.7,r*.88,0);ctx.closePath();
        ctx.fillStyle='#b71c1c';ctx.fill();ctx.strokeStyle='#ff8a65';ctx.lineWidth=Math.max(1,r*.035);ctx.stroke();
        // lure stalk
        ctx.strokeStyle='#ffb300';ctx.lineWidth=Math.max(1,r*.05);ctx.beginPath();ctx.moveTo(r*.25,-r*.42);ctx.quadraticCurveTo(r*.42,-r*.95,r*.58,-r*.8);ctx.stroke();
        ctx.fillStyle='#ffe082';ctx.shadowBlur=10;ctx.shadowColor='#ff6d00';ctx.beginPath();ctx.arc(r*.59,-r*.8,Math.max(2,r*.1),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        // huge jaw + teeth
        ctx.beginPath();ctx.moveTo(r*.82,r*.05);ctx.quadraticCurveTo(r*.5,r*.48,-r*.05,r*.2);ctx.quadraticCurveTo(r*.45,r*.16,r*.82,r*.05);ctx.closePath();ctx.fillStyle='#250505';ctx.fill();
        ctx.fillStyle='#fff0c2';for(let i=0;i<5;i++){let x=r*.22+i*r*.1;ctx.beginPath();ctx.moveTo(x,r*.16);ctx.lineTo(x+r*.03,r*.33);ctx.lineTo(x+r*.06,r*.15);ctx.closePath();ctx.fill();}
        this.drawEye(ctx,r*.5,-r*.25,Math.max(1.7,r*.17));
    }

    static drawVolcanicManta(ctx, r, wave) {
        // Large: broad manta silhouette, wing-like fins and whip tail.
        ctx.save();ctx.translate(-r*.75,0);ctx.rotate(wave*.7);
        ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*.95,-r*.85,-r*1.35,-r*.45);ctx.quadraticCurveTo(-r*1.05,0,-r*1.35,r*.45);ctx.quadraticCurveTo(-r*.95,r*.85,0,0);ctx.fillStyle='#6d1515';ctx.fill();ctx.restore();
        ctx.beginPath();ctx.moveTo(r*.92,0);ctx.quadraticCurveTo(r*.2,-r*.75,-r*.55,-r*.28);ctx.quadraticCurveTo(-r*.9,0,-r*.55,r*.28);ctx.quadraticCurveTo(r*.2,r*.75,r*.92,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#ff7043');g.addColorStop(.5,'#a91b16');g.addColorStop(1,'#43100f');ctx.fillStyle=g;ctx.fill();
        // horns and volcanic ridge
        ctx.fillStyle='#ffb300';ctx.beginPath();ctx.moveTo(r*.15,-r*.28);ctx.lineTo(r*.35,-r*.95);ctx.lineTo(r*.5,-r*.25);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#ffd166';ctx.lineWidth=Math.max(1,r*.035);for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-r*.35+i*r*.18,-r*.12);ctx.lineTo(-r*.25+i*r*.18,r*.22);ctx.stroke();}
        this.drawEye(ctx,r*.56,-r*.12,Math.max(1.8,r*.12));
    }

    static drawHellfireMoray(ctx, r, wave) {
        // Huge: long serpentine moray body, not a shark silhouette.
        ctx.save();ctx.translate(-r*.65,0);ctx.rotate(wave*.45);
        ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*.7,-r*.5,-r*1.25,-r*.22);ctx.quadraticCurveTo(-r*1.55,0,-r*1.25,r*.22);ctx.quadraticCurveTo(-r*.7,r*.5,0,0);ctx.fillStyle='#3a0b0b';ctx.fill();ctx.restore();
        ctx.beginPath();ctx.moveTo(r*.98,0);ctx.quadraticCurveTo(r*.58,-r*.58,r*.05,-r*.48);ctx.quadraticCurveTo(-r*.38,-r*.4,-r*.52,0);ctx.quadraticCurveTo(-r*.38,r*.4,r*.05,r*.48);ctx.quadraticCurveTo(r*.58,r*.58,r*.98,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#8e2430');g.addColorStop(.5,'#4a1018');g.addColorStop(1,'#16070b');ctx.fillStyle=g;ctx.fill();
        // continuous dorsal ridge
        ctx.strokeStyle='#ff5722';ctx.lineWidth=Math.max(2,r*.07);ctx.beginPath();ctx.moveTo(-r*.42,-r*.4);ctx.quadraticCurveTo(0,-r*.72,r*.55,-r*.42);ctx.stroke();
        // gill slits
        ctx.strokeStyle='#ff8a65';ctx.lineWidth=Math.max(1,r*.03);for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(r*.15+i*r*.08,-r*.18);ctx.lineTo(r*.18+i*r*.08,r*.22);ctx.stroke();}
        // open moray mouth
        ctx.beginPath();ctx.moveTo(r*.92,0);ctx.quadraticCurveTo(r*.55,r*.32,r*.22,r*.1);ctx.quadraticCurveTo(r*.55,-r*.22,r*.92,0);ctx.closePath();ctx.fillStyle='#090304';ctx.fill();
        ctx.fillStyle='#f4d6a0';for(let i=0;i<6;i++){const x=r*.38+i*r*.07;ctx.beginPath();ctx.moveTo(x,-r*.05);ctx.lineTo(x+r*.025,-r*.18);ctx.lineTo(x+r*.05,-r*.04);ctx.closePath();ctx.fill();}
        this.drawEye(ctx,r*.62,-r*.2,Math.max(2,r*.11));
    }


    static drawToxicMinnow(ctx, r, wave) {
        this.drawTail(ctx,r,'#5b8c22',.72,.48,wave);
        this.drawBody(ctx,r,'#b8ff3d',1.0,.56);
        ctx.fillStyle='#eaff9c'; ctx.beginPath(); ctx.arc(-r*.05,0,r*.28,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#72e83b'; ctx.lineWidth=Math.max(1,r*.06); ctx.beginPath(); ctx.moveTo(-r*.25,-r*.42);ctx.lineTo(r*.32,-r*.42);ctx.stroke();
        this.drawEye(ctx,r*.58,-r*.18,Math.max(1.2,r*.13));
    }

    static drawRadioactivePiranha(ctx,r,wave) {
        this.drawTail(ctx,r,'#2d6f42',.85,.6,wave);
        ctx.beginPath();ctx.moveTo(r*.9,0);ctx.quadraticCurveTo(r*.35,-r*.65,-r*.45,-r*.48);ctx.quadraticCurveTo(-r*.9,-r*.25,-r*.65,r*.35);ctx.quadraticCurveTo(-r*.15,r*.65,r*.9,0);ctx.closePath();ctx.fillStyle='#72e83b';ctx.fill();
        ctx.fillStyle='#b7ff58';ctx.beginPath();ctx.arc(-r*.12,-r*.08,r*.23,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#172a16';ctx.beginPath();ctx.moveTo(r*.75,-r*.03);ctx.quadraticCurveTo(r*.45,r*.34,r*.12,r*.16);ctx.quadraticCurveTo(r*.45,r*.08,r*.75,-r*.03);ctx.fill();
        ctx.fillStyle='#eaffc2';for(let i=0;i<4;i++){const x=r*.22+i*r*.1;ctx.beginPath();ctx.moveTo(x,r*.12);ctx.lineTo(x+r*.03,r*.27);ctx.lineTo(x+r*.06,r*.12);ctx.closePath();ctx.fill();}
        this.drawEye(ctx,r*.57,-r*.2,Math.max(1.4,r*.14));
    }

    static drawMutantAngler(ctx,r,wave) {
        this.drawTail(ctx,r,'#1d8053',.55,.45,wave);
        ctx.beginPath();ctx.ellipse(0,0,r*.86,r*.62,0,0,Math.PI*2);ctx.fillStyle='#39c96b';ctx.fill();
        ctx.fillStyle='#164d39';ctx.beginPath();ctx.moveTo(r*.7,-r*.02);ctx.quadraticCurveTo(r*.35,r*.45,-r*.15,r*.18);ctx.quadraticCurveTo(r*.35,r*.12,r*.7,-r*.02);ctx.fill();
        ctx.strokeStyle='#b8ff3d';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(r*.1,-r*.42);ctx.quadraticCurveTo(r*.25,-r*.95,r*.48,-r*.82);ctx.stroke();
        ctx.fillStyle='#f2ffad';ctx.shadowBlur=12;ctx.shadowColor='#b8ff3d';ctx.beginPath();ctx.arc(r*.5,-r*.82,Math.max(2,r*.1),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        this.drawEye(ctx,r*.5,-r*.22,Math.max(1.6,r*.16));
    }

    static drawSludgeRay(ctx,r,wave) {
        ctx.save();ctx.translate(-r*.72,0);ctx.rotate(wave*.6);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*1.0,-r*.85,-r*1.35,-r*.38);ctx.quadraticCurveTo(-r*1.05,0,-r*1.35,r*.38);ctx.quadraticCurveTo(-r*1.0,r*.85,0,0);ctx.closePath();ctx.fillStyle='#145b49';ctx.fill();ctx.restore();
        ctx.beginPath();ctx.moveTo(r*.95,0);ctx.quadraticCurveTo(r*.2,-r*.8,-r*.58,-r*.3);ctx.quadraticCurveTo(-r*.95,0,-r*.58,r*.3);ctx.quadraticCurveTo(r*.2,r*.8,r*.95,0);ctx.closePath();ctx.fillStyle='#1f9b6c';ctx.fill();
        ctx.strokeStyle='#a8ff5c';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(-r*.45,0);ctx.quadraticCurveTo(0,-r*.22,r*.55,0);ctx.stroke();
        this.drawEye(ctx,r*.58,-r*.12,Math.max(1.8,r*.12));
    }

    static drawWastelandEel(ctx,r,wave) {
        ctx.save();ctx.translate(-r*.68,0);ctx.rotate(wave*.5);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*.8,-r*.52,-r*1.35,-r*.2);ctx.quadraticCurveTo(-r*1.55,0,-r*1.35,r*.2);ctx.quadraticCurveTo(-r*.8,r*.52,0,0);ctx.fillStyle='#0e4b3d';ctx.fill();ctx.restore();
        ctx.beginPath();ctx.moveTo(r*.98,0);ctx.quadraticCurveTo(r*.6,-r*.62,r*.05,-r*.48);ctx.quadraticCurveTo(-r*.4,-r*.3,-r*.5,0);ctx.quadraticCurveTo(-r*.35,r*.35,r*.05,r*.48);ctx.quadraticCurveTo(r*.6,r*.62,r*.98,0);ctx.closePath();ctx.fillStyle='#176b54';ctx.fill();
        ctx.strokeStyle='#70ff9a';ctx.lineWidth=Math.max(1,r*.035);for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-r*.25+i*r*.14,-r*.35);ctx.lineTo(-r*.18+i*r*.14,r*.35);ctx.stroke();}
        ctx.fillStyle='#07130f';ctx.beginPath();ctx.moveTo(r*.94,0);ctx.quadraticCurveTo(r*.5,r*.28,r*.18,r*.08);ctx.quadraticCurveTo(r*.5,-r*.2,r*.94,0);ctx.fill();
        this.drawEye(ctx,r*.62,-r*.2,Math.max(2,r*.11));
    }

    static drawToxicBoss(ctx,boss) {
        const r=boss.size/2, t=performance.now()*.002;
        ctx.save();ctx.translate(boss.x,boss.y);if(boss.speedX<0)ctx.scale(-1,1);
        ctx.globalAlpha=.18;ctx.fillStyle='#9dff2f';ctx.shadowBlur=40;ctx.shadowColor='#7dff37';ctx.beginPath();ctx.arc(0,0,r*1.22,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.save();ctx.rotate(t*.35);ctx.strokeStyle='#b8ff3d';ctx.lineWidth=Math.max(2,r*.045);ctx.setLineDash([r*.18,r*.1]);ctx.beginPath();ctx.arc(0,0,r*1.12,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
        this.drawTail(ctx,r,'#104d3b',1.0,.78,Math.sin(t)*.12);
        ctx.beginPath();ctx.moveTo(r*.98,0);ctx.quadraticCurveTo(r*.62,-r*.75,-r*.35,-r*.62);ctx.quadraticCurveTo(-r*.9,-r*.4,-r*.78,0);ctx.quadraticCurveTo(-r*.9,r*.4,-r*.35,r*.62);ctx.quadraticCurveTo(r*.62,r*.75,r*.98,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#b8ff3d');g.addColorStop(.48,'#42d66f');g.addColorStop(1,'#0c5944');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#d8ff79';ctx.lineWidth=Math.max(1,r*.035);ctx.stroke();
        ctx.fillStyle='#07130f';ctx.beginPath();ctx.moveTo(r*.95,.02);ctx.quadraticCurveTo(r*.55,r*.38,r*.12,r*.15);ctx.quadraticCurveTo(r*.55,r*.12,r*.95,.02);ctx.fill();
        ctx.fillStyle='#eaffb0';for(let i=0;i<7;i++){const x=r*.18+i*r*.09;ctx.beginPath();ctx.moveTo(x,r*.12);ctx.lineTo(x+r*.03,r*.3);ctx.lineTo(x+r*.06,r*.12);ctx.closePath();ctx.fill();}
        this.drawEye(ctx,r*.62,-r*.22,Math.max(2.5,r*.11));
        // toxic boils / glow spots
        for(let i=0;i<8;i++){const a=i*Math.PI*.8+t*.25, rr=r*(.35+.12*(i%3));ctx.fillStyle='rgba(220,255,100,.8)';ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr*.6,Math.max(2,r*.045),0,Math.PI*2);ctx.fill();}
        ctx.restore();
    }

    static drawToxicColossus(ctx,boss) {
        const r=boss.size/2, t=performance.now()*0.0015;
        ctx.save();ctx.translate(boss.x,boss.y);if(boss.speedX<0)ctx.scale(-1,1);
        // Massive pulsing toxic aura.
        const pulse=1+Math.sin(t*3)*0.035;
        ctx.save();ctx.scale(pulse,pulse);ctx.globalAlpha=.14;ctx.fillStyle='#9dff2f';ctx.shadowBlur=65;ctx.shadowColor='#7dff37';ctx.beginPath();ctx.arc(0,0,r*1.38,0,Math.PI*2);ctx.fill();ctx.restore();
        // Multiple animated contamination rings.
        for(let k=0;k<3;k++){
            ctx.save();ctx.rotate((k%2? -1:1)*t*(.35+k*.12));ctx.globalAlpha=.42-.08*k;ctx.strokeStyle=k===1?'#dfff72':'#7dff37';ctx.lineWidth=Math.max(2,r*(.018+k*.008));ctx.setLineDash([r*(.14+k*.03),r*(.08+k*.02)]);ctx.beginPath();ctx.ellipse(0,0,r*(1.12+k*.09),r*(.82+k*.08),k*.22,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
        }
        // Animated toxic tail.
        this.drawTail(ctx,r,'#0a3b2f',1.18,.9,Math.sin(t*2.6)*.16);
        // Huge armored mutant body.
        ctx.beginPath();ctx.moveTo(r*1.02,0);ctx.quadraticCurveTo(r*.74,-r*.92,-r*.22,-r*.82);ctx.quadraticCurveTo(-r*.96,-r*.65,-r*.88,0);ctx.quadraticCurveTo(-r*.96,r*.65,-r*.22,r*.82);ctx.quadraticCurveTo(r*.74,r*.92,r*1.02,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#d8ff52');g.addColorStop(.32,'#6ee23f');g.addColorStop(.7,'#25a85d');g.addColorStop(1,'#063b31');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#e9ff9b';ctx.lineWidth=Math.max(2,r*.028);ctx.stroke();
        // Toxic armor plates / animated veins.
        ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle='#baff55';ctx.lineWidth=Math.max(1.5,r*.018);for(let i=0;i<6;i++){const yy=(-.55+i*.22)*r;ctx.beginPath();ctx.moveTo(-r*.58,yy);ctx.quadraticCurveTo(-r*.05,yy+Math.sin(t*2+i)*r*.07,r*.58,yy-Math.sin(t*2+i)*r*.06);ctx.stroke();}ctx.restore();
        // Giant jaws.
        ctx.fillStyle='#061712';ctx.beginPath();ctx.moveTo(r*.98,0);ctx.quadraticCurveTo(r*.48,r*.42,r*.02,r*.18);ctx.quadraticCurveTo(r*.5,-r*.38,r*.98,0);ctx.fill();
        ctx.fillStyle='#edffd0';for(let i=0;i<9;i++){const x=r*.12+i*r*.085;ctx.beginPath();ctx.moveTo(x,r*.11);ctx.lineTo(x+r*.032,r*.31);ctx.lineTo(x+r*.064,r*.11);ctx.closePath();ctx.fill();}
        // Three glowing eyes for the evolved boss.
        for(const [ex,ey] of [[r*.48,-r*.34],[r*.68,-r*.08],[r*.42,r*.12]]){
            ctx.fillStyle='#efffb0';ctx.shadowBlur=16;ctx.shadowColor='#dfff72';ctx.beginPath();ctx.arc(ex,ey,Math.max(3.5,r*.075),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#152514';ctx.beginPath();ctx.arc(ex+r*.012,ey,Math.max(1.5,r*.032),0,Math.PI*2);ctx.fill();
        }
        // Floating toxic droplets/particles around the boss.
        for(let i=0;i<16;i++){const a=i*Math.PI*2/16+t*(.5+(i%3)*.12), rr=r*(1.02+.12*(i%4));const px=Math.cos(a)*rr, py=Math.sin(a)*rr*.72;ctx.globalAlpha=.45+.2*Math.sin(t*3+i);ctx.fillStyle=i%2?'#9dff2f':'#e4ff86';ctx.beginPath();ctx.arc(px,py,Math.max(2,r*(.018+(i%3)*.008)),0,Math.PI*2);ctx.fill();}
        // Reactor-like toxic core.
        const corePulse=1+Math.sin(t*4)*.12;ctx.globalAlpha=.8;ctx.fillStyle='#cfff52';ctx.shadowBlur=28;ctx.shadowColor='#aaff35';ctx.beginPath();ctx.arc(-r*.12,0,r*.16*corePulse,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.strokeStyle='#f1ffb0';ctx.lineWidth=Math.max(1,r*.018);ctx.beginPath();ctx.arc(-r*.12,0,r*.22,0,Math.PI*2);ctx.stroke();
        ctx.restore();
    }

    static drawAbyssWarden(ctx,boss){ this.drawAbyssVariant(ctx,boss,'#3c2d78','#9d8cff',1.0,2); }
    static drawVoidLeviathan(ctx,boss){ this.drawAbyssVariant(ctx,boss,'#17134f','#62d7ff',1.22,3); }
    static drawAbyssEmperor(ctx,boss){ this.drawAbyssVariant(ctx,boss,'#24103f','#e0b7ff',1.42,4); }
    static drawAbyssVariant(ctx,boss,body,glow,scale,eyes){
        const r=boss.size/2*scale,t=performance.now()*.001; const wave=Math.sin(t*1.6+boss.tailPhase)*.14; const bob=Math.sin(t*1.1+boss.bobPhase)*Math.min(9,r*.04);
        ctx.save();ctx.translate(boss.x,boss.y+bob);if(boss.speedX<0)ctx.scale(-1,1);
        ctx.save();ctx.globalAlpha=.16;ctx.shadowBlur=45;ctx.shadowColor=glow;ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,0,r*1.35,r*.9,0,0,Math.PI*2);ctx.fill();ctx.restore();
        for(let i=0;i<2+eyes/2;i++){ctx.save();ctx.rotate(t*(.22+i*.09)*(i%2?-1:1));ctx.globalAlpha=.28;ctx.strokeStyle=glow;ctx.lineWidth=Math.max(2,r*.014);ctx.setLineDash([r*.16,r*.08]);ctx.beginPath();ctx.ellipse(0,0,r*(1.08+i*.12),r*(.55+i*.08),0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
        this.drawTail(ctx,r,body,1.35,.95,wave);
        ctx.beginPath();ctx.moveTo(r*1.12,0);ctx.quadraticCurveTo(r*.7,-r*.95,-r*.25,-r*.8);ctx.quadraticCurveTo(-r,-r*.58,-r*.98,0);ctx.quadraticCurveTo(-r,r*.58,-r*.25,r*.8);ctx.quadraticCurveTo(r*.7,r*.95,r*1.12,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,glow);g.addColorStop(.3,body);g.addColorStop(1,'#050316');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=glow;ctx.lineWidth=Math.max(2,r*.022);ctx.stroke();
        ctx.fillStyle='#08051a';ctx.beginPath();ctx.moveTo(r*.98,0);ctx.quadraticCurveTo(r*.58,r*.52,r*.06,r*.25);ctx.quadraticCurveTo(r*.5,r*.1,r*.98,0);ctx.fill();
        ctx.fillStyle='#f5edff';for(let i=0;i<9;i++){const x=r*.18+i*r*.075;ctx.beginPath();ctx.moveTo(x,r*.17);ctx.lineTo(x+r*.025,r*.36);ctx.lineTo(x+r*.05,r*.16);ctx.closePath();ctx.fill();}
        for(let i=0;i<eyes;i++){const ex=r*(.42+(i%2)*.2),ey=-r*.25+(i%3)*r*.22;ctx.fillStyle='#fff';ctx.shadowBlur=18;ctx.shadowColor=glow;ctx.beginPath();ctx.arc(ex,ey,Math.max(4,r*.06),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#111';ctx.beginPath();ctx.arc(ex+r*.012,ey,Math.max(1.5,r*.025),0,Math.PI*2);ctx.fill();}
        for(let i=0;i<18;i++){const a=t*(.35+i*.02)+i*.8,rr=r*(1.0+(i%4)*.12);ctx.globalAlpha=.25+.2*Math.sin(t*3+i);ctx.fillStyle=i%2?glow:'#fff';ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr*.7,Math.max(2,r*.016),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.restore();
    }

    static drawGodOfAbyss(ctx,boss){
        const r=boss.size/2,t=performance.now()*.001,pulse=1+Math.sin(t*2.8)*.045,wave=Math.sin(t*1.35+boss.tailPhase)*.16;
        ctx.save();ctx.translate(boss.x,boss.y+Math.sin(t*1.1+boss.bobPhase)*Math.min(12,r*.035));if(boss.speedX<0)ctx.scale(-1,1);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.14;ctx.shadowBlur=110;ctx.shadowColor='#b9a0ff';ctx.fillStyle='#6e49ff';ctx.beginPath();ctx.ellipse(0,0,r*1.72*pulse,r*1.18*pulse,0,0,Math.PI*2);ctx.fill();ctx.restore();
        // Four divine abyss halos and rotating glyphs.
        for(let i=0;i<5;i++){ctx.save();ctx.rotate(t*(.18+i*.07)*(i%2?-1:1));ctx.globalAlpha=.34-i*.045;ctx.strokeStyle=i%2?'#e8dcff':'#8e6cff';ctx.lineWidth=Math.max(2,r*.014);ctx.setLineDash([r*(.12+i*.02),r*.06]);ctx.beginPath();ctx.ellipse(0,0,r*(1.15+i*.13),r*(.52+i*.08),i*.14,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
        // Crown silhouette.
        ctx.fillStyle='#17102d';ctx.strokeStyle='#d8c7ff';ctx.lineWidth=Math.max(2,r*.02);ctx.beginPath();ctx.moveTo(-r*.7,-r*.52);ctx.lineTo(-r*.52,-r*1.25);ctx.lineTo(-r*.2,-r*.72);ctx.lineTo(0,-r*1.55);ctx.lineTo(r*.22,-r*.75);ctx.lineTo(r*.5,-r*1.3);ctx.lineTo(r*.68,-r*.55);ctx.lineTo(r*.8,-r*.95);ctx.lineTo(r*.78,-r*.3);ctx.lineTo(-r*.7,-r*.52);ctx.closePath();ctx.fill();ctx.stroke();
        this.drawTail(ctx,r,'#08051c',1.85,1.25,wave);
        ctx.beginPath();ctx.moveTo(r*1.25,0);ctx.quadraticCurveTo(r*.8,-r*1.06,-r*.25,-r*.9);ctx.quadraticCurveTo(-r*1.1,-r*.68,-r*1.12,0);ctx.quadraticCurveTo(-r*1.1,r*.68,-r*.25,r*.9);ctx.quadraticCurveTo(r*.8,r*1.06,r*1.25,0);ctx.closePath();
        const g=ctx.createRadialGradient(-r*.2,-r*.2,r*.04,0,0,r*1.35);g.addColorStop(0,'#8f70ff');g.addColorStop(.28,'#46308f');g.addColorStop(.62,'#1a123d');g.addColorStop(1,'#03020d');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#cdbaff';ctx.lineWidth=Math.max(3,r*.024);ctx.stroke();
        // Divine core.
        ctx.globalAlpha=.95;ctx.fillStyle='#f2eaff';ctx.shadowBlur=45;ctx.shadowColor='#9f7dff';ctx.beginPath();ctx.arc(-r*.12,0,r*(.19+Math.sin(t*4)*.015),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(2,r*.018);ctx.beginPath();ctx.arc(-r*.12,0,r*.3,0,Math.PI*2);ctx.stroke();
        // Six god eyes.
        for(let i=0;i<6;i++){const ex=r*(.42+(i%3)*.13),ey=-r*.35+(i%3)*r*.24;ctx.fillStyle='#fff';ctx.shadowBlur=24;ctx.shadowColor='#b79cff';ctx.beginPath();ctx.ellipse(ex,ey,r*.085,r*.055,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#090511';ctx.beginPath();ctx.arc(ex+r*.018,ey,r*.03,0,Math.PI*2);ctx.fill();}
        // Layered jaw.
        ctx.fillStyle='#010108';ctx.strokeStyle='#bda8ff';ctx.beginPath();ctx.moveTo(r*1.22,0);ctx.quadraticCurveTo(r*.8,r*.68,r*.02,r*.34);ctx.quadraticCurveTo(r*.58,r*.12,r*1.22,0);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#fff7ff';for(let i=0;i<16;i++){const x=r*.2+i*r*.06;ctx.beginPath();ctx.moveTo(x,r*.2);ctx.lineTo(x+r*.024,r*.45);ctx.lineTo(x+r*.05,r*.19);ctx.closePath();ctx.fill();}
        // Dense divine sparks.
        ctx.globalCompositeOperation='lighter';for(let i=0;i<44;i++){const a=t*(.25+(i%7)*.045)+i*.72,rr=r*(1.0+(i%9)*.105),px=Math.cos(a)*rr,py=Math.sin(a)*rr*.72;ctx.globalAlpha=.25+.45*((Math.sin(t*4+i)+1)/2);ctx.fillStyle=i%4===0?'#fff':i%2?'#bda7ff':'#7654ff';ctx.beginPath();ctx.arc(px,py,Math.max(2,r*(.012+(i%3)*.006)),0,Math.PI*2);ctx.fill();}ctx.restore();
    }

    static drawToxicGodFish(ctx, boss) {
        const r = boss.size / 2;
        const t = performance.now() * 0.001;
        const pulse = 1 + Math.sin(t * 3.2) * 0.045;
        const wave = Math.sin(t * 1.4 + boss.tailPhase) * 0.13;
        const bob = Math.sin(t * 1.05 + boss.bobPhase) * Math.min(10, r * 0.035);

        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        // Deep toxic divine aura.
        ctx.save();
        ctx.globalAlpha = .12 + Math.sin(t * 2.4) * .025;
        ctx.shadowBlur = 80;
        ctx.shadowColor = '#69ff20';
        ctx.fillStyle = '#4cff19';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.62 * pulse, r * 1.08 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Four huge rotating contamination halos.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
            const a = t * (.32 + i * .08) * (i % 2 ? -1 : 1);
            ctx.save();
            ctx.rotate(a);
            ctx.globalAlpha = .28 - i * .035;
            ctx.strokeStyle = i % 2 ? '#d7ff63' : '#55ff24';
            ctx.lineWidth = Math.max(2, r * .018);
            ctx.setLineDash([r * .16, r * .08]);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * (1.18 + i * .18), r * (.48 + i * .075), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.setLineDash([]);
        ctx.restore();

        // Crown/spines: a "god fish" silhouette.
        ctx.fillStyle = '#132b18';
        ctx.strokeStyle = '#baff4d';
        ctx.lineWidth = Math.max(2, r * .022);
        ctx.beginPath();
        ctx.moveTo(-r*.72,-r*.48); ctx.lineTo(-r*.56,-r*1.18);
        ctx.lineTo(-r*.30,-r*.68); ctx.lineTo(-r*.05,-r*1.42);
        ctx.lineTo(r*.18,-r*.72); ctx.lineTo(r*.48,-r*1.22);
        ctx.lineTo(r*.64,-r*.55); ctx.lineTo(r*.78,-r*.92);
        ctx.lineTo(r*.76,-r*.32); ctx.lineTo(-r*.72,-r*.48); ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Massive tail.
        this.drawTail(ctx, r, '#071c13', 1.72, 1.18, wave);

        // Armored divine body.
        ctx.beginPath();
        ctx.moveTo(r*1.22,0);
        ctx.quadraticCurveTo(r*.72,-r*1.02,-r*.24,-r*.82);
        ctx.quadraticCurveTo(-r*1.08,-r*.60,-r*1.08,0);
        ctx.quadraticCurveTo(-r*1.08,r*.60,-r*.24,r*.82);
        ctx.quadraticCurveTo(r*.72,r*1.02,r*1.22,0);
        ctx.closePath();
        const g = ctx.createRadialGradient(-r*.15,-r*.15,r*.05,0,0,r*1.2);
        g.addColorStop(0,'#6fff35'); g.addColorStop(.32,'#257d38'); g.addColorStop(.7,'#103a28'); g.addColorStop(1,'#04120d');
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#baff54'; ctx.stroke();

        // Toxic divine armor plates.
        ctx.strokeStyle = 'rgba(213,255,93,.7)';
        ctx.lineWidth = Math.max(2,r*.014);
        for(let i=0;i<7;i++){
            const x=-r*.55+i*r*.18;
            ctx.beginPath(); ctx.moveTo(x,-r*.45); ctx.quadraticCurveTo(x+r*.07,0,x+r*.03,r*.48); ctx.stroke();
        }

        // Huge glowing toxic core.
        const core = r * (.18 + Math.sin(t*4.5)*.012);
        ctx.globalAlpha=.95; ctx.fillStyle='#dfff63'; ctx.shadowBlur=35; ctx.shadowColor='#7dff2c';
        ctx.beginPath(); ctx.arc(-r*.12,0,core,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        ctx.globalAlpha=.9; ctx.strokeStyle='#f5ffb8'; ctx.lineWidth=Math.max(2,r*.02);
        ctx.beginPath(); ctx.arc(-r*.12,0,r*.29,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=1;

        // Three god-eyes.
        for(const [ex,ey,scale] of [[r*.53,-r*.30,1],[r*.76,-r*.04,1.12],[r*.49,r*.20,.92]]){
            ctx.fillStyle='#f3ffc5'; ctx.shadowBlur=24; ctx.shadowColor='#9dff32';
            ctx.beginPath(); ctx.ellipse(ex,ey,r*.095*scale,r*.06*scale,0,0,Math.PI*2); ctx.fill();
            ctx.shadowBlur=0; ctx.fillStyle='#13220e';
            ctx.beginPath(); ctx.arc(ex+r*.02,ey,r*.035*scale,0,Math.PI*2); ctx.fill();
        }

        // Cathedral-like side fins.
        ctx.fillStyle='#17452a'; ctx.strokeStyle='#91ff42';
        for(const sy of [-1,1]){
            ctx.beginPath();
            ctx.moveTo(-r*.08,sy*r*.38);
            ctx.lineTo(-r*.55,sy*r*1.02);
            ctx.lineTo(r*.18,sy*r*.72);
            ctx.lineTo(r*.42,sy*r*.35);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }

        // Gigantic jaw and layered teeth.
        ctx.fillStyle='#020b07'; ctx.strokeStyle='#8cff3c';
        ctx.beginPath();
        ctx.moveTo(r*1.18,0); ctx.quadraticCurveTo(r*.78,r*.62,r*.02,r*.31);
        ctx.quadraticCurveTo(r*.56,r*.12,r*1.18,0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#f0ffb5';
        for(let i=0;i<12;i++){
            const x=r*.25+i*r*.065;
            ctx.beginPath(); ctx.moveTo(x,r*.20); ctx.lineTo(x+r*.028,r*.43); ctx.lineTo(x+r*.056,r*.18); ctx.closePath(); ctx.fill();
        }

        // Divine toxic sparks, droplets and orbiting motes.
        ctx.globalCompositeOperation='lighter';
        for(let i=0;i<30;i++){
            const a=t*(.35+(i%5)*.08)+i*.91;
            const rr=r*(1.02+(i%8)*.105);
            const px=Math.cos(a)*rr, py=Math.sin(a)*rr*.68;
            const q=Math.max(2,r*(.014+(i%3)*.008));
            ctx.globalAlpha=.35+.35*Math.sin(t*3+i);
            ctx.fillStyle=i%3===0?'#ffffff':(i%2?'#dfff67':'#72ff35');
            ctx.beginPath(); ctx.arc(px,py,q,0,Math.PI*2); ctx.fill();
        }
        // Toxic energy arcs.
        ctx.globalAlpha=.55; ctx.strokeStyle='#e8ff80'; ctx.lineWidth=Math.max(1.5,r*.014);
        for(let i=0;i<5;i++){
            const y=-r*.55+i*r*.27;
            ctx.beginPath(); ctx.moveTo(-r*1.05,y);
            ctx.lineTo(-r*.65,y-r*.09); ctx.lineTo(-r*.3,y+r*.11);
            ctx.lineTo(r*.12,y-r*.10); ctx.lineTo(r*.68,y); ctx.stroke();
        }
        ctx.restore();
    }

    static drawBoss(ctx, boss) {
        if (boss.species === 'abyssal_warden') { this.drawAbyssWarden(ctx,boss); return; }
        if (boss.species === 'void_leviathan') { this.drawVoidLeviathan(ctx,boss); return; }
        if (boss.species === 'abyss_emperor') { this.drawAbyssEmperor(ctx,boss); return; }
        if (boss.species === 'god_of_abyss') { this.drawGodOfAbyss(ctx,boss); return; }
        if (boss.species === 'toxic_god_fish') {
            this.drawToxicGodFish(ctx, boss);
            return;
        }
        if (boss.species === 'toxic_waste_colossus') {
            this.drawToxicColossus(ctx, boss);
            return;
        }
        if (boss.species === 'toxic_waste_titan') {
            this.drawToxicBoss(ctx, boss);
            return;
        }
        if (boss.species === 'inferno_tyrant') {
            this.drawInfernoTyrant(ctx, boss);
            return;
        }
        if (boss.species === 'inferno_colossus') {
            this.drawInfernoColossus(ctx, boss);
            return;
        }
        if (boss.species === 'inferno_god_fish') {
            this.drawInfernoGodFish(ctx, boss);
            return;
        }
        if (boss.stage === 3) {
            this.drawAncientLeviathan(ctx, boss);
            return;
        }
        if (boss.stage === 2) {
            this.drawAbyssalLeviathan(ctx, boss);
            return;
        }

        this.drawAbyssalMonster(ctx, boss);
    }

    static drawInfernoTyrant(ctx, boss) {
        const r=boss.size/2, t=performance.now()*.001;
        const wave=Math.sin(t*2+boss.tailPhase)*.14, bob=Math.sin(t*1.2+boss.bobPhase)*Math.min(4,r*.05);
        ctx.save();ctx.translate(boss.x,boss.y+bob);if(boss.speedX<0)ctx.scale(-1,1);
        ctx.save();ctx.globalAlpha=.2;ctx.shadowBlur=32;ctx.shadowColor='#ff3d00';ctx.fillStyle='#ff4500';ctx.beginPath();ctx.ellipse(0,0,r*1.25,r*.86,0,0,Math.PI*2);ctx.fill();ctx.restore();
        this.drawTail(ctx,r,'#7f170c',1.15,.9,wave);
        ctx.beginPath();ctx.moveTo(r*1.02,0);ctx.quadraticCurveTo(r*.62,-r*.78,-r*.3,-r*.7);ctx.quadraticCurveTo(-r*.92,-r*.48,-r*.86,0);ctx.quadraticCurveTo(-r*.92,r*.48,-r*.3,r*.7);ctx.quadraticCurveTo(r*.62,r*.78,r*1.02,0);ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#ff6d00');g.addColorStop(.45,'#d84315');g.addColorStop(1,'#5d0d0d');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#ffb347';ctx.lineWidth=Math.max(2,r*.03);ctx.stroke();
        // Crown-like volcanic fins
        ctx.fillStyle='#8e160d';ctx.beginPath();ctx.moveTo(-r*.5,-r*.58);ctx.lineTo(-r*.32,-r*1.18);ctx.lineTo(-r*.08,-r*.68);ctx.lineTo(r*.12,-r*1.3);ctx.lineTo(r*.3,-r*.62);ctx.lineTo(r*.52,-r*1.05);ctx.lineTo(r*.48,-r*.48);ctx.closePath();ctx.fill();
        // Molten cracks
        ctx.strokeStyle='#ffd166';ctx.lineWidth=Math.max(1.5,r*.025);for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-r*.35+i*r*.15,-r*.45);ctx.lineTo(-r*.28+i*r*.14,r*.42);ctx.stroke();}
        // Four jagged side fins
        for(const sy of [-1,1]){ctx.beginPath();ctx.moveTo(r*.02,sy*r*.45);ctx.lineTo(-r*.35,sy*r*.98);ctx.lineTo(r*.48,sy*r*.75);ctx.closePath();ctx.fillStyle='#8e160d';ctx.fill();}
        // Fiery eyes
        for(const sy of [-1,1]){ctx.beginPath();ctx.arc(r*.6,sy*r*.2,Math.max(5,r*.11),0,Math.PI*2);ctx.fillStyle='#ffe082';ctx.shadowBlur=18;ctx.shadowColor='#ff6d00';ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#2b0502';ctx.beginPath();ctx.arc(r*.62,sy*r*.2,Math.max(2,r*.04),0,Math.PI*2);ctx.fill();}
        // Huge jaw + teeth
        ctx.beginPath();ctx.moveTo(r*1.0,0);ctx.quadraticCurveTo(r*.68,r*.55,r*.1,r*.28);ctx.quadraticCurveTo(r*.55,r*.18,r*1.0,0);ctx.closePath();ctx.fillStyle='#260604';ctx.fill();
        ctx.fillStyle='#fff1c1';for(let i=0;i<8;i++){const x=r*.34+i*r*.07;ctx.beginPath();ctx.moveTo(x,r*.2);ctx.lineTo(x+r*.03,r*.38);ctx.lineTo(x+r*.06,r*.18);ctx.closePath();ctx.fill();}
        // Smoke/embers around body
        ctx.fillStyle='#ffcc66';for(let i=0;i<7;i++){const a=t*.7+i;const x=Math.cos(a*1.7)*r*.9,y=Math.sin(a*1.3)*r*.75;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(x,y,Math.max(2,r*.025),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
        ctx.restore();
    }

    static drawInfernoColossus(ctx, boss) {
        const r = boss.size / 2, t = performance.now() * 0.001;
        const wave = Math.sin(t * 1.45 + boss.tailPhase) * 0.12;
        const bob = Math.sin(t * 0.9 + boss.bobPhase) * Math.min(8, r * 0.04);
        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        // Massive molten aura
        ctx.save();
        ctx.globalAlpha = .16;
        ctx.shadowBlur = 42;
        ctx.shadowColor = '#ff2a00';
        ctx.fillStyle = '#ff3d00';
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.42, r * .94, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Armored tail / rear fins
        this.drawTail(ctx, r, '#4b0806', 1.55, 1.08, wave);
        ctx.fillStyle = '#650d08';
        for (let i = 0; i < 4; i++) {
            const x = -r * .62 + i * r * .22;
            ctx.beginPath(); ctx.moveTo(x, -r * .42); ctx.lineTo(x - r * .13, -r * 1.18); ctx.lineTo(x + r * .13, -r * .48); ctx.closePath(); ctx.fill();
        }

        // Colossal body
        ctx.beginPath();
        ctx.moveTo(r * 1.08, 0);
        ctx.quadraticCurveTo(r * .64, -r * .9, -r * .32, -r * .76);
        ctx.quadraticCurveTo(-r * 1.02, -r * .54, -r * 1.0, 0);
        ctx.quadraticCurveTo(-r * 1.02, r * .54, -r * .32, r * .76);
        ctx.quadraticCurveTo(r * .64, r * .9, r * 1.08, 0);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, -r, 0, r);
        g.addColorStop(0, '#ff6a00'); g.addColorStop(.38, '#c6280f'); g.addColorStop(.72, '#74100a'); g.addColorStop(1, '#280304');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = '#ffb347'; ctx.lineWidth = Math.max(3, r * .025); ctx.stroke();

        // Giant magma armor plates
        ctx.fillStyle = '#3d0504';
        for (let i = 0; i < 5; i++) {
            const x = -r * .5 + i * r * .25;
            ctx.beginPath(); ctx.moveTo(x - r * .09, -r * .52); ctx.quadraticCurveTo(x, -r * .72, x + r * .12, -r * .48); ctx.lineTo(x + r * .1, r * .48); ctx.quadraticCurveTo(x, r * .7, x - r * .09, r * .5); ctx.closePath(); ctx.fill();
        }

        // Molten cracks
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = Math.max(2, r * .018);
        for (let i = 0; i < 7; i++) {
            const x = -r * .48 + i * r * .15;
            ctx.beginPath(); ctx.moveTo(x, -r * .48); ctx.lineTo(x + Math.sin(t * 2 + i) * r * .05, r * .45); ctx.stroke();
        }

        // Huge side horns/fins
        ctx.fillStyle = '#500705';
        for (const sy of [-1, 1]) {
            ctx.beginPath(); ctx.moveTo(-r * .05, sy * r * .46); ctx.lineTo(-r * .48, sy * r * 1.08); ctx.lineTo(r * .34, sy * r * .72); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(r * .25, sy * r * .42); ctx.lineTo(r * .58, sy * r * 1.02); ctx.lineTo(r * .68, sy * r * .35); ctx.closePath(); ctx.fill();
        }

        // Four blazing eyes
        for (const sy of [-1, 1]) {
            ctx.beginPath(); ctx.arc(r * .57, sy * r * .2, Math.max(7, r * .095), 0, Math.PI * 2);
            ctx.fillStyle = '#fff1a8'; ctx.shadowBlur = 25; ctx.shadowColor = '#ff3d00'; ctx.fill(); ctx.shadowBlur = 0;
            ctx.fillStyle = '#240202'; ctx.beginPath(); ctx.arc(r * .6, sy * r * .2, Math.max(3, r * .035), 0, Math.PI * 2); ctx.fill();
        }

        // Devastating jaw
        ctx.beginPath(); ctx.moveTo(r * 1.08, 0); ctx.quadraticCurveTo(r * .72, r * .65, r * .08, r * .32); ctx.quadraticCurveTo(r * .52, r * .12, r * 1.08, 0); ctx.closePath(); ctx.fillStyle = '#180202'; ctx.fill();
        ctx.fillStyle = '#fff0c0';
        for (let i = 0; i < 11; i++) {
            const x = r * .25 + i * r * .06;
            ctx.beginPath(); ctx.moveTo(x, r * .22); ctx.lineTo(x + r * .025, r * .42); ctx.lineTo(x + r * .05, r * .2); ctx.closePath(); ctx.fill();
        }

        // Floating embers / heat sparks
        ctx.fillStyle = '#ffcc66';
        for (let i = 0; i < 14; i++) {
            const a = t * .55 + i * .72;
            const rr = r * (.88 + (i % 3) * .12);
            const x = Math.cos(a * 1.7) * rr, y = Math.sin(a * 1.25) * rr * .72;
            ctx.globalAlpha = .25 + (i % 3) * .1;
            ctx.beginPath(); ctx.arc(x, y, Math.max(2, r * .018 + (i % 2) * 1), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    static drawAbyssalMonster(ctx, boss) {
        const r = boss.size / 2;
        const t = performance.now() * 0.001;
        const wave = Math.sin(t * 2.5 + boss.tailPhase) * 0.12;
        const bob = Math.sin(t * 1.8 + boss.bobPhase) * Math.min(3, r * 0.06);
        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        ctx.save();
        ctx.translate(-r * 0.72, 0);
        ctx.rotate(wave);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-r * 0.7, -r * 0.9, -r * 1.25, -r * 0.55);
        ctx.quadraticCurveTo(-r * 1.05, 0, -r * 1.25, r * 0.55);
        ctx.quadraticCurveTo(-r * 0.7, r * 0.9, 0, 0);
        ctx.fillStyle = boss.color; ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.98, r * 0.68, 0, 0, Math.PI * 2);
        ctx.fillStyle = boss.color; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-r * 0.15, -r * 0.55);
        ctx.lineTo(r * 0.12, -r * 1.12);
        ctx.lineTo(r * 0.38, -r * 0.5);
        ctx.closePath(); ctx.fillStyle = boss.color; ctx.fill();

        ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = Math.max(1, r * 0.045);
        ctx.beginPath(); ctx.moveTo(r * 0.38, -r * 0.35); ctx.quadraticCurveTo(r * 0.62, -r * 0.95, r * 0.7, -r * 1.18); ctx.stroke();
        ctx.beginPath(); ctx.arc(r * 0.7, -r * 1.2, Math.max(2, r * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = '#ffe66d'; ctx.fill();
        ctx.shadowBlur = 12; ctx.shadowColor = '#ffe66d'; ctx.fill(); ctx.shadowBlur = 0;

        this.drawEye(ctx, r * 0.63, -r * 0.2, Math.max(3, r * 0.12));

        ctx.beginPath();
        ctx.moveTo(r * 0.95, r * 0.02);
        ctx.quadraticCurveTo(r * 0.55, r * 0.38, r * 0.15, r * 0.2);
        ctx.strokeStyle = 'rgba(20,20,20,0.8)'; ctx.lineWidth = Math.max(1, r * 0.035); ctx.stroke();
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            const x = r * 0.32 + i * r * 0.1;
            ctx.beginPath(); ctx.moveTo(x, r * 0.22); ctx.lineTo(x + r * 0.035, r * 0.34); ctx.lineTo(x + r * 0.07, r * 0.2); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }

    // Level 2 final boss: a much larger abyssal leviathan with armored plates,
    // multiple horns, glowing eyes, jagged fins and tentacle-like lower fins.
    static drawAbyssalLeviathan(ctx, boss) {
        const r = boss.size / 2;
        const t = performance.now() * 0.001;
        const wave = Math.sin(t * 2.0 + boss.tailPhase) * 0.16;
        const bob = Math.sin(t * 1.25 + boss.bobPhase) * Math.min(5, r * 0.055);

        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        // Threat aura.
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.shadowBlur = 28;
        ctx.shadowColor = '#b84cff';
        ctx.fillStyle = '#6b1f8f';
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.18, r * 0.82, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Huge split tail.
        ctx.save();
        ctx.translate(-r * 0.78, 0);
        ctx.rotate(wave);
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-r * 0.55, side * r * 0.65, -r * 1.28, side * r * 0.95);
            ctx.quadraticCurveTo(-r * 1.08, side * r * 0.3, -r * 0.25, 0);
            ctx.closePath();
            ctx.fillStyle = '#54206f'; ctx.fill();
            ctx.strokeStyle = 'rgba(20,0,30,0.5)'; ctx.lineWidth = Math.max(1.5, r * 0.025); ctx.stroke();
        }
        ctx.restore();

        // Armored leviathan body.
        ctx.beginPath();
        ctx.moveTo(r * 1.0, 0);
        ctx.quadraticCurveTo(r * 0.65, -r * 0.7, -r * 0.35, -r * 0.68);
        ctx.quadraticCurveTo(-r * 0.95, -r * 0.5, -r * 0.92, 0);
        ctx.quadraticCurveTo(-r * 0.95, r * 0.5, -r * 0.35, r * 0.68);
        ctx.quadraticCurveTo(r * 0.65, r * 0.7, r * 1.0, 0);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, -r, 0, r);
        grad.addColorStop(0, '#32114b');
        grad.addColorStop(0.48, '#6b1f8f');
        grad.addColorStop(1, '#250b38');
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = '#b84cff';
        ctx.lineWidth = Math.max(1.5, r * 0.025); ctx.stroke();

        // Jagged dorsal crown.
        ctx.fillStyle = '#8e35b8';
        ctx.beginPath();
        ctx.moveTo(-r * 0.48, -r * 0.57);
        ctx.lineTo(-r * 0.3, -r * 1.15);
        ctx.lineTo(-r * 0.08, -r * 0.72);
        ctx.lineTo(r * 0.12, -r * 1.3);
        ctx.lineTo(r * 0.3, -r * 0.68);
        ctx.lineTo(r * 0.52, -r * 1.05);
        ctx.lineTo(r * 0.48, -r * 0.5);
        ctx.closePath(); ctx.fill();

        // Side fins / claws.
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(r * 0.05, side * r * 0.48);
            ctx.quadraticCurveTo(-r * 0.1, side * r * 0.95, r * 0.5, side * r * 1.02);
            ctx.quadraticCurveTo(r * 0.36, side * r * 0.58, r * 0.2, side * r * 0.4);
            ctx.closePath();
            ctx.fillStyle = '#54206f'; ctx.fill();
        }

        // Glowing horn crown.
        ctx.strokeStyle = '#d86cff';
        ctx.lineWidth = Math.max(2, r * 0.03);
        for (const dx of [-0.38, -0.12, 0.16, 0.4]) {
            ctx.beginPath();
            ctx.moveTo(r * dx, -r * 0.45);
            ctx.lineTo(r * (dx + 0.06), -r * (0.95 + Math.abs(dx) * 0.25));
            ctx.stroke();
        }

        // Two angry glowing eyes.
        for (const sy of [-1, 1]) {
            ctx.beginPath(); ctx.arc(r * 0.57, sy * r * 0.2, Math.max(4, r * 0.105), 0, Math.PI * 2);
            ctx.fillStyle = '#ff3b81'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff3b81'; ctx.fill(); ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(r * 0.59, sy * r * 0.2, Math.max(1.5, r * 0.035), 0, Math.PI * 2);
            ctx.fillStyle = '#fff'; ctx.fill();
        }

        // Huge jaw with layered teeth.
        ctx.beginPath();
        ctx.moveTo(r * 0.98, 0);
        ctx.quadraticCurveTo(r * 0.65, r * 0.48, r * 0.08, r * 0.24);
        ctx.quadraticCurveTo(r * 0.55, r * 0.18, r * 0.98, 0);
        ctx.closePath();
        ctx.fillStyle = '#160b20'; ctx.fill();
        ctx.strokeStyle = '#140a1c'; ctx.lineWidth = Math.max(1, r * 0.025); ctx.stroke();
        ctx.fillStyle = '#f6f2ff';
        for (let i = 0; i < 7; i++) {
            const x = r * 0.38 + i * r * 0.075;
            ctx.beginPath(); ctx.moveTo(x, r * 0.17); ctx.lineTo(x + r * 0.035, r * 0.36); ctx.lineTo(x + r * 0.07, r * 0.15); ctx.closePath(); ctx.fill();
        }

        // Bioluminescent body markings.
        ctx.strokeStyle = 'rgba(216,108,255,0.65)';
        ctx.lineWidth = Math.max(1, r * 0.018);
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(-r * 0.15 + i * r * 0.12, 0, r * (0.22 + i * 0.025), Math.PI * 0.75, Math.PI * 1.25);
            ctx.stroke();
        }

        // Tentacle-like lower feelers.
        ctx.strokeStyle = '#8e35b8';
        ctx.lineWidth = Math.max(2, r * 0.022);
        ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
            const x = i * r * 0.17;
            ctx.beginPath();
            ctx.moveTo(x, r * 0.52);
            ctx.bezierCurveTo(x - r * 0.12, r * 0.8, x + Math.sin(t * 1.5 + i) * r * 0.12, r * 0.95, x + r * 0.08, r * 1.12);
            ctx.stroke();
        }
        ctx.restore();
    }



    // Level 3 final boss: colossal Ancient Leviathan. It is intentionally
    // much larger and visually distinct from both previous bosses.
    static drawAncientLeviathan(ctx, boss) {
        const r = boss.size / 2;
        const t = performance.now() * 0.001;
        const wave = Math.sin(t * 1.25 + boss.tailPhase) * 0.12;
        const bob = Math.sin(t * 0.8 + boss.bobPhase) * Math.min(7, r * 0.045);

        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        // Colossal shadow / aura.
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.shadowBlur = 42;
        ctx.shadowColor = '#7c4dff';
        ctx.fillStyle = '#17102f';
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.28, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Massive triple-pronged tail.
        ctx.save();
        ctx.translate(-r * 0.78, 0);
        ctx.rotate(wave);
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-r * 0.65, side * r * 0.7, -r * 1.55, side * r * 1.12);
            ctx.lineTo(-r * 1.25, side * r * 0.28);
            ctx.quadraticCurveTo(-r * 0.55, side * r * 0.18, 0, 0);
            ctx.closePath();
            ctx.fillStyle = '#35205f'; ctx.fill();
            ctx.strokeStyle = '#8c6cff'; ctx.lineWidth = Math.max(2, r * 0.018); ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, 0);
        ctx.quadraticCurveTo(-r * 1.0, -r * 0.18, -r * 1.65, 0);
        ctx.quadraticCurveTo(-r * 1.0, r * 0.18, -r * 0.35, 0);
        ctx.fillStyle = '#24153f'; ctx.fill();
        ctx.restore();

        // Huge armored body.
        ctx.beginPath();
        ctx.moveTo(r * 1.08, 0);
        ctx.quadraticCurveTo(r * 0.78, -r * 0.78, r * 0.05, -r * 0.76);
        ctx.quadraticCurveTo(-r * 0.72, -r * 0.72, -r * 0.98, -r * 0.2);
        ctx.quadraticCurveTo(-r * 1.0, 0, -r * 0.98, r * 0.2);
        ctx.quadraticCurveTo(-r * 0.72, r * 0.72, r * 0.05, r * 0.76);
        ctx.quadraticCurveTo(r * 0.78, r * 0.78, r * 1.08, 0);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, -r, 0, r);
        grad.addColorStop(0, '#160c2e');
        grad.addColorStop(0.45, '#3c2468');
        grad.addColorStop(1, '#0d071c');
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = '#8c6cff'; ctx.lineWidth = Math.max(2, r * 0.02); ctx.stroke();

        // Ancient stone-like armor plates.
        for (let i = -3; i <= 3; i++) {
            const x = i * r * 0.19;
            ctx.beginPath();
            ctx.moveTo(x - r * 0.1, -r * 0.55);
            ctx.lineTo(x + r * 0.08, -r * 0.68);
            ctx.lineTo(x + r * 0.16, r * 0.48);
            ctx.lineTo(x, r * 0.58);
            ctx.closePath();
            ctx.fillStyle = i % 2 ? '#4e347d' : '#2c1b50';
            ctx.fill();
            ctx.strokeStyle = 'rgba(170,140,255,0.35)';
            ctx.lineWidth = Math.max(1, r * 0.012); ctx.stroke();
        }

        // Enormous crown horns.
        ctx.fillStyle = '#7b63c9';
        for (const dx of [-0.48, -0.24, 0, 0.25, 0.5]) {
            ctx.beginPath();
            ctx.moveTo(r * dx, -r * 0.55);
            ctx.quadraticCurveTo(r * (dx - 0.05), -r * 1.02, r * (dx + 0.06), -r * 1.48);
            ctx.lineTo(r * (dx + 0.15), -r * 0.58);
            ctx.closePath(); ctx.fill();
        }

        // Giant side fins.
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(r * 0.05, side * r * 0.48);
            ctx.quadraticCurveTo(-r * 0.15, side * r * 1.15, r * 0.72, side * r * 1.28);
            ctx.quadraticCurveTo(r * 0.58, side * r * 0.66, r * 0.28, side * r * 0.4);
            ctx.closePath();
            ctx.fillStyle = '#2b174d'; ctx.fill();
            ctx.strokeStyle = '#7656bd'; ctx.lineWidth = Math.max(1.5, r * 0.016); ctx.stroke();
        }

        // Three glowing eyes.
        for (const [ex, ey, scale] of [[0.61, -0.27, 1], [0.68, 0, 1.15], [0.61, 0.27, 1]]) {
            ctx.beginPath(); ctx.arc(r * ex, r * ey, Math.max(5, r * 0.07 * scale), 0, Math.PI * 2);
            ctx.fillStyle = '#ff315c'; ctx.shadowBlur = 20; ctx.shadowColor = '#ff315c'; ctx.fill(); ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(r * (ex + 0.012), r * ey, Math.max(1.5, r * 0.025), 0, Math.PI * 2);
            ctx.fillStyle = '#fff'; ctx.fill();
        }

        // Catastrophic jaw and oversized teeth.
        ctx.beginPath();
        ctx.moveTo(r * 1.06, 0);
        ctx.quadraticCurveTo(r * 0.62, r * 0.62, r * 0.05, r * 0.28);
        ctx.quadraticCurveTo(r * 0.52, r * 0.12, r * 1.06, 0);
        ctx.closePath();
        ctx.fillStyle = '#080511'; ctx.fill();
        ctx.strokeStyle = '#030208'; ctx.lineWidth = Math.max(1.5, r * 0.018); ctx.stroke();
        ctx.fillStyle = '#eee9ff';
        for (let i = 0; i < 10; i++) {
            const x = r * 0.28 + i * r * 0.075;
            ctx.beginPath();
            ctx.moveTo(x, r * 0.17); ctx.lineTo(x + r * 0.035, r * (0.37 + (i % 2) * 0.08)); ctx.lineTo(x + r * 0.07, r * 0.15);
            ctx.closePath(); ctx.fill();
        }

        // Ancient glowing runes.
        ctx.strokeStyle = 'rgba(174,137,255,0.8)';
        ctx.lineWidth = Math.max(1, r * 0.012);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(-r * 0.2 + i * r * 0.15, 0, r * (0.17 + Math.abs(i) * 0.025), Math.PI * 0.2, Math.PI * 1.8);
            ctx.stroke();
        }

        // Long lower tendrils.
        ctx.strokeStyle = '#5f42a0'; ctx.lineWidth = Math.max(2, r * 0.014); ctx.lineCap = 'round';
        for (let i = -3; i <= 3; i++) {
            const x = i * r * 0.14;
            ctx.beginPath();
            ctx.moveTo(x, r * 0.57);
            ctx.bezierCurveTo(x - r * 0.18, r * 0.9, x + Math.sin(t + i) * r * 0.16, r * 1.25, x + r * 0.08, r * 1.48);
            ctx.stroke();
        }
        ctx.restore();
    }

    static drawInfernoGodFish(ctx, boss) {
        const r = boss.size / 2, t = performance.now() * 0.001;
        const wave = Math.sin(t * 1.2 + boss.tailPhase) * 0.1;
        const bob = Math.sin(t * 0.7 + boss.bobPhase) * Math.min(12, r * 0.035);
        ctx.save();
        ctx.translate(boss.x, boss.y + bob);
        if (boss.speedX < 0) ctx.scale(-1, 1);

        // Divine inferno aura.
        ctx.save(); ctx.globalAlpha = .22; ctx.shadowBlur = 70; ctx.shadowColor = '#ff6a00';
        const aura = ctx.createRadialGradient(0,0,r*.25,0,0,r*1.55);
        aura.addColorStop(0,'#ffd166'); aura.addColorStop(.35,'#ff6b00'); aura.addColorStop(1,'rgba(80,0,0,0)');
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0,0,r*1.55,0,Math.PI*2); ctx.fill(); ctx.restore();

        // Rotating divine rings.
        ctx.save(); ctx.globalAlpha=.75; ctx.strokeStyle='#ffb300'; ctx.lineWidth=Math.max(2,r*.018);
        for(let i=0;i<3;i++){ const a=t*(.55+i*.16)+i*2.1; ctx.save(); ctx.rotate(a); ctx.scale(1,.28); ctx.beginPath(); ctx.arc(0,0,r*(1.12+i*.12),0,Math.PI*2); ctx.stroke(); ctx.restore(); }
        ctx.restore();

        this.drawTail(ctx,r,'#5b0805',1.75,1.22,wave);
        // Massive armored body.
        ctx.beginPath(); ctx.moveTo(r*1.12,0); ctx.quadraticCurveTo(r*.7,-r*.9,-r*.2,-r*.78); ctx.quadraticCurveTo(-r*1.02,-r*.55,-r*1.0,0); ctx.quadraticCurveTo(-r*1.02,r*.55,-r*.2,r*.78); ctx.quadraticCurveTo(r*.7,r*.9,r*1.12,0); ctx.closePath();
        const g=ctx.createLinearGradient(0,-r,0,r); g.addColorStop(0,'#ff9d00'); g.addColorStop(.35,'#e63b0f'); g.addColorStop(.7,'#8f120b'); g.addColorStop(1,'#250403'); ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle='#ffd166'; ctx.lineWidth=Math.max(2,r*.025); ctx.stroke();

        // God crown / horns.
        ctx.fillStyle='#6f0b07';
        for(const [x,h] of [[-.62,1.45],[-.34,1.75],[-.05,1.55],[.24,1.85],[.52,1.5]]){ ctx.beginPath(); ctx.moveTo(r*x,-r*.5); ctx.lineTo(r*(x-.1),-r*h); ctx.lineTo(r*(x+.11),-r*.58); ctx.closePath(); ctx.fill(); }
        // Molten rune cracks.
        ctx.strokeStyle='#ffe082'; ctx.lineWidth=Math.max(2,r*.018);
        for(let i=0;i<8;i++){ const x=-r*.55+i*r*.16; ctx.beginPath(); ctx.moveTo(x,-r*.5); ctx.lineTo(x+r*.05,-r*.08); ctx.lineTo(x-r*.03,r*.35); ctx.stroke(); }

        // Huge side fins.
        for(const side of [-1,1]){ ctx.beginPath(); ctx.moveTo(-r*.05,side*r*.45); ctx.quadraticCurveTo(-r*.25,side*r*1.2,r*.72,side*r*1.42); ctx.quadraticCurveTo(r*.58,side*r*.65,r*.3,side*r*.4); ctx.closePath(); ctx.fillStyle='#4d0806'; ctx.fill(); ctx.strokeStyle='#ff6a00'; ctx.lineWidth=Math.max(2,r*.018); ctx.stroke(); }

        // Three god eyes.
        for(const [ex,ey,rr] of [[.62,-.28,.09],[.72,0,.12],[.62,.28,.09]]){ ctx.beginPath(); ctx.arc(r*ex,r*ey,Math.max(7,r*rr),0,Math.PI*2); ctx.fillStyle='#fff0a6'; ctx.shadowBlur=28; ctx.shadowColor='#ff4d00'; ctx.fill(); ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(r*(ex+.015),r*ey,Math.max(2,r*.028),0,Math.PI*2); ctx.fillStyle='#3b0502'; ctx.fill(); }

        // Cataclysmic jaw.
        ctx.beginPath(); ctx.moveTo(r*1.12,0); ctx.quadraticCurveTo(r*.7,r*.72,r*.02,r*.36); ctx.quadraticCurveTo(r*.55,r*.1,r*1.12,0); ctx.closePath(); ctx.fillStyle='#100202'; ctx.fill();
        ctx.fillStyle='#fff4cf'; for(let i=0;i<14;i++){ const x=r*.25+i*r*.065; ctx.beginPath(); ctx.moveTo(x,r*.22); ctx.lineTo(x+r*.035,r*(.43+(i%2)*.09)); ctx.lineTo(x+r*.07,r*.2); ctx.closePath(); ctx.fill(); }

        // Fire particles / divine sparks.
        ctx.fillStyle='#ffd166'; for(let i=0;i<18;i++){ const a=t*.65+i*.83, dist=r*(.95+(i%4)*.1); const x=Math.cos(a)*dist, y=Math.sin(a)*dist*.7; ctx.globalAlpha=.35+.25*Math.sin(t*2+i); ctx.beginPath(); ctx.arc(x,y,Math.max(2,r*.018+(i%3)*1),0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha=1; ctx.restore();
    }

}
