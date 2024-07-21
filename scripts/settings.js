import { MODULE_ID } from "./const.js";

export function registerSettings() {
    game.settings.register(MODULE_ID, "enablePathfinding", {
        scope: "client",
        config: false,
        type: Boolean,
        default: false
    });
}