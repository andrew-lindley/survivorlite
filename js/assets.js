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

