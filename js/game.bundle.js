// Theme Configuration
const THEMES = {
    space: { name: 'Space', basePath: 'assets/images' },
    aquatic: { name: 'Aquatic', basePath: 'assets/images_aquatic' },
};

const ThemeManager = {
    current() { return localStorage.getItem('gameTheme') || 'space'; },
    set(theme) { localStorage.setItem('gameTheme', theme); },
    basePath() { return THEMES[this.current()].basePath; },
};

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

// Base width used for layout calculations; height is derived from window aspect ratio
const BASE_SHORT_SIDE = 381;

// Compute base dimensions from the actual window size
function computeBaseDimensions() {
    const w = window.innerWidth || 381;
    const h = window.innerHeight || 597;
    if (w > h) {
        // landscape
        const baseW = Math.round(BASE_SHORT_SIDE * (w / h));
        return { landscape: { baseWidth: baseW, baseHeight: BASE_SHORT_SIDE },
                 portrait:  { baseWidth: BASE_SHORT_SIDE, baseHeight: baseW } };
    }
    const baseH = Math.round(BASE_SHORT_SIDE * (h / w));
    return { portrait:  { baseWidth: BASE_SHORT_SIDE, baseHeight: baseH },
             landscape: { baseWidth: baseH, baseHeight: BASE_SHORT_SIDE } };
}

const ORIENTATIONS = computeBaseDimensions();
ORIENTATIONS.portrait.label = 'Portrait';
ORIENTATIONS.portrait.icon = '📱↕️';
ORIENTATIONS.landscape.label = 'Landscape';
ORIENTATIONS.landscape.icon = '📱↔️';

// Default orientation (can be changed at runtime)
let currentOrientation = 'portrait';

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

// Asset Configuration - Define all your sprites and audio here
// When you add image/audio files to the assets folder, register them here

const ASSET_CONFIG = {
    // Player ship sprites - add your ship images here
    ships: {
        player: {
            key: 'ship_player',
            path: 'ships/player.png',
        },
        playerFireball: {
            key: 'ship_player_fireball',
            path: 'ships/player_fireball.png',
        },
        playerFrost: {
            key: 'ship_player_frost',
            path: 'ships/player_frost.png',
        },
        playerLightning: {
            key: 'ship_player_lightning',
            path: 'ships/player_lightning.png',
        },
    },
    
    // Enemy sprites
    enemies: {
        scout: {
            key: 'enemy_scout',
            path: 'enemies/scout.png',
        },
        interceptor: {
            key: 'enemy_interceptor',
            path: 'enemies/interceptor.png',
        },
        destroyer: {
            key: 'enemy_destroyer', 
            path: 'enemies/destroyer.png',
        },
        boss: {
            key: 'enemy_boss',
            path: 'enemies/boss.png',
        },
    },
    
    // Weapon/projectile sprites
    weapons: {
        fireball: {
            key: 'proj_fireball',
            path: 'weapons/fireball.png',
        },
        frostNova: {
            key: 'proj_frost',
            path: 'weapons/frost.png',
        },
        lightning: {
            key: 'proj_lightning',
            path: 'weapons/lightning.png',
        },
        voidZone: {
            key: 'proj_void',
            path: 'weapons/void.png',
        },
        spiritOrb: {
            key: 'proj_spirit',
            path: 'weapons/spirit.png',
        },
    },
    
    // Effect sprites
    effects: {
        explosion: {
            key: 'fx_explosion',
            path: 'effects/explosion.png',
        },
        xpGem: {
            key: 'fx_xp_gem',
            path: 'effects/xp_gem.png',
        },
        hit: {
            key: 'fx_hit',
            path: 'effects/hit.png',
        },
    },
    
    // UI elements
    ui: {
        healthBar: {
            key: 'ui_health',
            path: 'ui/health_bar.png',
        },
        button: {
            key: 'ui_button',
            path: 'ui/button.png',
        },
    },
    
    // Weapon icons for UI
    icons: {
        fireball: {
            key: 'icon_fireball',
            path: 'icons/fireball.png',
        },
        lightning: {
            key: 'icon_lightning',
            path: 'icons/lightning.png',
        },
        frostNova: {
            key: 'icon_frostnova',
            path: 'icons/frostnova.png',
        },
        voidZone: {
            key: 'icon_voidzone',
            path: 'icons/voidzone.png',
        },
        spiritOrbs: {
            key: 'icon_spiritorbs',
            path: 'icons/spiritorbs.png',
        },
    },
    
    // Level backgrounds - one for each level
    backgrounds: {
        homescreen: {
            key: 'bg_homescreen',
            path: 'backgrounds/homescreen.jpg',
        },
        levelselect: {
            key: 'bg_levelselect',
            path: 'backgrounds/levelselect.jpg',
        },
        level1: {
            key: 'bg_level1',
            path: 'backgrounds/level1.jpg',
        },
        level2: {
            key: 'bg_level2',
            path: 'backgrounds/level2.jpg',
        },
        level3: {
            key: 'bg_level3',
            path: 'backgrounds/level3.jpg',
        },
        level4: {
            key: 'bg_level4',
            path: 'backgrounds/level4.jpg',
        },
        level5: {
            key: 'bg_level5',
            path: 'backgrounds/level5.jpg',
        },
    },
    
    // Sprite sheets (animated sprites)
    // Format: 2 rows x 3 columns (6 frames total)
    // Animation plays row 1 (frames 0,1,2) then row 2 (frames 3,4,5)
    spritesheets: {
        playerAnimated: {
            key: 'ship_player_anim',
            path: 'ships/player_sheet.png',
            frameWidth: 96,
            frameHeight: 96,
        },
        scoutAnimated: {
            key: 'enemy_scout_anim',
            path: 'enemies/scout_sheet.png',
            frameWidth: 128,
            frameHeight: 128,
        },
        interceptorAnimated: {
            key: 'enemy_interceptor_anim',
            path: 'enemies/interceptor_sheet.png',
            frameWidth: 64,
            frameHeight: 64,
        },
        destroyerAnimated: {
            key: 'enemy_destroyer_anim',
            path: 'enemies/destroyer_sheet.png',
            frameWidth: 128,
            frameHeight: 128,
        },
        bossAnimated: {
            key: 'enemy_boss_anim',
            path: 'enemies/boss_sheet.png',
            frameWidth: 256,
            frameHeight: 256,
        },
        explosionAnimated: {
            key: 'fx_explosion_anim',
            path: 'effects/explosion_sheet.png',
            frameWidth: 128,
            frameHeight: 128,
        },
        voidZoneAnimated: {
            key: 'proj_void_anim',
            path: 'weapons/void_sheet.png',
            frameWidth: 128,
            frameHeight: 128,
        },
    },
    
    // Sound effects
    audio: {
        // Weapon sounds
        laser: {
            key: 'sfx_laser',
            path: 'assets/audio/laser.mp3',
        },
        fireball: {
            key: 'sfx_fireball',
            path: 'assets/audio/fireball.mp3',
        },
        lightning: {
            key: 'sfx_lightning',
            path: 'assets/audio/lightning.mp3',
        },
        frostNova: {
            key: 'sfx_frost',
            path: 'assets/audio/frost.mp3',
        },
        voidZone: {
            key: 'sfx_void',
            path: 'assets/audio/void.mp3',
        },
        spiritOrbs: {
            key: 'sfx_spirit',
            path: 'assets/audio/spirit.mp3',
        },
        // Combat sounds
        hit: {
            key: 'sfx_hit',
            path: 'assets/audio/hit.mp3',
        },
        enemyDeath: {
            key: 'sfx_enemy_death',
            path: 'assets/audio/enemy_death.mp3',
        },
        playerHit: {
            key: 'sfx_player_hit',
            path: 'assets/audio/player_hit.mp3',
        },
        // Pickup sounds
        xpPickup: {
            key: 'sfx_xp_pickup',
            path: 'assets/audio/xp_pickup.mp3',
        },
        levelUp: {
            key: 'sfx_level_up',
            path: 'assets/audio/level_up.mp3',
        },
        // UI sounds
        buttonClick: {
            key: 'sfx_button',
            path: 'assets/audio/button.mp3',
        },
        menuSelect: {
            key: 'sfx_select',
            path: 'assets/audio/select.mp3',
        },
        // Game events
        waveStart: {
            key: 'sfx_wave_start',
            path: 'assets/audio/wave_start.mp3',
        },
        victory: {
            key: 'sfx_victory',
            path: 'assets/audio/victory.mp3',
        },
        gameOver: {
            key: 'sfx_game_over',
            path: 'assets/audio/game_over.mp3',
        },
    },
};

// Generate per-level enemy asset entries (level1/scout.png, level2/boss_sheet.png, etc.)
// Drop sprites into assets/images/enemies/level{N}/ to override the defaults for that level.
(function registerPerLevelEnemyAssets() {
    const enemyNames = ['scout', 'interceptor', 'destroyer', 'boss'];
    const sheetDefaults = {
        scout:       { frameWidth: 128, frameHeight: 128 },
        interceptor: { frameWidth: 64,  frameHeight: 64 },
        destroyer:   { frameWidth: 128, frameHeight: 128 },
        boss:        { frameWidth: 256, frameHeight: 256 },
    };

    for (let level = 1; level <= 5; level++) {
        for (const name of enemyNames) {
            ASSET_CONFIG.enemies[`level${level}_${name}`] = {
                key: `enemy_${name}_l${level}`,
                path: `enemies/level${level}/${name}.png`,
            };
            const defaults = sheetDefaults[name];
            ASSET_CONFIG.spritesheets[`level${level}_${name}Animated`] = {
                key: `enemy_${name}_anim_l${level}`,
                path: `enemies/level${level}/${name}_sheet.png`,
                frameWidth: defaults.frameWidth,
                frameHeight: defaults.frameHeight,
            };
        }
    }
})();

// Asset Manager - handles loading and checking if assets exist
class AssetManager {
    constructor() {
        this.loadedAssets = new Set();
        this.failedAssets = new Set();
        this.soundEnabled = true;
        this.soundVolume = 0.5;
        this.currentScene = null;
    }

    _setupListeners(scene) {
        scene.load.on('filecomplete', (key) => {
            this.loadedAssets.add(key);
        });
        scene.load.on('loaderror', (file) => {
            this.failedAssets.add(file.key);
        });
    }

    _loadImage(scene, basePath, config) {
        if (!this.loadedAssets.has(config.key)) {
            scene.load.image(config.key, basePath + '/' + config.path);
        }
    }

    _loadSheet(scene, basePath, config) {
        if (!this.loadedAssets.has(config.key)) {
            scene.load.spritesheet(config.key, basePath + '/' + config.path, {
                frameWidth: config.frameWidth,
                frameHeight: config.frameHeight,
            });
        }
    }

    preloadForLevel(scene, level) {
        const basePath = ThemeManager.basePath();
        this._setupListeners(scene);

        for (const [, config] of Object.entries(ASSET_CONFIG.ships)) {
            this._loadImage(scene, basePath, config);
        }
        for (const name of ['scout', 'interceptor', 'destroyer', 'boss']) {
            const config = ASSET_CONFIG.enemies[name];
            if (config) this._loadImage(scene, basePath, config);
        }
        for (const [, config] of Object.entries(ASSET_CONFIG.weapons)) {
            this._loadImage(scene, basePath, config);
        }
        for (const [, config] of Object.entries(ASSET_CONFIG.effects)) {
            this._loadImage(scene, basePath, config);
        }
        for (const [, config] of Object.entries(ASSET_CONFIG.icons)) {
            this._loadImage(scene, basePath, config);
        }
        for (const [, config] of Object.entries(ASSET_CONFIG.ui)) {
            this._loadImage(scene, basePath, config);
        }

        const bgConfig = ASSET_CONFIG.backgrounds[`level${level}`];
        if (bgConfig) this._loadImage(scene, basePath, bgConfig);

        for (const name of ['playerAnimated', 'scoutAnimated', 'interceptorAnimated',
            'destroyerAnimated', 'bossAnimated', 'explosionAnimated', 'voidZoneAnimated']) {
            const config = ASSET_CONFIG.spritesheets[name];
            if (config) this._loadSheet(scene, basePath, config);
        }

        for (const enemyName of ['scout', 'interceptor', 'destroyer', 'boss']) {
            const staticConf = ASSET_CONFIG.enemies[`level${level}_${enemyName}`];
            if (staticConf) this._loadImage(scene, basePath, staticConf);
            const animConf = ASSET_CONFIG.spritesheets[`level${level}_${enemyName}Animated`];
            if (animConf) this._loadSheet(scene, basePath, animConf);
        }
    }

    preloadAll(scene) {
        const basePath = ThemeManager.basePath();
        this._setupListeners(scene);

        for (const category of ['ships', 'enemies', 'weapons', 'effects', 'ui', 'backgrounds', 'icons']) {
            const assets = ASSET_CONFIG[category];
            for (const [, config] of Object.entries(assets)) {
                this._loadImage(scene, basePath, config);
            }
        }

        for (const [, config] of Object.entries(ASSET_CONFIG.spritesheets)) {
            this._loadSheet(scene, basePath, config);
        }

        for (const [, config] of Object.entries(ASSET_CONFIG.audio)) {
            if (!this.loadedAssets.has(config.key)) {
                scene.load.audio(config.key, config.path);
            }
        }
    }
    
    // Set current scene for audio playback
    setScene(scene) {
        this.currentScene = scene;
    }
    
    // Check if a specific asset is loaded
    hasAsset(key) {
        return this.loadedAssets.has(key) && !this.failedAssets.has(key);
    }
    
    // Get asset key if loaded, otherwise return null
    getAsset(category, name) {
        const config = ASSET_CONFIG[category]?.[name];
        if (config && this.hasAsset(config.key)) {
            return config.key;
        }
        // Also check spritesheets if category matches
        if (category === 'spritesheets') {
            const ssConfig = ASSET_CONFIG.spritesheets?.[name];
            if (ssConfig && this.hasAsset(ssConfig.key)) {
                return ssConfig.key;
            }
        }
        return null;
    }
    
    // Play a sound effect
    playSound(name, config = {}) {
        if (!this.soundEnabled || !this.currentScene) return null;
        
        const audioConfig = ASSET_CONFIG.audio?.[name];
        if (!audioConfig || !this.hasAsset(audioConfig.key)) return null;
        
        try {
            const sound = this.currentScene.sound.play(audioConfig.key, {
                volume: (config.volume || 1) * this.soundVolume,
                rate: config.rate || 1,
                detune: config.detune || 0,
                loop: config.loop || false,
            });
            return sound;
        } catch (e) {
            // Silently fail if audio context not ready
            return null;
        }
    }
    
    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    // Set volume (0-1)
    setVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    // Helper to create sprite or fallback to shape
    createSprite(scene, x, y, category, name, fallbackFn) {
        const assetKey = this.getAsset(category, name);
        if (assetKey) {
            return scene.add.sprite(x, y, assetKey);
        }
        // Use fallback graphics if sprite not available
        return fallbackFn ? fallbackFn() : null;
    }
    
    // Helper to create physics sprite or fallback
    createPhysicsSprite(scene, x, y, category, name, fallbackFn) {
        const assetKey = this.getAsset(category, name);
        if (assetKey) {
            return scene.physics.add.sprite(x, y, assetKey);
        }
        return fallbackFn ? fallbackFn() : null;
    }
}

// Global asset manager instance
const Assets = new AssetManager();

// Weapon System
class WeaponManager {
    constructor(scene, hero) {
        this.scene = scene;
        this.hero = hero;
        this.equippedWeapons = {}; // { weaponId: { tier: 0, lastFired: 0 } }
        this.projectiles = scene.add.group();
        this.voidZones = []; // Array of void zone objects
        this.spiritOrbs = [];
        this.spiritOrbAngle = 0;
        
        // Cache damage multiplier from upgrades
        this.damageMultiplier = ProgressManager.getWeaponDamageMultiplier();
        
        // Auto-equip starter laser weapon
        this.equipStarterWeapon();
        
        // Debug: equip starting weapon if set
        if (DEBUG_CONFIG.startingWeapon && DEBUG_CONFIG.startingWeapon !== 'none') {
            this.equipWeapon(DEBUG_CONFIG.startingWeapon);
        }
    }
    
    equipStarterWeapon() {
        // Equip the base laser - doesn't count toward weapon slots
        this.equippedWeapons['laser'] = { tier: 0, lastFired: 0, isStarter: true };
    }
    
    // Get effective damage with multiplier applied
    getEffectiveDamage(baseDamage) {
        return Math.floor(baseDamage * this.damageMultiplier);
    }

    equipWeapon(weaponId) {
        if (!this.equippedWeapons[weaponId]) {
            this.equippedWeapons[weaponId] = { tier: 0, lastFired: 0 };
            return true;
        }
        return false;
    }

    upgradeWeapon(weaponId) {
        if (this.equippedWeapons[weaponId]) {
            const weapon = this.equippedWeapons[weaponId];
            if (weapon.tier < 4) {
                weapon.tier++;
                return true;
            }
        }
        return false;
    }

    getWeaponTier(weaponId) {
        return this.equippedWeapons[weaponId]?.tier ?? -1;
    }

    adjustTimersForPause(pauseDuration) {
        Object.keys(this.equippedWeapons).forEach(weaponId => {
            this.equippedWeapons[weaponId].lastFired += pauseDuration;
        });
    }

    update(time, enemies) {
        Object.keys(this.equippedWeapons).forEach(weaponId => {
            const weaponData = this.equippedWeapons[weaponId];
            const weaponConfig = WEAPONS[weaponId];
            const tierConfig = weaponConfig.tiers[weaponData.tier];

            if (time - weaponData.lastFired >= tierConfig.cooldown) {
                this.fireWeapon(weaponId, tierConfig, weaponConfig.color, enemies);
                weaponData.lastFired = time;
            }
        });

        // Update projectiles
        this.updateProjectiles(enemies);
        
        // Update void zones
        this.updateVoidZones(time, enemies);
    }

    fireWeapon(weaponId, config, color, enemies) {
        switch (weaponId) {
            case 'laser':
                this.fireLaser(config, color, enemies);
                break;
            case 'fireball':
                this.fireFireball(config, color, enemies);
                break;
            case 'lightning':
                this.fireLightning(config, color, enemies);
                break;
            case 'frostNova':
                this.fireFrostNova(config, color, enemies);
                break;
            case 'voidZone':
                this.fireVoidZone(config, color, enemies);
                break;
            case 'spiritOrbs':
                this.updateSpiritOrbs(config, color, enemies);
                break;
        }
        
        // Play weapon sound (except for spirit orbs which are continuous)
        if (weaponId !== 'spiritOrbs') {
            Assets.playSound(weaponId, { volume: 0.4, rate: 0.9 + Math.random() * 0.2 });
        }
    }
    
