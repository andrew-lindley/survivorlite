// Game Constants
// PIXEL_SCALE: Increase for higher resolution (2 = 2x resolution, sharper sprites)
// Assets will appear the same size but with more detail
const PIXEL_SCALE = 2;

// Debug Configuration
const DEBUG_CONFIG = {
    invincible: false,
    allLevelsUnlocked: false,
    startingWeapon: 'none', // 'none', 'fireball', 'lightning', 'frostNova', 'voidZone', 'spiritOrbs'
    
    // Toggle functions
    toggleInvincible() {
        this.invincible = !this.invincible;
        return this.invincible;
    },
    
    toggleAllLevelsUnlocked() {
        this.allLevelsUnlocked = !this.allLevelsUnlocked;
        return this.allLevelsUnlocked;
    },
    
    // Reset all debug options
    reset() {
        this.invincible = false;
        this.allLevelsUnlocked = false;
        this.startingWeapon = 'none';
    }
};

// Orientation configurations for iPhone 16
const ORIENTATIONS = {
    landscape: {
        baseWidth: 844,   // iPhone 16 logical width in landscape
        baseHeight: 390,  // iPhone 16 logical height in landscape
        label: 'Landscape',
        icon: '📱↔️'
    },
    portrait: {
        baseWidth: 390,   // iPhone 16 logical width in portrait
        baseHeight: 844,  // iPhone 16 logical height in portrait
        label: 'Portrait',
        icon: '📱↕️'
    }
};

// Default orientation (can be changed at runtime)
let currentOrientation = 'landscape';

// Dynamic game config that updates based on orientation
const GAME_CONFIG = {
    get width() { return ORIENTATIONS[currentOrientation].baseWidth * PIXEL_SCALE; },
    get height() { return ORIENTATIONS[currentOrientation].baseHeight * PIXEL_SCALE; },
    worldWidth: 2000 * PIXEL_SCALE,
    worldHeight: 2000 * PIXEL_SCALE,
    get baseWidth() { return ORIENTATIONS[currentOrientation].baseWidth; },
    get baseHeight() { return ORIENTATIONS[currentOrientation].baseHeight; },
    pixelScale: PIXEL_SCALE,
};

// Function to set orientation (called from boot scene)
function setGameOrientation(orientation) {
    currentOrientation = orientation;
    // Store preference
    try {
        localStorage.setItem('cosmicSurvivorOrientation', orientation);
    } catch (e) {}
}

// Load saved orientation preference
try {
    const saved = localStorage.getItem('cosmicSurvivorOrientation');
    if (saved && ORIENTATIONS[saved]) {
        currentOrientation = saved;
    }
} catch (e) {}

// Level Definitions - 5 Levels
const LEVELS = {
    1: {
        name: 'Outer Rim',
        description: 'The edge of known space',
        waves: 15,
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        enemySpeedMultiplier: 1.0,
        spawnRateMultiplier: 1.0,
        background: 0x050510,
        nebulaColors: [0x4422aa, 0x2244aa],
        unlocked: true,
        introVideo: 'assets/videos/level1_intro.mp4',
    },
    2: {
        name: 'Abandoned Colony',
        description: 'Dangerous debris field',
        waves: 15,
        enemyHealthMultiplier: 1.3,
        enemyDamageMultiplier: 1.2,
        enemySpeedMultiplier: 1.1,
        spawnRateMultiplier: 1.15,
        background: 0x0a0815,
        nebulaColors: [0x553322, 0x332211],
        unlocked: false,
        introVideo: 'assets/videos/level2_intro.mp4',
    },
    3: {
        name: 'Nebula Core',
        description: 'Heart of the cosmic storm',
        waves: 15,
        enemyHealthMultiplier: 1.6,
        enemyDamageMultiplier: 1.4,
        enemySpeedMultiplier: 1.2,
        spawnRateMultiplier: 1.3,
        background: 0x100520,
        nebulaColors: [0x6622aa, 0x4411aa],
        unlocked: false,
        hasBoss: true,
        enemySizeOverrides: {
            basic: 0.75,
        },
        noRotateEnemies: ['basic'],
        introVideo: 'assets/videos/level3_intro.mp4',
    },
    4: {
        name: 'Dark Sector',
        description: 'Where light fears to travel',
        waves: 15,
        enemyHealthMultiplier: 2.0,
        enemyDamageMultiplier: 1.6,
        enemySpeedMultiplier: 1.3,
        spawnRateMultiplier: 1.5,
        background: 0x050008,
        nebulaColors: [0x220044, 0x110022],
        unlocked: false,
        introVideo: 'assets/videos/level4_intro.mp4',
    },
    5: {
        name: 'Hive World',
        description: 'The alien homeworld',
        waves: 15,
        enemyHealthMultiplier: 2.5,
        enemyDamageMultiplier: 2.0,
        enemySpeedMultiplier: 1.5,
        spawnRateMultiplier: 1.75,
        background: 0x0a0a00,
        nebulaColors: [0x444400, 0x222200],
        unlocked: false,
        introVideo: 'assets/videos/level5_intro.mp4',
    },
};

