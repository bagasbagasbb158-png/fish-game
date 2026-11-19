// AchievementData.js - Full achievement catalogue for Hunger Fish.
// Every achievement has a reachable requirement and a coin reward.
export class AchievementData {
    static getAllAchievements() {
        const A = (id, name, description, type, value, reward, extra = {}) => ({
            id, name, description, requirement: { type, value, ...extra }, reward, unlocked: false
        });
        return [
            // Feeding milestones
            A('FIRST_MEAL','First Meal','Eat your first fish.','fishEaten',1,25),
            A('HUNGRY_FISH','Hungry Fish','Eat 10 fish.','fishEaten',10,35),
            A('SCHOOL_BULLY','School Bully','Eat 25 fish.','fishEaten',25,50),
            A('PREDATOR','Predator','Eat 50 fish.','fishEaten',50,75),
            A('VORACIOUS','Voracious','Eat 100 fish.','fishEaten',100,100),
            A('OCEAN_EATER','Ocean Eater','Eat 250 fish.','fishEaten',250,175),
            A('APEX_APPETITE','Apex Appetite','Eat 500 fish.','fishEaten',500,300),
            A('ENDLESS_HUNGER','Endless Hunger','Eat 1,000 fish.','fishEaten',1000,500),
            A('OCEAN_LEGEND_APPETITE','Ocean Legend','Eat 2,500 fish.','fishEaten',2500,1000),

            // Boss hunting
            A('FIRST_BOSS','First Hunt','Defeat your first boss.','bossDefeated',1,100),
            A('BOSS_BREAKER','Boss Breaker','Defeat 3 bosses.','bossDefeated',3,125),
            A('BOSS_SLAYER','Boss Slayer','Defeat 5 bosses.','bossDefeated',5,175),
            A('LEVIATHAN_HUNTER','Leviathan Hunter','Defeat 10 bosses.','bossDefeated',10,250),
            A('BOSS_COLLECTOR','Boss Collector','Defeat 20 bosses.','bossDefeated',20,400),
            A('BOSS_REAPER','Boss Reaper','Defeat 30 bosses.','bossDefeated',30,600),
            A('FINAL_BOSS_HUNTER','Final Boss Hunter','Defeat all four bosses in Level 10.','levelCompleted',10,750),

            // Progression / exploration
            A('FIRST_DIVE','First Dive','Start your first game.','gamesPlayed',1,20),
            A('TEN_DIVES','Seasoned Swimmer','Play 10 games.','gamesPlayed',10,60),
            A('TWENTY_FIVE_DIVES','Ocean Regular','Play 25 games.','gamesPlayed',25,100),
            A('FIFTY_DIVES','Deep Sea Regular','Play 50 games.','gamesPlayed',50,175),
            A('LEVEL_TWO','Into the Deep','Reach level 2.','playerLevel',2,50),
            A('LEVEL_FIVE','Inferno Bound','Reach level 5.','playerLevel',5,100),
            A('LEVEL_SEVEN','Toxic Waters','Reach level 7.','playerLevel',7,150),
            A('LEVEL_TEN','The Abyss','Reach level 10.','playerLevel',10,300),
            A('LEVEL_TWENTY','Beyond the Abyss','Reach player level 20.','playerLevel',20,500),
            A('PACIFIC_COMPLETE','Pacific Conqueror','Complete Level 1.','levelCompleted',1,100),
            A('INFERNO_COMPLETE','Inferno Conqueror','Complete Level 4.','levelCompleted',4,175),
            A('TOXIC_COMPLETE','Toxic Survivor','Complete Level 7.','levelCompleted',7,250),
            A('ABYSS_COMPLETE','Abyssal Victory','Complete Level 10.','levelCompleted',10,500),

            // Growth
            A('GROWING','Getting Bigger','Reach size 50.','playerSize',50,40),
            A('GIANT','Giant','Reach size 100.','playerSize',100,75),
            A('TITAN','Titan','Reach size 150.','playerSize',150,125),
            A('COLOSSUS','Colossus','Reach size 200.','playerSize',200,200),
            A('ABYSSAL_SIZE','Abyssal Size','Reach size 300.','playerSize',300,350),

            // Combo / score
            A('COMBO_START','Feeding Streak','Reach a ×3 feeding combo.','bestCombo',3,40),
            A('COMBO_5','Chain Feeder','Reach a ×5 feeding combo.','bestCombo',5,60),
            A('COMBO_10','Combo Hunter','Reach a ×10 feeding combo.','bestCombo',10,100),
            A('COMBO_15','Unstoppable Feast','Reach a ×15 feeding combo.','bestCombo',15,175),
            A('COMBO_20','Feeding Frenzy','Reach a ×20 feeding combo.','bestCombo',20,300),
            A('SCORE_1K','Score Chaser','Reach a best score of 1,000.','bestScore',1000,50),
            A('SCORE_5K','High Scorer','Reach a best score of 5,000.','bestScore',5000,100),
            A('SCORE_10K','Score Master','Reach a best score of 10,000.','bestScore',10000,175),
            A('SCORE_25K','Score Monster','Reach a best score of 25,000.','bestScore',25000,300),
            A('SCORE_50K','Score Legend','Reach a best score of 50,000.','bestScore',50000,500),

            // Survival / precision
            A('FIRST_WIN','Victory','Complete your first level.','wins',1,100),
            A('THREE_WINS','Triple Victory','Complete 3 levels.','wins',3,125),
            A('FIVE_WINS','Ocean Veteran','Complete 5 levels.','wins',5,175),
            A('TEN_WINS','Ocean Champion','Complete 10 levels.','wins',10,300),
            A('PERFECT_RUN','Unscathed','Complete a level without taking damage.','perfectWin',1,200),
            A('PERFECT_TRIPLE','Untouchable','Complete 3 levels without taking damage.','perfectWins',3,350),
            A('QUICK_FINISH','Quick Feast','Complete a level in under 60 seconds.','fastWin',60,150),
            A('PACIFIC_SPEED','Pacific Speedrun','Complete Level 1 in under 55 seconds.','levelFastWin',1,125,{maxTime:55}),
            A('INFERNO_SPEED','Inferno Speedrun','Complete Level 4 in under 75 seconds.','levelFastWin',4,200,{maxTime:75}),
            A('TOXIC_SPEED','Toxic Speedrun','Complete Level 7 in under 105 seconds.','levelFastWin',7,250,{maxTime:105}),
            A('ABYSS_SPEED','Abyss Speedrun','Complete Level 10 in under 330 seconds.','levelFastWin',10,500,{maxTime:330}),

            // Zone mechanics
            A('SERPENT_TAMER','Serpent Tamer','Defeat a sea serpent by becoming large enough to eat it.','serpentDefeated',1,175),
            A('SERPENT_DODGER','Serpent Dodger','Successfully dodge 5 sea serpent charges.','serpentDodged',5,150),
            A('TOXIC_IMMUNITY','Toxic Immunity','Become immune to toxic bubbles.','toxicImmunity',1,175),
            A('TOXIC_SURVIVOR','Toxic Veteran','Survive 10 toxic bubble hits without reaching game over.','toxicHitsSurvived',10,150),
            A('LASER_DODGER','Laser Dodger','Successfully dodge 5 toxic laser attacks.','laserDodged',5,200),
            A('LASER_MASTER','Laser Master','Successfully dodge 15 toxic laser attacks.','laserDodged',15,400),
            A('ABYSS_SURVIVOR','Abyss Survivor','Complete Level 10 after surviving its hazards.','levelCompleted',10,350),

            // Pickups / economy / collection
            A('DOUBLE_COLLECTOR','Double Collector','Collect 5 2× collect boosters.','doubleBoosters',5,100),
            A('DOUBLE_FRENZY','Double Frenzy','Collect 20 2× collect boosters.','doubleBoosters',20,250),
            A('HEALTH_HUNTER','Second Wind','Collect 5 health boosters.','healthBoosters',5,100),
            A('HEALTH_KEEPER','Health Keeper','Collect 15 health boosters.','healthBoosters',15,250),
            A('COIN_PILE','Coin Pile','Earn 1,000 coins from gameplay.','coinsEarned',1000,100),
            A('COIN_FORTUNE','Coin Fortune','Earn 5,000 coins from gameplay.','coinsEarned',5000,200),
            A('COIN_EMPIRE','Coin Empire','Earn 10,000 coins from gameplay.','coinsEarned',10000,400),
            A('BIG_SPENDER','Big Spender','Spend 5,000 coins in the shop.','coinsSpent',5000,200),
            A('SHOPPER','Dedicated Collector','Own 5 fish skins.','skinsOwned',5,150),
            A('WARDROBE','Full Wardrobe','Own 10 fish skins.','skinsOwned',10,300),
            A('STYLE_ICON','Style Icon','Own 20 fish skins.','skinsOwned',20,600),

            // Damage / endurance
            A('BATTLE_SCAR','Battle Scar','Take 10 damage across your adventures.','damageTaken',10,50),
            A('HARDENED','Hardened','Take 25 damage across your adventures.','damageTaken',25,100),
            A('IRON_FIN','Iron Fin','Take 50 damage across your adventures.','damageTaken',50,200),
            A('CENTURY_SURVIVOR','Century Survivor','Take 100 damage across your adventures.','damageTaken',100,400)
        ];
    }
}