    fireLaser(config, color, enemies) {
        // Find nearest enemy within range
        let nearestEnemy = null;
        let nearestDist = Infinity;

        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(
                this.hero.x, this.hero.y,
                enemy.x, enemy.y
            );
            if (dist < nearestDist && dist <= config.range) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            const angle = Phaser.Math.Angle.Between(
                this.hero.x, this.hero.y,
                nearestEnemy.x, nearestEnemy.y
            );

            // Create laser bolt (simple glowing line)
            const projectile = this.scene.add.rectangle(
                this.hero.x, this.hero.y,
                config.size * 4, config.size,
                color
            );
            projectile.setRotation(angle);
            
            // Add glow effect
            const glow = this.scene.add.rectangle(
                this.hero.x, this.hero.y,
                config.size * 5, config.size * 2,
                color, 0.4
            );
            glow.setRotation(angle);
            
            this.scene.physics.add.existing(projectile);
            projectile.body.setSize(config.size * 3, config.size * 2);
            
            const velocityX = Math.cos(angle) * config.projectileSpeed;
            const velocityY = Math.sin(angle) * config.projectileSpeed;
            projectile.body.setVelocity(velocityX, velocityY);

            // Set radius for collision detection (used by updateProjectiles)
            projectile.radius = config.size * 2;
            
            projectile.glow = glow;
            projectile.weaponData = {
                type: 'laser',
                damage: config.damage,
                pierce: 1,
                pierceCount: 0,
                color: color
            };

            this.projectiles.add(projectile);

            // Muzzle flash
            const flash = this.scene.add.circle(this.hero.x, this.hero.y, 8, color, 0.8);
            this.scene.tweens.add({
                targets: flash,
                scale: 0,
                alpha: 0,
                duration: 100,
                onComplete: () => flash.destroy()
            });

            // Auto-destroy after 1 second
            this.scene.time.delayedCall(1000, () => {
                if (projectile.active) {
                    if (projectile.glow) projectile.glow.destroy();
                    projectile.destroy();
                }
            });
        }
    }

    fireFireball(config, color, enemies) {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(
                this.hero.x, this.hero.y,
                enemy.x, enemy.y
            );
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            const angle = Phaser.Math.Angle.Between(
                this.hero.x, this.hero.y,
                nearestEnemy.x, nearestEnemy.y
            );

            // Create fireball container
            const container = this.scene.add.container(this.hero.x, this.hero.y);
            
            // Check if fireball sprite is available
            const fireballKey = Assets.getAsset('weapons', 'fireball');
            
            if (fireballKey) {
                // Use sprite image
                const fireballSprite = this.scene.add.sprite(0, 0, fireballKey);
                fireballSprite.setDisplaySize(config.size * 3, config.size * 3);
                fireballSprite.setRotation(angle);
                container.add(fireballSprite);
                
                // Add subtle glow behind sprite
                const glow = this.scene.add.circle(0, 0, config.size * 1.5, 0xff6600, 0.3);
                container.addAt(glow, 0); // Add behind sprite
                
                // Pulsing glow animation
                this.scene.tweens.add({
                    targets: glow,
                    scale: 1.4,
                    alpha: 0.1,
                    duration: 100,
                    yoyo: true,
                    repeat: -1
                });
            } else {
                // Fallback to vector graphics
                const outerGlow = this.scene.add.circle(0, 0, config.size + 8, 0xff6600, 0.3);
                const middleFlame = this.scene.add.circle(0, 0, config.size + 4, 0xff4400, 0.6);
                const core = this.scene.add.circle(0, 0, config.size, 0xffaa00);
                core.setStrokeStyle(2, 0xffff00, 0.8);
                const center = this.scene.add.circle(0, 0, config.size * 0.4, 0xffffaa);
                
                container.add([outerGlow, middleFlame, core, center]);
                
                this.scene.tweens.add({
                    targets: outerGlow,
                    scale: 1.3,
                    alpha: 0.1,
                    duration: 100,
                    yoyo: true,
                    repeat: -1
                });
            }
            
            // Create physics body
            const projectile = this.scene.add.circle(this.hero.x, this.hero.y, config.size, 0x000000, 0);
            this.scene.physics.add.existing(projectile);
            projectile.body.setCircle(config.size);
            
            const velocityX = Math.cos(angle) * config.projectileSpeed;
            const velocityY = Math.sin(angle) * config.projectileSpeed;
            projectile.body.setVelocity(velocityX, velocityY);

            projectile.container = container;
            projectile.weaponData = {
                type: 'fireball',
                damage: config.damage,
                pierce: config.pierce,
                pierceCount: 0,
                color: color
            };

            this.projectiles.add(projectile);

            // Auto-destroy after 3 seconds
            this.scene.time.delayedCall(3000, () => {
                if (projectile.active) {
                    if (projectile.container) projectile.container.destroy();
                    projectile.destroy();
                }
            });
        }
    }

    fireLightning(config, color, enemies) {
        const inRange = [];
        
        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(
                this.hero.x, this.hero.y,
                enemy.x, enemy.y
            );
            if (dist <= config.range) {
                inRange.push({ enemy, dist });
            }
        });

        if (inRange.length === 0) return;

        // Sort by distance and take up to 'chains' enemies
        inRange.sort((a, b) => a.dist - b.dist);
        const targets = inRange.slice(0, config.chains);

        let prevX = this.hero.x;
        let prevY = this.hero.y;

        targets.forEach(({ enemy }, index) => {
            // Draw lightning bolt
            this.drawLightning(prevX, prevY, enemy.x, enemy.y, color);
            
            // Deal damage (with multiplier)
            enemy.takeDamage(this.getEffectiveDamage(config.damage));
            
            prevX = enemy.x;
            prevY = enemy.y;
        });
    }

    drawLightning(x1, y1, x2, y2, color) {
        const graphics = this.scene.add.graphics();
        
        // Create jagged lightning effect
        const segments = 8;
        const points = [{ x: x1, y: y1 }];
        
        const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const baseX = x1 + (x2 - x1) * t;
            const baseY = y1 + (y2 - y1) * t;
            const offset = (Math.random() - 0.5) * 30;
            const perpX = -(y2 - y1) / dist * offset;
            const perpY = (x2 - x1) / dist * offset;
            points.push({ x: baseX + perpX, y: baseY + perpY });
        }
        points.push({ x: x2, y: y2 });

        // Outer glow (thickest, most transparent)
        graphics.lineStyle(12, color, 0.15);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach(p => graphics.lineTo(p.x, p.y));
        graphics.strokePath();
        
        // Middle glow
        graphics.lineStyle(6, color, 0.4);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach(p => graphics.lineTo(p.x, p.y));
        graphics.strokePath();

        // Core (brightest)
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach(p => graphics.lineTo(p.x, p.y));
        graphics.strokePath();
        
        // Add spark at impact point
        const spark = this.scene.add.circle(x2, y2, 8, color, 0.8);
        spark.setStrokeStyle(2, 0xffffff, 1);
        this.scene.tweens.add({
            targets: spark,
            scale: 2,
            alpha: 0,
            duration: 150,
            onComplete: () => spark.destroy()
        });

        // Fade out
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy()
        });
    }

    fireFrostNova(config, color, enemies) {
        const x = this.hero.x;
        const y = this.hero.y;
        
        // Multiple expanding rings
        for (let r = 0; r < 3; r++) {
            const ring = this.scene.add.circle(x, y, 10, 0x000000, 0);
            ring.setStrokeStyle(4 - r, color, 0.8 - r * 0.2);

            this.scene.tweens.add({
                targets: ring,
                scale: config.range / 10,
                alpha: 0,
                duration: 400,
                delay: r * 80,
                ease: 'Power2',
                onComplete: () => ring.destroy()
            });
        }
        
        // Ground frost effect
        const frost = this.scene.add.circle(x, y, config.range, color, 0.2);
        this.scene.tweens.add({
            targets: frost,
            alpha: 0,
            duration: 500,
            onComplete: () => frost.destroy()
        });

        // Ice crystal particles
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const dist = config.range * (0.5 + Math.random() * 0.5);
            
            // Create snowflake/crystal shape
            const crystal = this.scene.add.star(x, y, 6, 3, 8, 0xaaeeff, 0.9);
            crystal.setStrokeStyle(1, 0xffffff, 0.8);
            
            this.scene.tweens.add({
                targets: crystal,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                rotation: Math.PI,
                scale: 0.3,
                duration: 400,
                ease: 'Power2',
                onComplete: () => crystal.destroy()
            });
        }
        
        // Inner burst particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const particle = this.scene.add.circle(x, y, 6, 0xffffff, 0.8);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * config.range * 0.6,
                y: y + Math.sin(angle) * config.range * 0.6,
                alpha: 0,
                scale: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Damage and slow enemies in range
        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (dist <= config.range) {
                // Store enemy position/size before damage (enemy might die)
                const enemyX = enemy.x;
                const enemyY = enemy.y;
                const enemyRadius = enemy.radius || 16;
                
                // Frost impact effect (create before damage in case enemy dies)
                const frostHit = this.scene.add.circle(enemyX, enemyY, enemyRadius, color, 0.5);
                this.scene.tweens.add({
                    targets: frostHit,
                    scale: 1.5,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => frostHit.destroy()
                });
                
                // Deal damage (with multiplier)
                enemy.takeDamage(this.getEffectiveDamage(config.damage));
                
                // Apply slow only if enemy survived
                if (enemy.active && enemy.applySlow) {
                    enemy.applySlow(config.slowAmount, config.slowDuration);
                }
            }
        });
    }

    updateProjectiles(enemies) {
        this.projectiles.getChildren().forEach(projectile => {
            if (!projectile.active) return;
            
            // Sync container position
            if (projectile.container) {
                projectile.container.x = projectile.x;
                projectile.container.y = projectile.y;
            }
            
            // Sync laser glow position
            if (projectile.glow) {
                projectile.glow.x = projectile.x;
                projectile.glow.y = projectile.y;
            }
            
            // Create trail for fireballs
            if (projectile.weaponData.type === 'fireball' && Math.random() > 0.5) {
                const trail = this.scene.add.circle(
                    projectile.x + (Math.random() - 0.5) * 8,
                    projectile.y + (Math.random() - 0.5) * 8,
                    4 + Math.random() * 4,
                    0xff6600,
                    0.6
                );
                trail.setDepth(-1);
                
                this.scene.tweens.add({
                    targets: trail,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => trail.destroy()
                });
            }

            // Check collision with enemies
            enemies.getChildren().forEach(enemy => {
                if (!enemy.active || !projectile.active) return;
                
                const dist = Phaser.Math.Distance.Between(
                    projectile.x, projectile.y,
                    enemy.x, enemy.y
                );

                if (dist < projectile.radius + enemy.radius) {
                    enemy.takeDamage(this.getEffectiveDamage(projectile.weaponData.damage));
                    projectile.weaponData.pierceCount++;
                    
                    // Create hit effect
                    this.createHitEffect(projectile.x, projectile.y, projectile.weaponData.color || 0xff4400);

                    if (projectile.weaponData.pierceCount >= projectile.weaponData.pierce) {
                        if (projectile.container) projectile.container.destroy();
                        if (projectile.glow) projectile.glow.destroy();
                        projectile.destroy();
                    }
                }
            });

            // Remove if out of bounds
            if (projectile.x < 0 || projectile.x > GAME_CONFIG.worldWidth ||
                projectile.y < 0 || projectile.y > GAME_CONFIG.worldHeight) {
                if (projectile.container) projectile.container.destroy();
                if (projectile.glow) projectile.glow.destroy();
                projectile.destroy();
            }
        });
    }

    createHitEffect(x, y, color) {
        // Impact flash
        const flash = this.scene.add.circle(x, y, 15, 0xffffff, 0.8);
        this.scene.tweens.add({
            targets: flash,
            scale: 0,
            alpha: 0,
            duration: 100,
            onComplete: () => flash.destroy()
        });
        
        // Expanding ring
        const ring = this.scene.add.circle(x, y, 5, 0x000000, 0);
        ring.setStrokeStyle(2, color, 1);
        this.scene.tweens.add({
            targets: ring,
            scale: 3,
            alpha: 0,
            duration: 200,
            onComplete: () => ring.destroy()
        });
        
        // Spark particles
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                x, y, 2 + Math.random() * 3, color, 1
            );
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 40;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 250,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    fireVoidZone(config, color, enemies) {
        if (!config || !this.hero) return;
        
        // Find a spot with enemies nearby
        let targetX = this.hero.x + (Math.random() - 0.5) * 200;
        let targetY = this.hero.y + (Math.random() - 0.5) * 200;
        
        // Try to place near an enemy if possible
        const nearbyEnemies = [];
        enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y);
            if (dist < 300) {
                nearbyEnemies.push(enemy);
            }
        });
        
        if (nearbyEnemies.length > 0) {
            const target = nearbyEnemies[Math.floor(Math.random() * nearbyEnemies.length)];
            targetX = target.x;
            targetY = target.y;
        }
        
        // Create void zone container
        const container = this.scene.add.container(targetX, targetY);
        
        const spriteKey = Assets.getAsset('spritesheets', 'voidZoneAnimated');
        if (spriteKey) {
            const sprite = this.scene.add.sprite(0, 0, spriteKey);
            const frameSize = ASSET_CONFIG.spritesheets.voidZoneAnimated.frameWidth;
            sprite.setScale((config.range * 2) / frameSize);
            
            const animKey = 'voidzone_loop';
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 5 }),
                    frameRate: 8,
                    repeat: -1
                });
            }
            sprite.play(animKey);
            container.add(sprite);
        } else {
            const outerGlow = this.scene.add.circle(0, 0, config.range, color, 0.15);
            const swirl = this.scene.add.circle(0, 0, config.range * 0.8, 0x000000, 0);
            swirl.setStrokeStyle(3, color, 0.6);
            const inner = this.scene.add.circle(0, 0, config.range * 0.3, 0x220033, 0.8);
            inner.setStrokeStyle(2, color, 1);
            container.add([outerGlow, swirl, inner]);
            
            this.scene.tweens.add({
                targets: swirl,
                rotation: Math.PI * 2,
                duration: 2000, repeat: -1, ease: 'Linear'
            });
            this.scene.tweens.add({
                targets: outerGlow,
                scale: 1.1, alpha: 0.1,
                duration: 500, yoyo: true, repeat: -1
            });
        }
        
        // Spawn animation
        container.setScale(0);
        container.setAlpha(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Zone data
        const zone = {
            container,
            x: targetX,
            y: targetY,
            range: config.range,
            damage: config.damage,
            tickRate: config.tickRate,
            lastTick: 0,
            expiresAt: this.scene.time.now + config.duration,
            damagedEnemies: new Set()
        };
        
        this.voidZones.push(zone);
        
        // Schedule destruction
        this.scene.time.delayedCall(config.duration, () => {
            this.scene.tweens.add({
                targets: container,
                scale: 0,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    container.destroy();
                    const index = this.voidZones.indexOf(zone);
                    if (index > -1) {
                        this.voidZones.splice(index, 1);
                    }
                }
            });
        });
    }

    updateSpiritOrbs(config, color, enemies) {
        if (!config || !this.hero) return;
        
        // Add orbs if needed
        while (this.spiritOrbs.length < config.orbCount) {
            const container = this.scene.add.container(this.hero.x, this.hero.y);
            
            // Outer glow
            const glow = this.scene.add.circle(0, 0, 14, color, 0.3);
            
            // Main orb
            const orb = this.scene.add.circle(0, 0, 8, color);
            orb.setStrokeStyle(2, 0xffffff, 0.8);
            
            // Inner bright core
            const core = this.scene.add.circle(0, 0, 4, 0xffffff, 0.9);
            
            container.add([glow, orb, core]);
            
            // Spawn animation
            container.setScale(0);
            this.scene.tweens.add({
                targets: container,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            // Pulsing glow
            this.scene.tweens.add({
                targets: glow,
                scale: 1.3,
                alpha: 0.15,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
            
            this.spiritOrbs.push({
                container,
                angleOffset: (this.spiritOrbs.length / config.orbCount) * Math.PI * 2,
                damage: config.damage,
                lastHit: {}
            });
        }
        
        // Remove excess orbs if downgraded (shouldn't happen but safety)
        while (this.spiritOrbs.length > config.orbCount) {
            const orb = this.spiritOrbs.pop();
            if (orb && orb.container) orb.container.destroy();
        }
        
        // Update orb positions and damage
        this.spiritOrbAngle += config.orbitSpeed * 0.016; // Approximate delta time
        
        this.spiritOrbs.forEach((orb, index) => {
            if (!orb || !orb.container) return;
            
            // Update damage value in case of upgrade
            orb.damage = config.damage;
            
            // Calculate position
            const angle = this.spiritOrbAngle + (index / config.orbCount) * Math.PI * 2;
            const x = this.hero.x + Math.cos(angle) * config.orbitRadius;
            const y = this.hero.y + Math.sin(angle) * config.orbitRadius;
            
            orb.container.x = x;
            orb.container.y = y;
            
            // Check collision with enemies
            enemies.getChildren().forEach(enemy => {
                if (!enemy || !enemy.active) return;
                
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist < 20 + enemy.radius) {
                    // Check cooldown per enemy (prevent rapid hits)
                    const now = this.scene.time.now;
                    const enemyId = enemy.id || 0;
                    if (!orb.lastHit[enemyId] || now - orb.lastHit[enemyId] > 500) {
                        enemy.takeDamage(this.getEffectiveDamage(orb.damage));
                        orb.lastHit[enemyId] = now;
                        
                        // Hit effect
                        this.createSpiritHitEffect(x, y, color);
                    }
                }
            });
        });
    }
    
    createSpiritHitEffect(x, y, color) {
        // Small sparkle burst
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const particle = this.scene.add.circle(x, y, 3, color, 1);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                alpha: 0,
                scale: 0,
                duration: 150,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    updateVoidZones(time, enemies) {
        if (!enemies) return;
        
        this.voidZones.forEach(zone => {
            if (!zone || !zone.container) return;
            
            // Tick damage
            if (time - zone.lastTick >= zone.tickRate) {
                zone.lastTick = time;
                
                enemies.getChildren().forEach(enemy => {
                    if (!enemy || !enemy.active) return;
                    
                    const dist = Phaser.Math.Distance.Between(zone.x, zone.y, enemy.x, enemy.y);
                    if (dist <= zone.range) {
                        enemy.takeDamage(this.getEffectiveDamage(zone.damage));
                        
                        // Damage tick visual
                        const tick = this.scene.add.circle(
                            enemy.x + (Math.random() - 0.5) * 10,
                            enemy.y + (Math.random() - 0.5) * 10,
                            4, WEAPONS.voidZone.color, 0.8
                        );
                        this.scene.tweens.add({
                            targets: tick,
                            y: tick.y - 15,
                            alpha: 0,
                            scale: 0,
                            duration: 300,
                            onComplete: () => tick.destroy()
                        });
                    }
                });
            }
        });
    }

    getAvailableUpgrades() {
        // Count only non-starter weapons
        const equippedCount = Object.keys(this.equippedWeapons).filter(id => 
            !this.equippedWeapons[id].isStarter
        ).length;
        // Get only non-starter weapons for upgrade options
        const allWeaponIds = Object.keys(WEAPONS).filter(id => !WEAPONS[id].isStarterWeapon);
        const upgrades = [];
        
        // Check if all weapon slots are full (use dynamic slot count from upgrades)
        const maxSlots = ProgressManager.getWeaponSlots();
        const slotsAreFull = equippedCount >= maxSlots;
        
        if (slotsAreFull) {
            // Only show upgrades for equipped weapons (excluding starter weapons)
            Object.keys(this.equippedWeapons).forEach(id => {
                if (!WEAPONS[id] || WEAPONS[id].isStarterWeapon) return; // Skip starter weapons
                const currentTier = this.getWeaponTier(id);
                if (currentTier < 4) {
                    upgrades.push({
                        id,
                        name: WEAPONS[id].name,
                        description: `Upgrade to Tier ${currentTier + 2}`,
                        action: 'upgrade',
                        tier: currentTier + 1,
                        color: WEAPONS[id].color,
                    });
                }
            });
        } else {
            // Show mix of new weapons and upgrades
            allWeaponIds.forEach(id => {
                if (!WEAPONS[id]) return; // Safety check
                const currentTier = this.getWeaponTier(id);
                
                if (currentTier === -1) {
                    // Not equipped - offer to equip
                    upgrades.push({
                        id,
                        name: WEAPONS[id].name,
                        description: WEAPONS[id].description,
                        action: 'equip',
                        tier: 0,
                        color: WEAPONS[id].color,
                    });
                } else if (currentTier < 4) {
                    // Can upgrade
                    upgrades.push({
                        id,
                        name: WEAPONS[id].name,
                        description: `Upgrade to Tier ${currentTier + 2}`,
                        action: 'upgrade',
                        tier: currentTier + 1,
                        color: WEAPONS[id].color,
                    });
                }
            });
        }

        // Shuffle and return up to 3 options (or less if fewer available)
        const shuffled = Phaser.Utils.Array.Shuffle(upgrades);
        return shuffled.slice(0, Math.min(3, shuffled.length));
    }
    
    getEquippedCount() {
        // Don't count starter weapons toward equipped count
        return Object.keys(this.equippedWeapons).filter(id => 
            !this.equippedWeapons[id].isStarter
        ).length;
    }
    
    getEquippedWeaponIds(includeStarter = true) {
        if (includeStarter) {
            return Object.keys(this.equippedWeapons);
        }
        return Object.keys(this.equippedWeapons).filter(id => 
            !this.equippedWeapons[id].isStarter
        );
    }
    
    cleanup() {
        // Clean up spirit orbs
        this.spiritOrbs.forEach(orb => {
            if (orb.container) orb.container.destroy();
        });
        this.spiritOrbs = [];
        
        // Clean up void zones
        this.voidZones.forEach(zone => {
            if (zone && zone.container) zone.container.destroy();
        });
        this.voidZones = [];
        
        // Clean up projectiles
        this.projectiles.getChildren().forEach(proj => {
            if (proj.container) proj.container.destroy();
        });
        this.projectiles.clear(true, true);
    }
}

// Enemy System
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.add.group();
        this.xpGems = scene.add.group();
        this.explosionAnimCreated = false;
    }

    playExplosion(x, y, scale = 1) {
        const spriteKey = Assets.getAsset('spritesheets', 'explosionAnimated');
        if (!spriteKey) return;

        if (!this.explosionAnimCreated) {
            this.scene.anims.create({
                key: 'explosion_play',
                frames: this.scene.anims.generateFrameNumbers(spriteKey, { start: 0, end: 5 }),
                frameRate: 12,
                repeat: 0
            });
            this.explosionAnimCreated = true;
        }

        const explosion = this.scene.add.sprite(x, y, spriteKey);
        explosion.setScale(scale);
        explosion.setDepth(100);
        explosion.play('explosion_play');
        explosion.once('animationcomplete', () => explosion.destroy());
    }

    buildBossShip(config, container) {
        const size = config.size;
        const parts = {};
        const level = this.scene.currentLevel || 1;
        
        // Resolve sprite: level-specific animated → base animated → level-specific static → base static
        const levelAnimKey = `level${level}_bossAnimated`;
        const baseAnimKey = 'bossAnimated';
        
        const animatedSpriteKey = Assets.getAsset('spritesheets', levelAnimKey)
                               || Assets.getAsset('spritesheets', baseAnimKey);
        if (animatedSpriteKey) {
            const sheetConfigKey = Assets.hasAsset(ASSET_CONFIG.spritesheets[levelAnimKey]?.key)
                ? levelAnimKey : baseAnimKey;
            
            parts.sprite = this.scene.add.sprite(0, 0, animatedSpriteKey);
            const frameSize = ASSET_CONFIG.spritesheets[sheetConfigKey].frameWidth;
            parts.sprite.setScale((size * 2) / (frameSize / 4));
            
            const animKey = `boss_fly_l${level}`;
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(animatedSpriteKey, { start: 0, end: 5 }),
                    frameRate: 6,
                    repeat: -1
                });
            }
            parts.sprite.play(animKey);
            
            parts.body = parts.sprite;
            container.add([parts.sprite]);
            return parts;
        }
        
        const levelStaticKey = `level${level}_boss`;
        const spriteKey = Assets.getAsset('enemies', levelStaticKey)
                       || Assets.getAsset('enemies', 'boss');
        if (spriteKey) {
            parts.sprite = this.scene.add.sprite(0, 0, spriteKey);
            parts.sprite.setScale((size * 2) / 64);
            
            parts.body = parts.sprite;
            container.add([parts.sprite]);
            return parts;
        }
        
        // Fallback: procedural boss visual
        const aura = this.scene.add.circle(0, 0, size * 2.2, config.glowColor, 0.08);
        container.add(aura);
        this.scene.tweens.add({
            targets: aura,
            scale: 1.3, alpha: 0.03,
            duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        
        const glow = this.scene.add.circle(0, 0, size * 1.5, config.glowColor, 0.2);
        container.add(glow);
        
        for (let i = 3; i >= 0; i--) {
            const ringSize = size * (0.5 + i * 0.2);
            const alpha = 0.4 + (3 - i) * 0.15;
            const ring = this.scene.add.circle(0, 0, ringSize, config.color, alpha);
            ring.setStrokeStyle(2, config.glowColor, 0.6);
            container.add(ring);
        }
        
        const eye = this.scene.add.circle(0, 0, size * 0.3, config.eyeColor, 0.9);
        eye.setStrokeStyle(3, 0xffffff, 0.5);
        container.add(eye);
        
        const eyeInner = this.scene.add.circle(0, 0, size * 0.15, 0xffffff, 0.7);
        container.add(eyeInner);
        
        const tentacleCount = 8;
        for (let i = 0; i < tentacleCount; i++) {
            const angle = (i / tentacleCount) * Math.PI * 2;
            const tx = Math.cos(angle) * size * 0.9;
            const ty = Math.sin(angle) * size * 0.9;
            const tentacle = this.scene.add.circle(tx, ty, size * 0.12, config.glowColor, 0.6);
            container.add(tentacle);
            
            this.scene.tweens.add({
                targets: tentacle,
                x: Math.cos(angle) * size * 1.1,
                y: Math.sin(angle) * size * 1.1,
                alpha: 0.3,
                duration: 1000 + Math.random() * 500,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                delay: i * 100
            });
        }
        
        this.scene.tweens.add({
            targets: eye, scale: 1.3, alpha: 0.6,
            duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: eyeInner, scale: 0.5, alpha: 1,
            duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        
        return { glow, body: eye, engineLight: eyeInner };
    }

    buildAlienShip(type, config, container) {
        const parts = {};
        const level = this.scene.currentLevel || 1;
        
        const assetMap = {
            'basic': 'scout',
            'fast': 'interceptor', 
            'tank': 'destroyer'
        };
        const baseName = assetMap[type];
        
        // Resolve sprite: level-specific animated → base animated → level-specific static → base static
        const levelAnimKey = `level${level}_${baseName}Animated`;
        const baseAnimKey = `${baseName}Animated`;
        const levelStaticKey = `level${level}_${baseName}`;
        const baseStaticKey = baseName;
        
        const animatedSpriteKey = Assets.getAsset('spritesheets', levelAnimKey)
                               || Assets.getAsset('spritesheets', baseAnimKey);
        
        if (animatedSpriteKey) {
            const sheetConfigKey = Assets.hasAsset(ASSET_CONFIG.spritesheets[levelAnimKey]?.key)
                ? levelAnimKey : baseAnimKey;
            
            parts.sprite = this.scene.add.sprite(0, 0, animatedSpriteKey);
            const frameSize = ASSET_CONFIG.spritesheets[sheetConfigKey].frameWidth;
            parts.sprite.setScale(config.size / (frameSize / 4));
            
            const animKey = `${baseName}_fly_l${level}`;
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(animatedSpriteKey, { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            parts.sprite.play(animKey);
            
            parts.body = parts.sprite;
            container.add([parts.sprite]);
            return parts;
        }
        
        const spriteKey = Assets.getAsset('enemies', levelStaticKey)
                       || Assets.getAsset('enemies', baseStaticKey);
        
        if (spriteKey) {
            parts.sprite = this.scene.add.sprite(0, 0, spriteKey);
            parts.sprite.setScale(config.size / 16);
            parts.body = parts.sprite;
            container.add([parts.sprite]);
            return parts;
        }
        
        console.warn(`No enemy sprite found for type: ${type}. Add assets/images/enemies/${baseName}.png or assets/images/enemies/level${level}/${baseName}.png`);
        
        parts.glow = this.scene.add.circle(0, 0, config.size * 0.8, config.glowColor, 0.3);
        parts.body = this.scene.add.circle(0, 0, config.size, config.color, 0.6);
        parts.body.setStrokeStyle(2, config.glowColor, 0.8);
        parts.engineLight = this.scene.add.circle(0, config.size * 0.5, config.size * 0.3, config.eyeColor, 0.7);
        container.add([parts.glow, parts.body, parts.engineLight]);
        
        return parts;
    }

    spawnEnemy(type, x, y, waveMultiplier = 1, levelHealthMult = 1, levelDamageMult = 1, levelSpeedMult = 1) {
        const config = ENEMY_TYPES[type];
        if (!config) return null;

        // Apply per-level size override if defined
        const levelConfig = this.scene.levelConfig;
        const sizeScale = (levelConfig?.enemySizeOverrides?.[type]) || 1;
        const scaledSize = config.size * sizeScale;

        const container = this.scene.add.container(x, y);
        
        const effectiveConfig = sizeScale !== 1 ? { ...config, size: scaledSize } : config;
        const shipParts = this.buildAlienShip(type, effectiveConfig, container);
        
        container.glow = shipParts.glow;
        container.body = shipParts.body;
        container.engineLight = shipParts.engineLight;
        
        const enemy = this.scene.add.circle(x, y, scaledSize, 0x000000, 0);
        this.scene.physics.add.existing(enemy);
        enemy.body.setCircle(scaledSize);

        enemy.id = Date.now() + Math.random();
        enemy.container = container;
        enemy.radius = scaledSize;
        enemy.enemyType = type;
        enemy.maxHealth = Math.floor(config.health * waveMultiplier * levelHealthMult);
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.floor(config.damage * waveMultiplier * levelDamageMult);
        enemy.baseSpeed = Math.floor(config.speed * levelSpeedMult);
        enemy.speed = enemy.baseSpeed;
        enemy.xpValue = config.xpValue;
        enemy.slowedUntil = 0;
        enemy.slowAmount = 0;

        // Health bar
        enemy.healthBar = this.scene.add.graphics();
        this.updateHealthBar(enemy);

        // Methods
        enemy.takeDamage = (amount) => this.enemyTakeDamage(enemy, amount);
        enemy.applySlow = (amount, duration) => this.applySlowToEnemy(enemy, amount, duration);
        
        // Spawn animation
        container.setScale(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        // Pulsing glow animation
        if (shipParts.glow) {
            this.scene.tweens.add({
                targets: shipParts.glow,
                scale: 1.2,
                alpha: 0.1,
                duration: 800 + Math.random() * 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        this.enemies.add(enemy);
        return enemy;
    }

    spawnBoss(x, y, levelHealthMult = 1, levelDamageMult = 1) {
        const config = ENEMY_TYPES.boss;
        
        const container = this.scene.add.container(x, y);
        const shipParts = this.buildBossShip(config, container);
        
        container.glow = shipParts.glow;
        container.body = shipParts.body;
        container.engineLight = shipParts.engineLight;
        
        const enemy = this.scene.add.circle(x, y, config.size, 0x000000, 0);
        this.scene.physics.add.existing(enemy);
        enemy.body.setCircle(config.size);
        
        enemy.id = Date.now() + Math.random();
        enemy.container = container;
        enemy.radius = config.size;
        enemy.enemyType = 'boss';
        enemy.isBoss = true;
        enemy.maxHealth = Math.floor(config.health * levelHealthMult);
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.floor(config.damage * levelDamageMult);
        enemy.baseSpeed = config.speed;
        enemy.speed = enemy.baseSpeed;
        enemy.xpValue = config.xpValue;
        enemy.slowedUntil = 0;
        enemy.slowAmount = 0;
        enemy.anchorX = x;
        enemy.anchorY = y;
        
        enemy.healthBar = this.scene.add.graphics();
        this.updateHealthBar(enemy);
        
        enemy.takeDamage = (amount) => this.enemyTakeDamage(enemy, amount);
        enemy.applySlow = (amount, duration) => this.applySlowToEnemy(enemy, amount, duration);
        
        // Dramatic spawn animation
        container.setScale(0);
        container.setAlpha(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 1500,
            ease: 'Power2'
        });
        
        this.enemies.add(enemy);
        this.boss = enemy;
        return enemy;
    }

    enemyTakeDamage(enemy, amount) {
        if (!enemy || !enemy.active) return;
        
        enemy.health -= amount;
        this.updateHealthBar(enemy);
        
        // Flash effect on container
        if (enemy.container && enemy.container.body && enemy.container.body.setFillStyle) {
            enemy.container.body.setFillStyle(0xffffff);
            this.scene.tweens.add({
                targets: enemy.container,
                scale: 1.15,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    if (enemy.active && enemy.container && enemy.container.body && enemy.container.body.setFillStyle) {
                        enemy.container.body.setFillStyle(ENEMY_TYPES[enemy.enemyType].color);
                    }
                }
            });
        }

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    applySlowToEnemy(enemy, amount, duration) {
        // Safety check - enemy must exist and be active
        if (!enemy || !enemy.active) return;
        
        const now = this.scene.time.now;
        enemy.slowedUntil = now + duration;
        enemy.slowAmount = Math.max(enemy.slowAmount || 0, amount);
        
        // Visual indicator - frost effect on body
        // Only apply to shapes that support setFillStyle/setStrokeStyle (not Graphics objects)
        if (enemy.container && enemy.container.body && 
            typeof enemy.container.body.setFillStyle === 'function' &&
            typeof enemy.container.body.setStrokeStyle === 'function') {
            try {
                enemy.container.body.setStrokeStyle(3, WEAPONS.frostNova.color, 1);
                // Blend enemy color with frost blue
                const enemyConfig = ENEMY_TYPES[enemy.enemyType];
                if (enemyConfig) {
                    const enemyColor = Phaser.Display.Color.ValueToColor(enemyConfig.color);
                    const frostColor = Phaser.Display.Color.ValueToColor(0x88ddff);
                    const blended = Phaser.Display.Color.Interpolate.ColorWithColor(enemyColor, frostColor, 100, 30);
                    const blendedHex = Phaser.Display.Color.GetColor(blended.r, blended.g, blended.b);
                    enemy.container.body.setFillStyle(blendedHex);
                }
            } catch (e) {
                // Silently ignore if visual effect fails
            }
        }
        // Mark enemy as slowed for visual tracking
        enemy.isSlowedVisually = true;
    }

    updateHealthBar(enemy) {
        enemy.healthBar.clear();
        
        const barWidth = enemy.radius * 2;
        const barHeight = 4;
        const x = enemy.x - barWidth / 2;
        const y = enemy.y - enemy.radius - 8;

        // Background
        enemy.healthBar.fillStyle(COLORS.healthBarBg, 1);
        enemy.healthBar.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = enemy.health / enemy.maxHealth;
        enemy.healthBar.fillStyle(COLORS.healthBar, 1);
        enemy.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    killEnemy(enemy) {
        const x = enemy.x;
        const y = enemy.y;
        const config = ENEMY_TYPES[enemy.enemyType];
        const isBoss = enemy.isBoss;
        
        if (isBoss) {
            this.boss = null;
        }
        
        if (isBoss) {
            this.playBossDeathSequence(enemy, x, y, config);
            return;
        }
        
        Assets.playSound('enemyDeath', { volume: 0.3, rate: 0.8 + Math.random() * 0.4 });
        this.spawnXPGem(x, y, enemy.xpValue);
        
        const ring = this.scene.add.circle(x, y, enemy.radius, 0x000000, 0);
        ring.setStrokeStyle(3, config.color, 1);
        this.scene.tweens.add({
            targets: ring, scale: 3, alpha: 0,
            duration: 300, ease: 'Power2',
            onComplete: () => ring.destroy()
        });
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
            const dist = 40 + Math.random() * 30;
            const size = 3 + Math.random() * 5;
            const particle = this.scene.add.circle(x, y, size, config.color, 1);
            particle.setStrokeStyle(1, config.glowColor, 0.8);
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0, scale: 0,
                duration: 350, ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        const glow = this.scene.add.circle(x, y, enemy.radius * 0.5, config.glowColor, 0.8);
        this.scene.tweens.add({
            targets: glow, scale: 2, alpha: 0,
            duration: 200,
            onComplete: () => glow.destroy()
        });

        const explosionScale = enemy.radius / (32 * PIXEL_SCALE) + 0.5;
        this.playExplosion(x, y, explosionScale);

        if (enemy.container) {
            enemy.container.destroy();
        }
        enemy.healthBar.destroy();
        enemy.destroy();
    }

    playBossDeathSequence(enemy, x, y, config) {
        // Disable the boss so it can't deal damage during death sequence
        enemy.body.setVelocity(0, 0);
        enemy.damage = 0;

        const bossRadius = config.size;
        const totalDuration = 2500;
        const explosionCount = 14;
        const flashCount = 6;

        // Phase 1: Rapid white flashing on the boss container
        if (enemy.container) {
            for (let i = 0; i < flashCount; i++) {
                this.scene.time.delayedCall(i * 150, () => {
                    if (!enemy.container) return;
                    const flash = this.scene.add.circle(
                        enemy.container.x, enemy.container.y,
                        bossRadius * 1.2, 0xffffff, 0.7
                    );
                    flash.setDepth(99);
                    this.scene.tweens.add({
                        targets: flash, alpha: 0, scale: 1.3,
                        duration: 120,
                        onComplete: () => flash.destroy()
                    });
                });
            }
        }

        // Phase 2: Small explosions scattered across the boss body
        for (let i = 0; i < explosionCount; i++) {
            const delay = 200 + Math.random() * (totalDuration - 600);
            this.scene.time.delayedCall(delay, () => {
                const ox = x + (Math.random() - 0.5) * bossRadius * 1.8;
                const oy = y + (Math.random() - 0.5) * bossRadius * 1.8;
                this.playExplosion(ox, oy, 0.8 + Math.random() * 0.6);
                Assets.playSound('enemyDeath', { volume: 0.2, rate: 0.7 + Math.random() * 0.6 });

                // Small camera shake per explosion
                this.scene.cameras.main.shake(80, 0.005);
            });
        }

        // Phase 3: Final big explosion + cleanup
        this.scene.time.delayedCall(totalDuration, () => {
            Assets.playSound('enemyDeath', { volume: 0.8, rate: 0.5 });

            // Shower of gems
            for (let i = 0; i < 10; i++) {
                const ox = x + (Math.random() - 0.5) * bossRadius * 2;
                const oy = y + (Math.random() - 0.5) * bossRadius * 2;
                this.spawnXPGem(ox, oy, Math.floor(enemy.xpValue / 10));
            }

            // Big shockwave rings
            for (let r = 0; r < 3; r++) {
                const shockRing = this.scene.add.circle(x, y, bossRadius * 0.5, 0x000000, 0);
                shockRing.setStrokeStyle(4, config.glowColor, 0.9);
                this.scene.tweens.add({
                    targets: shockRing,
                    scale: 8 + r * 2, alpha: 0,
                    duration: 600 + r * 200,
                    delay: r * 100,
                    ease: 'Power2',
                    onComplete: () => shockRing.destroy()
                });
            }

            // Final burst particles
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
                const dist = 100 + Math.random() * 60;
                const size = 4 + Math.random() * 6;
                const particle = this.scene.add.circle(x, y, size, config.color, 1);
                particle.setStrokeStyle(1, config.glowColor, 0.8);
                this.scene.tweens.add({
                    targets: particle,
                    x: x + Math.cos(angle) * dist,
                    y: y + Math.sin(angle) * dist,
                    alpha: 0, scale: 0,
                    duration: 600, ease: 'Power2',
                    onComplete: () => particle.destroy()
                });
            }

            // Final big flash + camera effects
            const finalGlow = this.scene.add.circle(x, y, bossRadius, 0xffffff, 0.9);
            finalGlow.setDepth(100);
            this.scene.tweens.add({
                targets: finalGlow, scale: 6, alpha: 0,
                duration: 500,
                onComplete: () => finalGlow.destroy()
            });
            this.scene.cameras.main.shake(600, 0.03);
            this.scene.cameras.main.flash(400, 255, 200, 200);

            // Destroy boss
            if (enemy.container) {
                enemy.container.destroy();
            }
            enemy.healthBar.destroy();
            enemy.destroy();
        });
    }

    spawnXPGem(x, y, value) {
        // Determine gem color based on value
        const gemTier = this.getGemTier(value);
        const gemColor = gemTier.color;
        const glowColor = gemTier.glowColor;
        
        // Scale size based on value (bigger = more valuable)
        const sizeMultiplier = 1 + (value - 4) * 0.05; // Base at 4 XP
        const gemSize = XP_CONFIG.gemSize * Math.min(sizeMultiplier, 1.5);
        
        // Create gem container
        const container = this.scene.add.container(x, y);
        
        // Outer glow
        const glow = this.scene.add.circle(0, 0, gemSize + 8, glowColor, 0.35);
        
        // Secondary glow ring for higher value gems
        let ring = null;
        if (value >= 10) {
            ring = this.scene.add.circle(0, 0, gemSize + 4, 0x000000, 0);
            ring.setStrokeStyle(2, gemColor, 0.6);
        }
        
        // Main gem body (diamond shape)
        const gem = this.scene.add.star(0, 0, 4, gemSize * 0.5, gemSize, gemColor);
        gem.setStrokeStyle(2, 0xffffff, 0.7);
        
        // Inner highlight
        const highlight = this.scene.add.star(0, 0, 4, gemSize * 0.2, gemSize * 0.4, 0xffffff, 0.6);
        
        // Center sparkle for epic+ gems
        let sparkle = null;
        if (value >= 15) {
            sparkle = this.scene.add.circle(0, 0, gemSize * 0.15, 0xffffff, 0.9);
        }
        
        // Add elements to container
        if (ring) container.add(ring);
        container.add([glow, gem, highlight]);
        if (sparkle) container.add(sparkle);
        
        // Physics body (invisible)
        const physicsBody = this.scene.add.circle(x, y, gemSize, 0x000000, 0);
        this.scene.physics.add.existing(physicsBody);
        physicsBody.body.setCircle(gemSize);
        
        physicsBody.xpValue = value;
        physicsBody.radius = gemSize;
        physicsBody.container = container;
        physicsBody.gemColor = gemColor;
        
        // Spawn animation with pop
        container.setScale(0);
        this.scene.tweens.add({
            targets: container,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Floating animation (faster for higher value)
        const floatDuration = Math.max(400, 700 - value * 20);
        this.scene.tweens.add({
            targets: container,
            y: y - 6 - value * 0.3,
            yoyo: true,
            repeat: -1,
            duration: floatDuration,
            ease: 'Sine.easeInOut'
        });
        
        // Glow pulsing (more intense for higher value)
        this.scene.tweens.add({
            targets: glow,
            scale: 1.4,
            alpha: 0.15,
            yoyo: true,
            repeat: -1,
            duration: Math.max(300, 500 - value * 15)
        });
        
        // Ring rotation for rare+ gems
        if (ring) {
            this.scene.tweens.add({
                targets: ring,
                scale: 1.3,
                alpha: 0,
                duration: 800,
                repeat: -1
            });
        }
        
        // Sparkle pulse for epic+ gems
        if (sparkle) {
            this.scene.tweens.add({
                targets: sparkle,
                scale: 1.5,
                alpha: 0.4,
                yoyo: true,
                repeat: -1,
                duration: 200
            });
        }
        
        // Rotation (faster for higher value)
        const rotationDuration = Math.max(1500, 3000 - value * 100);
        this.scene.tweens.add({
            targets: [gem, highlight],
            rotation: Math.PI * 2,
            repeat: -1,
            duration: rotationDuration,
            ease: 'Linear'
        });

        this.xpGems.add(physicsBody);
    }
    
    getGemTier(value) {
        // Find the highest tier that matches the value
        let tier = XP_CONFIG.gemTiers[0];
        for (const t of XP_CONFIG.gemTiers) {
            if (value >= t.minValue) {
                tier = t;
            }
        }
        return tier;
    }

    update(hero, time) {
        const now = time;

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            // Update slow effect
            if (now >= enemy.slowedUntil) {
                enemy.speed = enemy.baseSpeed;
                enemy.slowAmount = 0;
                // Reset visual if it was slowed and body supports style methods
                if (enemy.isSlowedVisually && enemy.container && enemy.container.body && 
                    typeof enemy.container.body.setStrokeStyle === 'function' &&
                    typeof enemy.container.body.setFillStyle === 'function') {
                    const config = ENEMY_TYPES[enemy.enemyType];
                    enemy.container.body.setStrokeStyle(2, config.glowColor || 0x000000, 0.6);
                    enemy.container.body.setFillStyle(config.color);
                    enemy.isSlowedVisually = false;
                }
            } else {
                enemy.speed = enemy.baseSpeed * (1 - enemy.slowAmount);
            }

            if (enemy.isBoss) {
                // Boss wanders gently near its anchor point
                const driftDist = Phaser.Math.Distance.Between(
                    enemy.x, enemy.y, enemy.anchorX, enemy.anchorY
                );
                const leashRadius = 120 * PIXEL_SCALE;
                if (driftDist > leashRadius) {
                    const returnAngle = Phaser.Math.Angle.Between(
                        enemy.x, enemy.y, enemy.anchorX, enemy.anchorY
                    );
                    enemy.body.setVelocity(
                        Math.cos(returnAngle) * enemy.speed * 1.5,
                        Math.sin(returnAngle) * enemy.speed * 1.5
                    );
                } else {
                    // Layered sine waves for organic-feeling lateral + vertical drift
                    const vx = Math.sin(now * 0.0008) * enemy.speed * 0.6
                             + Math.sin(now * 0.0003) * enemy.speed * 0.3;
                    const vy = Math.cos(now * 0.0006) * enemy.speed * 0.6
                             + Math.cos(now * 0.00025) * enemy.speed * 0.3;
                    enemy.body.setVelocity(vx, vy);
                }
                
                if (enemy.container) {
                    enemy.container.x = enemy.x;
                    enemy.container.y = enemy.y;
                }
            } else {
                // Regular enemies move toward hero
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y,
                    hero.x, hero.y
                );
                
                enemy.body.setVelocity(
                    Math.cos(angle) * enemy.speed,
                    Math.sin(angle) * enemy.speed
                );
                
                if (enemy.container) {
                    enemy.container.x = enemy.x;
                    enemy.container.y = enemy.y;
                    const noRotate = this.scene.levelConfig?.noRotateEnemies;
                    if (!noRotate || !noRotate.includes(enemy.enemyType)) {
                        enemy.container.rotation = angle + Math.PI / 2;
                    }
                }
            }

            // Update health bar position
            enemy.healthBar.clear();
            this.updateHealthBar(enemy);
        });

        // Move XP gems toward hero if close
        this.xpGems.getChildren().forEach(gem => {
            if (!gem.active) return;

            const dist = Phaser.Math.Distance.Between(
                gem.x, gem.y,
                hero.x, hero.y
            );

            if (dist < XP_CONFIG.pickupRange * 2) {
                // Magnetic pull
                const angle = Phaser.Math.Angle.Between(
                    gem.x, gem.y,
                    hero.x, hero.y
                );
                const pullSpeed = 350 * (1 - dist / (XP_CONFIG.pickupRange * 2));
                gem.body.setVelocity(
                    Math.cos(angle) * pullSpeed,
                    Math.sin(angle) * pullSpeed
                );
            } else {
                gem.body.setVelocity(0, 0);
            }
            
            // Sync container position
            if (gem.container) {
                gem.container.x = gem.x;
                // Keep floating animation relative to current position
            }
        });
    }

    checkXPCollection(hero) {
        let collectedXP = 0;
        
        this.xpGems.getChildren().forEach(gem => {
            if (!gem.active) return;

            const dist = Phaser.Math.Distance.Between(
                gem.x, gem.y,
                hero.x, hero.y
            );

            if (dist < hero.radius + gem.radius) {
                collectedXP += gem.xpValue;
                
                const gemColor = gem.gemColor || 0x44ffaa;
                const tier = this.getGemTier(gem.xpValue);
                
                // Collection burst effect (more particles for higher value)
                const particleCount = 6 + Math.floor(gem.xpValue / 4);
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2;
                    const sparkle = this.scene.add.star(gem.x, gem.y, 4, 2, 5, gemColor, 1);
                    
                    this.scene.tweens.add({
                        targets: sparkle,
                        x: gem.x + Math.cos(angle) * (25 + gem.xpValue),
                        y: gem.y + Math.sin(angle) * (25 + gem.xpValue),
                        alpha: 0,
                        scale: 0,
                        rotation: Math.PI * 2,
                        duration: 300,
                        onComplete: () => sparkle.destroy()
                    });
                }
                
                // Flash ring for higher value gems
                if (gem.xpValue >= 10) {
                    const ring = this.scene.add.circle(gem.x, gem.y, gem.radius, 0x000000, 0);
                    ring.setStrokeStyle(3, gemColor, 1);
                    this.scene.tweens.add({
                        targets: ring,
                        scale: 3,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => ring.destroy()
                    });
                }
                
                // Convert color to hex string for text
                const colorHex = '#' + gemColor.toString(16).padStart(6, '0');
                
                // Collection text popup (bigger for higher value)
                const fontSize = 16 + Math.floor(gem.xpValue / 3);
                const popup = this.scene.add.text(gem.x, gem.y, `+${gem.xpValue}`, {
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Courier New',
                    color: colorHex,
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);

                this.scene.tweens.add({
                    targets: popup,
                    y: popup.y - 45,
                    alpha: 0,
                    scale: 1.4,
                    duration: 700,
                    ease: 'Power2',
                    onComplete: () => popup.destroy()
                });

                // Destroy container
                if (gem.container) {
                    gem.container.destroy();
                }
                gem.destroy();
            }
        });

        return collectedXP;
    }

    getSpawnPosition(hero) {
        const minDist = 400;
        const maxDist = 600;
        
        // Get hero's facing direction (rotation points "up" at -PI/2 when moving forward)
        // Convert to the direction the hero is facing
        const heroFacing = hero.rotation - Math.PI / 2;
        
        // Define a "no spawn zone" cone in front of the player (90 degrees = PI/2 radians)
        const noSpawnConeHalf = Math.PI / 4; // 45 degrees on each side of facing direction
        
        // Generate a random angle, but avoid the front cone
        // We'll spawn from the sides and behind (270 degrees of valid area)
        let angle;
        const validRangeSize = Math.PI * 2 - (noSpawnConeHalf * 2);
        const randomOffset = Math.random() * validRangeSize;
        
        // Start from the edge of the no-spawn zone (behind the cone)
        angle = heroFacing + noSpawnConeHalf + randomOffset;
        
        const dist = minDist + Math.random() * (maxDist - minDist);
        
        let x = hero.x + Math.cos(angle) * dist;
        let y = hero.y + Math.sin(angle) * dist;
        
        // Clamp to world bounds
        x = Phaser.Math.Clamp(x, 50, GAME_CONFIG.worldWidth - 50);
        y = Phaser.Math.Clamp(y, 50, GAME_CONFIG.worldHeight - 50);
        
        return { x, y };
    }

    getBossSpawnPosition() {
        if (!this.boss || !this.boss.active) return null;
        const angle = Math.random() * Math.PI * 2;
        const dist = this.boss.radius * 1.5 + Math.random() * 60;
        let x = this.boss.x + Math.cos(angle) * dist;
        let y = this.boss.y + Math.sin(angle) * dist;
        x = Phaser.Math.Clamp(x, 50, GAME_CONFIG.worldWidth - 50);
        y = Phaser.Math.Clamp(y, 50, GAME_CONFIG.worldHeight - 50);
        return { x, y };
    }

    getRandomEnemyType(wave) {
        // Unlock enemy types based on wave
        const available = ['basic'];
        if (wave >= 3) available.push('fast');
        if (wave >= 6) available.push('tank');
        
        return available[Math.floor(Math.random() * available.length)];
    }

    clearAll() {
        this.boss = null;
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.container) enemy.container.destroy();
            if (enemy.healthBar) enemy.healthBar.destroy();
        });
        this.enemies.clear(true, true);
        
        // Destroy gem containers
        this.xpGems.getChildren().forEach(gem => {
            if (gem.container) gem.container.destroy();
        });
        this.xpGems.clear(true, true);
    }

    adjustTimersForPause(pauseDuration) {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.slowedUntil > 0) {
                enemy.slowedUntil += pauseDuration;
            }
        });
    }
}