const TOTAL_LEVELS = 5;

// Hero Configuration
const HERO_CONFIG = {
    speed: 200 * PIXEL_SCALE,
    maxHealth: 100,
    size: 24 * PIXEL_SCALE,
    baseColor: 0xffffff,
    // Weapon module colors for ship evolution
    weaponModules: {
        fireball: { color: 0xff4400, position: 'front', shape: 'cannon' },
        lightning: { color: 0x00aaff, position: 'wings', shape: 'coils' },
        frostNova: { color: 0x88ddff, position: 'core', shape: 'crystal' },
        voidZone: { color: 0x9944ff, position: 'back', shape: 'engine' },
        spiritOrbs: { color: 0x44ffaa, position: 'sides', shape: 'drones' },
    },
};

// XP & Leveling
const XP_CONFIG = {
    baseXpToLevel: 20,
    xpMultiplier: 1.5, // Each level requires 1.5x more XP
    lateGameXpMultiplier: 1.15, // Softer ramp from level 9 onward
    gemValue: 5,
    gemSize: 8 * PIXEL_SCALE,
    gemColor: 0x00ff00,
    pickupRange: 50 * PIXEL_SCALE,
    // Gem colors based on XP value
    gemTiers: [
        { minValue: 0, color: 0x44ffaa, glowColor: 0x88ffcc, name: 'Common' },      // Green - common (1-4 XP)
        { minValue: 5, color: 0x44aaff, glowColor: 0x88ccff, name: 'Uncommon' },    // Blue - uncommon (5-9 XP)
        { minValue: 10, color: 0xaa44ff, glowColor: 0xcc88ff, name: 'Rare' },       // Purple - rare (10-14 XP)
        { minValue: 15, color: 0xffaa44, glowColor: 0xffcc88, name: 'Epic' },       // Orange - epic (15-19 XP)
        { minValue: 20, color: 0xff44aa, glowColor: 0xff88cc, name: 'Legendary' }, // Pink - legendary (20+ XP)
    ],
};

// Wave Configuration
const WAVE_CONFIG = {
    totalWaves: 15,
    waveDuration: 30000, // 30 seconds per wave
    baseEnemyCount: 5,
    enemyCountPerWave: 3,
    spawnInterval: 2000, // Base spawn interval in ms
    spawnIntervalReduction: 100, // Reduce by 100ms per wave
    minSpawnInterval: 500,
};

