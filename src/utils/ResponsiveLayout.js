/**
 * ResponsiveLayout — single source of truth for all responsive sizing.
 *
 * Usage:
 *   const rl = new ResponsiveLayout(scene);
 *   rl.fontSize(14);          // scaled font size
 *   rl.buttonSize();          // good button diameter
 *   rl.panelPadding();        // padding
 *   rl.iconSize();            // emoji / icon size
 *   rl.isPortrait;            // current orientation
 *   rl.w, rl.h;               // current camera width/height
 *   rl.smaller;               // Math.min(w, h)
 */
class ResponsiveLayout {
    constructor(scene) {
        this.scene = scene;
        this.recalculate();
    }

    /** Recalculate cached dimensions. Call on every resize. */
    recalculate() {
        this.w = this.scene.cameras.main.width;
        this.h = this.scene.cameras.main.height;
        this.isPortrait = this.h > this.w;
        this.smaller = Math.min(this.w, this.h);
        this.larger = Math.max(this.w, this.h);
        this.aspect = this.w / this.h; // width / height
    }

    // ── Font sizes ───────────────────────────────────
    /** General-purpose font size (for body text, stats, etc.) */
    fontSize(base) {
        return Math.max(9, Math.round(base * this.smaller / 700));
    }

    /** Title font size */
    titleSize(base) {
        return Math.max(16, Math.round(base * this.smaller / 600));
    }

    /** Small label font */
    labelSize(base) {
        return Math.max(8, Math.round(base * this.smaller / 750));
    }

    // ── Buttons ──────────────────────────────────────
    /** Ideal button diameter for touch targets */
    buttonDiameter() {
        return Math.max(42, Math.min(70, Math.round(this.smaller * 0.09)));
    }

    /** Touch-safe hit area size (wider than visual) */
    hitAreaSize(diameter) {
        return diameter + 24;
    }

    // ── Panels / Cards ──────────────────────────────
    /** Panel width as fraction of screen */
    panelWidth(fraction) {
        return Math.round(this.w * (fraction || 0.9));
    }

    /** Panel height as fraction of screen */
    panelHeight(fraction) {
        return Math.round(this.h * (fraction || 0.85));
    }

    /** Card slot height for lists */
    cardHeight() {
        return Math.max(50, Math.min(85, Math.round(this.smaller * 0.1)));
    }

    // ── Spacing ─────────────────────────────────────
    /** General padding / gap */
    pad() {
        return Math.max(8, Math.round(this.smaller * 0.02));
    }

    /** Line height for stat rows */
    lineHeight() {
        return Math.max(12, Math.round(this.smaller * 0.02));
    }

    // ── Icons ───────────────────────────────────────
    /** Emoji / icon size */
    iconSize() {
        return Math.max(14, Math.min(32, Math.round(this.smaller * 0.04)));
    }

    // ── Joystick ────────────────────────────────────
    joystickRadius() {
        return Math.max(36, Math.min(68, Math.round(this.smaller * 0.09)));
    }

    stickRadius() {
        return Math.round(this.joystickRadius() * 0.42);
    }

    // ── Positioning helpers ─────────────────────────
    /** Right-side button X (with padding) */
    rightButtonX() {
        return this.w - this.buttonDiameter() / 2 - this.pad();
    }

    /** Bottom button Y */
    bottomButtonY(offset) {
        return this.h - this.buttonDiameter() / 2 - this.pad() - (offset || 0);
    }

    /** Top-left panel corner */
    topLeft() {
        return { x: this.pad(), y: this.pad() };
    }

    /** Center of screen */
    center() {
        return { x: this.w / 2, y: this.h / 2 };
    }
}
