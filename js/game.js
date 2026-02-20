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
        this.waveStartTime = this.time.now;
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

        // Show first wave
        this.ui.showWaveAnnouncement(1);
        Assets.playSound('waveStart', { volume: 0.6 });

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

// Boot Scene - Loading
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load all game assets
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
        
        // Background panel - increased height for new option
        const panelWidth = 280;
        const panelHeight = 280;
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x0a0a1a, 0.95);
        panel.setStrokeStyle(2, 0xff8800, 0.8);
        
        // Title
        const title = this.add.text(0, -115, '🛠 DEBUG MENU', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#ff8800',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Warning text
        const warning = this.add.text(0, -90, 'For testing only', {
            fontSize: '10px',
            fontFamily: 'Courier New',
            color: '#886644',
        }).setOrigin(0.5);
        
        // Debug options
        const optionStartY = -55;
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
        
        // Close button
        const closeBtn = this.add.rectangle(0, 115, 100, 35, 0x333344);
        closeBtn.setStrokeStyle(2, 0xffffff, 0.6);
        closeBtn.setInteractive({ useHandCursor: true });
        
        const closeText = this.add.text(0, 115, 'CLOSE', {
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
    scene: [BootScene, LevelSelectScene, ShopScene, GameScene],
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
    
    // Handle orientation change
    function handleOrientationChange() {
        const newOrientation = detectOrientation();
        
        // Only update if orientation actually changed
        if (newOrientation !== currentOrientation) {
            console.log(`Orientation changed: ${currentOrientation} → ${newOrientation}`);
            
            // Update the global orientation
            setGameOrientation(newOrientation);
            
            // Resize the Phaser game canvas
            game.scale.resize(GAME_CONFIG.width, GAME_CONFIG.height);
            
            // Refresh the scale manager to recalculate positioning
            game.scale.refresh();
            
            // Restart the current scene to re-layout UI properly
            const currentScene = game.scene.getScenes(true)[0];
            if (currentScene) {
                const sceneKey = currentScene.scene.key;
                // Don't restart GameScene during active gameplay to avoid losing progress
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

