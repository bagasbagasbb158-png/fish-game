// LevelData.js - Level definitions and visual progression
export const LevelData = {
    TOTAL_LEVELS: 20,
    levels: Array.from({ length: 20 }, (_, index) => {
        const level = index + 1;
        const playable = level <= 10;
        return {
            id: level,
            name: `LEVEL ${level}`,
            location: level <= 2 ? 'PACIFIC OCEAN' : level === 3 ? 'DEPTH OCEAN' : level <= 5 ? 'INFERNO OCEAN' : level === 6 ? 'DARK CRIMSON MAGMA' : level >= 7 && level <= 9 ? 'TOXIC WASTE OCEAN' : level === 10 ? 'ABYSSAL END' : 'UNKNOWN OCEAN',
            playable,
            environment: level === 1 ? 'reef' : level === 2 ? 'deepReef' : level === 3 ? 'abyss' : level >= 4 && level <= 6 ? 'infernoOcean' : level >= 7 && level <= 9 ? 'toxicWasteOcean' : level === 10 ? 'abyssalEnd' : 'unknown',
            bossCount: level === 1 ? 1 : level === 2 ? 2 : level === 3 ? 3 : level === 4 ? 1 : level === 5 ? 2 : level === 6 ? 3 : level === 7 ? 1 : level === 8 ? 2 : level === 9 ? 3 : level === 10 ? 4 : 1,
            boss1Time: 30,
            boss2Time: level === 10 ? 120 : (level === 2 || level === 3 || level === 5 || level === 6 || level === 8 || level === 9 ? 60 : null),
            boss3Time: level === 10 ? 180 : (level === 3 || level === 6 || level === 9 ? 90 : null),
            boss4Time: level === 10 ? 240 : null
        };
    })
};

export function getLevelData(level) {
    return LevelData.levels.find(item => item.id === level) || LevelData.levels[0];
}
