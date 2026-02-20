# Game Assets Guide

Place your custom sprites in the folders below. The game will automatically use them if found, otherwise it falls back to the built-in graphics.

## Folder Structure

```
assets/
├── images/
│   ├── ships/              # Player ship sprites
│   ├── enemies/            # Default enemy sprites (used when no level-specific sprite exists)
│   │   ├── level1/         # Level 1 enemy overrides (optional)
│   │   ├── level2/         # Level 2 enemy overrides (optional)
│   │   ├── level3/         # Level 3 enemy overrides (optional)
│   │   ├── level4/         # Level 4 enemy overrides (optional)
│   │   └── level5/         # Level 5 enemy overrides (optional)
│   ├── weapons/            # Projectile sprites
│   ├── effects/            # Particle/explosion sprites
│   ├── icons/              # Weapon icons for UI
│   ├── backgrounds/        # Level background landscapes
│   └── ui/                 # UI element sprites
└── videos/                 # Intro videos per level (MP4)
```

## Required Image Names

### Player Ship
- `ships/player.png` - Main player ship (static)
- `ships/player_sheet.png` - Animated player ship (sprite sheet)

### Enemies — Default (Static)
- `enemies/scout.png` - Basic enemy (small, saucer-like)
- `enemies/interceptor.png` - Fast enemy (sleek, arrow-shaped)
- `enemies/destroyer.png` - Tank enemy (large, heavy)
- `enemies/boss.png` - Boss enemy (very large, used on Level 3)

### Enemies — Default (Animated Sprite Sheets)
- `enemies/scout_sheet.png` - Animated scout (sprite sheet)
- `enemies/interceptor_sheet.png` - Animated interceptor (sprite sheet)
- `enemies/destroyer_sheet.png` - Animated destroyer (sprite sheet)
- `enemies/boss_sheet.png` - Animated boss (sprite sheet, 256px frames)

### Enemies — Per-Level Overrides (Optional)

You can give each level its own unique enemy sprites. Place them in `enemies/level{N}/` using the same filenames. Level-specific sprites take priority; if not found, the default above is used.

```
enemies/level1/scout.png           # Level 1 scout (static)
enemies/level1/scout_sheet.png     # Level 1 scout (animated)
enemies/level1/interceptor.png
enemies/level1/destroyer.png
enemies/level3/boss.png            # Level 3 boss (static)
enemies/level3/boss_sheet.png      # Level 3 boss (animated)
...
```

You only need to add the files you want to override — any missing per-level sprite will fall back to the default.

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
- `weapons/void.png` - Void zone effect (static)
- `weapons/void_sheet.png` - Animated void zone (sprite sheet, 128px frames)
- `weapons/spirit.png` - Spirit orb

### Effects
- `effects/explosion.png` - Enemy death explosion (static)
- `effects/explosion_sheet.png` - Animated explosion (sprite sheet, 128px frames, plays on any ship death)
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

### Intro Videos (MP4)
- `videos/level1_intro.mp4` - Outer Rim intro
- `videos/level2_intro.mp4` - Abandoned Colony intro
- `videos/level3_intro.mp4` - Nebula Core intro
- `videos/level4_intro.mp4` - Dark Sector intro
- `videos/level5_intro.mp4` - Hive World intro

Videos play fullscreen before the level starts. Tap or press ESC/Space to skip. If a video file is missing, the level loads immediately.

## Recommended Sizes

| Asset Type | Recommended Size | Notes |
|------------|-----------------|-------|
| Player Ship | 64-128 px | Facing UP |
| Enemies (static) | 32-64 px | Facing DOWN (toward player) |
| Boss (static) | 128-256 px | Large, centered |
| Enemies (sheet) | 384x256 px | 3 cols x 2 rows, 128px per frame |
| Boss (sheet) | 768x512 px | 3 cols x 2 rows, 256px per frame |
| Weapon Icons | 64x64 px | Square, displayed at 36-56px |
| Projectiles | 16-32 px | |
| Effects | 32-64 px | |
| XP Gems | 16-24 px | |
| Intro Videos | Any resolution | MP4 format, H.264 codec |
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

