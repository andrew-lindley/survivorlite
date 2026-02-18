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

