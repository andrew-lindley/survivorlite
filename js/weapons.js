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

