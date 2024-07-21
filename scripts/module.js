import { MODULE_ID } from "./const.js";
import { registerSettings } from "./settings.js";
import { registerKeybindings } from "./keybindings.js";
import { wrapRuler } from "./ruler.js";

Hooks.once("init", () => {
    registerSettings();
    registerKeybindings();
});

Hooks.once("ready", () => {
    wrapRuler();
});

Hooks.on("getSceneControlButtons", function (controls) {
    if (!canvas.scene) return;
    
    const tokenControls = controls.find(c => c.name === "token");
    const rulerIndex = tokenControls.tools.findIndex(t => t.name === "ruler");

    tokenControls.tools.splice(rulerIndex + 1, 0, {
        name: "pathfinding",
        title: "pf2e-wayfinder.controls.pathfinding",
        icon: "fa-solid fa-route",
        toggle: true,
        active: game.settings.get(MODULE_ID, "enablePathfinding"),
        onClick: active => {
            game.settings.set(MODULE_ID, "enablePathfinding", active);
        }
    });
});