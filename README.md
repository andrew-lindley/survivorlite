# Cosmic Survivor

A space-themed Vampire Survivors-style mobile game built with Phaser 3.

## Features

- **Spaceship Hero** with smooth movement (keyboard + touch joystick)
- **6 Weapons** with unique attack patterns:
  - 💚 **Ship Laser** - Base weapon, auto-fires at nearest enemy (starter)
  - 🔥 **Fireball** - Shoots homing projectiles at enemies
  - ⚡ **Lightning Aura** - Chain lightning that jumps between enemies
  - ❄️ **Frost Nova** - AOE burst that damages and slows enemies
  - 🌀 **Void Zone** - Creates damaging zones that linger on the ground
  - 👻 **Spirit Orbs** - Summons orbiting spirits that damage enemies
- **5 Tiers per weapon** - Each upgrade improves damage, cooldown, and special effects
- **5 Sectors (Levels)** - Progressive difficulty across different space environments
- **15 Waves per sector** - Survive to unlock the next sector
- **XP System** - Collect colored gems from defeated enemies to level up
- **Shop System** - Purchase permanent upgrades with collected gems
- **Orientation Toggle** - Play in landscape or portrait mode

## How to Play

### Controls
- **Desktop**: WASD or Arrow Keys to move, ESC to pause
- **Mobile**: Touch and drag anywhere to create a virtual joystick

### Gameplay
1. Select a sector from the level select screen
2. Survive waves of alien enemies
3. Collect XP gems from defeated enemies (color = value)
4. Level up to choose new weapons or upgrade existing ones
5. Survive all 15 waves to complete the sector and unlock the next
6. Spend collected gems in the shop for permanent upgrades

## Shop Upgrades

| Upgrade | Description | Max Level |
|---------|-------------|-----------|
| ⚡ Engine Boost | Increase ship speed | 5 |
| 🔫 Weapon Bay | Add weapon slot + XP boost | 2 |
| 🛡️ Shield Generator | Absorb hits at level start | 3 |
| 💥 Weapon System | +50% damage to all weapons | 1 |

## Running the Game

```bash
# Using npx serve (recommended)
npx serve .

# Or any static file server
python -m http.server 8000
```

Then open `http://localhost:3000` (or `8000`) in your browser.

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── js/
│   ├── constants.js    # Game configuration
│   ├── assets.js       # Asset loading system
│   ├── weapons.js      # Weapon system
│   ├── enemies.js      # Enemy AI and spawning
│   ├── hero.js         # Player spaceship
│   ├── ui.js           # UI components
│   └── game.js         # Main game loop & scenes
├── assets/
│   └── images/         # Custom sprite assets
│       ├── ships/      # Player ship sprites
│       ├── enemies/    # Enemy sprites
│       ├── weapons/    # Weapon effect sprites
│       ├── backgrounds/# Level backgrounds
│       └── icons/      # UI icons
└── README.md
```

## Weapons

| Weapon | Tier 1 | Tier 5 |
|--------|--------|--------|
| Ship Laser | 8 dmg, 0.8s CD (starter, not upgradeable) | - |
| Fireball | 10 dmg, 1.5s CD, 1 pierce | 45 dmg, 0.7s CD, 3 pierce |
| Lightning | 8 dmg, 1 chain | 35 dmg, 5 chains |
| Frost Nova | 15 dmg, 30% slow | 55 dmg, 60% slow |
| Void Zone | 5 dmg/tick, 3s duration | 20 dmg/tick, 5s duration |
| Spirit Orbs | 6 dmg, 2 orbs | 22 dmg, 6 orbs |

## Enemy Types

- **Scout Drone** (Wave 1+) - Basic alien, balanced stats
- **Interceptor** (Wave 3+) - Fast but fragile
- **Destroyer** (Wave 6+) - Slow but tanky

## Sectors

1. **Outer Rim** - The edge of known space
2. **Abandoned Colony** - Dangerous debris field
3. **Nebula Core** - Heart of the cosmic storm
4. **Dark Sector** - Where light fears to travel
5. **Hive World** - The alien homeworld

## Debug Menu

Click the ⚙ gear icon on the home screen to access debug options:
- **Invincibility** - Player cannot take damage
- **All Levels Unlocked** - Access all sectors without completing previous ones

## License

MIT