// Hero Class - Spaceship
class Hero {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create ship container
        this.container = scene.add.container(x, y);
        this.container.setDepth(10);
        
        // Ship components
        this.shipParts = {};
        this.equippedWeapons = [];
        
        // Build base ship
        this.buildShip();
        
        // Create physics body (invisible)
        this.sprite = scene.add.circle(x, y, HERO_CONFIG.size, 0x000000, 0);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(HERO_CONFIG.size);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Properties
        this.maxHealth = HERO_CONFIG.maxHealth;
        this.health = this.maxHealth;
        
        // Apply speed upgrade
        const speedMultiplier = ProgressManager.getSpeedMultiplier();
        this.speed = HERO_CONFIG.speed * speedMultiplier;
        
        this.radius = HERO_CONFIG.size;
        this.invincibleUntil = 0;
        this.rotation = 0; // Point right (90° clockwise from up)
        
        // Apply shield upgrade (hits absorbed at start)
        this.shieldCharges = ProgressManager.getShieldCharges();
        this.maxShieldCharges = this.shieldCharges;
        
        // XP & Leveling
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = XP_CONFIG.baseXpToLevel;
        
        // Trail effect
        this.lastTrailTime = 0;
        
        // Input
        this.setupInput();
        
        // Engine glow animation
        this.createEngineEffect();
        
