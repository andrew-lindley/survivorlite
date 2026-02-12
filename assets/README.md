# Game Assets Guide

Place your custom sprites in the folders below. The game will automatically use them if found, otherwise it falls back to the built-in graphics.

## Folder Structure

```
assets/images/
├── ships/          # Player ship sprites
├── enemies/        # Enemy sprites  
├── weapons/        # Projectile sprites
├── effects/        # Particle/explosion sprites
├── icons/          # Weapon icons for UI
├── backgrounds/    # Level background landscapes
└── ui/             # UI element sprites
```

## Required Image Names

### Player Ship
- `ships/player.png` - Main player ship (static)
- `ships/player_sheet.png` - Animated player ship (sprite sheet)

### Enemies (Static)
- `enemies/scout.png` - Basic enemy (small, saucer-like)
- `enemies/interceptor.png` - Fast enemy (sleek, arrow-shaped)
- `enemies/destroyer.png` - Tank enemy (large, heavy)

### Enemies (Animated Sprite Sheets)
- `enemies/scout_sheet.png` - Animated scout (sprite sheet)
- `enemies/interceptor_sheet.png` - Animated interceptor (sprite sheet)
- `enemies/destroyer_sheet.png` - Animated destroyer (sprite sheet)

**Sprite Sheet Format:** 2 rows x 3 columns (6 frames total)
```
[Frame 0][Frame 1][Frame 2]
[Frame 3][Frame 4][Frame 5]
```
Animation cycles: Row 1 (0→1→2) then Row 2 (3→4→5)

### Weapon Icons (UI Display)
- `icons/fireball.png` - Fireball weapon icon
- `icons/lightning.png` - Lightning Aura weapon icon
- `icons/frostnova.png` - Frost Nova weapon icon
- `icons/voidzone.png` - Void Zone weapon icon
- `icons/spiritorbs.png` - Spirit Orbs weapon icon

### Weapons/Projectiles
- `weapons/fireball.png` - Fireball projectile
- `weapons/frost.png` - Frost nova effect
- `weapons/lightning.png` - Lightning chain effect
- `weapons/void.png` - Void zone effect
- `weapons/spirit.png` - Spirit orb

### Effects
- `effects/explosion.png` - Enemy death explosion
- `effects/xp_gem.png` - XP gem pickup
- `effects/hit.png` - Damage hit effect

### Level Backgrounds
- `backgrounds/level1.png` - Outer Rim background
- `backgrounds/level2.png` - Asteroid Belt background
- `backgrounds/level3.png` - Nebula Core background
- `backgrounds/level4.png` - Dark Sector background
- `backgrounds/level5.png` - Hive World background

### UI
- `ui/health_bar.png` - Health bar sprite
- `ui/button.png` - Button background

## Recommended Sizes

| Asset Type | Recommended Size | Notes |
|------------|-----------------|-------|
| Player Ship | 64-128 px | Facing UP |
| Enemies (static) | 32-64 px | Facing DOWN (toward player) |
| Enemies (sheet) | 384x256 px | 3 cols x 2 rows, 128px per frame |
| Weapon Icons | 64x64 px | Square, displayed at 36-56px |
| Projectiles | 16-32 px | |
| Effects | 32-64 px | |
| XP Gems | 16-24 px | |
| Backgrounds | 512-1024 px | Will be tiled/repeated |

## Tips

1. **Transparent backgrounds**: Use PNG format with transparency
2. **Orientation**: Ships should face UP by default (the game rotates them)
3. **Consistent style**: Keep all sprites in a similar art style
4. **Icons**: Use clear, recognizable symbols for weapon icons

## Free Asset Sources

- **Kenney.nl** - https://kenney.nl/assets (CC0, high quality)
- **OpenGameArt** - https://opengameart.org (various licenses)
- **itch.io** - https://itch.io/game-assets/free/tag-sprites

## Testing

After adding sprites:
1. Refresh the game in your browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Open browser console (F12) to see which assets loaded
3. Missing assets will show "Asset not found (using fallback)" messages

