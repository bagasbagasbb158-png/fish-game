// FishRenderer.js - Shared cosmetic fish renderer for Shop previews and gameplay.
// The same skin data drives both views so a purchased skin looks the same in-game.
export class FishRenderer {
    static draw(ctx, x, y, size, skin, options = {}) {
        if (!skin) return;
        const angle = options.angle ?? 0;
        const time = options.time ?? performance.now();
        const animated = options.animated !== false;
        const rarity = skin.rarity || 'common';
        const r = size / 2;
        const tailSwing = animated ? Math.sin(time * 0.004 + (options.phase || 0)) * 0.14 : 0;
        const bob = animated ? Math.sin(time * 0.003 + (options.phase || 0)) * Math.min(2.5, size * 0.035) : 0;
        const pattern = skin.pattern || 'none';
        const finStyle = skin.finStyle || 'standard';
        const tailStyle = skin.tailStyle || 'standard';

        ctx.save();
        ctx.translate(x, y + bob);
        // Mirror horizontally for left-facing movement instead of rotating the fish 180°.
        // This keeps fins/eyes upright while preserving the natural body orientation.
        const facingLeft = options.facingLeft ?? (Math.cos(angle) < 0);
        let lean = options.lean ?? (facingLeft ? angle - Math.PI : angle);
        // Hard clamp: cosmetic tilt is always a small upright lean.
        lean = Math.max(-0.32, Math.min(0.32, lean));
        if (facingLeft) ctx.scale(-1, 1);
        ctx.rotate(lean);

        // Premium cosmetic effects: Epic and Myth are intentionally much more dramatic.
        if (skin.effect && skin.effect !== 'none') this.drawPremiumEffect(ctx, r, skin, time, animated);

        // Tail.
        ctx.save();
        ctx.translate(-r * 0.78, 0);
        ctx.rotate(tailSwing);
        ctx.fillStyle = skin.finColor || skin.bodyColor;
        ctx.beginPath();
        switch (tailStyle) {
            case 'long_flowing': case 'comet_tail': case 'dragon_tail': case 'nebula_tail': case 'whip_tail':
                ctx.moveTo(0, 0); ctx.quadraticCurveTo(-r * 1.15, -r * 0.85, -r * 1.55, -r * 0.2);
                ctx.quadraticCurveTo(-r * 1.25, 0, -r * 1.55, r * 0.2);
                ctx.quadraticCurveTo(-r * 1.15, r * 0.85, 0, 0); break;
            case 'lightning_bolt':
                ctx.moveTo(0,0); ctx.lineTo(-r*0.8,-r*0.8); ctx.lineTo(-r*1.25,-r*0.25); ctx.lineTo(-r*1.8,-r*0.35);
                ctx.lineTo(-r*1.05,r*0.1); ctx.lineTo(-r*1.55,r*0.75); ctx.closePath(); break;
            case 'fan_shape': case 'fan':
                ctx.moveTo(0,0); ctx.lineTo(-r*1.45,-r*1.0); ctx.lineTo(-r*1.7,0); ctx.lineTo(-r*1.45,r*1.0); ctx.closePath(); break;
            case 'prism_tail':
                ctx.moveTo(0,0); ctx.lineTo(-r*1.45,-r*0.95); ctx.lineTo(-r*1.75,0); ctx.lineTo(-r*1.45,r*0.95); ctx.closePath(); break;
            case 'event_horizon':
                ctx.arc(-r*0.85,0,r*0.72,0,Math.PI*2); break;
            default:
                ctx.moveTo(0,0); ctx.lineTo(-r*1.35,-r*0.65); ctx.lineTo(-r*1.35,r*0.65); ctx.closePath();
        }
        ctx.fill();
        ctx.restore();

        // Dorsal/ventral fins.
        this.drawFin(ctx, r, skin, finStyle, false);
        this.drawFin(ctx, r, skin, finStyle, true);

        // Main body silhouette.
        ctx.fillStyle = skin.bodyColor || '#ff6b35';
        ctx.beginPath();
        const bodyScaleX = ['serpentine'].includes(finStyle) ? 1.18 : 1.0;
        ctx.ellipse(0, 0, r * bodyScaleX, r * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();

        // Secondary belly / stripe base.
        if (skin.secondaryColor) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = skin.secondaryColor;
            ctx.beginPath();
            ctx.ellipse(r * 0.12, r * 0.20, r * 0.72, r * 0.24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Pattern layer.
        this.drawPattern(ctx, r, skin, pattern);

        // Specialty geometry.
        this.drawSpecialGeometry(ctx, r, skin, finStyle, tailStyle, time);

        // Eye.
        ctx.fillStyle = skin.eyeColor || '#fff';
        ctx.beginPath(); ctx.arc(r * 0.58, -r * 0.25, Math.max(3, r * 0.14), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = skin.pupilColor || '#111';
        ctx.beginPath(); ctx.arc(r * 0.62, -r * 0.25, Math.max(1.5, r * 0.065), 0, Math.PI * 2); ctx.fill();

        // Premium eye shine.
        if (rarity === 'epic' || rarity === 'myth' || rarity === 'ultra') {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(r * 0.60, -r * 0.30, Math.max(1, r * 0.025), 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }

        this.drawOrnament(ctx, r, skin, time);
        // Draw the highest-rarity VFX again over the fish for a layered, premium finish.
        if (rarity === 'ultra' && skin.effect) this.drawUltraOverlay(ctx, r, skin, time);
        else if (rarity === 'myth' && skin.effect) this.drawMythOverlay(ctx, r, skin, time);
        ctx.restore();
    }


    static drawPremiumEffect(ctx, r, skin, time, animated) {
        const rarity = skin.rarity || 'common';
        const t = time * 0.001;
        const pulse = 0.72 + Math.sin(t * 4) * 0.28;
        const color = skin.secondaryColor || skin.finColor || '#fff';
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Every Epic/Myth gets a readable aura.
        ctx.globalAlpha = rarity === 'ultra' ? 0.26 * pulse : (rarity === 'myth' ? 0.18 * pulse : 0.12 * pulse);
        ctx.fillStyle = color;
        ctx.shadowBlur = rarity === 'ultra' ? r * 1.05 : (rarity === 'myth' ? r * 0.7 : r * 0.45);
        ctx.shadowColor = color;
        ctx.beginPath(); ctx.arc(0, 0, r * (1.25 + 0.05 * pulse), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        if (rarity === 'epic') {
            // 10 orbiting sparks + a breathing ring.
            ctx.globalAlpha = 0.75;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, r * 0.025);
            ctx.beginPath(); ctx.arc(0, 0, r * (1.02 + Math.sin(t * 3) * 0.05), 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 10; i++) {
                const a = t * (1.2 + i * 0.03) + i * Math.PI * 2 / 10;
                const rr = r * (1.05 + (i % 3) * 0.13);
                const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
                const spark = Math.max(1, r * (0.025 + (i % 2) * 0.018));
                ctx.beginPath(); ctx.moveTo(x - spark * 2, y); ctx.lineTo(x, y - spark * 3); ctx.lineTo(x + spark * 2, y); ctx.lineTo(x, y + spark * 3); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
            }
            // Effect-specific signature.
            if (skin.effect === 'electric_arcs') {
                ctx.strokeStyle = '#8be9ff'; ctx.lineWidth = Math.max(1, r * 0.035);
                for (let i=0;i<3;i++) { const y=-r*0.55+i*r*0.55; ctx.beginPath(); ctx.moveTo(-r*1.1,y); ctx.lineTo(-r*.65,y-r*.12); ctx.lineTo(-r*.2,y+r*.1); ctx.lineTo(r*.3,y-r*.08); ctx.lineTo(r*.95,y); ctx.stroke(); }
            } else if (skin.effect === 'light_refraction') {
                ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.55;
                for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-r*.8+i*r*.4,-r*.7); ctx.lineTo(-r*.15+i*r*.4,r*.7); ctx.stroke(); }
            } else if (skin.effect === 'ember_glow') {
                ctx.fillStyle = '#ffb347';
                for(let i=0;i<9;i++){ const a=t*1.8+i*2.4; const rr=r*(.8+(i%4)*.16); ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*.035,0,Math.PI*2);ctx.fill(); }
            } else if (skin.effect === 'distortion_wave') {
                ctx.strokeStyle = '#9b59ff';
                for(let i=0;i<2;i++){ctx.globalAlpha=.42-i*.12;ctx.beginPath();ctx.ellipse(0,0,r*(1.15+i*.2),r*(.7+i*.15),t*.25,0,Math.PI*2);ctx.stroke();}
            } else if (skin.effect === 'deep_glow') {
                ctx.fillStyle='#ff365d';
                for(let i=0;i<5;i++){const a=t*1.5+i*1.25;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.1,Math.sin(a)*r*.72,r*.045,0,Math.PI*2);ctx.fill();}
            }
        } else if (rarity === 'ultra') {
            // MYTH ULTRA = GOD FISH. Massive dimensional VFX, divine halo, portals and sparks.
            const god = skin.secondaryColor || '#e8d7ff';
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = god;
            ctx.lineWidth = Math.max(2, r * 0.032);
            // Three rotating divine halos.
            for (let i = 0; i < 4; i++) {
                const rr = r * (1.18 + i * 0.25);
                ctx.globalAlpha = 0.72 - i * 0.1;
                ctx.beginPath();
                ctx.ellipse(0, 0, rr, rr * (0.38 + i * 0.07), t * (0.28 + i * 0.08) * (i % 2 ? -1 : 1), 0, Math.PI * 2);
                ctx.stroke();
            }
            // Divine rays / crown.
            ctx.globalAlpha = 0.5 + 0.2 * pulse;
            for (let i = 0; i < 12; i++) {
                const a = t * 0.35 + i * Math.PI / 6;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.45);
                ctx.lineTo(Math.cos(a) * r * (1.55 + 0.12 * Math.sin(t * 3 + i)), Math.sin(a) * r * (1.05 + 0.08 * Math.sin(t * 3 + i)));
                ctx.stroke();
            }
            // God sparks + starbursts.
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 22; i++) {
                const a = -t * (0.7 + (i % 4) * 0.13) + i * 0.92;
                const rr = r * (1.0 + (i % 7) * 0.12);
                const px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.72;
                const q = r * (0.025 + (i % 3) * 0.018);
                ctx.beginPath(); ctx.moveTo(px - q * 2, py); ctx.lineTo(px, py - q * 4); ctx.lineTo(px + q * 2, py); ctx.lineTo(px, py + q * 4); ctx.closePath(); ctx.fill();
            }
            // Dimensional rifts.
            ctx.strokeStyle = skin.effect === 'eclipse_dimension' ? '#ffb84d' : '#a855f7';
            ctx.lineWidth = Math.max(2, r * 0.025);
            for (let i = 0; i < 5; i++) {
                const a = -t * 0.45 + i * 1.256;
                const rr = r * (1.32 + 0.08 * Math.sin(t * 2 + i));
                ctx.beginPath();
                ctx.arc(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18, rr * 0.55, a, a + 1.35);
                ctx.stroke();
            }
            // Signature god-fish effects.
            if (skin.effect === 'astral_dimension') {
                ctx.globalAlpha = 0.22; ctx.fillStyle = '#8be9ff';
                ctx.beginPath(); ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 0.9; ctx.fillStyle = '#7dd3fc';
                for (let i = 0; i < 6; i++) { const a = t * 1.4 + i * 1.05; const rr = r * 1.65; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * .55, r * .045, 0, Math.PI * 2); ctx.fill(); }
            } else if (skin.effect === 'eclipse_dimension') {
                ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = r * 0.07;
                ctx.beginPath(); ctx.arc(0, 0, r * 1.58, t * 0.6, t * 0.6 + Math.PI * 1.45); ctx.stroke();
                ctx.fillStyle = '#ff8c42';
                for (let i = 0; i < 12; i++) { const a = -t * 1.8 + i * .52; const rr = r * (1.3 + (i%3)*.16); ctx.beginPath(); ctx.arc(Math.cos(a)*rr, Math.sin(a)*rr*.65, r*(.025+(i%2)*.018), 0, Math.PI*2); ctx.fill(); }
            }
        } else if (rarity === 'myth') {
            // Myth = dimensional spectacle: multiple rings, orbiting motes, sparks and tears.
            ctx.globalAlpha = 0.85;
            const mythColor = skin.secondaryColor || '#f1c40f';
            ctx.strokeStyle = mythColor;
            ctx.lineWidth = Math.max(1.5, r * 0.025);
            for (let i=0;i<3;i++) {
                const rr=r*(1.05+i*.25);
                ctx.beginPath(); ctx.ellipse(0,0,rr,rr*(.48+i*.08),t*(.25+i*.12),0,Math.PI*2); ctx.stroke();
            }
            // Dimension tears: jagged portals around the body.
            ctx.strokeStyle = skin.effect === 'cosmic_storm' ? '#c77dff' : mythColor;
            for(let i=0;i<4;i++){
                const a=t*.55+i*Math.PI/2, rr=r*(1.18+.12*Math.sin(t*2+i));
                const x=Math.cos(a)*rr, y=Math.sin(a)*rr;
                ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a+.5)*r*.22,y+Math.sin(a+.5)*r*.22);ctx.lineTo(x+Math.cos(a-.35)*r*.18,y+Math.sin(a-.35)*r*.18);ctx.stroke();
            }
            // 14 star/spark motes.
            for(let i=0;i<14;i++){
                const a=t*(.65+(i%3)*.12)+i*.73;
                const rr=r*(1.0+(i%5)*.12);
                const x=Math.cos(a)*rr,y=Math.sin(a)*rr, q=r*(.025+(i%2)*.02);
                ctx.beginPath();ctx.moveTo(x-q*2,y);ctx.lineTo(x,y-q*3);ctx.lineTo(x+q*2,y);ctx.lineTo(x,y+q*3);ctx.closePath();ctx.fillStyle=i%3===0?'#fff':mythColor;ctx.fill();
            }
            // Effect signatures.
            if(skin.effect==='aurora_borealis'){
                for(let i=0;i<4;i++){ctx.globalAlpha=.22;ctx.strokeStyle=i%2?'#74d9ff':'#b86cff';ctx.lineWidth=r*.08;ctx.beginPath();ctx.arc(0,0,r*(1.15+i*.08),Math.PI*(.15+i*.2),Math.PI*(.85+i*.2));ctx.stroke();}
            } else if(skin.effect==='fire_breath'){
                ctx.globalAlpha=.65;ctx.fillStyle='#ff7b00';
                for(let i=0;i<7;i++){const px=r*(.7+i*.16),py=Math.sin(t*5+i)*r*(.12+i*.015);ctx.beginPath();ctx.arc(px,py,r*(.05+(7-i)*.008),0,Math.PI*2);ctx.fill();}
            } else if(skin.effect==='cosmic_storm'){
                ctx.strokeStyle='#8f5cff';ctx.lineWidth=Math.max(1,r*.03);
                for(let i=0;i<5;i++){const a=t*2+i*1.2;ctx.beginPath();ctx.arc(0,0,r*(.9+i*.08),a,a+1.1);ctx.stroke();}
            }
            else if(skin.effect==='astral_dimension'){
                ctx.strokeStyle='#7dd3fc'; ctx.lineWidth=Math.max(1,r*.022);
                for(let i=0;i<5;i++){
                    const a=t*(.45+i*.08)+i*1.256; const rr=r*(1.05+i*.18);
                    ctx.beginPath(); ctx.arc(0,0,rr,a,a+1.25); ctx.stroke();
                    ctx.fillStyle=i%2?'#fff':'#67e8f9'; ctx.beginPath(); ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*.035,0,Math.PI*2); ctx.fill();
                }
                ctx.globalAlpha=.35; ctx.fillStyle='#38bdf8'; ctx.beginPath(); ctx.arc(0,0,r*1.55,0,Math.PI*2); ctx.fill();
            } else if(skin.effect==='eclipse_dimension'){
                ctx.strokeStyle='#ffcc66'; ctx.lineWidth=Math.max(1,r*.035);
                for(let i=0;i<3;i++){
                    const rr=r*(1.2+i*.28), a=t*(.3+i*.12);
                    ctx.beginPath(); ctx.ellipse(0,0,rr,rr*(.42+i*.08),a,0,Math.PI*2); ctx.stroke();
                }
                ctx.globalAlpha=.8; ctx.fillStyle='#ff9f43';
                for(let i=0;i<10;i++){ const a=-t*1.4+i*.63; const rr=r*(1.15+(i%3)*.2); ctx.beginPath(); ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*(.025+(i%2)*.018),0,Math.PI*2); ctx.fill(); }
                ctx.globalAlpha=.55; ctx.strokeStyle='#8f5cff'; ctx.lineWidth=r*.05; ctx.beginPath(); ctx.arc(0,0,r*1.7,t,t+Math.PI*1.2); ctx.stroke();
            }
        }
        ctx.restore();
    }

    static drawUltraOverlay(ctx, r, skin, time) {
        const t = time * 0.001;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const c = skin.effect === 'eclipse_dimension' ? '#ffd166' : '#d8b4fe';
        ctx.strokeStyle = c;
        ctx.lineWidth = Math.max(2, r * 0.028);
        // Huge divine crown/halo.
        for (let i = 0; i < 3; i++) {
            const rr = r * (1.45 + i * 0.2);
            ctx.globalAlpha = 0.55 - i * 0.12;
            ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.42, t * (0.25 + i * 0.1), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 10; i++) {
            const a = t * 0.3 + i * Math.PI / 5;
            ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*.75, Math.sin(a)*r*.5); ctx.lineTo(Math.cos(a)*r*1.55, Math.sin(a)*r*1.0); ctx.stroke();
        }
        ctx.restore();
    }

    static drawMythOverlay(ctx, r, skin, time) {
        const t=time*.001;
        ctx.save();
        ctx.globalCompositeOperation='lighter';
        // Crown-like rays make Myth instantly recognizable even at small size.
        ctx.strokeStyle=skin.secondaryColor||'#f1c40f';
        ctx.lineWidth=Math.max(1,r*.022);
        ctx.globalAlpha=.65+.2*Math.sin(t*3);
        for(let i=0;i<8;i++){
            const a=t*.25+i*Math.PI/4;
            ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.78,Math.sin(a)*r*.48);ctx.lineTo(Math.cos(a)*r*1.28,Math.sin(a)*r*.8);ctx.stroke();
        }
        ctx.restore();
    }

    static drawFin(ctx, r, skin, style, lower) {
        ctx.save();
        ctx.fillStyle = skin.finColor || skin.bodyColor;
        const side = lower ? 1 : -1;
        ctx.beginPath();
        const y = side * r * 0.45;
        switch (style) {
            case 'crystal_fins': case 'needle_fin': case 'icicle':
                ctx.moveTo(-r*0.1,y); ctx.lineTo(r*0.25,y + side*r*0.9); ctx.lineTo(r*0.62,y + side*r*0.15); ctx.closePath(); break;
            case 'dragon_wings': case 'phoenix_wings': case 'celestial_fins': case 'emperor_fins':
                ctx.moveTo(-r*0.15,y); ctx.lineTo(r*0.25,y + side*r*1.15); ctx.lineTo(r*0.7,y + side*r*0.65); ctx.lineTo(r*0.5,y); ctx.closePath(); break;
            case 'serpentine': case 'void_tendrils':
                ctx.moveTo(-r*0.1,y); ctx.quadraticCurveTo(r*0.3,y+side*r*0.7,r*0.75,y+side*r*0.25); ctx.lineTo(r*0.45,y); ctx.closePath(); break;
            case 'fan': case 'flower_like': case 'royal_fan': case 'butterfly':
                ctx.moveTo(-r*0.2,y); ctx.quadraticCurveTo(r*0.1,y+side*r*0.95,r*0.75,y+side*r*0.55); ctx.lineTo(r*0.45,y); ctx.closePath(); break;
            default:
                ctx.moveTo(-r*0.2,y); ctx.lineTo(r*0.35,y+side*r*0.55); ctx.lineTo(r*0.55,y); ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
    }

    static drawPattern(ctx, r, skin, pattern) {
        const c = skin.secondaryColor || skin.finColor || '#fff';
        const s = skin.patternScale || 1;
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = Math.max(1.5, r * 0.07);
        if (pattern.includes('stripe') || pattern.includes('bands') || pattern.includes('lines')) {
            const count = 3 + Math.round(s);
            for (let i=0;i<count;i++) { const x=-r*0.45+i*r*0.28; ctx.beginPath(); ctx.moveTo(x,-r*0.52); ctx.lineTo(x+r*0.08,r*0.52); ctx.stroke(); }
        } else if (pattern.includes('spot') || pattern.includes('speckle') || pattern.includes('dot')) {
            for (let i=0;i<5;i++) { const x=-r*0.25+(i%3)*r*0.28, y=-r*0.25+Math.floor(i/3)*r*0.3; ctx.beginPath(); ctx.arc(x,y,r*0.07*s,0,Math.PI*2); ctx.fill(); }
        } else if (pattern.includes('crystal') || pattern.includes('facet')) {
            for (let i=0;i<4;i++) { const x=-r*0.25+i*r*0.18; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+r*0.1,-r*0.35); ctx.lineTo(x+r*0.2,0); ctx.lineTo(x+r*0.1,r*0.3); ctx.closePath(); ctx.stroke(); }
        } else if (pattern.includes('scale')) {
            for (let row=0;row<2;row++) for (let i=0;i<5;i++) { const x=-r*0.55+i*r*0.25+(row%2)*r*0.12,y=-r*0.25+row*r*0.3; ctx.beginPath(); ctx.arc(x,y,r*0.13,Math.PI,Math.PI*2); ctx.stroke(); }
        } else if (pattern.includes('constellation') || pattern.includes('cosmic') || pattern.includes('star')) {
            for (let i=0;i<6;i++) { const x=-r*0.55+(i*37%100)/100*r*1.05, y=-r*0.5+(i*61%100)/100*r; ctx.beginPath(); ctx.arc(x,y,r*0.035+((i%2)*r*0.025),0,Math.PI*2); ctx.fill(); }
        } else if (pattern !== 'none') {
            ctx.beginPath(); ctx.moveTo(-r*0.65,-r*0.12); ctx.quadraticCurveTo(0,r*0.5,r*0.65,-r*0.12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-r*0.45,-r*0.35); ctx.quadraticCurveTo(0,0,r*0.45,-r*0.35); ctx.stroke();
        }
        ctx.restore();
    }

    static drawSpecialGeometry(ctx, r, skin, finStyle, tailStyle, time) {
        ctx.save();
        ctx.strokeStyle = skin.secondaryColor || '#fff';
        ctx.fillStyle = skin.finColor || skin.secondaryColor || skin.bodyColor;
        ctx.lineWidth = Math.max(1.5, r*0.045);
        if (finStyle === 'crystal_fins') {
            for (let i=0;i<3;i++) { const x=-r*0.25+i*r*0.25; ctx.beginPath(); ctx.moveTo(x,-r*0.45); ctx.lineTo(x+r*0.12,-r*0.95); ctx.lineTo(x+r*0.25,-r*0.45); ctx.closePath(); ctx.fill(); }
        }
        if (finStyle.includes('dragon') || skin.ornament === 'horns_and_spikes') {
            for (const x of [-0.25,0.05,0.35]) { ctx.beginPath(); ctx.moveTo(r*x,-r*0.5); ctx.lineTo(r*(x+0.12),-r*0.95); ctx.lineTo(r*(x+0.22),-r*0.48); ctx.closePath(); ctx.fill(); }
        }
        if (skin.rarity === 'myth' || skin.rarity === 'ultra') {
            ctx.globalAlpha = 0.75;
            ctx.beginPath(); ctx.arc(0,0,r*0.82,0,Math.PI*2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    static drawOrnament(ctx, r, skin, time) {
        const o = skin.ornament || '';
        ctx.save();
        ctx.strokeStyle = skin.secondaryColor || '#fff';
        ctx.fillStyle = skin.secondaryColor || skin.finColor || '#fff';
        ctx.lineWidth = Math.max(1.5, r*0.05);
        if (o.includes('eyepatch')) { ctx.beginPath(); ctx.moveTo(r*0.43,-r*0.43); ctx.lineTo(r*0.72,-r*0.08); ctx.stroke(); }
        if (o.includes('helmet')) { ctx.beginPath(); ctx.arc(r*0.25,-r*0.05,r*0.65,Math.PI*1.05,Math.PI*1.95); ctx.stroke(); }
        if (o.includes('jewel') || o.includes('crown')) {
            ctx.beginPath(); ctx.moveTo(-r*0.1,-r*0.55); ctx.lineTo(0,-r*0.85); ctx.lineTo(r*0.18,-r*0.58); ctx.lineTo(r*0.35,-r*0.88); ctx.lineTo(r*0.48,-r*0.45); ctx.stroke();
        }
        if (o.includes('horn')) {
            ctx.beginPath(); ctx.moveTo(-r*0.05,-r*0.48); ctx.lineTo(r*0.08,-r*1.0); ctx.lineTo(r*0.2,-r*0.48); ctx.fill();
        }
        if (o.includes('crystal')) {
            for (let i=0;i<3;i++) { const a=time*0.001+i*2.1; const x=Math.cos(a)*r*1.05, y=Math.sin(a)*r*0.7; ctx.beginPath(); ctx.moveTo(x,y-r*0.08); ctx.lineTo(x+r*0.08,y); ctx.lineTo(x,y+r*0.08); ctx.lineTo(x-r*0.08,y); ctx.closePath(); ctx.fill(); }
        }
        if (o.includes('lure')) { ctx.beginPath(); ctx.moveTo(r*0.15,-r*0.45); ctx.lineTo(r*0.15,-r*0.95); ctx.stroke(); ctx.beginPath(); ctx.arc(r*0.15,-r*1.03,r*0.12,0,Math.PI*2); ctx.fill(); }
        if (o.includes('planet') || o.includes('orbit')) { ctx.beginPath(); ctx.ellipse(0,0,r*1.25,r*0.5,0.35,0,Math.PI*2); ctx.stroke(); }
        ctx.restore();
    }
}
