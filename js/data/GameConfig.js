// GameConfig.js - Central configuration for game balance and constants
export const GameConfig = {
    // Player settings
    PLAYER_START_SIZE: 30,
    PLAYER_MAX_SIZE: Infinity, // Normal levels have no artificial player-size cap.
    PLAYER_START_SPEED: 0.1,
    PLAYER_COLOR: '#ff6b35',
    PLAYER_GROWTH_RATE: 0.05, // 5% of eaten enemy size
    PLAYER_MAX_HEALTH: 3,
    PLAYER_DAMAGE_INVULNERABILITY: 1.5, // seconds
    TOXIC_IMMUNITY_SIZE: 150, // Level 7 toxic immunity becomes ready at this player size
    CAMERA_SHAKE_DURATION: 0.32, // seconds
    CAMERA_SHAKE_STRENGTH: 9,

    // Enemy fish settings
    STARTING_ENEMY_COUNT: 10,
    ENEMY_SIZE_TIERS: [
        { name: 'Tiny', sizeMin: 10, sizeMax: 18, speedMin: 1.5, speedMax: 2.5, color: '#06d6a0', weight: 40, species: 'guppy' },
        { name: 'Small', sizeMin: 18, sizeMax: 25, speedMin: 1.0, speedMax: 2.0, color: '#118ab2', weight: 30, species: 'clownfish' },
        { name: 'Medium', sizeMin: 25, sizeMax: 35, speedMin: 0.5, speedMax: 1.5, color: '#ff9f1c', weight: 20, species: 'pufferfish' },
        { name: 'Large', sizeMin: 35, sizeMax: 45, speedMin: 0.2, speedMax: 0.8, color: '#ff6b35', weight: 8, species: 'angelfish' },
        { name: 'Huge', sizeMin: 45, sizeMax: 60, speedMin: 0.1, speedMax: 0.4, color: '#073b4c', weight: 2, species: 'shark' }
    ],

    // Level 4 Inferno Ocean enemy species. Every size tier gets a completely new species.
    INFERNO_ENEMY_SIZE_TIERS: [
        { name: 'Flame Tetra', sizeMin: 10, sizeMax: 18, speedMin: 1.7, speedMax: 2.7, color: '#ffb000', weight: 40, species: 'flame_tetra' },
        { name: 'Inferno Lionfish', sizeMin: 18, sizeMax: 25, speedMin: 1.1, speedMax: 2.1, color: '#ff5a1f', weight: 30, species: 'inferno_lionfish' },
        { name: 'Magma Angler', sizeMin: 25, sizeMax: 35, speedMin: 0.6, speedMax: 1.5, color: '#e53935', weight: 20, species: 'magma_angler' },
        { name: 'Volcanic Manta', sizeMin: 35, sizeMax: 45, speedMin: 0.25, speedMax: 0.85, color: '#ff7043', weight: 8, species: 'volcanic_manta' },
        { name: 'Hellfire Moray', sizeMin: 45, sizeMax: 60, speedMin: 0.12, speedMax: 0.45, color: '#7b1f1f', weight: 2, species: 'hellfire_moray' }
    ],

    // Level 7 Toxic Waste Ocean enemy species.
    TOXIC_ENEMY_SIZE_TIERS: [
        { name: 'Toxic Minnow', sizeMin: 11, sizeMax: 19, speedMin: 1.6, speedMax: 2.6, color: '#b8ff3d', weight: 40, species: 'toxic_minnow' },
        { name: 'Radioactive Piranha', sizeMin: 19, sizeMax: 27, speedMin: 1.05, speedMax: 2.05, color: '#72e83b', weight: 30, species: 'radioactive_piranha' },
        { name: 'Mutant Angler', sizeMin: 27, sizeMax: 38, speedMin: 0.55, speedMax: 1.45, color: '#39c96b', weight: 20, species: 'mutant_angler' },
        { name: 'Sludge Ray', sizeMin: 38, sizeMax: 50, speedMin: 0.22, speedMax: 0.78, color: '#1f9b6c', weight: 8, species: 'sludge_ray' },
        { name: 'Wasteland Eel', sizeMin: 50, sizeMax: 66, speedMin: 0.1, speedMax: 0.4, color: '#176b54', weight: 2, species: 'wasteland_eel' }
    ],

    // Level 10 Abyssal End enemy species.
    ABYSS_ENEMY_SIZE_TIERS: [
        { name: 'Abyss Stalker', sizeMin: 12, sizeMax: 20, speedMin: 1.8, speedMax: 2.8, color: '#7d6cff', weight: 40, species: 'abyss_stalker' },
        { name: 'Void Eel', sizeMin: 20, sizeMax: 28, speedMin: 1.2, speedMax: 2.3, color: '#9b59ff', weight: 30, species: 'void_eel' },
        { name: 'Abyss Ray', sizeMin: 28, sizeMax: 40, speedMin: 0.7, speedMax: 1.6, color: '#4fc3ff', weight: 20, species: 'abyss_ray' },
        { name: 'Devourer', sizeMin: 40, sizeMax: 52, speedMin: 0.3, speedMax: 0.9, color: '#6d4aff', weight: 8, species: 'abyss_devourer' },
        { name: 'Void Serpent', sizeMin: 52, sizeMax: 68, speedMin: 0.14, speedMax: 0.45, color: '#241344', weight: 2, species: 'void_serpent' }
    ],

    // Boss settings
    BOSS_SPAWN_TIME: 30, // seconds
    BOSS_SIZE: 80,
    BOSS2_SIZE: 150,
    BOSS3_SIZE: 250,
    BOSS4_SIZE: 120,
    BOSS5_SIZE: 220,
    BOSS6_SIZE: 360,
    BOSS7_SIZE: 145,
    BOSS8_SIZE: 235,
    BOSS9_SIZE: 380,
    BOSS10_SIZE: 520,
    // Level 10 player cap: keeps the final fight readable and maneuverable while
    // preserving the 1.2x size requirement needed to attack Boss 4.
    LEVEL10_PLAYER_MAX_SIZE: 320,
    PLAYER_COLLISION_FORGIVENESS: 0.90,
    INITIAL_ENEMY_ENTRY_SPEED_MULTIPLIER: 2.15,
    INITIAL_EDIBLE_ENEMY_COUNT: 3,
    BOSS_SPEED: 0.55,
    BOSS_COLOR: '#ff00ff',
    BOSS_MESSAGE_TIME: 180, // frames at 60fps (3 seconds)

    // Scoring
    SCORE_MULTIPLIER: 10, // points = enemySize * SCORE_MULTIPLIER
    COMBO_WINDOW: 2.5, // seconds between meals before the feeding streak expires
    COMBO_MAX_MULTIPLIER: 2.0,
    COMBO_STEP: 0.10, // +10% score per combo step, capped by COMBO_MAX_MULTIPLIER
    RISK_SCORE_MAX_BONUS: 0.35, // up to +35% for eating prey close to the safe size threshold

    // Coin rewards
    COIN_REWARD_BASE: 1,
    COIN_REWARD_SIZE_MULTIPLIER: 0.5, // coins = base + size * multiplier
    BOSS_COIN_REWARD: 500, // Fixed reward for defeating the boss

    // XP Progression
    XP_BASE_REQUIREMENT: 100,
    XP_LEVEL_INCREMENT: 50,
    TINY_XP: 2,
    SMALL_XP: 4,
    MEDIUM_XP: 7,
    LARGE_XP: 12,
    HUGE_XP: 20,
    BOSS_XP: 100,

    // Environment
    BUBBLE_COUNT: 25,
    PARTICLE_COUNT: 15,

    // Animation
    FISH_TAIL_SPEED_FACTOR: 0.002,
    FISH_BOBBING_SPEED_FACTOR: 0.001,
    BOSS_TAIL_SPEED_FACTOR: 0.0015,
    BOSS_BOBBING_SPEED_FACTOR: 0.0008,
    BOSS_BOBBING_AMPLITUDE: 3.0
};