        // Create shield visual if has shields
        if (this.shieldCharges > 0) {
            this.createShieldVisual();
        }
    }

    buildShip() {
        // Clear existing parts
        this.container.removeAll(true);
        this.shipParts = {};
        this.useSprite = false;
        
        // Check if animated sprite sheet is available (priority)
        const animatedSpriteKey = Assets.getAsset('spritesheets', 'playerAnimated');
        // Fallback to static sprite
        const staticSpriteKey = Assets.getAsset('ships', 'player');
        
        if (animatedSpriteKey) {
            // Use animated sprite sheet
            this.useSprite = true;
            this.useAnimatedSprite = true;
            this.shipParts.sprite = this.scene.add.sprite(0, 0, 'ship_player_anim');
            // Scale sprite to match hero size (HERO_CONFIG.size is already scaled)
            const frameSize = ASSET_CONFIG.spritesheets.playerAnimated.frameWidth;
            this.shipParts.sprite.setScale(HERO_CONFIG.size / (frameSize / 2));
            this.shipParts.sprite.setRotation(Math.PI / 2); // Rotate if sprite faces right
            
            // Create flying animation
            if (!this.scene.anims.exists('player_fly')) {
                this.scene.anims.create({
                    key: 'player_fly',
                    frames: this.scene.anims.generateFrameNumbers('ship_player_anim', { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            this.shipParts.sprite.play('player_fly');
            
            this.container.add([this.shipParts.sprite]);
        } else if (staticSpriteKey) {
            // Use static sprite-based ship
            this.useSprite = true;
            this.useAnimatedSprite = false;
            this.shipParts.sprite = this.scene.add.sprite(0, 0, staticSpriteKey);
            // Scale sprite to match hero size (assumes ~64px source sprite)
            this.shipParts.sprite.setScale(HERO_CONFIG.size / 32);
            
            // Add engine effect behind sprite (scaled)
            const ps = GAME_CONFIG.pixelScale;
            this.shipParts.engineFlame = this.scene.add.ellipse(0, 26 * ps, 8 * ps, 16 * ps, 0x00ccff, 0.8);
            
            this.container.add([
                this.shipParts.engineFlame,
                this.shipParts.sprite
            ]);
        } else {
            // No sprite available - show placeholder indicator
            console.warn('No player ship sprite found. Add assets/images/ships/player.png or player_animated spritesheet.');
            // Simple placeholder circle so player can still play
            const placeholder = this.scene.add.circle(0, 0, HERO_CONFIG.size * 0.8, 0xffffff, 0.5);
            placeholder.setStrokeStyle(2, 0x88ccff, 0.8);
            this.container.add(placeholder);
        }
        
        // Add weapon modules based on equipped weapons
        this.updateWeaponModules();
    }
    
    updateWeaponModules() {
        // Weapon modules removed - using sprite-based ship
        // If you want visual weapon attachments, add them to your ship sprite
    }
    
    addWeaponModule(weaponId) {
        // Weapon modules removed - using sprite-based ship
        // If you want visual weapon attachments, add them to your ship sprite
    }
    
    onWeaponEquipped(weaponId) {
        if (!this.equippedWeapons.includes(weaponId)) {
            this.equippedWeapons.push(weaponId);
            this.addWeaponModule(weaponId);
        }
    }
    
    onWeaponUpgraded(weaponId, newTier) {
        // Could add visual upgrades based on tier
        // For now, just ensure the module exists
        if (!this.equippedWeapons.includes(weaponId)) {
            this.onWeaponEquipped(weaponId);
        }
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    set x(val) { this.sprite.x = val; this.container.x = val; }
    set y(val) { this.sprite.y = val; this.container.y = val; }

    setupInput() {
        // Keyboard
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.scene.input.keyboard.addKey('W'),
            down: this.scene.input.keyboard.addKey('S'),
            left: this.scene.input.keyboard.addKey('A'),
            right: this.scene.input.keyboard.addKey('D'),
        };

        // Touch/Mouse joystick
        this.joystick = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
        this.joystickGraphics = this.scene.add.graphics();
        this.joystickGraphics.setScrollFactor(0);
        this.joystickGraphics.setDepth(100);

        this.scene.input.on('pointerdown', (pointer) => {
            if (this.scene.isPaused) return;
            this.joystick.active = true;
            this.joystick.startX = pointer.x;
            this.joystick.startY = pointer.y;
            this.joystick.currentX = pointer.x;
            this.joystick.currentY = pointer.y;
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.joystick.active) {
                this.joystick.currentX = pointer.x;
                this.joystick.currentY = pointer.y;
            }
        });

        this.scene.input.on('pointerup', () => {
            this.joystick.active = false;
            this.joystickGraphics.clear();
        });
    }

    createEngineEffect() {
        // Pulsing engine flame
        if (this.shipParts.engineFlame) {
            this.scene.tweens.add({
                targets: this.shipParts.engineFlame,
                scaleY: 1.5,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Engine glow pulse
        if (this.shipParts.engineGlow) {
            this.scene.tweens.add({
                targets: this.shipParts.engineGlow,
                scale: 1.3,
                alpha: 0.15,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    createShieldVisual() {
        // Create shield ring around ship
        this.shieldRing = this.scene.add.circle(0, 0, this.radius * 1.6, 0x000000, 0);
        this.shieldRing.setStrokeStyle(3, 0x44ccff, 0.8);
        this.container.add(this.shieldRing);
        this.container.sendToBack(this.shieldRing);
        
        // Shield glow
        this.shieldGlow = this.scene.add.circle(0, 0, this.radius * 1.8, 0x44ccff, 0.15);
        this.container.add(this.shieldGlow);
        this.container.sendToBack(this.shieldGlow);
        
        // Animate shield
        this.scene.tweens.add({
            targets: this.shieldRing,
            scale: 1.1,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.scene.tweens.add({
            targets: this.shieldGlow,
            scale: 1.2,
            alpha: 0.08,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Shield charge indicators
        this.updateShieldVisual();
    }
    
    updateShieldVisual() {
        if (!this.shieldRing) return;
        
        if (this.shieldCharges <= 0) {
            // Shield depleted - fade out and destroy
            this.scene.tweens.add({
                targets: [this.shieldRing, this.shieldGlow],
                alpha: 0,
                scale: 2,
                duration: 300,
                onComplete: () => {
                    if (this.shieldRing) this.shieldRing.destroy();
                    if (this.shieldGlow) this.shieldGlow.destroy();
                    this.shieldRing = null;
                    this.shieldGlow = null;
                }
            });
        } else {
            // Update shield appearance based on remaining charges
            const chargeRatio = this.shieldCharges / this.maxShieldCharges;
            const alpha = 0.4 + chargeRatio * 0.4;
            this.shieldRing.setStrokeStyle(2 + chargeRatio, 0x44ccff, alpha);
        }
    }
    
    createTrailParticle() {
        // Engine trail particles
        const offsetX = (Math.random() - 0.5) * 8;
        const particle = this.scene.add.circle(
            this.x + Math.sin(this.rotation) * 20 + offsetX,
            this.y + Math.cos(this.rotation) * 20,
            3 + Math.random() * 3,
            COLORS.shipEngine,
            0.6
        );
        particle.setDepth(5);
        
        this.scene.tweens.add({
            targets: particle,
            scale: 0,
            alpha: 0,
            y: particle.y + 30,
            duration: 300,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }

    update(time) {
        let vx = 0;
        let vy = 0;

        // Keyboard input
        if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
        if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
        if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
        if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

        // Touch joystick input
        if (this.joystick.active) {
            const dx = this.joystick.currentX - this.joystick.startX;
            const dy = this.joystick.currentY - this.joystick.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 60;

            if (dist > 10) {
                vx = dx / Math.max(dist, maxDist);
                vy = dy / Math.max(dist, maxDist);
            }

            this.drawJoystick();
        }

        // Normalize diagonal movement
        const isMoving = vx !== 0 || vy !== 0;
        if (isMoving) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / len) * this.speed;
            vy = (vy / len) * this.speed;
            
            // Rotate ship to face movement direction
            this.rotation = Math.atan2(vy, vx) + Math.PI / 2;
        }

        this.sprite.body.setVelocity(vx, vy);

        // Sync container with physics sprite
        this.container.x = this.sprite.x;
        this.container.y = this.sprite.y;
        this.container.rotation = this.rotation;
        
        // Create trail particles when moving
        if (isMoving && time - this.lastTrailTime > 50) {
            this.createTrailParticle();
            this.lastTrailTime = time;
        }

        // Invincibility flash
        if (time < this.invincibleUntil) {
            const flash = Math.sin(time * 0.03) > 0;
            if (this.container) {
                this.container.alpha = flash ? 1 : 0.4;
            }
        } else {
            if (this.container) {
                this.container.alpha = 1;
            }
        }
    }

    drawJoystick() {
        this.joystickGraphics.clear();
        
        // Outer ring
        this.joystickGraphics.lineStyle(2, 0xffffff, 0.5);
        this.joystickGraphics.strokeCircle(this.joystick.startX, this.joystick.startY, 60);
        
        // Inner stick
        const dx = this.joystick.currentX - this.joystick.startX;
        const dy = this.joystick.currentY - this.joystick.startY;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
        const angle = Math.atan2(dy, dx);
        
        const stickX = this.joystick.startX + Math.cos(angle) * dist;
        const stickY = this.joystick.startY + Math.sin(angle) * dist;
        
        this.joystickGraphics.fillStyle(0xffffff, 0.6);
        this.joystickGraphics.fillCircle(stickX, stickY, 25);
    }

    takeDamage(amount, time) {
        if (time < this.invincibleUntil) return false;
        
        // Debug invincibility check
        if (DEBUG_CONFIG.invincible) return false;

        // Check if shield absorbs the hit
        if (this.shieldCharges > 0) {
            this.shieldCharges--;
            this.invincibleUntil = time + 500; // Shorter invincibility for shield hit
            
            // Shield absorb effect
            this.scene.cameras.main.shake(100, 0.008);
            this.scene.cameras.main.flash(100, 68, 200, 255, false);
            
            // Shield break particles
            for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                const particle = this.scene.add.circle(
                    this.x + Math.cos(angle) * this.radius * 1.5,
                    this.y + Math.sin(angle) * this.radius * 1.5,
                    4, 0x44ccff, 0.9
                );
                
                this.scene.tweens.add({
                    targets: particle,
                    x: this.x + Math.cos(angle) * 80,
                    y: this.y + Math.sin(angle) * 80,
                    alpha: 0,
                    scale: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => particle.destroy()
                });
            }
            
            // Update shield visual
            this.updateShieldVisual();
            
            return false; // Damage was blocked
        }

        this.health -= amount;
        this.invincibleUntil = time + 1000;
        
        // Play hit sound
        Assets.playSound('playerHit', { volume: 0.5 });

        // Screen shake
        this.scene.cameras.main.shake(200, 0.015);
        
        // Flash effect
        this.scene.cameras.main.flash(100, 255, 50, 50, false);

        // Damage sparks
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = this.scene.add.circle(
                this.x, this.y,
                4, 0xff6644, 0.9
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 50,
                y: this.y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        return true;
    }

    addXP(amount) {
        this.xp += amount;
        
        if (this.xp >= this.xpToNextLevel) {
            return this.levelUp();
        }
        return false;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        const multiplier = this.level >= 9 ? XP_CONFIG.lateGameXpMultiplier : XP_CONFIG.xpMultiplier;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * multiplier);

        // Level up effect - energy burst
        for (let i = 0; i < 3; i++) {
            const ring = this.scene.add.circle(this.x, this.y, this.radius, 0x000000, 0);
            ring.setStrokeStyle(3 - i, 0x44aaff, 1);
        
        this.scene.tweens.add({
            targets: ring,
                scale: 4 + i,
            alpha: 0,
                duration: 600,
                delay: i * 100,
                ease: 'Power2',
            onComplete: () => ring.destroy()
        });
        }
        
        // Star burst
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const particle = this.scene.add.star(
                this.x, this.y,
                4, 3, 6, 0x44aaff, 1
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * (70 + Math.random() * 30),
                y: this.y + Math.sin(angle) * (70 + Math.random() * 30),
                alpha: 0,
                rotation: Math.PI * 2,
                scale: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
        
        this.scene.cameras.main.flash(200, 68, 136, 255, false);

        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
}
// UI System
class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.ps = GAME_CONFIG.pixelScale; // Pixel scale for UI
        this.isPortrait = currentOrientation === 'portrait';
        this.topOffset = 22; // 44px visible offset for top UI (44 / PIXEL_SCALE)
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(50);
        // Scale the entire UI container for high resolution
        this.container.setScale(this.ps);

        this.createHealthBar();
        this.createXPBar();
        this.createWaveDisplay();
        this.createWeaponDisplay();
        this.createPauseButton();
    }

    createHealthBar() {
        const x = 10;
        const y = 10 + this.topOffset;
        // Narrower health bar in portrait mode
        const width = this.isPortrait ? 120 : 200;
        const height = this.isPortrait ? 16 : 20;

        // Background
        this.healthBarBg = this.scene.add.rectangle(
            x + width/2, y + height/2,
            width, height,
            COLORS.healthBarBg
        );
        this.healthBarBg.setStrokeStyle(2, 0xffffff, 0.5);

        // Health bar
        this.healthBar = this.scene.add.rectangle(
            x + width/2, y + height/2,
            width - 4, height - 4,
            COLORS.healthBar
        );
        
        // Store width for updates
        this.healthBarWidth = width - 4;
        this.healthBarX = x;

        // Label - hide in portrait to save space
        if (!this.isPortrait) {
            this.healthLabel = this.scene.add.text(x, y - 18, 'HEALTH', {
                fontSize: '12px',
                fontFamily: 'Courier New',
                color: COLORS.textSecondary,
            });
            this.container.add([this.healthLabel]);
        }

        // Text
        this.healthText = this.scene.add.text(x + width/2, y + height/2, '100/100', {
            fontSize: this.isPortrait ? '10px' : '12px',
            fontFamily: 'Courier New',
            color: COLORS.textPrimary,
        }).setOrigin(0.5);

        this.container.add([this.healthBarBg, this.healthBar, this.healthText]);
    }

    createXPBar() {
        const x = 10;
        const y = (this.isPortrait ? 32 : 55) + this.topOffset;
        const width = this.isPortrait ? 120 : 200;
        const height = this.isPortrait ? 10 : 12;

        // Background
        this.xpBarBg = this.scene.add.rectangle(
            x + width/2, y + height/2,
            width, height,
            COLORS.xpBarBg
        );
        this.xpBarBg.setStrokeStyle(1, 0xffffff, 0.3);

        // XP bar
        this.xpBar = this.scene.add.rectangle(
            x + 2, y + height/2,
            0, height - 4,
            COLORS.xpBar
        );
        this.xpBar.setOrigin(0, 0.5);
        
        // Store width for updates
        this.xpBarWidth = width - 4;

        // Level text
        this.levelText = this.scene.add.text(x + width + 8, y + height/2, 'LVL 1', {
            fontSize: this.isPortrait ? '12px' : '14px',
            fontFamily: 'Courier New',
            color: COLORS.textPrimary,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);

        this.container.add([this.xpBarBg, this.xpBar, this.levelText]);
    }

    createWaveDisplay() {
        // Position from right edge, adjust for portrait
        const x = this.isPortrait ? GAME_CONFIG.baseWidth - 90 : GAME_CONFIG.baseWidth - 150;
        const y = 10 + this.topOffset;

        // Sector indicator - shorter in portrait
        this.sectorText = this.scene.add.text(x, y, 'SECTOR 1', {
            fontSize: this.isPortrait ? '10px' : '12px',
            fontFamily: 'Courier New',
            color: '#ffffff',
        });
        if (this.isPortrait) {
            this.sectorText.setOrigin(0, 0);
        }

        // Wave label
        this.waveText = this.scene.add.text(x, y + (this.isPortrait ? 14 : 18), 'WAVE 1/15', {
            fontSize: this.isPortrait ? '14px' : '18px',
            fontFamily: 'Courier New',
            color: COLORS.textPrimary,
            fontStyle: 'bold',
        });

        // Timer
        this.timerText = this.scene.add.text(x, y + (this.isPortrait ? 32 : 43), '0:30', {
            fontSize: this.isPortrait ? '12px' : '14px',
            fontFamily: 'Courier New',
            color: COLORS.textSecondary,
        });

        // Enemy count
        this.enemyCountText = this.scene.add.text(x, y + (this.isPortrait ? 48 : 63), 'Enemies: 0', {
            fontSize: this.isPortrait ? '10px' : '12px',
            fontFamily: 'Courier New',
            color: COLORS.textSecondary,
        });

        this.container.add([this.sectorText, this.waveText, this.timerText, this.enemyCountText]);
    }

    setSector(sectorNum, sectorName) {
        if (this.sectorText) {
            // Shorter text in portrait
            if (this.isPortrait) {
                this.sectorText.setText(`S${sectorNum}`);
            } else {
                this.sectorText.setText(`SECTOR ${sectorNum}: ${sectorName.toUpperCase()}`);
            }
        }
    }

    createWeaponDisplay() {
        const x = 10;
        const y = GAME_CONFIG.baseHeight - (this.isPortrait ? 60 : 80);
        const slotSize = this.isPortrait ? 32 : 40;
        const slotSpacing = this.isPortrait ? 38 : 50;

        // Label - hide in portrait
        if (!this.isPortrait) {
            this.weaponLabel = this.scene.add.text(x, y - 20, 'WEAPONS', {
                fontSize: '12px',
                fontFamily: 'Courier New',
                color: COLORS.textSecondary,
            });
            this.container.add([this.weaponLabel]);
        }

        this.weaponSlots = [];      // Background slots
        this.weaponIcons = [];      // Sprites or fallback shapes
        this.weaponTierTexts = [];
        
        // Use dynamic weapon slots from upgrades
        const weaponSlotCount = ProgressManager.getWeaponSlots();

        for (let i = 0; i < weaponSlotCount; i++) {
            // Slot background
            const slot = this.scene.add.rectangle(x + slotSize/2 + 5 + i * slotSpacing, y + slotSize/2, slotSize, slotSize, 0x222233);
            slot.setStrokeStyle(2, 0x444466, 0.8);
            
            // Placeholder for icon (will be replaced when weapon equipped)
            const iconPlaceholder = this.scene.add.circle(x + slotSize/2 + 5 + i * slotSpacing, y + slotSize/2, slotSize * 0.35, 0x333344, 0.5);
            
            const tierText = this.scene.add.text(x + slotSize/2 + 5 + i * slotSpacing, y + slotSize + 5, '', {
                fontSize: this.isPortrait ? '8px' : '10px',
                fontFamily: 'Courier New',
                color: COLORS.textSecondary,
            }).setOrigin(0.5);

            this.weaponSlots.push(slot);
            this.weaponIcons.push(iconPlaceholder);
            this.weaponTierTexts.push(tierText);
            this.container.add([slot, iconPlaceholder, tierText]);
        }
        
        // Store for weapon updates
        this.weaponSlotSize = slotSize;
        this.weaponSlotSpacing = slotSpacing;
        this.weaponDisplayX = x;
        this.weaponDisplayY = y;
    }

    createPauseButton() {
        const x = GAME_CONFIG.baseWidth - (this.isPortrait ? 35 : 50);
        const y = (this.isPortrait ? 75 : 90) + this.topOffset;
        const size = this.isPortrait ? 30 : 40;

        // Pause button background
        this.pauseButton = this.scene.add.rectangle(x, y, size, size, 0x333333, 0.8);
        this.pauseButton.setStrokeStyle(2, 0xffffff, 0.5);
        this.pauseButton.setInteractive({ useHandCursor: true });

        // Pause icon (two vertical bars) - scale to button size
        const barWidth = size * 0.15;
        const barHeight = size * 0.5;
        const barGap = size * 0.1;
        this.pauseIcon = this.scene.add.graphics();
        this.pauseIcon.fillStyle(0xffffff, 1);
        this.pauseIcon.fillRect(x - barGap - barWidth, y - barHeight/2, barWidth, barHeight);
        this.pauseIcon.fillRect(x + barGap, y - barHeight/2, barWidth, barHeight);

        this.pauseButton.on('pointerover', () => {
            this.pauseButton.setFillStyle(0x555555, 0.9);
        });

        this.pauseButton.on('pointerout', () => {
            this.pauseButton.setFillStyle(0x333333, 0.8);
        });

        this.pauseButton.on('pointerdown', () => {
            this.scene.togglePauseMenu();
        });

        this.container.add([this.pauseButton, this.pauseIcon]);
    }

    showPauseMenu(onResume, onRestart) {
        this.pauseMenuElements = [];

        // Darken background
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            GAME_CONFIG.width, GAME_CONFIG.height,
            0x000000, 0.8
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(95);
        this.pauseMenuElements.push(overlay);

        // Pause title
        const title = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 100,
            '⏸ PAUSED',
            {
                fontSize: '48px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(96);
        this.pauseMenuElements.push(title);

        // Resume button
        const resumeBtn = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            220, 50,
            0x00aa66
        );
        resumeBtn.setStrokeStyle(3, 0x00ffaa, 0.8);
        resumeBtn.setScrollFactor(0);
        resumeBtn.setDepth(96);
        resumeBtn.setInteractive({ useHandCursor: true });
        this.pauseMenuElements.push(resumeBtn);

        const resumeText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            '▶ RESUME',
            {
                fontSize: '20px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        resumeText.setScrollFactor(0);
        resumeText.setDepth(97);
        this.pauseMenuElements.push(resumeText);

        resumeBtn.on('pointerover', () => resumeBtn.setFillStyle(0x00cc77));
        resumeBtn.on('pointerout', () => resumeBtn.setFillStyle(0x00aa66));
        resumeBtn.on('pointerdown', () => {
            this.hidePauseMenu();
            onResume();
        });

        // Start Over button
        const restartBtn = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 70,
            220, 50,
            0xaa3333
        );
        restartBtn.setStrokeStyle(3, 0xff5555, 0.8);
        restartBtn.setScrollFactor(0);
        restartBtn.setDepth(96);
        restartBtn.setInteractive({ useHandCursor: true });
        this.pauseMenuElements.push(restartBtn);

        const restartText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 70,
            '← RETURN TO BASE',
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setDepth(97);
        this.pauseMenuElements.push(restartText);

        restartBtn.on('pointerover', () => restartBtn.setFillStyle(0xcc4444));
        restartBtn.on('pointerout', () => restartBtn.setFillStyle(0xaa3333));
        restartBtn.on('pointerdown', () => {
            this.hidePauseMenu();
            onRestart();
        });

        // Tip text
        const tip = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 150,
            'Press ESC to resume',
            {
                fontSize: '14px',
                fontFamily: 'Courier New',
                color: '#888888',
            }
        ).setOrigin(0.5);
        tip.setScrollFactor(0);
        tip.setDepth(96);
        this.pauseMenuElements.push(tip);
    }

    hidePauseMenu() {
        if (this.pauseMenuElements) {
            this.pauseMenuElements.forEach(el => el.destroy());
            this.pauseMenuElements = [];
        }
    }

    updateHealth(current, max) {
        const width = this.healthBarWidth;
        const percent = current / max;
        this.healthBar.width = width * percent;
        this.healthBar.x = this.healthBarX + 2 + (width * percent) / 2;
        this.healthText.setText(`${Math.ceil(current)}/${max}`);
        
        // Color change based on health
        if (percent < 0.25) {
            this.healthBar.setFillStyle(0xff0000);
        } else if (percent < 0.5) {
            this.healthBar.setFillStyle(0xffaa00);
        } else {
            this.healthBar.setFillStyle(COLORS.healthBar);
        }
    }

    updateXP(current, max, level) {
        const width = this.xpBarWidth;
        const percent = Math.min(current / max, 1);
        this.xpBar.width = width * percent;
        this.levelText.setText(`LVL ${level}`);
    }

    updateWave(wave, total, timeRemaining, enemyCount) {
        this.waveText.setText(`WAVE ${wave}/${total}`);
        
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        this.enemyCountText.setText(`Enemies: ${enemyCount}`);
    }

    updateWeapons(weaponManager) {
        const equippedIds = weaponManager.getEquippedWeaponIds(false); // Exclude starter weapon
        
        // Build a cache key to check if weapons changed
        const cacheKey = equippedIds.map(id => `${id}:${weaponManager.getWeaponTier(id)}`).join(',');
        
        // Only rebuild icons if weapons have changed
        if (this.lastWeaponCache === cacheKey) {
            return; // No changes, skip update
        }
        this.lastWeaponCache = cacheKey;
        
        const x = this.weaponDisplayX;
        const y = this.weaponDisplayY;
        const slotSize = this.weaponSlotSize;
        const slotSpacing = this.weaponSlotSpacing;
        const iconSize = slotSize * 0.8;
        
        // Use dynamic weapon slots from upgrades
        const weaponSlotCount = this.weaponSlots.length;
        
        // Update each slot
        for (let i = 0; i < weaponSlotCount; i++) {
            // Destroy old icon if it exists
            if (this.weaponIcons[i]) {
                this.weaponIcons[i].destroy();
                this.weaponIcons[i] = null;
            }
            
            const slotCenterX = x + slotSize/2 + 5 + i * slotSpacing;
            const slotCenterY = y + slotSize/2;
            
            if (i < equippedIds.length) {
                const id = equippedIds[i];
                const tier = weaponManager.getWeaponTier(id);
                const config = WEAPONS[id];
                
                // Check if we have a sprite icon for this weapon
                const iconKey = Assets.getAsset('icons', id);
                
                if (iconKey) {
                    // Use sprite icon
                    const icon = this.scene.add.sprite(slotCenterX, slotCenterY, iconKey);
                    icon.setDisplaySize(iconSize, iconSize);
                    this.weaponIcons[i] = icon;
                    this.container.add(icon);
                } else {
                    // Fallback to colored circle
                    const icon = this.scene.add.circle(slotCenterX, slotCenterY, slotSize * 0.35, config.color);
                    icon.setStrokeStyle(2, 0xffffff, 0.8);
                    this.weaponIcons[i] = icon;
                    this.container.add(icon);
                }
                
                // Update slot border to show equipped
                this.weaponSlots[i].setStrokeStyle(2, config.color, 1);
                this.weaponTierTexts[i].setText(`T${tier + 1}`);
                this.weaponTierTexts[i].setColor('#ffffff');
            } else {
                // Empty slot - show placeholder
                const icon = this.scene.add.circle(slotCenterX, slotCenterY, slotSize * 0.35, 0x333344, 0.5);
                this.weaponIcons[i] = icon;
                this.container.add(icon);
                
                this.weaponSlots[i].setStrokeStyle(2, 0x444466, 0.5);
                this.weaponTierTexts[i].setText('');
            }
        }
    }

    showLevelUpMenu(upgrades, onSelect) {
        const isPortrait = currentOrientation === 'portrait';
        
        // Darken background
        this.levelUpOverlay = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            GAME_CONFIG.width, GAME_CONFIG.height,
            0x000000, 0.7
        );
        this.levelUpOverlay.setScrollFactor(0);
        this.levelUpOverlay.setDepth(90);

        // Title - adjust position for portrait
        const titleY = isPortrait ? 60 : 80;
        this.levelUpTitle = this.scene.add.text(
            GAME_CONFIG.width / 2, titleY,
            '⬆ LEVEL UP! ⬆',
            {
                fontSize: isPortrait ? '28px' : '32px',
                fontFamily: 'Courier New',
                color: '#ffff00',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        this.levelUpTitle.setScrollFactor(0);
        this.levelUpTitle.setDepth(91);

        const subtitleY = isPortrait ? 95 : 120;
        this.levelUpSubtitle = this.scene.add.text(
            GAME_CONFIG.width / 2, subtitleY,
            'Choose an upgrade:',
            {
                fontSize: isPortrait ? '14px' : '16px',
                fontFamily: 'Courier New',
                color: '#ffffff',
            }
        ).setOrigin(0.5);
        this.levelUpSubtitle.setScrollFactor(0);
        this.levelUpSubtitle.setDepth(91);

        // Upgrade cards - different layout for portrait vs landscape
        this.upgradeCards = [];
        
        if (isPortrait) {
            // Portrait: vertical stacked layout, 60% of screen dimensions
            const cardWidth = GAME_CONFIG.width * 0.60;
            const cardSpacing = 15;
            const totalCardsHeight = GAME_CONFIG.height * 0.60;
            const cardHeight = (totalCardsHeight - (upgrades.length - 1) * cardSpacing) / upgrades.length;
            
            // Center the cards vertically (accounting for title area)
            const titleAreaHeight = 130;
            const availableHeight = GAME_CONFIG.height - titleAreaHeight;
            const totalBlockHeight = upgrades.length * cardHeight + (upgrades.length - 1) * cardSpacing;
            const startY = titleAreaHeight + (availableHeight - totalBlockHeight) / 2 + cardHeight / 2;
            
            upgrades.forEach((upgrade, i) => {
                const x = GAME_CONFIG.width / 2;
                const y = startY + i * (cardHeight + cardSpacing);
                
                this.createUpgradeCardPortrait(upgrade, x, y, cardWidth, cardHeight, onSelect);
            });
        } else {
            // Landscape: horizontal layout
            const cardWidth = 260;
            const cardHeight = 320;
            const cardSpacing = 30;
            const startX = GAME_CONFIG.width / 2 - (upgrades.length - 1) * (cardWidth + cardSpacing) / 2;

            upgrades.forEach((upgrade, i) => {
                const x = startX + i * (cardWidth + cardSpacing);
                const y = GAME_CONFIG.height / 2 + 20;

                this.createUpgradeCardLandscape(upgrade, x, y, cardWidth, cardHeight, onSelect);
            });
        }
    }
    
    // Portrait upgrade card - centered vertical layout
    createUpgradeCardPortrait(upgrade, x, y, cardWidth, cardHeight, onSelect) {
        // Card background
        const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, COLORS.uiPanel);
        card.setStrokeStyle(4, upgrade.color, 1);
        card.setScrollFactor(0);
        card.setDepth(91);
        card.setInteractive({ useHandCursor: true });

        // Scale factors based on card height
        const scaleFactor = Math.min(cardHeight / 180, 1.2); // Base scale on card height
        const iconSize = cardHeight * 0.30; // Icon takes 30% of card height
        const nameFontSize = Math.max(14, Math.min(18 * scaleFactor, 22));
        const actionFontSize = Math.max(12, Math.min(14 * scaleFactor, 18));
        const descFontSize = Math.max(10, Math.min(11 * scaleFactor, 14));
        
        // Vertical spacing - distribute elements evenly
        const topPadding = cardHeight * 0.12;
        const iconY = y - cardHeight/2 + topPadding + iconSize/2;
        const nameY = iconY + iconSize/2 + cardHeight * 0.12;
        const actionY = nameY + cardHeight * 0.12;
        const descY = actionY + cardHeight * 0.14;

        // Centered weapon icon
        const iconKey = Assets.getAsset('icons', upgrade.id);
        let icon;
        if (iconKey) {
            icon = this.scene.add.sprite(x, iconY, iconKey);
            icon.setDisplaySize(iconSize, iconSize);
        } else {
            icon = this.scene.add.circle(x, iconY, iconSize/2, upgrade.color);
            icon.setStrokeStyle(3, 0xffffff, 0.8);
        }
        icon.setScrollFactor(0);
        icon.setDepth(92);

        // Weapon name - centered
        const name = this.scene.add.text(x, nameY, upgrade.name, {
            fontSize: `${nameFontSize}px`,
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        name.setScrollFactor(0);
        name.setDepth(92);

        // Action (NEW! or TIER X) - centered
        const actionText = upgrade.action === 'equip' ? 'NEW!' : `TIER ${upgrade.tier + 1}`;
        const action = this.scene.add.text(x, actionY, actionText, {
            fontSize: `${actionFontSize}px`,
            fontFamily: 'Courier New',
            color: upgrade.action === 'equip' ? '#00ff00' : '#ffaa00',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        action.setScrollFactor(0);
        action.setDepth(92);

        // Description - centered
        const desc = this.scene.add.text(x, descY, upgrade.description, {
            fontSize: `${descFontSize}px`,
            fontFamily: 'Courier New',
            color: '#aaaaaa',
            wordWrap: { width: cardWidth - 40 },
            align: 'center',
        }).setOrigin(0.5, 0);
        desc.setScrollFactor(0);
        desc.setDepth(92);

        // Hover effect
        card.on('pointerover', () => {
            card.setFillStyle(0x2a3a5e);
            this.scene.tweens.add({
                targets: card,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 100,
            });
        });

        card.on('pointerout', () => {
            card.setFillStyle(COLORS.uiPanel);
            this.scene.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
            });
        });

        card.on('pointerdown', () => {
            Assets.playSound('menuSelect', { volume: 0.5 });
            this.hideLevelUpMenu();
            onSelect(upgrade);
        });

        this.upgradeCards.push({ card, icon, name, action, desc });
    }
    
    // Landscape upgrade card - vertical layout (original style)
    createUpgradeCardLandscape(upgrade, x, y, cardWidth, cardHeight, onSelect) {
        // Card background
        const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, COLORS.uiPanel);
        card.setStrokeStyle(4, upgrade.color, 1);
        card.setScrollFactor(0);
        card.setDepth(91);
        card.setInteractive({ useHandCursor: true });

        // Weapon icon - use sprite if available
        const iconKey = Assets.getAsset('icons', upgrade.id);
        let icon;
        if (iconKey) {
            icon = this.scene.add.sprite(x, y - 80, iconKey);
            icon.setDisplaySize(80, 80);
        } else {
            // Fallback to colored circle
            icon = this.scene.add.circle(x, y - 80, 45, upgrade.color);
            icon.setStrokeStyle(3, 0xffffff, 0.8);
        }
        icon.setScrollFactor(0);
        icon.setDepth(92);

        // Weapon name
        const name = this.scene.add.text(x, y + 10, upgrade.name, {
            fontSize: '22px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        name.setScrollFactor(0);
        name.setDepth(92);

        // Action
        const actionText = upgrade.action === 'equip' ? 'NEW!' : `TIER ${upgrade.tier + 1}`;
        const action = this.scene.add.text(x, y + 45, actionText, {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: upgrade.action === 'equip' ? '#00ff00' : '#ffaa00',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        action.setScrollFactor(0);
        action.setDepth(92);

        // Description
        const desc = this.scene.add.text(x, y + 90, upgrade.description, {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#aaaaaa',
            wordWrap: { width: cardWidth - 30 },
            align: 'center',
        }).setOrigin(0.5);
        desc.setScrollFactor(0);
        desc.setDepth(92);

        // Hover effect - don't scale icon to avoid distortion
        card.on('pointerover', () => {
            card.setFillStyle(0x2a3a5e);
            this.scene.tweens.add({
                targets: [card, name, action, desc],
                scale: 1.05,
                duration: 100,
            });
        });

        card.on('pointerout', () => {
            card.setFillStyle(COLORS.uiPanel);
            this.scene.tweens.add({
                targets: [card, name, action, desc],
                scale: 1,
                duration: 100,
            });
        });

        card.on('pointerdown', () => {
            Assets.playSound('menuSelect', { volume: 0.5 });
            this.hideLevelUpMenu();
            onSelect(upgrade);
        });

        this.upgradeCards.push({ card, icon, name, action, desc });
    }

    hideLevelUpMenu() {
        if (this.levelUpOverlay) this.levelUpOverlay.destroy();
        if (this.levelUpTitle) this.levelUpTitle.destroy();
        if (this.levelUpSubtitle) this.levelUpSubtitle.destroy();
        
        this.upgradeCards.forEach(({ card, icon, name, action, desc, selectText }) => {
            card.destroy();
            icon.destroy();
            name.destroy();
            action.destroy();
            desc.destroy();
            if (selectText) selectText.destroy();
        });
        this.upgradeCards = [];
    }

    showGameOver(wave, heroLevel, sectorNum, sectorName, gemsEarned, onRestart) {
        // Overlay
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            GAME_CONFIG.width, GAME_CONFIG.height,
            0x000000, 0.85
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(100);

        // Game Over text
        const title = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 100,
            'MISSION FAILED',
            {
                fontSize: '42px',
                fontFamily: 'Courier New',
                color: '#ff3333',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(101);

        // Sector info
        const sectorInfo = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 50,
            `Sector ${sectorNum}: ${sectorName}`,
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: '#888888',
            }
        ).setOrigin(0.5);
        sectorInfo.setScrollFactor(0);
        sectorInfo.setDepth(101);

        // Stats
        const stats = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 10,
            `Wave Reached: ${wave}/15\nPilot Level: ${heroLevel}`,
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                align: 'center',
            }
        ).setOrigin(0.5);
        stats.setScrollFactor(0);
        stats.setDepth(101);
        
        // Gems earned
        const gemsText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 55,
            `💎 +${gemsEarned} Gems`,
            {
                fontSize: '20px',
                fontFamily: 'Courier New',
                color: '#44ffaa',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        gemsText.setScrollFactor(0);
        gemsText.setDepth(101);

        // Restart button
        const button = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 110,
            200, 50,
            0x446688
        );
        button.setStrokeStyle(3, 0xffffff, 0.8);
        button.setScrollFactor(0);
        button.setDepth(101);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 110,
            'RETURN TO BASE',
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        buttonText.setScrollFactor(0);
        buttonText.setDepth(102);

        button.on('pointerover', () => button.setFillStyle(0x5577aa));
        button.on('pointerout', () => button.setFillStyle(0x446688));
        button.on('pointerdown', onRestart);
    }

    showVictory(heroLevel, sectorNum, sectorName, gemsEarned, onRestart) {
        // Overlay
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            GAME_CONFIG.width, GAME_CONFIG.height,
            0x000000, 0.85
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(100);

        // Victory text
        const title = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 120,
            '★ SECTOR CLEARED ★',
            {
                fontSize: '42px',
                fontFamily: 'Courier New',
                color: '#44ff88',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(101);

        // Sector info
        const sectorInfo = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 70,
            `Sector ${sectorNum}: ${sectorName}`,
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffaa44',
            }
        ).setOrigin(0.5);
        sectorInfo.setScrollFactor(0);
        sectorInfo.setDepth(101);

        // Stats
        const stats = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 20,
            `All 15 waves defeated!\nPilot Level: ${heroLevel}`,
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                align: 'center',
            }
        ).setOrigin(0.5);
        stats.setScrollFactor(0);
        stats.setDepth(101);
        
        // Gems earned
        const gemsText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 30,
            `💎 +${gemsEarned} Gems`,
            {
                fontSize: '22px',
                fontFamily: 'Courier New',
                color: '#44ffaa',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        gemsText.setScrollFactor(0);
        gemsText.setDepth(101);

        // Next level message
        const nextMsg = sectorNum < TOTAL_LEVELS 
            ? `Sector ${sectorNum + 1} unlocked!`
            : 'All sectors completed!';
        const nextText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 65,
            nextMsg,
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: '#ffffff',
            }
        ).setOrigin(0.5);
        nextText.setScrollFactor(0);
        nextText.setDepth(101);

        // Return button
        const button = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 100,
            200, 50,
            0x33aa33
        );
        button.setStrokeStyle(3, 0x44ff88, 0.8);
        button.setScrollFactor(0);
        button.setDepth(101);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 100,
            'CONTINUE',
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        buttonText.setScrollFactor(0);
        buttonText.setDepth(102);

        button.on('pointerover', () => button.setFillStyle(0x44bb44));
        button.on('pointerout', () => button.setFillStyle(0x33aa33));
        button.on('pointerdown', onRestart);
    }

    showWaveAnnouncement(wave) {
        // Background flash
        const flash = this.scene.add.rectangle(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2,
            GAME_CONFIG.width, GAME_CONFIG.height,
            0xffffff, 0
        );
        flash.setScrollFactor(0);
        flash.setDepth(79);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0.15,
            duration: 100,
            yoyo: true,
            onComplete: () => flash.destroy()
        });
        
        // Decorative lines
        const leftLine = this.scene.add.rectangle(
            GAME_CONFIG.width / 2 - 200, GAME_CONFIG.height / 2 - 50,
            0, 3, 0xffaa00
        );
        leftLine.setScrollFactor(0);
        leftLine.setDepth(80);
        leftLine.setOrigin(1, 0.5);
        
        const rightLine = this.scene.add.rectangle(
            GAME_CONFIG.width / 2 + 200, GAME_CONFIG.height / 2 - 50,
            0, 3, 0xffaa00
        );
        rightLine.setScrollFactor(0);
        rightLine.setDepth(80);
        rightLine.setOrigin(0, 0.5);
        
        this.scene.tweens.add({
            targets: [leftLine, rightLine],
            width: 150,
            duration: 300,
            ease: 'Power2'
        });
        
        // Wave label
        const label = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 85,
            '— WAVE —',
            {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffaa00',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(80);
        label.setAlpha(0);
        
        // Main wave number
        const text = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 45,
            `${wave}`,
            {
                fontSize: '96px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        text.setScrollFactor(0);
        text.setDepth(80);
        text.setAlpha(0);
        text.setScale(2);
        
        // Subtitle
        const subtitle = this.scene.add.text(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 30,
            wave === 15 ? 'FINAL WAVE!' : wave >= 10 ? 'Stay Strong!' : 'Survive!',
            {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: wave === 15 ? '#ff4444' : '#888888',
            }
        ).setOrigin(0.5);
        subtitle.setScrollFactor(0);
        subtitle.setDepth(80);
        subtitle.setAlpha(0);

        // Animate in
        this.scene.tweens.add({
            targets: [label, subtitle],
            alpha: 1,
            duration: 200,
        });
        
        this.scene.tweens.add({
            targets: text,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
        });
        
        // Animate out
        this.scene.time.delayedCall(1200, () => {
            this.scene.tweens.add({
                targets: [text, label, subtitle, leftLine, rightLine],
                alpha: 0,
                y: '-=30',
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    text.destroy();
                    label.destroy();
                    subtitle.destroy();
                    leftLine.destroy();
                    rightLine.destroy();
                }
            });
        });
    }
}

// Main Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Set current level from data passed from LevelSelectScene
        this.currentLevel = (data && data.level) ? data.level : 1;
        this.levelConfig = LEVELS[this.currentLevel] || LEVELS[1];
    }

    create() {
        this.isPaused = false;
        this.gameOver = false;
        this.showingPauseMenu = false;
        this.waitingForInput = true;
        
        // Set up audio for this scene
        Assets.setScene(this);

        // Create world with level-specific background
        this.createWorld();

        // Create hero
        this.hero = new Hero(this, GAME_CONFIG.worldWidth / 2, GAME_CONFIG.worldHeight / 2);

        // Camera follow
        this.cameras.main.startFollow(this.hero.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Create managers
        this.enemyManager = new EnemyManager(this);
        this.weaponManager = new WeaponManager(this, this.hero);
        this.ui = new UIManager(this);
        
        // Set sector info on UI
        this.ui.setSector(this.currentLevel, this.levelConfig.name);

        // Wave system
        this.currentWave = 1;
        this.waveStartTime = 0;
        this.lastSpawnTime = 0;
        this.enemiesSpawnedThisWave = 0;
        this.maxEnemiesThisWave = WAVE_CONFIG.baseEnemyCount;
        
        // Gems collected this run (XP becomes gems)
        this.gemsCollected = 0;
        this.waitingForClear = false;

        // Spawn boss if this level has one
        if (this.levelConfig.hasBoss) {
            const cx = GAME_CONFIG.worldWidth / 2;
            const cy = GAME_CONFIG.worldHeight / 2 - 400 * PIXEL_SCALE;
            const levelHealthMult = this.levelConfig.enemyHealthMultiplier;
            const levelDamageMult = this.levelConfig.enemyDamageMultiplier;
            this.enemyManager.spawnBoss(cx, cy, levelHealthMult, levelDamageMult);
        }

        // Wait for first user interaction before starting waves
        const startGame = () => {
            if (!this.waitingForInput) return;
            this.waitingForInput = false;
            this.waveStartTime = this.time.now;
            this.lastSpawnTime = this.time.now;
            this.ui.showWaveAnnouncement(1);
            Assets.playSound('waveStart', { volume: 0.6 });
        };
        this.input.on('pointerdown', startGame);
        this.input.keyboard.on('keydown', startGame);

        // ESC key to toggle pause
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.gameOver) {
                this.togglePauseMenu();
            }
        });
    }

    togglePauseMenu() {
        // Don't allow pause during level up menu
        if (this.isPaused && !this.showingPauseMenu) return;

        if (this.showingPauseMenu) {
            // Resume game
            this.ui.hidePauseMenu();
            this.showingPauseMenu = false;
            this.resumeGame();
        } else {
            // Pause game
            this.showingPauseMenu = true;
            this.isPaused = true;
            this.pauseStartTime = this.time.now;
            this.physics.pause();
            
            this.ui.showPauseMenu(
                // On Resume
                () => {
                    this.showingPauseMenu = false;
                    this.resumeGame();
                },
                // On Return to Level Select
                () => {
                    this.showingPauseMenu = false;
                    this.weaponManager.cleanup();
                    this.scene.start('LevelSelectScene');
                }
            );
        }
    }

    createWorld() {
        // Deep space background - use level-specific color
        const bgColor = this.levelConfig ? this.levelConfig.background : COLORS.background;
        this.cameras.main.setBackgroundColor(bgColor);
        
        // Check for custom background image for this level
        const bgKey = Assets.getAsset('backgrounds', `level${this.currentLevel}`);
        
        if (bgKey) {
            // Use custom background image - tile it across the world
            const bg = this.add.tileSprite(
                GAME_CONFIG.worldWidth / 2,
                GAME_CONFIG.worldHeight / 2,
                GAME_CONFIG.worldWidth,
                GAME_CONFIG.worldHeight,
                bgKey
            );
            bg.setDepth(-15);
            this.levelBackground = bg;
        } else {
            // Fallback to procedural background
            // Create nebula clouds
            const nebulaGraphics = this.add.graphics();
            nebulaGraphics.setDepth(-10);
            
            // Multiple nebula patches - use level-specific colors
            const nebulaColors = this.levelConfig ? this.levelConfig.nebulaColors : [COLORS.nebulaColor1, COLORS.nebulaColor2];
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * GAME_CONFIG.worldWidth;
                const y = Math.random() * GAME_CONFIG.worldHeight;
                const size = 200 + Math.random() * 400;
                const color = Math.random() > 0.5 ? nebulaColors[0] : nebulaColors[1];
                
                // Layered nebula effect
                for (let j = 5; j >= 0; j--) {
                    nebulaGraphics.fillStyle(color, 0.02 + j * 0.01);
                    nebulaGraphics.fillCircle(x, y, size - j * 30);
                }
            }
        }
        
        // Star field - distant stars (small, dim)
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * GAME_CONFIG.worldWidth;
            const y = Math.random() * GAME_CONFIG.worldHeight;
            const size = 0.5 + Math.random() * 1;
            const alpha = 0.2 + Math.random() * 0.4;
            
            const star = this.add.circle(x, y, size, COLORS.starColor, alpha);
            star.setDepth(-8);
        }
        
        // Medium stars with slight glow
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * GAME_CONFIG.worldWidth;
            const y = Math.random() * GAME_CONFIG.worldHeight;
            const size = 1 + Math.random() * 1.5;
            
            // Glow
            const glow = this.add.circle(x, y, size * 3, COLORS.starColor, 0.1);
            glow.setDepth(-7);
            
            // Star core
            const star = this.add.circle(x, y, size, COLORS.starColor, 0.6 + Math.random() * 0.4);
            star.setDepth(-6);
            
            // Twinkle animation for some
            if (Math.random() > 0.7) {
                this.tweens.add({
                    targets: [star, glow],
                    alpha: star.alpha * 0.3,
                    duration: 1000 + Math.random() * 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
        
        // Bright stars with colored tints
        const starColors = [0xffffff, 0xaaddff, 0xffddaa, 0xffaaaa, 0xaaffaa];
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * GAME_CONFIG.worldWidth;
            const y = Math.random() * GAME_CONFIG.worldHeight;
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            
            // Outer glow
            const glow = this.add.circle(x, y, 8, color, 0.15);
            glow.setDepth(-5);
            
            // Star with 4 points
            const star = this.add.star(x, y, 4, 2, 5, color, 0.9);
            star.setDepth(-4);
            
            // Twinkle
            this.tweens.add({
                targets: [star, glow],
                scale: 1.3,
                alpha: '-=0.3',
                duration: 1500 + Math.random() * 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Subtle grid overlay for spatial reference
        const gridGraphics = this.add.graphics();
        gridGraphics.setDepth(-3);
        gridGraphics.lineStyle(1, 0x222244, 0.15);
        
        const gridSize = 100;
        for (let x = 0; x <= GAME_CONFIG.worldWidth; x += gridSize) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, GAME_CONFIG.worldHeight);
        }
        for (let y = 0; y <= GAME_CONFIG.worldHeight; y += gridSize) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(GAME_CONFIG.worldWidth, y);
        }
        gridGraphics.strokePath();
        
        // Floating space dust particles
        this.ambientParticles = [];
        for (let i = 0; i < 40; i++) {
            const particle = this.add.circle(
                Math.random() * GAME_CONFIG.worldWidth,
                Math.random() * GAME_CONFIG.worldHeight,
                1 + Math.random() * 2,
                0x4466aa,
                0.2 + Math.random() * 0.2
            );
            particle.setDepth(-2);
            
            this.tweens.add({
                targets: particle,
                y: particle.y + (Math.random() - 0.5) * 150,
                x: particle.x + (Math.random() - 0.5) * 100,
                alpha: 0.05,
                duration: 5000 + Math.random() * 5000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.ambientParticles.push(particle);
        }

        // World bounds
        this.physics.world.setBounds(0, 0, GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);

        // Danger zone boundary - energy field effect
        const borderGlow = this.add.graphics();
        borderGlow.lineStyle(20, 0xff2244, 0.1);
        borderGlow.strokeRect(0, 0, GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
        
        const borderMid = this.add.graphics();
        borderMid.lineStyle(8, 0xff3344, 0.3);
        borderMid.strokeRect(0, 0, GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
        
        const border = this.add.graphics();
        border.lineStyle(2, 0xff4466, 0.8);
        border.strokeRect(0, 0, GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
        
        // Corner warning beacons
        const corners = [
            [0, 0], [GAME_CONFIG.worldWidth, 0],
            [0, GAME_CONFIG.worldHeight], [GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight]
        ];
        
        corners.forEach(([cx, cy]) => {
            const beacon = this.add.circle(cx, cy, 20, 0xff4466, 0.3);
            const beaconCore = this.add.circle(cx, cy, 8, 0xff4466, 0.8);
            
            this.tweens.add({
                targets: beacon,
                scale: 1.5,
                alpha: 0.1,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        });
    }

    update(time, delta) {
        if (this.gameOver || this.isPaused) return;
        if (this.waitingForInput) return;

        // Update hero
        this.hero.update(time);

        // Update enemies
        this.enemyManager.update(this.hero, time);

        // Update weapons
        this.weaponManager.update(time, this.enemyManager.enemies);

        // Check XP collection
        const collectedXP = this.enemyManager.checkXPCollection(this.hero);
        if (collectedXP > 0) {
            // Track as gems (1 XP = 1 gem, before multiplier)
            this.gemsCollected += collectedXP;
            
            // Each gem heals the player for 0.5 HP
            this.hero.heal(collectedXP * 0.5);
            
            // Play pickup sound (randomize pitch slightly)
            Assets.playSound('xpPickup', { volume: 0.3, rate: 0.9 + Math.random() * 0.2 });
            
            // Apply XP multiplier from weapon bay upgrade
            const xpMultiplier = ProgressManager.getXPMultiplier();
            const boostedXP = Math.floor(collectedXP * xpMultiplier);
            
            if (this.hero.addXP(boostedXP)) {
                Assets.playSound('levelUp', { volume: 0.7 });
                this.showUpgradeMenu();
            }
        }

        // Check hero collision with enemies
        this.checkEnemyCollision(time);

        // Update UI
        this.ui.updateHealth(this.hero.health, this.hero.maxHealth);
        this.ui.updateXP(this.hero.xp, this.hero.xpToNextLevel, this.hero.level);
        this.ui.updateWeapons(this.weaponManager);

        // Wave management
        this.updateWave(time);

        // Check game over
        if (this.hero.health <= 0) {
            this.enemyManager.playExplosion(this.hero.x, this.hero.y, 2);
            this.endGame(false);
        }
    }

    checkEnemyCollision(time) {
        this.enemyManager.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            const dist = Phaser.Math.Distance.Between(
                this.hero.x, this.hero.y,
                enemy.x, enemy.y
            );

            if (dist < this.hero.radius + enemy.radius) {
                this.hero.takeDamage(enemy.damage, time);
            }
        });
    }

    updateWave(time) {
        // If waiting for all enemies to be cleared (boss level final phase)
        if (this.waitingForClear) {
            const remaining = this.enemyManager.enemies.getLength();
            const totalWaves = this.levelConfig ? this.levelConfig.waves : WAVE_CONFIG.totalWaves;
            this.ui.updateWave(this.currentWave, totalWaves, 0, remaining);
            if (remaining === 0) {
                this.waitingForClear = false;
                this.endGame(true);
            }
            return;
        }

        const waveElapsed = time - this.waveStartTime;
        const timeRemaining = Math.max(0, WAVE_CONFIG.waveDuration - waveElapsed);

        const totalWaves = this.levelConfig ? this.levelConfig.waves : WAVE_CONFIG.totalWaves;
        this.ui.updateWave(
            this.currentWave,
            totalWaves,
            timeRemaining,
            this.enemyManager.enemies.getLength()
        );

        // Spawn enemies
        const spawnInterval = Math.max(
            WAVE_CONFIG.minSpawnInterval,
            WAVE_CONFIG.spawnInterval - (this.currentWave - 1) * WAVE_CONFIG.spawnIntervalReduction
        );

        if (time - this.lastSpawnTime > spawnInterval) {
            this.spawnWaveEnemies();
            this.lastSpawnTime = time;
        }

        // Check wave completion
        if (waveElapsed >= WAVE_CONFIG.waveDuration) {
            this.advanceWave();
        }
    }

    spawnWaveEnemies() {
        // Spawn 1-3 enemies at a time based on wave
        const spawnRateMult = this.levelConfig ? this.levelConfig.spawnRateMultiplier : 1;
        const spawnCount = Math.min(1 + Math.floor(this.currentWave / 5), Math.ceil(3 * spawnRateMult));
        
        // Apply level difficulty multipliers
        const levelHealthMult = this.levelConfig ? this.levelConfig.enemyHealthMultiplier : 1;
        const levelDamageMult = this.levelConfig ? this.levelConfig.enemyDamageMultiplier : 1;
        const levelSpeedMult = this.levelConfig ? this.levelConfig.enemySpeedMultiplier : 1;
        const waveMultiplier = 1 + (this.currentWave - 1) * 0.15;

        for (let i = 0; i < spawnCount; i++) {
            // Spawn from boss if one is alive, otherwise normal spawn
            const bossPos = this.enemyManager.getBossSpawnPosition();
            const pos = bossPos || this.enemyManager.getSpawnPosition(this.hero);
            const type = this.enemyManager.getRandomEnemyType(this.currentWave);
            this.enemyManager.spawnEnemy(type, pos.x, pos.y, waveMultiplier, levelHealthMult, levelDamageMult, levelSpeedMult);
        }
    }

    advanceWave() {
        this.currentWave++;

        const totalWaves = this.levelConfig ? this.levelConfig.waves : WAVE_CONFIG.totalWaves;
        if (this.currentWave > totalWaves) {
            if (this.levelConfig?.hasBoss && this.enemyManager.enemies.getLength() > 0) {
                this.waitingForClear = true;
            } else {
                this.endGame(true);
            }
            return;
        }

        // Show wave announcement
        this.ui.showWaveAnnouncement(this.currentWave);
        Assets.playSound('waveStart', { volume: 0.6 });

        // Reset wave timer
        this.waveStartTime = this.time.now;
        this.enemiesSpawnedThisWave = 0;
        this.maxEnemiesThisWave = WAVE_CONFIG.baseEnemyCount + 
            (this.currentWave - 1) * WAVE_CONFIG.enemyCountPerWave;

        // Heal hero slightly between waves
        this.hero.heal(10);
    }

    showUpgradeMenu() {
        this.isPaused = true;
        this.pauseStartTime = this.time.now;
        
        // Pause physics
        this.physics.pause();
        
        const upgrades = this.weaponManager.getAvailableUpgrades();
        
        if (upgrades.length === 0) {
            // All weapons maxed - just give a heal
            this.hero.heal(20);
            this.resumeGame();
            return;
        }

        this.ui.showLevelUpMenu(upgrades, (upgrade) => {
            if (upgrade.action === 'equip') {
                this.weaponManager.equipWeapon(upgrade.id);
                this.hero.onWeaponEquipped(upgrade.id);
            } else {
                this.weaponManager.upgradeWeapon(upgrade.id);
                this.hero.onWeaponUpgraded(upgrade.id, upgrade.tier);
            }
            this.resumeGame();
        });
    }

    resumeGame() {
        // Adjust wave start time to account for pause duration
        const pauseDuration = this.time.now - this.pauseStartTime;
        this.waveStartTime += pauseDuration;
        this.lastSpawnTime += pauseDuration;
        
        // Adjust weapon and enemy timers
        this.weaponManager.adjustTimersForPause(pauseDuration);
        this.enemyManager.adjustTimersForPause(pauseDuration);
        
        // Resume physics
        this.physics.resume();
        this.isPaused = false;
    }

    endGame(victory) {
        this.gameOver = true;
        this.isPaused = true;

        // Stop all enemies
        this.enemyManager.enemies.getChildren().forEach(enemy => {
            if (enemy.body) enemy.body.setVelocity(0, 0);
        });
        
        // Clean up weapon effects
        this.weaponManager.cleanup();
        
        // Award gems collected this run
        const gemsEarned = this.gemsCollected;
        if (gemsEarned > 0) {
            ProgressManager.addGems(gemsEarned);
        }

        if (victory) {
            // Save progress - complete current level and unlock next
            ProgressManager.completeLevel(this.currentLevel);
            Assets.playSound('victory', { volume: 0.8 });
            
            this.ui.showVictory(this.hero.level, this.currentLevel, this.levelConfig.name, gemsEarned, () => {
                // Return to level select instead of restarting
                this.scene.start('LevelSelectScene');
            });
        } else {
            Assets.playSound('gameOver', { volume: 0.8 });
            this.ui.showGameOver(this.currentWave, this.hero.level, this.currentLevel, this.levelConfig.name, gemsEarned, () => {
                // Return to level select on game over
                this.scene.start('LevelSelectScene');
            });
        }
    }
}

// Progress Manager - Handles saving/loading game progress
const ProgressManager = {
    STORAGE_KEY: 'cosmicSurvivorProgress',
    
    getDefaultProgress() {
        return { 
            unlockedLevels: [1], 
            completedLevels: [],
            gems: 0,
            upgrades: {
                speed: 0,
                weaponSlot: 0,
                shield: 0,
                weaponPower: 0,
            }
        };
    },
    
    getProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const progress = JSON.parse(saved);
                // Ensure new fields exist for older saves
                if (progress.gems === undefined) progress.gems = 0;
                if (!progress.upgrades) {
                    progress.upgrades = { speed: 0, weaponSlot: 0, shield: 0 };
                }
                return progress;
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
        return this.getDefaultProgress();
    },
    
    saveProgress(progress) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    },
    
    // Gem management
    getGems() {
        return this.getProgress().gems;
    },
    
    addGems(amount) {
        const progress = this.getProgress();
        progress.gems += amount;
        this.saveProgress(progress);
        return progress.gems;
    },
    
    spendGems(amount) {
        const progress = this.getProgress();
        if (progress.gems >= amount) {
            progress.gems -= amount;
            this.saveProgress(progress);
            return true;
        }
        return false;
    },
    
    // Upgrade management
    getUpgradeLevel(upgradeId) {
        const progress = this.getProgress();
        return progress.upgrades[upgradeId] || 0;
    },
    
    purchaseUpgrade(upgradeId) {
        const progress = this.getProgress();
        const upgrade = SHOP_CONFIG.upgrades[upgradeId];
        if (!upgrade) return false;
        
        const currentLevel = progress.upgrades[upgradeId] || 0;
        if (currentLevel >= upgrade.maxLevel) return false;
        
        const cost = upgrade.costs[currentLevel];
        if (progress.gems < cost) return false;
        
        progress.gems -= cost;
        progress.upgrades[upgradeId] = currentLevel + 1;
        this.saveProgress(progress);
        return true;
    },
    
    getUpgradeEffect(upgradeId) {
        const level = this.getUpgradeLevel(upgradeId);
        if (level === 0) return 0;
        const upgrade = SHOP_CONFIG.upgrades[upgradeId];
        return upgrade ? upgrade.effects[level - 1] : 0;
    },
    
    getWeaponSlots() {
        return BASE_WEAPON_SLOTS + this.getUpgradeEffect('weaponSlot');
    },
    
    getXPMultiplier() {
        const level = this.getUpgradeLevel('weaponSlot');
        if (level === 0) return 1;
        const upgrade = SHOP_CONFIG.upgrades.weaponSlot;
        return 1 + (upgrade.xpBoost ? upgrade.xpBoost[level - 1] : 0);
    },
    
    getSpeedMultiplier() {
        return 1 + this.getUpgradeEffect('speed');
    },
    
    getShieldCharges() {
        return this.getUpgradeEffect('shield');
    },
    
    getWeaponDamageMultiplier() {
        const bonus = this.getUpgradeEffect('weaponPower');
        return 1 + bonus; // 1.0 base + 0.5 bonus = 1.5x
    },
    
    isLevelUnlocked(level) {
        const progress = this.getProgress();
        return progress.unlockedLevels.includes(level);
    },
    
    unlockLevel(level) {
        const progress = this.getProgress();
        if (!progress.unlockedLevels.includes(level)) {
            progress.unlockedLevels.push(level);
            this.saveProgress(progress);
        }
    },
    
    completeLevel(level) {
        const progress = this.getProgress();
        if (!progress.completedLevels.includes(level)) {
            progress.completedLevels.push(level);
        }
        // Unlock next level
        if (level < TOTAL_LEVELS && !progress.unlockedLevels.includes(level + 1)) {
            progress.unlockedLevels.push(level + 1);
        }
        this.saveProgress(progress);
    },
    
    isLevelCompleted(level) {
        const progress = this.getProgress();
        return progress.completedLevels.includes(level);
    },
    
    resetProgress() {
        this.saveProgress(this.getDefaultProgress());
    }
};

// QuickBoot Scene - Minimal load, straight into level 1
class QuickBootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuickBootScene' });
    }

    preload() {
        Assets.preloadForLevel(this, 1);
    }

    create() {
        this.scene.start('GameScene', { level: 1 });
    }
}

// Boot Scene - Loading
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        Assets.preloadAll(this);
        
        // Show loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '24px',
            fontFamily: 'Courier New',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // Loading progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 + 30, 320, 20);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 155, height / 2 + 35, 310 * value, 10);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            if (this.loadingText) this.loadingText.destroy();
        });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Scrolling background to simulate flying through space
        const bgKey = Assets.getAsset('backgrounds', 'homescreen');
        if (bgKey) {
            // Use tileSprite for scrolling background image
            this.scrollingBg = this.add.tileSprite(width / 2, height / 2, width, height, bgKey);
            this.scrollingBg.setDepth(-10);
        } else {
            // Fallback: Create a starfield that scrolls
            this.scrollingBg = null;
        }
        
        // Create multiple layers of stars for parallax scrolling effect
        this.starLayers = [];
        
        // Far stars (slow, small, dim)
        const farStars = [];
        for (let i = 0; i < 60; i++) {
            const star = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 1 + 0.5,
                0xffffff,
                0.2 + Math.random() * 0.3
            );
            star.setDepth(-9);
            star.scrollSpeed = 0.5 + Math.random() * 0.3;
            farStars.push(star);
        }
        this.starLayers.push(farStars);
        
        // Mid stars (medium speed)
        const midStars = [];
        for (let i = 0; i < 40; i++) {
            const star = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 1.5 + 0.5,
                0xffffff,
                0.4 + Math.random() * 0.3
            );
            star.setDepth(-8);
            star.scrollSpeed = 1 + Math.random() * 0.5;
            midStars.push(star);
        }
        this.starLayers.push(midStars);
        
        // Near stars (fast, bright)
        const nearStars = [];
        for (let i = 0; i < 20; i++) {
            const star = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 2 + 1,
                0xffffff,
                0.6 + Math.random() * 0.4
            );
            star.setDepth(-7);
            star.scrollSpeed = 2 + Math.random() * 1;
            nearStars.push(star);
        }
        this.starLayers.push(nearStars);
        
        // Occasional shooting stars
        this.time.addEvent({
            delay: 3000,
            repeat: -1,
            callback: () => {
                const startX = Math.random() * width;
                const shootingStar = this.add.rectangle(startX, -10, 2, 30, 0xffffff, 0.9);
                shootingStar.setDepth(-6);
                
                this.tweens.add({
                    targets: shootingStar,
                    y: height + 50,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => shootingStar.destroy()
                });
            }
        });
        
        // Use percentage-based positioning for better spacing across screen sizes
        const isPortrait = currentOrientation === 'portrait';
        
        // Key Y positions - title at top, ship centered, UI elements below
        const titleY = isPortrait ? height * 0.10 : height * 0.12;
        const subtitleY = isPortrait ? height * 0.16 : height * 0.20;
        const shipY = height * 0.45; // Ship centered vertically
        const instructY = isPortrait ? height * 0.72 : height * 0.72;
        const buttonY = isPortrait ? height * 0.85 : height * 0.85;
        
        // Nebula glow behind ship
        const nebulaSize = isPortrait ? 250 : 300;
        const nebula = this.add.ellipse(width / 2, shipY, nebulaSize, nebulaSize, 0x2244aa, 0.2);
        this.tweens.add({
            targets: nebula,
            scale: 1.3,
            alpha: 0.1,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Player ship sprite (centered on screen)
        const shipKey = Assets.getAsset('ships', 'player');
        const shipSize = isPortrait ? 160 : 200; // Larger ship as centerpiece
        let playerShip;
        let engineGlow;
        
        if (shipKey) {
            // Use the player ship sprite
            playerShip = this.add.sprite(width / 2, shipY, shipKey);
            playerShip.setDisplaySize(shipSize, shipSize);
            
            // Engine glow that follows the ship
            engineGlow = this.add.ellipse(width / 2, shipY + shipSize * 0.45, 20, 40, 0x00ccff, 0.6);
            
            // Gentle floating animation for ship and engine
            this.tweens.add({
                targets: [playerShip, engineGlow],
                y: '-=10',
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Engine glow pulsing
            this.tweens.add({
                targets: engineGlow,
                scaleY: 1.5,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        } else {
            // Fallback to vector silhouette if sprite not loaded
            const shipGraphics = this.add.graphics();
            shipGraphics.fillStyle(0xffffff, 0.5);
            shipGraphics.beginPath();
            shipGraphics.moveTo(width / 2, shipY - 50);
            shipGraphics.lineTo(width / 2 + 35, shipY + 10);
            shipGraphics.lineTo(width / 2 + 30, shipY + 50);
            shipGraphics.lineTo(width / 2 - 30, shipY + 50);
            shipGraphics.lineTo(width / 2 - 35, shipY + 10);
            shipGraphics.closePath();
            shipGraphics.fillPath();
            
            // Engine glow for fallback
            engineGlow = this.add.ellipse(width / 2, shipY + 55, 16, 30, 0x00ccff, 0.6);
            this.tweens.add({
                targets: engineGlow,
                scaleY: 1.5,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Pulsing rings around ship
        const ringBaseSize = isPortrait ? 80 : 100;
        for (let i = 0; i < 3; i++) {
            const ring = this.add.circle(width / 2, shipY, ringBaseSize + i * 30, 0x000000, 0);
            ring.setStrokeStyle(2, 0xffffff, 0.3 - i * 0.08);
            
            this.tweens.add({
                targets: ring,
                scale: 1.5,
                alpha: 0,
                duration: 2000,
                repeat: -1,
                delay: i * 600
            });
        }

        // Title with glow effect
        const titleGlow = this.add.text(width / 2, titleY, 'COSMIC SURVIVOR', {
            fontSize: isPortrait ? '36px' : '48px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        titleGlow.setAlpha(0.4);
        titleGlow.setBlendMode(Phaser.BlendModes.ADD);
        
        const title = this.add.text(width / 2, titleY, 'COSMIC SURVIVOR', {
            fontSize: isPortrait ? '32px' : '44px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Pulsing title
        this.tweens.add({
            targets: [title, titleGlow],
            scale: 1.02,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle with typewriter effect
        const subtitleText = 'Survive the Alien Onslaught';
        const subtitle = this.add.text(width / 2, subtitleY, '', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#aaaaaa',
        }).setOrigin(0.5);

        let charIndex = 0;
        this.time.addEvent({
            delay: 50,
            repeat: subtitleText.length - 1,
            callback: () => {
                subtitle.text += subtitleText[charIndex];
                charIndex++;
            }
        });

        // Decorative lines
        const lineOffset = isPortrait ? 120 : 160;
        const leftLine = this.add.rectangle(width / 2 - lineOffset, subtitleY, 50, 2, 0xffffff, 0.5);
        const rightLine = this.add.rectangle(width / 2 + lineOffset, subtitleY, 50, 2, 0xffffff, 0.5);

        // Instructions
        const instructions = this.add.text(width / 2, instructY, '🚀 WASD / Arrows to pilot  •  📱 Touch to steer', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#667799',
            align: 'center',
        }).setOrigin(0.5);
        instructions.setAlpha(0);
        
        this.tweens.add({
            targets: instructions,
            alpha: 1,
            y: instructY - 3,
            duration: 500,
            delay: 800
        });

        // Launch button with glow
        const buttonGlow = this.add.rectangle(width / 2, buttonY, 200, 50, 0xffffff, 0.2);
        this.tweens.add({
            targets: buttonGlow,
            scale: 1.1,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        const button = this.add.rectangle(width / 2, buttonY, 180, 45, 0x2266aa);
        button.setStrokeStyle(3, 0xffffff, 0.8);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(width / 2, buttonY, '🚀 LAUNCH', {
            fontSize: '20px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Button entrance animation
        button.setScale(0);
        buttonText.setScale(0);
        buttonGlow.setScale(0);
        
        this.tweens.add({
            targets: [button, buttonText, buttonGlow],
            scale: 1,
            duration: 400,
            delay: 600,
            ease: 'Back.easeOut'
        });

        button.on('pointerover', () => {
            button.setFillStyle(0x3388cc);
            this.tweens.add({
                targets: [button, buttonText],
                scale: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x2266aa);
            this.tweens.add({
                targets: [button, buttonText],
                scale: 1,
                duration: 100
            });
        });

        button.on('pointerdown', () => {
            // Warp effect
            this.cameras.main.flash(200, 68, 136, 255, false);
            this.cameras.main.fade(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
                this.scene.start('LevelSelectScene');
            });
        });

        // Version
        this.add.text(width - 10, height - 10, 'v1.0', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#334455',
        }).setOrigin(1, 1);
        
        // Hint
        this.add.text(10, height - 10, 'ESC to pause', {
            fontSize: '11px',
            fontFamily: 'Courier New',
            color: '#334455',
        }).setOrigin(0, 1);
        
        // Debug menu button (small gear icon in corner)
        this.createDebugButton(width);
    }
    
    createDebugButton(width) {
        const debugBtn = this.add.text(width - 10, 10, '⚙', {
            fontSize: '20px',
            fontFamily: 'Courier New',
            color: '#334455',
        }).setOrigin(1, 0);
        
        debugBtn.setInteractive({ useHandCursor: true });
        
        debugBtn.on('pointerover', () => {
            debugBtn.setColor('#667799');
        });
        
        debugBtn.on('pointerout', () => {
            debugBtn.setColor('#334455');
        });
        
        debugBtn.on('pointerdown', () => {
            this.showDebugMenu();
        });
    }
    
    showDebugMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create debug menu container
        this.debugContainer = this.add.container(width / 2, height / 2);
        this.debugContainer.setDepth(100);
        
        const panelWidth = 280;
        const panelHeight = 330;
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x0a0a1a, 0.95);
        panel.setStrokeStyle(2, 0xff8800, 0.8);
        
        // Title
        const title = this.add.text(0, -140, '🛠 DEBUG MENU', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#ff8800',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Warning text
        const warning = this.add.text(0, -115, 'For testing only', {
            fontSize: '10px',
            fontFamily: 'Courier New',
            color: '#886644',
        }).setOrigin(0.5);
        
        // Debug options
        const optionStartY = -75;
        const optionSpacing = 45;
        
        // Option 1: Invincibility
        const invincibleToggle = this.createDebugToggle(
            0, optionStartY,
            '🛡 Invincibility',
            DEBUG_CONFIG.invincible,
            (newValue) => {
                DEBUG_CONFIG.invincible = newValue;
            }
        );
        
        // Option 2: All Levels Unlocked
        const levelsToggle = this.createDebugToggle(
            0, optionStartY + optionSpacing,
            '🔓 All Levels Unlocked',
            DEBUG_CONFIG.allLevelsUnlocked,
            (newValue) => {
                DEBUG_CONFIG.allLevelsUnlocked = newValue;
            }
        );
        
        // Option 3: Starting Weapon Selector
        const weaponSelector = this.createDebugWeaponSelector(
            0, optionStartY + optionSpacing * 2
        );
        
        // Option 4: Theme Toggle
        const themeToggle = this.createDebugToggle(
            0, optionStartY + optionSpacing * 3,
            '🌊 Aquatic Theme',
            ThemeManager.current() === 'aquatic',
            (newValue) => {
                ThemeManager.set(newValue ? 'aquatic' : 'space');
                this.debugContainer.destroy();
                this.debugContainer = null;
                Assets.loadedAssets.clear();
                Assets.failedAssets.clear();
                this.textures.getTextureKeys().forEach(k => {
                    if (!k.startsWith('__')) this.textures.remove(k);
                });
                this.anims.getAnimationNames().forEach(k => this.anims.remove(k));
                this.scene.start('BootScene');
            }
        );
        
        // Close button
        const closeBtn = this.add.rectangle(0, 140, 100, 35, 0x333344);
        closeBtn.setStrokeStyle(2, 0xffffff, 0.6);
        closeBtn.setInteractive({ useHandCursor: true });
        
        const closeText = this.add.text(0, 140, 'CLOSE', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#aaaaaa',
        }).setOrigin(0.5);
        
        closeBtn.on('pointerover', () => {
            closeBtn.setFillStyle(0x444455);
            closeText.setColor('#ffffff');
        });
        
        closeBtn.on('pointerout', () => {
            closeBtn.setFillStyle(0x333344);
            closeText.setColor('#aaaaaa');
        });
        
        closeBtn.on('pointerdown', () => {
            this.debugContainer.destroy();
            this.debugContainer = null;
        });
        
        // Add all elements to container
        this.debugContainer.add([
            panel,
            title,
            warning,
            ...invincibleToggle,
            ...levelsToggle,
            ...weaponSelector,
            ...themeToggle,
            closeBtn,
            closeText
        ]);
        
        // Entrance animation
        this.debugContainer.setScale(0.8);
        this.debugContainer.setAlpha(0);
        this.tweens.add({
            targets: this.debugContainer,
            scale: 1,
            alpha: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }
    
    createDebugWeaponSelector(x, y) {
        const elements = [];
        
        // Weapon options
        const weaponOptions = [
            { id: 'none', name: 'None' },
            { id: 'fireball', name: 'Torpedo' },
            { id: 'lightning', name: 'Lightning' },
            { id: 'frostNova', name: 'Frost Nova' },
            { id: 'voidZone', name: 'Void Zone' },
            { id: 'spiritOrbs', name: 'Spirit Orbs' },
        ];
        
        // Find current index
        let currentIndex = weaponOptions.findIndex(w => w.id === DEBUG_CONFIG.startingWeapon);
        if (currentIndex === -1) currentIndex = 0;
        
        // Label
        const labelText = this.add.text(x - 100, y, '🔫 Start Weapon', {
            fontSize: '13px',
            fontFamily: 'Courier New',
            color: '#cccccc',
        }).setOrigin(0, 0.5);
        elements.push(labelText);
        
        // Selector background
        const selectorWidth = 100;
        const selectorHeight = 24;
        const selectorX = x + 65;
        
        const selectorBg = this.add.rectangle(selectorX, y, selectorWidth, selectorHeight, 0x222233);
        selectorBg.setStrokeStyle(2, 0x444466, 0.8);
        elements.push(selectorBg);
        
        // Current selection text
        const selectionText = this.add.text(selectorX, y, weaponOptions[currentIndex].name, {
            fontSize: '11px',
            fontFamily: 'Courier New',
            color: '#44ff88',
        }).setOrigin(0.5);
        elements.push(selectionText);
        
        // Left arrow
        const leftArrow = this.add.text(selectorX - selectorWidth/2 + 10, y, '◀', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#888888',
        }).setOrigin(0.5);
        leftArrow.setInteractive({ useHandCursor: true });
        elements.push(leftArrow);
        
        // Right arrow
        const rightArrow = this.add.text(selectorX + selectorWidth/2 - 10, y, '▶', {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#888888',
        }).setOrigin(0.5);
        rightArrow.setInteractive({ useHandCursor: true });
        elements.push(rightArrow);
        
        // Arrow interactions
        leftArrow.on('pointerover', () => leftArrow.setColor('#ffffff'));
        leftArrow.on('pointerout', () => leftArrow.setColor('#888888'));
        leftArrow.on('pointerdown', () => {
            currentIndex = (currentIndex - 1 + weaponOptions.length) % weaponOptions.length;
            selectionText.setText(weaponOptions[currentIndex].name);
            DEBUG_CONFIG.startingWeapon = weaponOptions[currentIndex].id;
        });
        
        rightArrow.on('pointerover', () => rightArrow.setColor('#ffffff'));
        rightArrow.on('pointerout', () => rightArrow.setColor('#888888'));
        rightArrow.on('pointerdown', () => {
            currentIndex = (currentIndex + 1) % weaponOptions.length;
            selectionText.setText(weaponOptions[currentIndex].name);
            DEBUG_CONFIG.startingWeapon = weaponOptions[currentIndex].id;
        });
        
        return elements;
    }
    
    createDebugToggle(x, y, label, initialValue, onChange) {
        const elements = [];
        
        // Label
        const labelText = this.add.text(x - 100, y, label, {
            fontSize: '13px',
            fontFamily: 'Courier New',
            color: '#cccccc',
        }).setOrigin(0, 0.5);
        elements.push(labelText);
        
        // Toggle background
        const toggleWidth = 50;
        const toggleHeight = 24;
        const toggleX = x + 90;
        
        const toggleBg = this.add.rectangle(toggleX, y, toggleWidth, toggleHeight, 0x222233);
        toggleBg.setStrokeStyle(2, 0x444466, 0.8);
        toggleBg.setInteractive({ useHandCursor: true });
        elements.push(toggleBg);
        
        // Toggle knob
        const knobX = initialValue ? toggleX + 12 : toggleX - 12;
        const knob = this.add.circle(knobX, y, 9, initialValue ? 0x44ff88 : 0x666666);
        elements.push(knob);
        
        // Status text
        const statusText = this.add.text(toggleX, y + 18, initialValue ? 'ON' : 'OFF', {
            fontSize: '9px',
            fontFamily: 'Courier New',
            color: initialValue ? '#44ff88' : '#666666',
        }).setOrigin(0.5);
        elements.push(statusText);
        
        // Track current state
        let isOn = initialValue;
        
        toggleBg.on('pointerdown', () => {
            isOn = !isOn;
            
            // Animate knob
            this.tweens.add({
                targets: knob,
                x: isOn ? toggleX + 12 : toggleX - 12,
                duration: 100,
                ease: 'Power2'
            });
            
            // Update colors
            knob.setFillStyle(isOn ? 0x44ff88 : 0x666666);
            statusText.setText(isOn ? 'ON' : 'OFF');
            statusText.setColor(isOn ? '#44ff88' : '#666666');
            
            // Callback
            onChange(isOn);
        });
        
        return elements;
    }

    
    update(time, delta) {
        const height = this.cameras.main.height;
        const scrollSpeed = 100; // Pixels per second
        const deltaSeconds = delta / 1000;
        
        // Scroll the background image
        if (this.scrollingBg) {
            this.scrollingBg.tilePositionY -= scrollSpeed * deltaSeconds;
        }
        
        // Scroll the star layers with parallax effect
        if (this.starLayers) {
            this.starLayers.forEach(layer => {
                layer.forEach(star => {
                    star.y += star.scrollSpeed * scrollSpeed * deltaSeconds;
                    
                    // Wrap stars that go off screen
                    if (star.y > height + 10) {
                        star.y = -10;
                        star.x = Math.random() * this.cameras.main.width;
                    }
                });
            });
        }
    }
}

// Level Select Scene
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const isPortrait = currentOrientation === 'portrait';
        
        // Check for custom background image
        const bgKey = Assets.getAsset('backgrounds', 'levelselect');
        if (bgKey) {
            const bg = this.add.image(width / 2, height / 2, bgKey);
            // Scale to cover the screen
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            bg.setDepth(-10);
        } else {
            // Fallback: Star background
            for (let i = 0; i < 80; i++) {
                const star = this.add.circle(
                    Math.random() * width,
                    Math.random() * height,
                    Math.random() * 1.5,
                    0xffffff,
                    0.3 + Math.random() * 0.5
                );
                
                if (Math.random() > 0.8) {
                    this.tweens.add({
                        targets: star,
                        alpha: 0.1,
                        duration: 1000 + Math.random() * 2000,
                        yoyo: true,
                        repeat: -1
                    });
                }
            }
        }
        
        // Title - adjust size for portrait
        this.add.text(width / 2, isPortrait ? 40 : 50, 'SELECT SECTOR', {
            fontSize: isPortrait ? '28px' : '36px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        this.add.text(width / 2, isPortrait ? 70 : 85, 'Choose your mission', {
            fontSize: isPortrait ? '12px' : '14px',
            fontFamily: 'Courier New',
            color: '#667799',
        }).setOrigin(0.5);
        
        // Level cards - different layout for portrait vs landscape
        if (isPortrait) {
            // Portrait: vertical stacked layout, centered, taking ~80% of screen height
            const cardWidth = width - 60;
            const cardSpacing = 15;
            const totalCardsHeight = height * 0.80; // 80% of screen height
            const cardHeight = (totalCardsHeight - (TOTAL_LEVELS - 1) * cardSpacing) / TOTAL_LEVELS;
            
            // Center the cards vertically
            const totalBlockHeight = TOTAL_LEVELS * cardHeight + (TOTAL_LEVELS - 1) * cardSpacing;
            const startY = (height - totalBlockHeight) / 2 + cardHeight / 2;
            
            for (let i = 1; i <= TOTAL_LEVELS; i++) {
                const cardY = startY + (i - 1) * (cardHeight + cardSpacing);
                this.createLevelCardPortrait(i, width / 2, cardY, cardWidth, cardHeight);
            }
        } else {
            // Landscape: horizontal layout
            const cardWidth = 180;
            const cardHeight = 240;
            const cardSpacing = 20;
            const startX = width / 2 - (TOTAL_LEVELS - 1) * (cardWidth + cardSpacing) / 2;
            const cardY = height / 2 + 10;
            
            for (let i = 1; i <= TOTAL_LEVELS; i++) {
                this.createLevelCard(i, startX + (i - 1) * (cardWidth + cardSpacing), cardY, cardWidth, cardHeight);
            }
        }
        
        // Back button - position adjusted for portrait
        const backBtnY = isPortrait ? height - 60 : height - 40;
        const backBtn = this.add.rectangle(70, backBtnY, 100, 35, 0x333344);
        backBtn.setStrokeStyle(2, 0xffffff, 0.6);
        backBtn.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(70, backBtnY, '← BACK', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#aaaaaa',
        }).setOrigin(0.5);
        
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x444455);
            backText.setColor('#ffffff');
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x333344);
            backText.setColor('#aaaaaa');
        });
        
        backBtn.on('pointerdown', () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('BootScene');
            });
        });
        
        // Progress info
        const progress = ProgressManager.getProgress();
        const completedCount = progress.completedLevels.length;
        this.add.text(width - 20, height - (isPortrait ? 30 : 20), `Completed: ${completedCount}/${TOTAL_LEVELS}`, {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: '#446688',
        }).setOrigin(1, 1);
        
        // Gem display
        const gemCount = ProgressManager.getGems();
        const gemDisplay = this.add.container(width - 80, 30);
        const gemIcon = this.add.star(0, 0, 4, 6, 12, 0x44ffaa, 1);
        gemIcon.setStrokeStyle(1, 0x88ffcc, 0.8);
        const gemText = this.add.text(18, 0, gemCount.toString(), {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#44ffaa',
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        gemDisplay.add([gemIcon, gemText]);
        
        // Shop button - position adjusted for portrait
        const shopBtnY = isPortrait ? height - 60 : height - 40;
        const shopBtn = this.add.rectangle(width - 80, shopBtnY, 120, 35, 0x2a3a2a);
        shopBtn.setStrokeStyle(2, 0x44ff88, 0.8);
        shopBtn.setInteractive({ useHandCursor: true });
        
        const shopText = this.add.text(width - 80, shopBtnY, '🛒 SHOP', {
            fontSize: '16px',
            fontFamily: 'Courier New',
            color: '#44ff88',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        shopBtn.on('pointerover', () => {
            shopBtn.setFillStyle(0x3a4a3a);
            shopText.setColor('#66ffaa');
        });
        
        shopBtn.on('pointerout', () => {
            shopBtn.setFillStyle(0x2a3a2a);
            shopText.setColor('#44ff88');
        });
        
        shopBtn.on('pointerdown', () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('ShopScene');
            });
        });
    }
    
    // Portrait-specific level card layout (horizontal, adaptive height)
    createLevelCardPortrait(levelNum, x, y, cardWidth, cardHeight) {
        const levelConfig = LEVELS[levelNum];
        const isUnlocked = DEBUG_CONFIG.allLevelsUnlocked || ProgressManager.isLevelUnlocked(levelNum);
        const isCompleted = ProgressManager.isLevelCompleted(levelNum);
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 
            isUnlocked ? 0x1a1a2e : 0x0a0a15);
        card.setStrokeStyle(3, isCompleted ? 0x44ff88 : (isUnlocked ? 0xffffff : 0x333344), 
            isUnlocked ? 0.8 : 0.4);
        
        // Check for level background image
        const bgKey = Assets.getAsset('backgrounds', `level${levelNum}`);
        if (bgKey) {
            const bgImage = this.add.image(x, y, bgKey);
            const scaleX = cardWidth / bgImage.width;
            const scaleY = cardHeight / bgImage.height;
            const scale = Math.max(scaleX, scaleY);
            bgImage.setScale(scale);
            bgImage.setAlpha(isUnlocked ? 0.3 : 0.1);
            
            const maskGraphics = this.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight);
            const mask = maskGraphics.createGeometryMask();
            bgImage.setMask(mask);
        }
        
        // Left side: Level number (vertically centered)
        const levelNumText = this.add.text(x - cardWidth/2 + 45, y, levelNum.toString(), {
            fontSize: '42px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#ffffff' : '#333344',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Center content area - spread elements based on card height
        const contentX = x - cardWidth/2 + 100;
        const verticalSpread = Math.min(cardHeight * 0.35, 40); // Adaptive spacing
        
        // Level name
        const nameText = this.add.text(contentX, y - verticalSpread, levelConfig.name, {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#ffffff' : '#444444',
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        
        // Description
        const descText = this.add.text(contentX, y, levelConfig.description, {
            fontSize: '12px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#667799' : '#333344',
        }).setOrigin(0, 0.5);
        
        // Difficulty stars
        const starsY = y + verticalSpread;
        const difficulty = Math.min(5, levelNum);
        for (let s = 0; s < 5; s++) {
            const starColor = s < difficulty ? 0xffaa44 : 0x333344;
            this.add.star(contentX + s * 16, starsY, 5, 5, 10, starColor, s < difficulty ? 0.9 : 0.3);
        }
        
        // Right side: Status (vertically centered)
        let statusText = '';
        let statusColor = '#666666';
        if (isCompleted) {
            statusText = '✓';
            statusColor = '#44ff88';
        } else if (isUnlocked) {
            statusText = '►';
            statusColor = '#ffaa44';
        } else {
            statusText = '🔒';
            statusColor = '#444444';
        }
        
        const status = this.add.text(x + cardWidth/2 - 35, y, statusText, {
            fontSize: '28px',
            fontFamily: 'Courier New',
            color: statusColor,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        if (isUnlocked) {
            card.setInteractive({ useHandCursor: true });
            
            card.on('pointerover', () => {
                card.setFillStyle(0x2a2a4e);
                this.tweens.add({
                    targets: card,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 100
                });
            });
            
            card.on('pointerout', () => {
                card.setFillStyle(0x1a1a2e);
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });
            
            card.on('pointerdown', () => {
                this.cameras.main.flash(200, 68, 136, 255, false);
                this.cameras.main.fade(400, 0, 0, 0);
                this.time.delayedCall(400, () => {
                    this.scene.start('GameScene', { level: levelNum });
                });
            });
        }
    }
    
    createLevelCard(levelNum, x, y, cardWidth, cardHeight) {
        const levelConfig = LEVELS[levelNum];
        // Debug: unlock all levels if flag is set
        const isUnlocked = DEBUG_CONFIG.allLevelsUnlocked || ProgressManager.isLevelUnlocked(levelNum);
        const isCompleted = ProgressManager.isLevelCompleted(levelNum);
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 
            isUnlocked ? 0x1a1a2e : 0x0a0a15);
        card.setStrokeStyle(3, isCompleted ? 0x44ff88 : (isUnlocked ? 0xffffff : 0x333344), 
            isUnlocked ? 0.8 : 0.4);
        
        // Check for level background image
        const bgKey = Assets.getAsset('backgrounds', `level${levelNum}`);
        if (bgKey) {
            // Create a container to clip the image to the card bounds
            const bgImage = this.add.image(x, y, bgKey);
            
            // Scale to cover the card
            const scaleX = cardWidth / bgImage.width;
            const scaleY = cardHeight / bgImage.height;
            const scale = Math.max(scaleX, scaleY);
            bgImage.setScale(scale);
            
            // Apply alpha based on unlock status
            bgImage.setAlpha(isUnlocked ? 0.4 : 0.15);
            
            // Create a mask to clip to card bounds
            const maskGraphics = this.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight);
            const mask = maskGraphics.createGeometryMask();
            bgImage.setMask(mask);
        }
        
        // Level number
        const levelNumText = this.add.text(x, y - 70, levelNum.toString(), {
            fontSize: '56px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#ffffff' : '#333344',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Level name
        const nameText = this.add.text(x, y + 10, levelConfig.name, {
            fontSize: '16px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#ffffff' : '#444444',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Description
        const descText = this.add.text(x, y + 40, levelConfig.description, {
            fontSize: '11px',
            fontFamily: 'Courier New',
            color: isUnlocked ? '#667799' : '#333344',
            wordWrap: { width: cardWidth - 20 },
            align: 'center',
        }).setOrigin(0.5);
        
        // Status indicator
        let statusText = '';
        let statusColor = '#666666';
        if (isCompleted) {
            statusText = '✓ CLEARED';
            statusColor = '#44ff88';
        } else if (isUnlocked) {
            statusText = '► PLAY';
            statusColor = '#ffaa44';
        } else {
            statusText = '🔒 LOCKED';
            statusColor = '#444444';
        }
        
        const status = this.add.text(x, y + 80, statusText, {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: statusColor,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Difficulty stars
        const difficulty = Math.min(5, levelNum);
        const starsY = y + 105;
        for (let s = 0; s < 5; s++) {
            const starColor = s < difficulty ? 0xffaa44 : 0x333344;
            this.add.star(x - 28 + s * 14, starsY, 5, 4, 8, starColor, s < difficulty ? 0.9 : 0.3);
        }
        
        if (isUnlocked) {
            card.setInteractive({ useHandCursor: true });
            
            card.on('pointerover', () => {
                card.setFillStyle(0x2a2a4e);
                this.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });
            
            card.on('pointerout', () => {
                card.setFillStyle(0x1a1a2e);
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });
            
            card.on('pointerdown', () => {
                this.cameras.main.flash(200, 68, 136, 255, false);
                this.cameras.main.fade(400, 0, 0, 0);
                this.time.delayedCall(400, () => {
                    this.scene.start('GameScene', { level: levelNum });
                });
            });
        }
    }
}

// Shop Scene
class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const isPortrait = currentOrientation === 'portrait';
        
        // Background
        for (let i = 0; i < 60; i++) {
            const star = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 1.5,
                0xffffff,
                0.2 + Math.random() * 0.3
            );
        }
        
        // Dark overlay panel
        this.add.rectangle(width / 2, height / 2, width - 60, height - 60, 0x0a0a1a, 0.95)
            .setStrokeStyle(3, 0x44ff88, 0.6);
        
        // Title - adjust for portrait
        const titleY = isPortrait ? 40 : 50;
        this.add.text(width / 2, titleY, 'SHIP UPGRADES', {
            fontSize: isPortrait ? '26px' : '32px',
            fontFamily: 'Courier New',
            color: '#44ff88',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Gem display
        const gemY = isPortrait ? 70 : 85;
        this.gemText = this.add.text(width / 2, gemY, '', {
            fontSize: isPortrait ? '16px' : '18px',
            fontFamily: 'Courier New',
            color: '#44ffaa',
        }).setOrigin(0.5);
        this.updateGemDisplay();
        
        // Create upgrade cards - different layout for portrait vs landscape
        const upgrades = Object.values(SHOP_CONFIG.upgrades);
        this.upgradeCards = [];
        
        if (isPortrait) {
            // Portrait: vertical stacked layout, 60% of screen dimensions
            const cardWidth = width * 0.60;
            const cardSpacing = 15;
            const totalCardsHeight = height * 0.60;
            const cardHeight = (totalCardsHeight - (upgrades.length - 1) * cardSpacing) / upgrades.length;
            
            // Center the cards vertically (accounting for title area)
            const titleAreaHeight = 100;
            const availableHeight = height - titleAreaHeight;
            const totalBlockHeight = upgrades.length * cardHeight + (upgrades.length - 1) * cardSpacing;
            const startY = titleAreaHeight + (availableHeight - totalBlockHeight) / 2 + cardHeight / 2;
            
            upgrades.forEach((upgrade, index) => {
                const x = width / 2;
                const y = startY + index * (cardHeight + cardSpacing);
                this.createUpgradeCardPortrait(upgrade, x, y, cardWidth, cardHeight);
            });
        } else {
            // Landscape: horizontal layout
            const cardWidth = Math.min(180, (width - 100) / upgrades.length - 15);
            const cardSpacing = 15;
            const totalWidth = upgrades.length * cardWidth + (upgrades.length - 1) * cardSpacing;
            const startX = width / 2 - totalWidth / 2 + cardWidth / 2;
            const cardY = height / 2 + 20;
            
            upgrades.forEach((upgrade, index) => {
                this.createUpgradeCard(upgrade, startX + index * (cardWidth + cardSpacing), cardY, cardWidth);
            });
        }
        
        // Back button
        const backBtnY = isPortrait ? height - 40 : height - 50;
        const backBtn = this.add.rectangle(width / 2, backBtnY, 150, 40, 0x333344);
        backBtn.setStrokeStyle(2, 0xffffff, 0.6);
        backBtn.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(width / 2, backBtnY, '← BACK', {
            fontSize: '16px',
            fontFamily: 'Courier New',
            color: '#aaaaaa',
        }).setOrigin(0.5);
        
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x444455);
            backText.setColor('#ffffff');
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x333344);
            backText.setColor('#aaaaaa');
        });
        
        backBtn.on('pointerdown', () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('LevelSelectScene');
            });
        });
    }
    
    // Portrait upgrade card - centered vertical layout
    createUpgradeCardPortrait(upgrade, x, y, cardWidth, cardHeight) {
        const currentLevel = ProgressManager.getUpgradeLevel(upgrade.id);
        const isMaxed = currentLevel >= upgrade.maxLevel;
        const cost = isMaxed ? 0 : upgrade.costs[currentLevel];
        const canAfford = ProgressManager.getGems() >= cost;
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a2e);
        card.setStrokeStyle(3, isMaxed ? 0x44ff88 : 0xffffff, 0.8);
        
        // Scale factors based on card height
        const iconSize = cardHeight * 0.30; // Icon takes 30% of card height
        const nameFontSize = Math.max(12, Math.min(16 * (cardHeight / 150), 18));
        const descFontSize = Math.max(9, Math.min(11 * (cardHeight / 150), 12));
        const levelFontSize = Math.max(12, Math.min(16 * (cardHeight / 150), 18));
        
        // Vertical positioning
        const topPadding = cardHeight * 0.08;
        const iconY = y - cardHeight/2 + topPadding + iconSize/2;
        const nameY = iconY + iconSize/2 + cardHeight * 0.08;
        const descY = nameY + cardHeight * 0.10;
        const levelY = descY + cardHeight * 0.12;
        const effectY = levelY + cardHeight * 0.10;
        const buttonY = y + cardHeight/2 - cardHeight * 0.12;
        
        // Icon - centered
        this.add.text(x, iconY, upgrade.icon, {
            fontSize: `${iconSize}px`,
        }).setOrigin(0.5);
        
        // Name - centered
        this.add.text(x, nameY, upgrade.name, {
            fontSize: `${nameFontSize}px`,
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Description - centered
        this.add.text(x, descY, upgrade.description, {
            fontSize: `${descFontSize}px`,
            fontFamily: 'Courier New',
            color: '#667799',
            wordWrap: { width: cardWidth - 30 },
            align: 'center',
        }).setOrigin(0.5);
        
        // Level indicator - centered
        let levelStr = '';
        for (let i = 0; i < upgrade.maxLevel; i++) {
            levelStr += i < currentLevel ? '●' : '○';
        }
        this.add.text(x, levelY, levelStr, {
            fontSize: `${levelFontSize}px`,
            fontFamily: 'Courier New',
            color: '#44ff88',
        }).setOrigin(0.5);
        
        // Current effect display - centered
        let effectText = '';
        if (currentLevel > 0) {
            const effect = upgrade.effects[currentLevel - 1];
            if (upgrade.id === 'speed') {
                effectText = `+${Math.round(effect * 100)}% Speed`;
            } else if (upgrade.id === 'weaponSlot') {
                effectText = `+${effect} Slot${effect > 1 ? 's' : ''}`;
                const xpBoost = upgrade.xpBoost ? upgrade.xpBoost[currentLevel - 1] : 0;
                effectText += ` / +${Math.round(xpBoost * 100)}% XP`;
            } else if (upgrade.id === 'shield') {
                effectText = `${effect} Shield${effect > 1 ? 's' : ''}`;
            } else if (upgrade.id === 'weaponPower') {
                effectText = `+${Math.round(effect * 100)}% Damage`;
            }
        }
        if (effectText) {
            this.add.text(x, effectY, effectText, {
                fontSize: `${descFontSize}px`,
                fontFamily: 'Courier New',
                color: '#88aaff',
            }).setOrigin(0.5);
        }
        
        // Buy button or Maxed indicator
        if (!isMaxed) {
            const btnColor = canAfford ? 0x2a4a2a : 0x2a2a2a;
            const btnWidth = Math.min(cardWidth - 40, 120);
            const buyBtn = this.add.rectangle(x, buttonY, btnWidth, 30, btnColor);
            buyBtn.setStrokeStyle(2, canAfford ? 0x44ff88 : 0x444444, 0.8);
            
            const btnText = this.add.text(x, buttonY, `💎 ${cost}`, {
                fontSize: '13px',
                fontFamily: 'Courier New',
                color: canAfford ? '#44ff88' : '#666666',
                fontStyle: 'bold',
            }).setOrigin(0.5);
            
            if (canAfford) {
                buyBtn.setInteractive({ useHandCursor: true });
                
                buyBtn.on('pointerover', () => {
                    buyBtn.setFillStyle(0x3a5a3a);
                    btnText.setColor('#66ffaa');
                });
                
                buyBtn.on('pointerout', () => {
                    buyBtn.setFillStyle(0x2a4a2a);
                    btnText.setColor('#44ff88');
                });
                
                buyBtn.on('pointerdown', () => {
                    if (ProgressManager.purchaseUpgrade(upgrade.id)) {
                        this.cameras.main.flash(200, 68, 255, 136, false);
                        this.scene.restart();
                    }
                });
            }
            
            this.upgradeCards.push({ card, buyBtn, btnText, upgrade });
        } else {
            this.add.text(x, buttonY, '✓ MAXED', {
                fontSize: '13px',
                fontFamily: 'Courier New',
                color: '#44ff88',
                fontStyle: 'bold',
            }).setOrigin(0.5);
        }
    }
    
    updateGemDisplay() {
        const gems = ProgressManager.getGems();
        this.gemText.setText(`💎 ${gems} Gems`);
    }
    
    createUpgradeCard(upgrade, x, y, cardWidth) {
        const currentLevel = ProgressManager.getUpgradeLevel(upgrade.id);
        const isMaxed = currentLevel >= upgrade.maxLevel;
        const cost = isMaxed ? 0 : upgrade.costs[currentLevel];
        const canAfford = ProgressManager.getGems() >= cost;
        
        // Card background
        const card = this.add.rectangle(x, y, cardWidth, 220, 0x1a1a2e);
        card.setStrokeStyle(3, isMaxed ? 0x44ff88 : 0xffffff, 0.8);
        
        // Icon
        this.add.text(x, y - 70, upgrade.icon, {
            fontSize: '48px',
        }).setOrigin(0.5);
        
        // Name
        this.add.text(x, y - 20, upgrade.name, {
            fontSize: '16px',
            fontFamily: 'Courier New',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Description
        this.add.text(x, y + 10, upgrade.description, {
            fontSize: '11px',
            fontFamily: 'Courier New',
            color: '#667799',
            wordWrap: { width: cardWidth - 20 },
            align: 'center',
        }).setOrigin(0.5);
        
        // Level indicator
        let levelStr = '';
        for (let i = 0; i < upgrade.maxLevel; i++) {
            levelStr += i < currentLevel ? '●' : '○';
        }
        this.add.text(x, y + 45, levelStr, {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#44ff88',
        }).setOrigin(0.5);
        
        // Current effect display
        let effectText = '';
        let effectText2 = '';
        if (currentLevel > 0) {
            const effect = upgrade.effects[currentLevel - 1];
            if (upgrade.id === 'speed') {
                effectText = `+${Math.round(effect * 100)}% Speed`;
            } else if (upgrade.id === 'weaponSlot') {
                effectText = `+${effect} Slot${effect > 1 ? 's' : ''}`;
                const xpBoost = upgrade.xpBoost ? upgrade.xpBoost[currentLevel - 1] : 0;
                effectText2 = `+${Math.round(xpBoost * 100)}% XP`;
            } else if (upgrade.id === 'shield') {
                effectText = `${effect} Shield${effect > 1 ? 's' : ''}`;
            }
        }
        if (effectText) {
            this.add.text(x, y + 60, effectText, {
                fontSize: '11px',
                fontFamily: 'Courier New',
                color: '#88aaff',
            }).setOrigin(0.5);
        }
        if (effectText2) {
            this.add.text(x, y + 75, effectText2, {
                fontSize: '11px',
                fontFamily: 'Courier New',
                color: '#88ffaa',
            }).setOrigin(0.5);
        }
        
        // Buy button
        if (!isMaxed) {
            const btnColor = canAfford ? 0x2a4a2a : 0x2a2a2a;
            const buyBtn = this.add.rectangle(x, y + 95, cardWidth - 30, 35, btnColor);
            buyBtn.setStrokeStyle(2, canAfford ? 0x44ff88 : 0x444444, 0.8);
            
            const btnText = this.add.text(x, y + 95, `💎 ${cost}`, {
                fontSize: '14px',
                fontFamily: 'Courier New',
                color: canAfford ? '#44ff88' : '#666666',
                fontStyle: 'bold',
            }).setOrigin(0.5);
            
            if (canAfford) {
                buyBtn.setInteractive({ useHandCursor: true });
                
                buyBtn.on('pointerover', () => {
                    buyBtn.setFillStyle(0x3a5a3a);
                    btnText.setColor('#66ffaa');
                });
                
                buyBtn.on('pointerout', () => {
                    buyBtn.setFillStyle(0x2a4a2a);
                    btnText.setColor('#44ff88');
                });
                
                buyBtn.on('pointerdown', () => {
                    if (ProgressManager.purchaseUpgrade(upgrade.id)) {
                        // Success effect
                        this.cameras.main.flash(200, 68, 255, 136, false);
                        
                        // Refresh scene to show updated state
                        this.scene.restart();
                    }
                });
            }
            
            this.upgradeCards.push({ card, buyBtn, btnText, upgrade });
        } else {
            // Maxed indicator
            this.add.text(x, y + 95, '✓ MAXED', {
                fontSize: '14px',
                fontFamily: 'Courier New',
                color: '#44ff88',
                fontStyle: 'bold',
            }).setOrigin(0.5);
        }
    }
}

// Detect initial orientation BEFORE creating the game
// This ensures the game starts with correct dimensions
(function setInitialOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const detectedOrientation = isLandscape ? 'landscape' : 'portrait';
    if (detectedOrientation !== currentOrientation) {
        setGameOrientation(detectedOrientation);
        console.log(`Initial orientation set to: ${detectedOrientation}`);
    }
})();

// Game Configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: COLORS.background,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [QuickBootScene, BootScene, LevelSelectScene, ShopScene, GameScene],
};

// Create game instance
const game = new Phaser.Game(config);

// Automatic Orientation Detection
(function setupOrientationDetection() {
    // Detect current orientation from screen dimensions
    function detectOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        return isLandscape ? 'landscape' : 'portrait';
    }
    
    // Handle orientation / resize change
    function handleOrientationChange() {
        const newOrientation = detectOrientation();

        // Recompute base dimensions from the new window size
        const dims = computeBaseDimensions();
        ORIENTATIONS.portrait.baseWidth = dims.portrait.baseWidth;
        ORIENTATIONS.portrait.baseHeight = dims.portrait.baseHeight;
        ORIENTATIONS.landscape.baseWidth = dims.landscape.baseWidth;
        ORIENTATIONS.landscape.baseHeight = dims.landscape.baseHeight;

        const orientationChanged = newOrientation !== currentOrientation;
        if (orientationChanged) {
            setGameOrientation(newOrientation);
        }

        // Resize the Phaser game canvas to match new dimensions
        game.scale.resize(GAME_CONFIG.width, GAME_CONFIG.height);
        game.scale.refresh();

        // Restart non-gameplay scenes to re-layout UI
        if (orientationChanged) {
            const currentScene = game.scene.getScenes(true)[0];
            if (currentScene) {
                const sceneKey = currentScene.scene.key;
                if (sceneKey !== 'GameScene') {
                    currentScene.scene.restart();
                }
            }
        }
    }
    
    // Listen for orientation changes using multiple methods for compatibility
    
    // Method 1: Media query listener (most reliable)
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addEventListener('change', handleOrientationChange);
    
    // Method 2: Resize event (backup, catches all size changes)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce to avoid multiple rapid calls
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleOrientationChange, 100);
    });
    
    // Method 3: Screen orientation API (for mobile devices)
    if (screen.orientation) {
        screen.orientation.addEventListener('change', handleOrientationChange);
    }
    
    console.log(`Orientation detection initialized. Current: ${currentOrientation}`);
})();

