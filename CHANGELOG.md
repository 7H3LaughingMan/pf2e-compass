# 6.1.0

- Adds support for Token Vision & Fog Exploration.
  - If Token Vision is enabled for a scene it will not find a path going through squares that are not visible.
  - If Fog Exploration is enabled for a scene it will not find a path going through squares that haven't been explored.
  - If both are enabled then it will not find a path going through squares that are not visible and haven't been explored.

# 6.0.0

Initial Release! This is the successor to PF2e Token Drag Ruler and adds pathfinding capabilities to the token drag measurement tool added to the PF2e System.

- Uses a custom Rust WebAssembly that runs the A* Pathfinding Algorithm, provides faster results in milliseconds compared to trying to run the same algorithm via JavaScript.
- If a path can't be found it will default back to acting like it's not enabled.
- Only supports square grids properly at the moment, the built in token drag measurement tool does not support hexagonal grids at the moment.
- Collision detection works by getting the shape of the token and reducing it by 40% of the grid's size.
  - For example on a 100 grid size map a medium creature would be 100 x 100, this is then reduced by 40 pixels on each side down to a 20 x 20 square. While a large creature starts with a 200 x 200 square and is reduced down to a 120 x 120 square.
- This module does not account for "squeezing", you will have to manually adjust the token's size using effects in order to have a large creature navigate tighter paths.