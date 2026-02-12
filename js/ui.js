// UI System
class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.ps = GAME_CONFIG.pixelScale; // Pixel scale for UI
        this.isPortrait = currentOrientation === 'portrait';
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
        const y = 10;
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
        const y = this.isPortrait ? 32 : 55;
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
        const y = 10;

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
        const y = this.isPortrait ? 75 : 90;
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

