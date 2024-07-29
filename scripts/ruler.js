import { MODULE_ID } from "./const.js";
import { Wayfinder } from "../wasm/pf2e-astar.js"

export function wrapRuler() {
    libWrapper.register(MODULE_ID, "CONFIG.Canvas.rulerClass.prototype._startMeasurement", function (wrapped, origin, { snap = true, token } = {}) {
        if (this.state !== Ruler.STATES.INACTIVE) return;

        this.wayfinder = new Wayfinder(token);

        if (canvas.scene.tokenVision) {
            let vision_pixels = canvas.app.renderer.extract.pixels(canvas.visibility.vision);
            let vision_bounds = canvas.visibility.vision.getLocalBounds();

            if (vision_bounds.width !== 0 && vision_bounds.height !== 0) {
                this.wayfinder.addVision(vision_pixels, vision_bounds);
            }
        }

        if (canvas.scene.fog.exploration) {
            let explored_pixels = canvas.app.renderer.extract.pixels(canvas.visibility.explored);
            let explored_bounds = canvas.visibility.explored.getLocalBounds();

            if (explored_bounds.width !== 0 && explored_bounds.height !== 0) {
                this.wayfinder.addVision(explored_pixels, explored_bounds);
            }
        }

        wrapped(origin, { snap, token });
    });

    libWrapper.register(MODULE_ID, "CONFIG.Canvas.rulerClass.prototype._endMeasurement", function (wrapped) {
        if (this.state !== Ruler.STATES.MEASURING) return;

        this.wayfinder = null;
        wrapped();
    });

    libWrapper.register(MODULE_ID, "CONFIG.Canvas.rulerClass.prototype._getMeasurementDestination", function (wrapped, point, { snap = true } = {}) {
        let destination = wrapped(point, { snap });

        if (this.token && this.wayfinder && game.settings.get(MODULE_ID, "enablePathfinding")) {
            let path = this.wayfinder.findPath(this.waypoints[this.waypoints.length - 1], destination);
            if (path && path.length > 1) {
                destination.path = path;
            }
        }

        return destination;
    });

    libWrapper.register(MODULE_ID, "CONFIG.Canvas.rulerClass.prototype._getMeasurementSegments", function (wrapped) {
        const segments = [];
        const path = [];

        for (let element of this.history) {
            if (Object.hasOwn(element, "path")) {
                if (path.length == 0) {
                    path.push(...element.path);
                } else {
                    const pathAddition = element.path.slice(1);
                    path.push(...pathAddition);
                }
            } else {
                path.push(element);
            }
        }

        for (let element of this.waypoints) {
            if (Object.hasOwn(element, "path")) {
                if (path.length == 0) {
                    path.push(...element.path);
                } else {
                    const pathAddition = element.path.slice(1);
                    path.push(...pathAddition);
                }
            } else {
                path.push(element);
            }
        }

        if (Object.hasOwn(this.destination, "path")) {
            const pathAddition = this.destination.path.slice(1);
            path.push(...pathAddition);
        } else {
            path.push(this.destination);
        }

        for (let i = 1; i < path.length; i++) {
            const label = this.labels.children.at(i - 1) ?? this.labels.addChild(new PreciseText("", CONFIG.canvasTextStyle));
            const history = i < this.history.length;
            const first = i === this.history.length;
            const ray = new Ray(path[i - 1], path[i]);
            segments.push({
                ray,
                teleport: history ? path[i].teleport : first && (i > 0) && (ray.distance > 0),
                label,
                distance: 0,
                cost: 0,
                cumulativeDistance: 0,
                cumulativeCost: 0,
                history,
                first,
                last: i === path.length - 1,
                animation: {}
            });
        }

        if (this.labels.children.length > segments.length) {
            this.labels.removeChildren(segments.length).forEach(c => c.destroy());
        }

        return segments;
    });
}