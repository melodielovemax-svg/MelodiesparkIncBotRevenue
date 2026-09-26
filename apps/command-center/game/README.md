# Path of Melodie — Phoenix Ascension

This directory contains the Godot 4 vertical slice for the game foundation. It
is intentionally separate from the existing Melodiespark command center.

## Run

Open `game/project.godot` with Godot 4.x, or run:

```powershell
godot --path .\game
```

The current slice is a procedural Act 01 test arena. It includes:

- an isometric 3D camera, dark-fantasy lighting, shadows, and procedural arena;
- a controllable Guardian (`WASD`/arrow keys);
- a basic attack (left click or `Space`) with hit detection and impact particles;
- an enemy that follows and attacks the player;
- enemy defeat and a glowing loot drop that is collected by walking over it;
- a minimal inventory counter and versioned local save at
  `user://path_of_melodie_save.json`.

The geometry is deliberately generated at runtime so the slice has no copied
third-party assets. Production models, animation scenes, navigation meshes,
audio, and authored VFX can be introduced behind these scene/script contracts.
