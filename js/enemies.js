// Enemy System
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.add.group();
        this.xpGems = scene.add.group();
    }

    buildAlienShip(type, config, container) {
        const parts = {};
        
        // Map enemy types to asset names
        const assetMap = {
            'basic': 'scout',
            'fast': 'interceptor', 
            'tank': 'destroyer'
        };
        
        // Map enemy types to animated spritesheet names
        const animatedAssetMap = {
            'basic': 'scoutAnimated',
            'fast': 'interceptorAnimated',
            'tank': 'destroyerAnimated'
        };
        
        // First check if animated sprite sheet is available
        const animatedSpriteKey = Assets.getAsset('spritesheets', animatedAssetMap[type]);
        
        if (animatedSpriteKey) {
            // Use animated sprite sheet
            parts.sprite = this.scene.add.sprite(0, 0, animatedSpriteKey);
            
            // Get frame size from config for proper scaling
            const frameSize = ASSET_CONFIG.spritesheets[animatedAssetMap[type]].frameWidth;
            parts.sprite.setScale(config.size / (frameSize / 4));  // Doubled size
            
            // Create animation if it doesn't exist yet (2 rows x 3 cols = 6 frames)
            const animKey = `${assetMap[type]}_fly`;
            if (!this.scene.anims.exists(animKey)) {
                this.scene.anims.create({
                    key: animKey,
                    frames: this.scene.anims.generateFrameNumbers(animatedSpriteKey, { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1  // Loop forever
                });
            }
            
            // Play the animation
            parts.sprite.play(animKey);
            
            parts.glow = this.scene.add.circle(0, 0, config.size * 0.8, config.glowColor, 0.3);
            parts.engineLight = this.scene.add.circle(0, config.size * 0.5, config.size * 0.3, config.eyeColor, 0.7);
            parts.body = parts.sprite; // Reference sprite as body for compatibility
            container.add([parts.glow, parts.sprite, parts.engineLight]);
            return parts;
        }
        
        // Fall back to static sprite if available
        const spriteKey = Assets.getAsset('enemies', assetMap[type]);
        
        if (spriteKey) {
            // Use sprite-based enemy
            parts.sprite = this.scene.add.sprite(0, 0, spriteKey);
            parts.sprite.setScale(config.size / 16); // Adjust scale based on sprite size
            parts.glow = this.scene.add.circle(0, 0, config.size * 0.8, config.glowColor, 0.3);
            parts.engineLight = this.scene.add.circle(0, config.size * 0.5, config.size * 0.3, config.eyeColor, 0.7);
            parts.body = parts.sprite; // Reference sprite as body for compatibility
            container.add([parts.glow, parts.sprite, parts.engineLight]);
            return parts;
        }
        
        // No sprite available - show placeholder
        console.warn(`No enemy sprite found for type: ${type}. Add assets/images/enemies/${assetMap[type]}.png`);
        
        // Simple placeholder so game can still run
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

        // Create enemy container for layered graphics
        const container = this.scene.add.container(x, y);
        
        // Build alien ship based on type
        const shipParts = this.buildAlienShip(type, config, container);
        
        // Store references for animations
        container.glow = shipParts.glow;
        container.body = shipParts.body;
        container.engineLight = shipParts.engineLight;
        
        // Create invisible physics body
        const enemy = this.scene.add.circle(x, y, config.size, 0x000000, 0);
        this.scene.physics.add.existing(enemy);
        enemy.body.setCircle(config.size);

        // Enemy properties - apply both wave and level multipliers
        enemy.id = Date.now() + Math.random(); // Unique ID for tracking
        enemy.container = container;
        enemy.radius = config.size;
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
        
        // Play death sound
        Assets.playSound('enemyDeath', { volume: 0.3, rate: 0.8 + Math.random() * 0.4 });
        
        // Spawn XP gem
        this.spawnXPGem(x, y, enemy.xpValue);
        
        // Death burst effect - outer ring
        const ring = this.scene.add.circle(x, y, enemy.radius, 0x000000, 0);
        ring.setStrokeStyle(3, config.color, 1);
        this.scene.tweens.add({
            targets: ring,
            scale: 3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });
        
        // Death particles
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
                alpha: 0,
                scale: 0,
                duration: 350,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Inner glow burst
        const glow = this.scene.add.circle(x, y, enemy.radius * 0.5, config.glowColor, 0.8);
        this.scene.tweens.add({
            targets: glow,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => glow.destroy()
        });

        // Destroy container and health bar
        if (enemy.container) {
            enemy.container.destroy();
        }
        enemy.healthBar.destroy();
        enemy.destroy();
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

            // Move toward hero
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y,
                hero.x, hero.y
            );
            
            enemy.body.setVelocity(
                Math.cos(angle) * enemy.speed,
                Math.sin(angle) * enemy.speed
            );
            
            // Sync container position and rotation
            if (enemy.container) {
                enemy.container.x = enemy.x;
                enemy.container.y = enemy.y;
                
                // Rotate ship to face movement direction (toward hero)
                enemy.container.rotation = angle + Math.PI / 2;
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

    getRandomEnemyType(wave) {
        // Unlock enemy types based on wave
        const available = ['basic'];
        if (wave >= 3) available.push('fast');
        if (wave >= 6) available.push('tank');
        
        return available[Math.floor(Math.random() * available.length)];
    }

    clearAll() {
        // Destroy enemy containers first
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

