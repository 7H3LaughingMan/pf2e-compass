import { MODULE_ID } from "./const.js";

export function wrapRuler() {
    libWrapper.register(MODULE_ID, "CONFIG.Canvas.rulerClass.prototype.measure", measure, "MIXED");
}

function measure(wrapped, destination, { snap = true, force = false } = {}) {
    if (!this.dragMeasurement || !snap) {
        return wrapped(destination, { snap, force });
    }

    if ( this.state !== Ruler.STATES.MEASURING ) return;

    // Compute the measurement destination, segments, and distance
    const d = this._getMeasurementDestination(destination, {snap});
    if ( this.destination && (d.x === this.destination.x) && (d.y === this.destination.y) && !force ) return;
    this.destination = d;
    this.segments = this._getMeasurementSegments();
    this._computeDistance();
    this._broadcastMeasurement();

    // Draw the ruler graphic
    this.ruler.clear();
    this._drawMeasuredPath();

    // Draw grid highlight
    this.highlightLayer.clear();
    for ( const segment of this.segments ) this._highlightMeasurementSegment(segment);
    return this.segments;
}