// Weapon Definitions with 5 Tiers
const WEAPONS = {
    laser: {
        name: 'Ship Laser',
        description: 'Basic ship weapon - fires at nearest enemy',
        color: 0x00ffaa,
        isStarterWeapon: true, // Flag to exclude from upgrade menu
        tiers: [
            { damage: 8, cooldown: 800, projectileSpeed: 400 * PIXEL_SCALE, size: 4 * PIXEL_SCALE, range: 250 * PIXEL_SCALE },
        ],
    },
    fireball: {
        name: 'Torpedo',
        description: 'Launches torpedoes at nearby enemies',
        color: 0xff4400,
        tiers: [
            { damage: 10, cooldown: 1500, projectileSpeed: 300 * PIXEL_SCALE, size: 8 * PIXEL_SCALE, pierce: 1 },
            { damage: 15, cooldown: 1300, projectileSpeed: 320 * PIXEL_SCALE, size: 10 * PIXEL_SCALE, pierce: 1 },
            { damage: 20, cooldown: 1100, projectileSpeed: 350 * PIXEL_SCALE, size: 12 * PIXEL_SCALE, pierce: 2 },
            { damage: 30, cooldown: 900, projectileSpeed: 380 * PIXEL_SCALE, size: 14 * PIXEL_SCALE, pierce: 2 },
            { damage: 45, cooldown: 700, projectileSpeed: 420 * PIXEL_SCALE, size: 16 * PIXEL_SCALE, pierce: 3 },
        ],
    },
    lightning: {
        name: 'Lightning Aura',
        description: 'Zaps nearby enemies with chain lightning',
        color: 0x00aaff,
        tiers: [
            { damage: 8, cooldown: 2000, range: 80 * PIXEL_SCALE, chains: 1 },
            { damage: 12, cooldown: 1800, range: 100 * PIXEL_SCALE, chains: 2 },
            { damage: 18, cooldown: 1500, range: 120 * PIXEL_SCALE, chains: 3 },
            { damage: 25, cooldown: 1200, range: 150 * PIXEL_SCALE, chains: 4 },
            { damage: 35, cooldown: 1000, range: 180 * PIXEL_SCALE, chains: 5 },
        ],
    },
    frostNova: {
        name: 'Frost Nova',
        description: 'Releases a freezing burst that slows enemies',
        color: 0x88ddff,
        tiers: [
            { damage: 15, cooldown: 3000, range: 100 * PIXEL_SCALE, slowAmount: 0.3, slowDuration: 2000 },
            { damage: 22, cooldown: 2700, range: 120 * PIXEL_SCALE, slowAmount: 0.35, slowDuration: 2500 },
            { damage: 30, cooldown: 2400, range: 140 * PIXEL_SCALE, slowAmount: 0.4, slowDuration: 3000 },
            { damage: 40, cooldown: 2000, range: 170 * PIXEL_SCALE, slowAmount: 0.5, slowDuration: 3500 },
            { damage: 55, cooldown: 1600, range: 200 * PIXEL_SCALE, slowAmount: 0.6, slowDuration: 4000 },
        ],
    },
    voidZone: {
        name: 'Void Zone',
        description: 'Creates damaging zones that linger on the ground',
        color: 0x9944ff,
        tiers: [
            { damage: 5, cooldown: 4000, range: 60 * PIXEL_SCALE, duration: 3000, tickRate: 500 },
            { damage: 7, cooldown: 3500, range: 70 * PIXEL_SCALE, duration: 3500, tickRate: 450 },
            { damage: 10, cooldown: 3000, range: 85 * PIXEL_SCALE, duration: 4000, tickRate: 400 },
            { damage: 14, cooldown: 2500, range: 100 * PIXEL_SCALE, duration: 4500, tickRate: 350 },
            { damage: 20, cooldown: 2000, range: 120 * PIXEL_SCALE, duration: 5000, tickRate: 300 },
        ],
    },
    spiritOrbs: {
        name: 'Spirit Orbs',
        description: 'Summons orbiting spirits that damage enemies',
        color: 0x44ffaa,
        tiers: [
            { damage: 6, cooldown: 100, orbitRadius: 60 * PIXEL_SCALE, orbCount: 2, orbitSpeed: 2 },
            { damage: 9, cooldown: 100, orbitRadius: 70 * PIXEL_SCALE, orbCount: 3, orbitSpeed: 2.2 },
            { damage: 12, cooldown: 100, orbitRadius: 80 * PIXEL_SCALE, orbCount: 4, orbitSpeed: 2.5 },
            { damage: 16, cooldown: 100, orbitRadius: 90 * PIXEL_SCALE, orbCount: 5, orbitSpeed: 2.8 },
            { damage: 22, cooldown: 100, orbitRadius: 100 * PIXEL_SCALE, orbCount: 6, orbitSpeed: 3.2 },
        ],
    },
};

