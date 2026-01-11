export const CONFIG = {
    // --- DISPLAY SETTINGS ---
    TILE_SIZE: 64,          // 64x64 pixels per grid cell
    VIEW_WIDTH: 1024,       // Canvas Width
    VIEW_HEIGHT: 768,       // Canvas Height
    RENDER_SCALE: 1.0,      // Future proofing for zoom levels

    // --- WORLD SETTINGS ---
    // This defines the "Active Area" around the player
    // Since the world is "Endless", we handle chunks later, 
    // but this is the max loaded grid size.
    MAP_COLS: 50, 
    MAP_ROWS: 50,

    // --- FILE PATHS ---
    ASSET_PATH: './assets/',
    DATA_PATH: './data/',

    // --- GAMEPLAY CONSTANTS ---
    TICK_RATE: 100,         // Logic updates every 100ms
    STARTING_HP: 100,
    STARTING_X: 25,         // Middle of our 50x50 grid
    STARTING_Y: 25,

    // --- DEBUG FLAGS ---
    // Set these to false when releasing the game
    DEBUG_DRAW_GRID: true,      // Draw white lines around tiles
    DEBUG_SHOW_COORDS: false,   // Show X,Y text on every tile
    DEBUG_NO_CLIP: false        // Walk through walls
};