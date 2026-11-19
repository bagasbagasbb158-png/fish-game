// UIManager.js - Canvas UI for HUNGER FISH
import { CoinFeedback } from '../gameplay/CoinFeedback.js';
import { XPFeedback } from '../gameplay/XPFeedback.js';
import { LevelUpFeedback } from '../gameplay/LevelUpFeedback.js';
import { PurchaseFeedback } from '../gameplay/PurchaseFeedback.js';
import { SkinData } from '../data/SkinData.js';
import { FishRenderer } from '../gameplay/FishRenderer.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'Arial, sans-serif';
        this.bossMessageActive = false;
        this.bossMessageTimer = 0;
        this.coinFeedbacks = [];
        this.xpFeedbacks = [];
        this.levelUpNotifications = [];
        this.purchaseFeedbacks = [];
        this.shopScrollY = 0;
        this.shopContentHeight = 0;
        this.shopViewport = null;
        this.shopSkinHitAreas = new Map();
        this.hoveredButton = null;
        this.damageFeedback = null;
        this.pressedButton = null;
        this.hoverPulse = 0;
        this.achievementScrollY = 0;
        this.achievementContentHeight = 0;
        this.achievementViewport = null;
        this.achievementNotifications = [];

        // Zone tutorials -----------------------------------------------------
        // Add your screenshots manually by setting `image` to a relative path,
        // e.g. `assets/tutorial/pacific-1.png`. The dashed image area is kept
        // visible when no image is supplied so screenshots can be added later.
        this.tutorialActive = false;
        this.tutorialLevel = null;
        this.tutorialStep = 0;
        this.tutorialShownLevels = new Set();
        this.tutorialImageCache = new Map();
        this.tutorialContinueButtonArea = null;
        this.tutorialSkipButtonArea = null;

        this.tutorials = {
            1: {
                zone: 'PACIFIC OCEAN',
                panels: [
                    {
                        title: 'EAT SMALLER FISH',
                        text: 'Eat fish that are smaller than you to grow and become stronger.',
                        image: 'assets/tutorial/LV1 PANEL 1.png'
                    },
                    {
                        title: 'LOOK FOR THE WHITE INDICATOR',
                        text: 'Fish that you can eat have a white indicator above them. Follow it and hunt safely.',
                        image: 'assets/tutorial/LV1 PANEL 2.png'
                    },
                    {
                        title: 'DEFEAT THE BOSS',
                        text: 'Your target is to defeat the boss. Grow larger than the boss, then overpower and conquer it.',
                        image: 'assets/tutorial/LV1 PANEL 3.png'
                    }
                ]
            },
            4: {
                zone: 'INFERNO OCEAN',
                panels: [
                    {
                        title: 'AVOID THE SEA SERPENT',
                        text: 'Watch out for the sea serpent area. Avoid the serpent until you are large enough to face it.',
                        image: 'assets/tutorial/LV 4 PANEL 1.png'
                    },
                    {
                        title: 'CONQUER THE SERPENT',
                        text: 'Once you are larger than the sea serpent, you can overpower and conquer it.',
                        image: 'assets/tutorial/LV 4 PANEL 2.png'
                    }
                ]
            },
            7: {
                zone: 'TOXIC WASTE OCEAN',
                panels: [
                    {
                        title: 'BUILD YOUR IMMUNITY',
                        text: 'Avoid the flying toxic bubbles until your immunity bar is full. Then you become immune and bubbles will no longer damage you.',
                        image: 'assets/tutorial/LV7 PANEL 1.png'
                    },
                    {
                        title: 'WATCH OUT FOR SHOCK LASERS',
                        text: 'After you become immune to the poison, shock lasers appear. Stay alert and dodge them.',
                        image: 'assets/tutorial/LV7 PANEL 2.png'
                    }
                ]
            },
            10: {
                zone: 'ABYSSAL END',
                panels: [
                    {
                        title: 'FINAL LEVEL: HARDER HAZARDS',
                        text: 'The obstacles are much harder here. Dodge sudden laser attacks. A warning indicator appears at the laser position before it fires.',
                        image: 'assets/tutorial/laser.png'
                    },
                    {
                        title: 'AVOID THE VOID VORTEX',
                        text: 'Void Vortexes can appear randomly in the middle of the ocean. Stay away from the center whenever possible.',
                        image: 'assets/tutorial/vortex.png'
                    },
                    {
                        title: 'DODGE THE VOID SHARDS',
                        text: 'Watch the sky! Void Shards rain down from above. Keep moving and avoid their impact areas.',
                        image: 'assets/tutorial/shards.png'
                    },
                    {
                        title: 'SAFE ZONE PROTECTION',
                        text: 'Danger is everywhere! Find the Safe Zone and stay inside it when hazards appear. Use it to survive deadly attacks and keep moving forward.',
                        image: 'assets/tutorial/safe.png'
                    },
                    {
                        title: 'FINAL BOSSES',
                        text: 'Bosses 2, 3, and 4 have different attack mechanics. Strike when they are vulnerable and use every opening to attack!',
                        image: 'assets/tutorial/bos.png'
                    }
                ]
            }
        };
    }

    showLevelUpNotification(newLevel) { this.levelUpNotifications.push(new LevelUpFeedback(newLevel)); }
    showPurchaseFeedback(text) {
        this.purchaseFeedbacks.push(new PurchaseFeedback(text, this.game.getCanvas().width / 2, 105));
    }
    startBossMessage(text = 'A MASSIVE FISH HAS APPEARED!') {
        this.bossMessageActive = true; this.bossMessageTimer = 180; this.bossMessageText = text;
    }
    showCoinFeedback(amount, x, y) { this.coinFeedbacks.push(new CoinFeedback(amount, x, y)); }
    showXPFeedback(amount, x, y) { this.xpFeedbacks.push(new XPFeedback(amount, x, y)); }
    showDamageFeedback(source, remainingHealth) {
        this.damageFeedback = { source, remainingHealth, timer: 0.9 };
    }

    showAchievementNotification(achievement) {
        if (!achievement) return;
        this.achievementNotifications.push({
            name: achievement.name || achievement.id,
            reward: Number(achievement.reward) || 0,
            timer: 4.2
        });
        if (this.achievementNotifications.length > 3) this.achievementNotifications.shift();
    }

    handleAchievementsWheel(deltaY) {
        if (!this.achievementViewport) return;
        const max = Math.max(0, this.achievementContentHeight - this.achievementViewport.height);
        this.achievementScrollY = Math.max(0, Math.min(max, this.achievementScrollY + deltaY * 0.75));
    }

    drawAchievementNotifications(ctx) {
        if (!this.achievementNotifications.length) return;
        const W = ctx.canvas.width;
        let y = 18;
        for (let i = this.achievementNotifications.length - 1; i >= 0; i--) {
            const n = this.achievementNotifications[i];
            n.timer -= 1 / 60;
            if (n.timer <= 0) { this.achievementNotifications.splice(i, 1); continue; }
            const alpha = Math.min(1, n.timer < .5 ? n.timer * 2 : 1);
            const w = Math.min(360, W - 30), h = 62, x = W - w - 15;
            ctx.save(); ctx.globalAlpha = alpha;
            this.panel(ctx, x, y, w, h, 'rgba(9,35,38,.96)', 'rgba(255,215,106,.72)', 14);
            ctx.textAlign = 'left'; ctx.fillStyle = '#ffd76a'; ctx.font = '900 10px Arial'; ctx.fillText('ACHIEVEMENT UNLOCKED', x + 16, y + 19);
            ctx.fillStyle = '#f3fbff'; ctx.font = 'bold 14px Arial'; ctx.fillText(n.name, x + 16, y + 39);
            ctx.textAlign = 'right'; ctx.fillStyle = '#ffe28a'; ctx.font = '900 12px Arial'; ctx.fillText(`+${n.reward} COINS`, x + w - 16, y + 39);
            ctx.restore();
            y += h + 9;
        }
    }

    roundRect(ctx, x, y, w, h, r = 14) {
        const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    panel(ctx, x, y, w, h, fill = 'rgba(5,24,39,.92)', stroke = 'rgba(105,220,255,.28)', r = 18) {
        ctx.save(); this.roundRect(ctx, x, y, w, h, r);
        ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }

    button(ctx, x, y, w, h, label, accent = '#2ec4d6', opts = {}) {
        const key = opts.key || label;
        const hover = this.hoveredButton === key;
        const pressed = this.pressedButton === key;
        const lift = hover && !pressed ? -1.5 : pressed ? 1.5 : 0;
        ctx.save();
        this.roundRect(ctx, x, y + lift, w, h, opts.radius || 12);
        ctx.fillStyle = hover ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.07)'; ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = hover ? 2.5 : 1.5; ctx.stroke();
        if (opts.glow) { ctx.shadowColor = accent; ctx.shadowBlur = hover ? 18 : 9; this.roundRect(ctx, x, y, w, h, opts.radius || 12); ctx.stroke(); }
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = opts.disabled ? '#71808b' : '#f3fbff';
        ctx.font = `bold ${opts.fontSize || 15}px ${this.fontFamily}`;
        ctx.fillText(label, x + w / 2, y + h / 2 + 1 + lift);
        ctx.restore();
    }

    title(ctx, title, subtitle = '') {
        const W = ctx.canvas.width;
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#eefdff'; ctx.font = `900 ${Math.min(52, W * .075)}px ${this.fontFamily}`;
        ctx.shadowColor = 'rgba(52,218,255,.5)'; ctx.shadowBlur = 20; ctx.fillText(title, W / 2, 64); ctx.shadowBlur = 0;
        if (subtitle) { ctx.fillStyle = '#8bb9c8'; ctx.font = `14px ${this.fontFamily}`; ctx.fillText(subtitle, W / 2, 88); }
    }

    drawSeaBackdrop(ctx, dark = false) {
        const W = ctx.canvas.width, H = ctx.canvas.height;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, dark ? '#020c18' : '#031a2c'); g.addColorStop(.55, '#052d43'); g.addColorStop(1, '#06131f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(50,214,236,.055)';
        for (let i = 0; i < 9; i++) { const x = (i + 1) * W / 10; ctx.beginPath(); ctx.arc(x, H * .82, 55 + (i % 3) * 24, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = 'rgba(113,231,255,.08)'; ctx.lineWidth = 1;
        for (let y = H * .18; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(W*.5, y-18, W, y); ctx.stroke(); }
    }

    updateHover(x, y) {
        const hit = (a) => a && x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height;
        const candidates = [
            ['startButtonArea', this.startButtonArea], ['shopButtonArea', this.shopButtonArea],
            ['achievementsButtonArea', this.achievementsButtonArea], ['levelButtonArea', this.levelButtonArea],
            ['levelSelectBackButtonArea', this.levelSelectBackButtonArea], ['achievementsBackButtonArea', this.achievementsBackButtonArea],
            ['shopBack', this.backButtonArea], ['pauseButtonArea', this.pauseButtonArea],
            ['resumeButtonArea', this.pauseResumeButtonArea], ['pauseMenuButtonArea', this.pauseMenuButtonArea],
            ['restart', this.restartButtonArea], ['endMenu', this.endMenuButtonArea], ['next', this.nextLevelButtonArea],
            ['tutorialContinue', this.tutorialContinueButtonArea], ['tutorialSkip', this.tutorialSkipButtonArea]
        ];
        let found = null;
        for (const [key, area] of candidates) if (hit(area)) { found = key; break; }
        if (!found && this.shopSkinHitAreas) {
            for (const [id, area] of this.shopSkinHitAreas) if (area.actionable && hit(area)) { found = `skin_${id}`; break; }
        }
        this.hoveredButton = found;
        return found;
    }

    setPressedButton(key) { this.pressedButton = key || null; }

    startTutorial(level) {
        const tutorial = this.tutorials[level];
        if (!tutorial || this.tutorialShownLevels.has(level)) return false;

        this.tutorialShownLevels.add(level);
        this.tutorialLevel = level;
        this.tutorialStep = 0;
        this.tutorialActive = true;
        this.tutorialContinueButtonArea = null;
        this.tutorialSkipButtonArea = null;
        return true;
    }

    closeTutorial() {
        this.tutorialActive = false;
        this.tutorialLevel = null;
        this.tutorialStep = 0;
        this.tutorialContinueButtonArea = null;
        this.tutorialSkipButtonArea = null;
    }

    handleTutorialClick(clickX, clickY) {
        if (!this.tutorialActive) return false;

        const continueArea = this.tutorialContinueButtonArea;
        const skipArea = this.tutorialSkipButtonArea;
        const hit = (a) => a && clickX >= a.x && clickX <= a.x + a.width &&
            clickY >= a.y && clickY <= a.y + a.height;

        if (hit(skipArea)) {
            this.closeTutorial();
            return true;
        }

        if (hit(continueArea)) {
            const panels = this.tutorials[this.tutorialLevel]?.panels || [];
            if (this.tutorialStep < panels.length - 1) this.tutorialStep++;
            else this.closeTutorial();
            return true;
        }

        return true;
    }

    getTutorialImage(src) {
        if (!src) return null;
        if (this.tutorialImageCache.has(src)) return this.tutorialImageCache.get(src);

        const img = new Image();
        img.onload = () => { this.tutorialImageCache.set(src, img); };
        img.onerror = () => { this.tutorialImageCache.set(src, null); };
        img.src = src;
        this.tutorialImageCache.set(src, img);
        return img;
    }

    drawTutorial(ctx) {
        if (!this.tutorialActive) return;

        const tutorial = this.tutorials[this.tutorialLevel];
        const panel = tutorial?.panels?.[this.tutorialStep];
        if (!tutorial || !panel) {
            this.closeTutorial();
            return;
        }

        const W = ctx.canvas.width, H = ctx.canvas.height;
        const narrow = W < 700;
        const pw = Math.min(760, W - (narrow ? 24 : 60));
        const ph = Math.min(H - 32, narrow ? 560 : 610);
        const px = (W - pw) / 2;
        const py = (H - ph) / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 5, 12, .78)';
        ctx.fillRect(0, 0, W, H);

        this.panel(ctx, px, py, pw, ph, 'rgba(3, 22, 37, .98)', 'rgba(88, 222, 245, .55)', 24);

        // Zone + progress
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#73e9ff';
        ctx.font = `900 ${narrow ? 10 : 11}px Arial`;
        ctx.fillText(`${tutorial.zone}  •  LEVEL ${this.tutorialLevel}`, W / 2, py + 32);

        ctx.fillStyle = '#f4fdff';
        ctx.font = `900 ${narrow ? 25 : 31}px ${this.fontFamily}`;
        ctx.fillText(panel.title, W / 2, py + 72);

        // Screenshot placeholder / manually inserted image.
        const margin = narrow ? 18 : 34;
        const imageX = px + margin;
        const imageY = py + 94;
        const imageW = pw - margin * 2;
        const imageH = Math.min(narrow ? 220 : 290, ph * .47);

        ctx.save();
        this.roundRect(ctx, imageX, imageY, imageW, imageH, 16);
        ctx.clip();
        ctx.fillStyle = 'rgba(1, 12, 22, .95)';
        ctx.fillRect(imageX, imageY, imageW, imageH);

        const img = this.getTutorialImage(panel.image);
        if (img && img.complete && img.naturalWidth > 0) {
            const scale = Math.max(imageW / img.naturalWidth, imageH / img.naturalHeight);
            const dw = img.naturalWidth * scale;
            const dh = img.naturalHeight * scale;
            ctx.drawImage(img, imageX + (imageW - dw) / 2, imageY + (imageH - dh) / 2, dw, dh);
        } else {
            ctx.strokeStyle = 'rgba(121, 226, 245, .28)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 7]);
            this.roundRect(ctx, imageX + 2, imageY + 2, imageW - 4, imageH - 4, 14);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#6f9cac';
            ctx.font = `bold ${narrow ? 12 : 14}px Arial`;
            ctx.fillText('SCREENSHOT AREA', W / 2, imageY + imageH / 2 - 4);
            ctx.fillStyle = '#486c7b';
            ctx.font = `${narrow ? 10 : 11}px Arial`;
            ctx.fillText('Add your tutorial image manually in UIManager.js → tutorials', W / 2, imageY + imageH / 2 + 18);
        }
        ctx.restore();

        // Description
        const textY = imageY + imageH + 34;
        ctx.fillStyle = '#c5e5ed';
        ctx.font = `${narrow ? 13 : 15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxTextWidth = pw - margin * 2;
        const words = panel.text.split(/\s+/);
        const lines = [];
        let line = '';
        for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxTextWidth && line) {
                lines.push(line);
                line = word;
            } else line = test;
        }
        if (line) lines.push(line);

        lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, W / 2, textY + i * 22));

        // Progress dots
        const dotY = py + ph - 76;
        const count = tutorial.panels.length;
        const gap = 18;
        const start = W / 2 - ((count - 1) * gap) / 2;
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.arc(start + i * gap, dotY, i === this.tutorialStep ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = i === this.tutorialStep ? '#73e9ff' : 'rgba(145, 190, 202, .38)';
            ctx.fill();
        }

        // Controls
        const bw = Math.min(210, pw * .42);
        const bh = 44;
        const bx = W / 2 - bw / 2;
        const by = py + ph - 56;
        const isLast = this.tutorialStep === count - 1;
        this.button(ctx, bx, by, bw, bh, isLast ? 'START LEVEL' : 'NEXT', '#42d7e9', {
            key: 'tutorialContinue',
            glow: true,
            fontSize: narrow ? 13 : 14
        });
        this.tutorialContinueButtonArea = { x: bx, y: by, width: bw, height: bh };

        ctx.fillStyle = '#6d96a4';
        ctx.font = `${narrow ? 10 : 11}px Arial`;
        ctx.fillText('You can skip this tutorial', W / 2, by - 13);

        ctx.fillStyle = '#8eb2be';
        ctx.font = `bold ${narrow ? 10 : 11}px Arial`;
        ctx.fillText('SKIP', W / 2, by + bh + 20);
        this.tutorialSkipButtonArea = { x: W / 2 - 45, y: by + bh + 5, width: 90, height: 24 };

        ctx.restore();
    }

    draw(ctx) {
        if (this.game.finalEnding?.isActive?.()) return;
        const state = this.game.getGameState().getCurrent();
        if (state === 'menu') return this.drawMenu(ctx);
        if (state === 'shop') return this.drawShop(ctx);
        if (state === 'achievements') { this.drawAchievements(ctx); this.drawAchievementNotifications(ctx); return; }
        if (state === 'level_select') return this.drawLevelSelect(ctx);

        this.drawHUD(ctx);
        const lists = [this.coinFeedbacks, this.xpFeedbacks, this.levelUpNotifications, this.purchaseFeedbacks];
        for (const list of lists) for (let i = list.length - 1; i >= 0; i--) {
            const f = list[i]; f.update(); if (f.isDead()) list.splice(i, 1); else f.draw(ctx);
        }
        if (this.bossMessageActive) { this.drawBossMessage(ctx); this.bossMessageTimer--; if (this.bossMessageTimer <= 0) this.bossMessageActive = false; }
        if (this.damageFeedback) { this.drawDamageFeedback(ctx); this.damageFeedback.timer -= 1/60; if (this.damageFeedback.timer <= 0) this.damageFeedback = null; }
        this.pressedButton = null;
        this.hoverPulse = 0;
        if (state === 'paused') this.drawPauseOverlay(ctx);
        if (state === 'gameover') this.drawGameOver(ctx);
        if (state === 'won') this.drawVictory(ctx);
        if (state === 'playing' && this.tutorialActive) this.drawTutorial(ctx);
        this.drawAchievementNotifications(ctx);
    }

    drawPauseOverlay(ctx) {
        const W = ctx.canvas.width, H = ctx.canvas.height;
        const pw = Math.min(440, W - 36), ph = 250;
        const px = (W - pw) / 2, py = (H - ph) / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 6, 14, .66)';
        ctx.fillRect(0, 0, W, H);
        this.panel(ctx, px, py, pw, ph, 'rgba(3, 24, 39, .97)', 'rgba(105, 220, 255, .42)', 24);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#eefdff';
        ctx.font = `900 ${Math.min(38, W * .065)}px ${this.fontFamily}`;
        ctx.fillText('GAME PAUSED', W / 2, py + 68);
        ctx.fillStyle = '#86aeba';
        ctx.font = '13px Arial';
        ctx.fillText('The ocean is frozen. Take a breath.', W / 2, py + 96);

        const bw = Math.min(165, (pw - 50) / 2), bh = 48, gap = 14;
        const total = bw * 2 + gap, x = W / 2 - total / 2, y = py + 142;
        this.button(ctx, x, y, bw, bh, 'RESUME', '#55d69c', { key: 'resumeButtonArea', glow: true });
        this.pauseResumeButtonArea = { x, y, width: bw, height: bh };
        this.button(ctx, x + bw + gap, y, bw, bh, 'MAIN MENU', '#688390', { key: 'pauseMenuButtonArea' });
        this.pauseMenuButtonArea = { x: x + bw + gap, y, width: bw, height: bh };
        ctx.restore();
    }

    drawMenu(ctx) {
        this.drawSeaBackdrop(ctx);
        const W = ctx.canvas.width, H = ctx.canvas.height, cx = W / 2;
        const narrow = W < 650;
        const titleY = Math.max(78, H * .18);
        ctx.save(); ctx.textAlign = 'center';
        ctx.fillStyle = '#77e8ff'; ctx.font = `bold 13px ${this.fontFamily}`; ctx.letterSpacing = '3px'; ctx.fillText('WELCOME TO THE DEEP', cx, titleY - 38);
        ctx.fillStyle = '#f3fdff'; ctx.font = `900 ${Math.min(64, W*.095)}px ${this.fontFamily}`; ctx.shadowColor = '#22cce4'; ctx.shadowBlur = 24; ctx.fillText('HUNGER FISH', cx, titleY + 18); ctx.shadowBlur = 0;
        ctx.fillStyle = '#91b9c8'; ctx.font = '16px Arial'; ctx.fillText('Eat smaller. Grow bigger. Rule the ocean.', cx, titleY + 50);

        const bw = narrow ? Math.min(300, W - 70) : 220, bh = 54, gap = 14;
        const cols = narrow ? 1 : 2;
        const rows = 2; const totalW = cols * bw + (cols-1)*gap;
        const startX = cx - totalW/2; const startY = Math.max(titleY + 82, H*.40);
        const items = [
            ['PLAY NOW', '#35d0e5', 'startButtonArea'], ['FISH SHOP', '#8f72ff', 'shopButtonArea'],
            ['ACHIEVEMENTS', '#f0b85a', 'achievementsButtonArea'], ['LEVEL SELECT', '#52d89a', 'levelButtonArea']
        ];
        items.forEach((it, i) => {
            const col = i % cols, row = Math.floor(i / cols), x = startX + col*(bw+gap), y = startY + row*(bh+gap);
            this.button(ctx, x, y, bw, bh, it[0], it[1], { key: it[2], glow: i===0, fontSize: 16 });
            this[it[2]] = {x,y,width:bw,height:bh};
        });
        const hintY = startY + rows*(bh+gap) + 25;
        this.panel(ctx, cx-190, hintY, 380, 46, 'rgba(1,15,27,.62)', 'rgba(117,224,245,.12)', 23);
        ctx.fillStyle = '#7da9b8'; ctx.font = '13px Arial'; ctx.fillText('FOLLOW THE MOUSE  •  EAT  •  GROW  •  SURVIVE', cx, hintY+29);
        ctx.restore();
    }

    drawHUD(ctx) {
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;
        const score = this.game.getScoreSystem().getScore();
        const best = this.game.getSaveSystem().get('bestScore') || 0;
        const p = this.game.getProgressionSystem();
        const prog = p.getXPProgress();
        const hp = this.game.getHealth();
        const coins = this.game.getEconomySystem().getCoins();
        const level = this.game.getLevelSystem?.().getCurrentLevel?.() || 1;

        ctx.save();

        // --- TOP LEFT: unified player status HUD ---
        const compact = W < 720;
        const panelX = 12, panelY = 12, panelW = compact ? Math.min(270, W - 24) : 292;
        const toxic = level >= 7 && level <= 9;
        const panelH = toxic ? 154 : 132;
        this.panel(ctx, panelX, panelY, panelW, panelH,
            'rgba(2,18,31,.90)', 'rgba(93,221,245,.26)', 18);

        // Accent rail / identity
        this.roundRect(ctx, panelX + 12, panelY + 12, 4, panelH - 24, 2);
        ctx.fillStyle = '#35d0e5'; ctx.fill();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#73e9ff';
        ctx.font = '900 10px Arial';
        ctx.fillText('HUNGER FISH', panelX + 27, panelY + 27);

        // Health lives, aligned to the same header row.
        ctx.textAlign = 'right';
        ctx.fillStyle = '#91aeba';
        ctx.font = 'bold 9px Arial';
        ctx.fillText('HEALTH', panelX + panelW - 76, panelY + 27);
        for (let i = 0; i < 3; i++) {
            this.drawHeart(ctx, panelX + panelW - 62 + i * 17, panelY + 23, i < hp ? '#ff6170' : 'rgba(255,255,255,.10)');
        }

        // Main score + best score block.
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f5fdff';
        ctx.font = '900 25px Arial';
        ctx.fillText(String(score), panelX + 27, panelY + 58);
        ctx.fillStyle = '#6f96a4';
        ctx.font = 'bold 8px Arial';
        ctx.fillText('SCORE', panelX + 28, panelY + 72);

        ctx.fillStyle = '#cfe3e9';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`BEST  ${best}`, panelX + 96, panelY + 59);

        // Level + XP line.
        ctx.fillStyle = '#8fb7c3';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`LV ${p.getLevel()}`, panelX + 27, panelY + 91);
        if (level === 10) { ctx.fillStyle = '#c7b7ff'; ctx.font = '900 9px Arial'; ctx.fillText('FINAL JOURNEY', panelX + 112, panelY + 91); }
        ctx.fillStyle = '#678b98';
        ctx.font = '9px Arial';
        ctx.fillText(`XP ${Math.floor(prog.current)} / ${prog.needed}`, panelX + 72, panelY + 91);

        // XP progress bar.
        const barX = panelX + 27, barY = panelY + 98, barW = panelW - 54, barH = 7;
        this.roundRect(ctx, barX, barY, barW, barH, 4);
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
        this.roundRect(ctx, barX, barY, barW * (prog.percentage / 100), barH, 4);
        ctx.fillStyle = '#48d8eb'; ctx.fill();

        if (toxic) {
            // Toxic resistance sits in its own row to prevent collisions with XP/health.
            const progress = this.game.getToxicImmunityProgress?.() || 0;
            const full = progress >= 1;
            const tx = panelX + 27, ty = panelY + 119, tw = panelW - 54, th = 8;
            ctx.textAlign = 'left';
            ctx.fillStyle = full ? '#eaff9a' : '#91b49b';
            ctx.font = '900 9px Arial';
            ctx.fillText(full ? '☣ TOXIC IMMUNITY READY' : `☣ TOXIC RESISTANCE  ${Math.round(progress * 100)}%`, tx, ty);
            this.roundRect(ctx, tx, ty + 6, tw, th, 4);
            ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
            this.roundRect(ctx, tx, ty + 6, tw * progress, th, 4);
            ctx.fillStyle = full ? '#d9ff58' : '#70c94b'; ctx.fill();
            if (full) {
                ctx.save();
                ctx.globalAlpha = .45 + Math.sin(performance.now() * .006) * .18;
                ctx.shadowColor = '#b8ff3d'; ctx.shadowBlur = 12;
                this.roundRect(ctx, tx, ty + 6, tw, th, 4);
                ctx.strokeStyle = '#d9ff58'; ctx.lineWidth = 1; ctx.stroke();
                ctx.restore();
            }
        }

        if (this.game.getHealthBooster?.()) {
            ctx.textAlign='left'; ctx.fillStyle='#ff8b9a'; ctx.font='900 9px Arial';
            ctx.fillText('♥ +1 HP BOOSTER ACTIVE IN ARENA', panelX + 27, panelY + panelH - 8);
        }

        // --- TOP RIGHT: session status HUD ---
        const rightW = compact ? 176 : 214, rightH = 116;
        const rightX = W - rightW - 12, rightY = 12;
        this.panel(ctx, rightX, rightY, rightW, rightH,
            'rgba(2,18,31,.90)', 'rgba(93,221,245,.26)', 18);

        const time = this.game.getTimerSystem().getElapsedTime();
        const mm = Math.floor(time / 60), ss = Math.floor(time) % 60;
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f3fdff';
        ctx.font = '900 19px Arial';
        ctx.fillText(`${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`, rightX + rightW - 18, rightY + 29);
        ctx.fillStyle = '#6f96a4';
        ctx.font = 'bold 8px Arial';
        ctx.fillText('SURVIVAL TIME', rightX + rightW - 18, rightY + 43);

        ctx.fillStyle = '#ffd76a';
        ctx.font = '900 16px Arial';
        ctx.fillText(`COINS  ${coins}`, rightX + rightW - 18, rightY + 69);

        this.button(ctx, rightX + (compact ? 50 : 72), rightY + 82, compact ? 112 : 124, 28, 'Ⅱ  PAUSE', '#5b7b8a', { key: 'pauseButtonArea', fontSize: 10 });
        this.pauseButtonArea = { x: rightX + (compact ? 50 : 72), y: rightY + 82, width: compact ? 112 : 124, height: 28 };

        ctx.restore();
    }

    drawHeart(ctx, x, y, fill) {
        ctx.save();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x, y + 7);
        ctx.bezierCurveTo(x - 13, y - 1, x - 9, y - 9, x - 3, y - 5);
        ctx.bezierCurveTo(x, y - 9, x + 9, y - 9, x + 13, y - 1);
        ctx.bezierCurveTo(x + 9, y + 5, x + 3, y + 10, x, y + 13);
        ctx.bezierCurveTo(x - 3, y + 10, x - 9, y + 5, x, y + 7);
        ctx.fill();
        ctx.restore();
    }

    drawDamageFeedback(ctx) {
        if (!this.damageFeedback) return;
        const f = this.damageFeedback;
        const W = ctx.canvas.width;
        const alpha = Math.min(1, f.timer / 0.25);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff6673';
        ctx.font = '900 15px Arial';
        ctx.shadowColor = 'rgba(255,70,90,.7)'; ctx.shadowBlur = 14;
        ctx.fillText(`⚠ ${f.source}`, W/2, 150);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffd7dc';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`${f.remainingHealth} HEALTH REMAINING`, W/2, 169);
        ctx.restore();
    }

    drawLevelSelect(ctx) {
        this.drawSeaBackdrop(ctx,true); const W=ctx.canvas.width,H=ctx.canvas.height;
        this.title(ctx,'LEVEL SELECT','Choose your hunting ground');
        const ls=this.game.getLevelSystem(), unlocked=ls.getUnlockedLevel(), cols=W<650?2:4;
        const cardW=Math.min(190,(W-50-(cols-1)*12)/cols), cardH=70, gapX=12,gapY=11;
        const totalW=cols*cardW+(cols-1)*gapX,startX=(W-totalW)/2,startY=108; this.levelHitAreas=new Map();
        for(let i=1;i<=20;i++){
            const row=Math.floor((i-1)/cols),col=(i-1)%cols,x=startX+col*(cardW+gapX),y=startY+row*(cardH+gapY), open=i<=unlocked, playable=i<=10, current=i===ls.getCurrentLevel();
            this.panel(ctx,x,y,cardW,cardH,open?'rgba(8,45,62,.9)':'rgba(11,22,31,.78)',current?'#5ce6ff':open?'rgba(82,216,154,.3)':'rgba(100,120,130,.18)',12);
            ctx.textAlign='left'; ctx.fillStyle=open?'#effcff':'#64737b'; ctx.font='900 16px Arial'; ctx.fillText(`LV ${i}`,x+14,y+25);
            ctx.fillStyle=open?'#8ec0cd':'#58666d'; ctx.font='bold 11px Arial'; const location=ls.getLevelData(i)?.location || 'UNKNOWN OCEAN'; ctx.fillText(playable?location:'COMING SOON',x+14,y+47);
            ctx.textAlign='right'; ctx.fillStyle=current?'#5ce6ff':open?'#56d99b':'#66757c'; ctx.font='bold 11px Arial'; ctx.fillText(current?'CURRENT':open?'UNLOCKED':'LOCKED',x+cardW-12,y+25);
            this.levelHitAreas.set(i,{x,y,width:cardW,height:cardH});
        }
        const bw=130,bh=40,x=W/2-bw/2,y=H-54; this.button(ctx,x,y,bw,bh,'BACK','#688390',{key:'levelBack'}); this.levelSelectBackButtonArea={x,y,width:bw,height:bh};
    }

    drawAchievements(ctx) {
        this.drawSeaBackdrop(ctx,true); const W=ctx.canvas.width,H=ctx.canvas.height;
        this.title(ctx,'ACHIEVEMENTS','Unlock them all and earn bonus coins');
        const sys=this.game.getAchievementSystem();
        const arr=typeof sys.getAllAchievements==='function'?sys.getAllAchievements():[];
        const unlocked=this.game.getSaveSystem().get('unlockedAchievements')||[];
        const unlockedSet=new Set(unlocked);
        const narrow=W<760;
        const viewport={x:18,y:146,width:W-36,height:Math.max(230,H-220)};
        this.achievementViewport=viewport;
        const cols=narrow?1:2;
        const gap=12;
        const cardW=(viewport.width-gap*(cols+1))/cols;
        const cardH=78;
        const rows=Math.ceil(arr.length/cols);
        this.achievementContentHeight=Math.max(viewport.height, rows*(cardH+gap)+gap);
        const max=Math.max(0,this.achievementContentHeight-viewport.height);
        this.achievementScrollY=Math.max(0,Math.min(max,this.achievementScrollY));

        this.panel(ctx,18,98,W-36,38,'rgba(4,27,42,.92)','rgba(105,220,255,.14)',12);
        ctx.textAlign='center'; ctx.fillStyle='#a5c8d3'; ctx.font='bold 12px Arial';
        ctx.fillText(`${unlocked.length} / ${arr.length} UNLOCKED`,W/2,122);
        ctx.fillStyle='#ffd76a'; ctx.fillText('SCROLL TO VIEW ALL',W-105,122);

        this.panel(ctx,viewport.x,viewport.y,viewport.width,viewport.height,'rgba(1,14,25,.48)','rgba(105,220,255,.1)',15);
        ctx.save(); ctx.beginPath(); ctx.rect(viewport.x,viewport.y,viewport.width,viewport.height); ctx.clip();
        arr.forEach((a,i)=>{
            const row=Math.floor(i/cols), col=i%cols;
            const x=viewport.x+gap+col*(cardW+gap);
            const y=viewport.y+gap+row*(cardH+gap)-this.achievementScrollY;
            if(y+cardH<viewport.y || y>viewport.y+viewport.height) return;
            const ok=unlockedSet.has(a.id);
            this.roundRect(ctx,x,y,cardW,cardH,12);
            ctx.fillStyle=ok?'rgba(57,204,153,.11)':'rgba(255,255,255,.025)';ctx.fill();
            ctx.strokeStyle=ok?'rgba(82,216,154,.35)':'rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.stroke();
            ctx.textAlign='left';
            ctx.fillStyle=ok?'#69e0aa':'#65747c';ctx.font='900 16px Arial';ctx.fillText(ok?'✓':'🔒',x+12,y+24);
            ctx.fillStyle=ok?'#eafcff':'#829198';ctx.font='900 12px Arial';ctx.fillText(a.name||a.id,x+40,y+22);
            ctx.fillStyle=ok?'#a8cbd4':'#68777d';ctx.font='11px Arial';
            const desc=(a.description||'').length>52?(a.description.slice(0,49)+'...'):(a.description||'');
            ctx.fillText(desc,x+40,y+40);
            ctx.fillStyle='#ffd76a';ctx.font='900 10px Arial';ctx.fillText(`REWARD  +${a.reward||0} COINS`,x+40,y+59);
        });
        ctx.restore();
        if(max>0){
            const tx=viewport.x+viewport.width-7,ty=viewport.y+10,th=viewport.height-20;
            const thumb=Math.max(34,th*(viewport.height/this.achievementContentHeight));
            const yy=ty+(th-thumb)*(this.achievementScrollY/max);
            ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(tx,ty,4,th);
            ctx.fillStyle='rgba(255,215,106,.7)';ctx.fillRect(tx,yy,4,thumb);
        }
        const bw=130,bh=40,x=W/2-bw/2,by=H-54;
        this.button(ctx,x,by,bw,bh,'BACK','#688390',{key:'achBack'});
        this.achievementsBackButtonArea={x,y:by,width:bw,height:bh};
    }

    drawShop(ctx) {
        this.drawSeaBackdrop(ctx,true); const W=ctx.canvas.width,H=ctx.canvas.height;
        this.title(ctx,'FISH SHOP','Upgrade your look. Become the apex predator.');
        const coins=this.game.getEconomySystem().getCoins(),level=this.game.getProgressionSystem().getLevel();
        this.panel(ctx,18,98,W-36,42,'rgba(4,27,42,.92)','rgba(105,220,255,.14)',12);ctx.textAlign='center';ctx.font='bold 13px Arial';ctx.fillStyle='#ffd76a';ctx.fillText(`COINS  ${coins}`,W/2-90,124);ctx.fillStyle='#79e4f4';ctx.fillText(`LEVEL  ${level}`,W/2+90,124);
        const footerY=H-52,bw=110,bh=40;this.backButtonArea={x:W/2-bw/2,y:footerY,width:bw,height:bh};
        const viewport={x:18,y:148,width:W-36,height:H-214};this.shopViewport=viewport;this.panel(ctx,viewport.x,viewport.y,viewport.width,viewport.height,'rgba(1,14,25,.42)','rgba(105,220,255,.1)',15);
        const order=['common','special','epic','myth','ultra'], skinSystem=this.game.getSkinSystem(), by={};for(const r of order)by[r]=skinSystem.getSkinsByRarity(r).slice().sort((a,b)=>a.requiredLevel-b.requiredLevel||a.price-b.price);
        const cardW=Math.min(190,Math.max(145,Math.floor((viewport.width-55)/3))),cardH=245,gx=16,gy=18,cols=Math.max(1,Math.min(3,Math.floor((viewport.width+gx)/(cardW+gx))));
        const totalW=cols*cardW+(cols-1)*gx,startX=viewport.x+(viewport.width-totalW)/2; let contentH=18;for(const r of order){if(!by[r].length)continue;contentH+=62+Math.ceil(by[r].length/cols)*(cardH+gy)+28;}this.shopContentHeight=Math.max(contentH,viewport.height);const max=Math.max(0,this.shopContentHeight-viewport.height);this.shopScrollY=Math.max(0,Math.min(max,this.shopScrollY));
        ctx.save();ctx.beginPath();ctx.rect(viewport.x,viewport.y,viewport.width,viewport.height);ctx.clip();this.shopSkinHitAreas.clear();let cy=viewport.y+18-this.shopScrollY;
        for(const r of order){const skins=by[r];if(!skins.length)continue;const info=SkinData.RARITIES[r];ctx.textAlign='left';ctx.fillStyle=info.color;ctx.font='900 21px Arial';ctx.fillText(info.name.toUpperCase(),viewport.x+18,cy+23);ctx.fillStyle='#6e939f';ctx.font='11px Arial';ctx.fillText(`${skins.length} SKINS`,viewport.x+18,cy+43);cy+=58;for(let i=0;i<skins.length;i++){const row=Math.floor(i/cols),col=i%cols,x=startX+col*(cardW+gx),y=cy+row*(cardH+gy);this.drawSkinCard(ctx,skins[i],x,y,cardW,cardH,level,coins,skinSystem);}cy+=Math.ceil(skins.length/cols)*(cardH+gy)+28;}
        ctx.restore();if(max>0){const tx=viewport.x+viewport.width-7,ty=viewport.y+10,th=viewport.height-20,thumb=Math.max(34,th*(viewport.height/this.shopContentHeight)),yy=ty+(th-thumb)*(this.shopScrollY/max);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(tx,ty,4,th);ctx.fillStyle='rgba(91,224,245,.65)';ctx.fillRect(tx,yy,4,thumb);}
        this.button(ctx,W/2-bw/2,footerY,bw,bh,'BACK','#688390',{key:'shopBack'});ctx.restore();
    }

    drawSkinCard(ctx,skin,x,y,width,height,playerLevel,coins,skinSystem){
        const rarity=SkinData.RARITIES[skin.rarity]||{color:'#888',name:skin.rarity},locked=playerLevel<skin.requiredLevel,owned=skinSystem.isOwned(skin.id),equipped=skinSystem.isEquipped(skin.id);
        this.panel(ctx,x,y,width,height,'rgba(9,27,40,.96)',rarity.color,14);ctx.fillStyle=rarity.color;this.roundRect(ctx,x,y,width,7,4);ctx.fill();
        const cx=x+width/2;ctx.textAlign='center';ctx.fillStyle='#effcff';ctx.font='bold 15px Arial';ctx.fillText(skin.name,cx,y+30);ctx.fillStyle=rarity.color;ctx.font='900 10px Arial';ctx.fillText((skin.tierLabel||rarity.name).toUpperCase(),cx,y+47);
        FishRenderer.draw(ctx,cx,y+103,Math.min(82,width*.44),skin,{angle:0,time:performance.now(),phase:skin.id.length*.37,animated:true});
        ctx.fillStyle='#ffd76a';ctx.font='bold 13px Arial';ctx.fillText(`COINS  ${skin.price}`,cx,y+161);ctx.fillStyle=locked?'#e27b7b':'#79dca8';ctx.font='10px Arial';ctx.fillText(locked?`REQUIRES LEVEL ${skin.requiredLevel}`:`LEVEL ${skin.requiredLevel} UNLOCKED`,cx,y+181);
        const bw=width-28,bh=34,bx=x+14,by=y+height-bh-13;let text,color,actionable=true;if(equipped){text='EQUIPPED';color='#2d9a70';actionable=false;}else if(owned){text='EQUIP';color='#278fa8';}else if(locked){text='LOCKED';color='#41525c';actionable=false;}else if(coins<skin.price){text='NEED MORE COINS';color='#6e3f45';actionable=false;}else{text='BUY';color='#2d9a70';}this.button(ctx,bx,by,bw,bh,text,color,{key:`skin_${skin.id}`,fontSize:11,disabled:!actionable});this.shopSkinHitAreas.set(skin.id,{x:bx,y:by,width:bw,height:bh,actionable});skin.buttonArea=this.shopSkinHitAreas.get(skin.id);
    }

    handleShopWheel(deltaY){if(!this.shopViewport)return;const max=Math.max(0,this.shopContentHeight-this.shopViewport.height);this.shopScrollY=Math.max(0,Math.min(max,this.shopScrollY+deltaY*.8));}

    drawBossMessage(ctx){const W=ctx.canvas.width,H=ctx.canvas.height;ctx.save();const a=Math.max(0,this.bossMessageTimer/180);ctx.globalAlpha=a;this.panel(ctx,W*.1,H*.37,W*.8,92,'rgba(34,7,14,.9)','rgba(255,92,92,.75)',18);ctx.textAlign='center';ctx.fillStyle='#ff7070';ctx.font='900 13px Arial';ctx.fillText('⚠  THREAT DETECTED  ⚠',W/2,H*.37+28);ctx.fillStyle='#fff4f4';ctx.font='bold 20px Arial';ctx.fillText(this.bossMessageText||'A MASSIVE FISH HAS APPEARED!',W/2,H*.37+60);ctx.restore();}

    drawGameOver(ctx){this.drawEndScreen(ctx,false);}
    drawVictory(ctx){this.drawEndScreen(ctx,true);}
    drawEndScreen(ctx,victory){
        const W=ctx.canvas.width,H=ctx.canvas.height;ctx.save();ctx.fillStyle='rgba(0,5,12,.72)';ctx.fillRect(0,0,W,H);const compact=H<620||W<560;const pw=Math.min(560,W-32),ph=compact?Math.min(430,H-28):390,px=(W-pw)/2,py=Math.max(14,(H-ph)/2);
        this.panel(ctx,px,py,pw,ph,victory?'rgba(4,37,34,.96)':'rgba(39,13,22,.96)',victory?'rgba(82,221,163,.55)':'rgba(255,103,112,.55)',24);
        ctx.textAlign='center';ctx.fillStyle=victory?'#72e5ad':'#ff777e';ctx.font=`900 ${Math.min(44,W*.075)}px Arial`;ctx.fillText(victory?'OCEAN CONQUERED':'YOU GOT EATEN',W/2,py+70);
        const level=this.game.getLevelSystem().getCurrentLevel();ctx.fillStyle='#eafcff';ctx.font='bold 18px Arial';ctx.fillText(victory?`LEVEL ${level} COMPLETE`:'Your hunger meter hit zero.',W/2,py+108);
        ctx.fillStyle='#8baeb9';ctx.font='13px Arial';ctx.fillText(victory?'You survived the hunt and defeated the threat.':'The ocean is ruthless. Grow smarter and try again.',W/2,py+137);
        const score=this.game.getScoreSystem().getScore(),coins=this.game.getEconomySystem().getCoins();ctx.fillStyle='#ffd76a';ctx.font='bold 14px Arial';ctx.fillText(`SCORE  ${score}     •     COINS  ${coins}`,W/2,py+170);
        const stats=this.game.getRunStats?.() || {};
        ctx.fillStyle='#9bc1cc';ctx.font='bold 11px Arial';
        ctx.fillText(`FISH EATEN  ${stats.fishEaten || 0}    •    MAX SIZE  ${Math.round(stats.maxSize || 0)}    •    BEST COMBO  ×${stats.bestCombo || 0}`,W/2,py+204);
        const survival=stats.survivalTime||0,sm=Math.floor(survival/60),ss=Math.floor(survival)%60;
        ctx.fillText(`SURVIVED  ${String(sm).padStart(2,'0')}:${String(ss).padStart(2,'0')}    •    DAMAGE TAKEN  ${stats.damageTaken || 0}`,W/2,py+226);
        ctx.fillStyle='#607f8b';ctx.font='10px Arial';
        ctx.fillText(`ALL-TIME BEST COMBO  ×${this.game.getSaveSystem().get('bestCombo') || 0}`,W/2,py+250);
        this.drawEndButtons(ctx,victory);ctx.restore();
    }

    drawEndButtons(ctx,victory){const W=ctx.canvas.width,H=ctx.canvas.height,bw=Math.min(190,(W-70)/2),bh=48,gap=14,py=Math.min(H-58,H/2+92);this.endMenuButtonArea=null;this.restartButtonArea=null;this.nextLevelButtonArea=null;
        if(!victory){const total=bw*2+gap,x=(W-total)/2;this.button(ctx,x,py,bw,bh,'TRY AGAIN','#55d69c',{key:'restart',glow:true});this.restartButtonArea={x,y:py,width:bw,height:bh};this.button(ctx,x+bw+gap,py,bw,bh,'MAIN MENU','#688390',{key:'endMenu'});this.endMenuButtonArea={x:x+bw+gap,y:py,width:bw,height:bh};return;}
        const total=bw*2+gap,x=(W-total)/2;this.button(ctx,x,py,bw,bh,'MAIN MENU','#688390',{key:'endMenu'});this.endMenuButtonArea={x,y:py,width:bw,height:bh};const next= this.game.getLevelSystem().getCurrentLevel()+1,can=next<=this.game.getLevelSystem().getUnlockedLevel()&&next<=this.game.getLevelSystem().getTotalLevels();this.button(ctx,x+bw+gap,py,bw,bh,can?`NEXT • LV ${next}`:'COMING SOON',can?'#55d69c':'#46545b',{key:'next',glow:can,disabled:!can});if(can)this.nextLevelButtonArea={x:x+bw+gap,y:py,width:bw,height:bh};
    }
}