const BASE_WEAPON_SLOTS = 3;
const MAX_WEAPON_SLOTS = 5; // Maximum possible with upgrades

// Shop Configuration
const SHOP_CONFIG = {
    upgrades: {
        speed: {
            id: 'speed',
            name: 'Engine Boost',
            description: 'Increase ship speed',
            icon: '⚡',
            maxLevel: 5,
            costs: [50, 150, 400, 800, 1500],
            effects: [0.1, 0.2, 0.35, 0.5, 0.75], // Speed multiplier bonus per level
        },
        weaponSlot: {
            id: 'weaponSlot',
            name: 'Weapon Bay',
            description: 'Add slot + XP boost',
            icon: '🔫',
            maxLevel: 2, // Can add 2 more slots (3 base + 2 = 5 max)
            costs: [200, 600],
            effects: [1, 2], // Additional weapon slots
            xpBoost: [0.10, 0.25], // 10% and 25% more XP gained
        },
        shield: {
            id: 'shield',
            name: 'Shield Generator',
            description: 'Absorb hits',
            icon: '🛡️',
            maxLevel: 3,
            costs: [100, 300, 700],
            effects: [1, 2, 3], // Number of hits absorbed at start of level
        },
        weaponPower: {
            id: 'weaponPower',
            name: 'Weapon System',
            description: '+50% weapon damage',
            icon: '💥',
            maxLevel: 1,
            costs: [500],
            effects: [0.5], // 50% damage bonus (1.5x multiplier)
        },
    },
};

// Enemy Types - Space Aliens
const ENEMY_TYPES = {
    basic: {
        name: 'Scout Drone',
        health: 20,
        damage: 5,
        speed: 60 * PIXEL_SCALE,
        size: 16 * PIXEL_SCALE,
        color: 0x44dd55,
        glowColor: 0x88ff88,
        eyeColor: 0xff0000,
        xpValue: 5,
        shape: 'drone',
    },
    fast: {
        name: 'Interceptor',
        health: 10,
        damage: 3,
        speed: 120 * PIXEL_SCALE,
        size: 12 * PIXEL_SCALE,
        color: 0xaa44dd,
        glowColor: 0xdd88ff,
        eyeColor: 0xff4444,
        xpValue: 4,
        shape: 'interceptor',
    },
    tank: {
        name: 'Destroyer',
        health: 60,
        damage: 10,
        speed: 35 * PIXEL_SCALE,
        size: 24 * PIXEL_SCALE,
        color: 0x667788,
        glowColor: 0x8899aa,
        eyeColor: 0xff8800,
        xpValue: 12,
        shape: 'destroyer',
    },
    boss: {
        name: 'Hive Mother',
        health: 2000,
        damage: 20,
        speed: 8 * PIXEL_SCALE,
        size: 64 * PIXEL_SCALE,
        color: 0xcc2255,
        glowColor: 0xff4488,
        eyeColor: 0xffcc00,
        xpValue: 100,
        shape: 'boss',
        isBoss: true,
    },
};

// Colors - Space Theme
const COLORS = {
    background: 0x050510,
    grid: 0x101030,
    healthBar: 0xff4466,
    healthBarBg: 0x2a2a3a,
    xpBar: 0x44ffaa,
    xpBarBg: 0x2a2a3a,
    uiPanel: 0x0a0a1a,
    textPrimary: '#ffffff',
    textSecondary: '#8888aa',
    // Ship colors
    shipHull: 0xffffff,
    shipGlow: 0xdddddd,
    shipEngine: 0x00ccff,
    shipTrail: 0xffffff,
    // Space colors
    starColor: 0xffffff,
    nebulaColor1: 0x4422aa,
    nebulaColor2: 0x2244aa,
};

