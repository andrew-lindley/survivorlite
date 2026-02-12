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
        this.rotation = -Math.PI / 2; // Point up by default
        
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
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * XP_CONFIG.xpMultiplier);

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
