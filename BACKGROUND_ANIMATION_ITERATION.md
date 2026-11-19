# Background Animation Iteration

Added an animated underwater background layer without changing gameplay logic.

## Included
- Swaying seaweed / kelp
- Coral formations with subtle movement
- Rocks and shells on the seabed
- Slowly drifting jellyfish silhouettes in the distant background
- Depth-based opacity for simple parallax/depth feel
- Decorations are generated procedurally, so no external image assets are required
- Background is rendered behind fish, effects, and HUD

## Files
- `js/gameplay/BackgroundEnvironment.js` - new background scenery system
- `js/core/Game.js` - initializes, updates, regenerates and renders the scenery
