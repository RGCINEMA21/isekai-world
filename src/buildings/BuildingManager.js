/**
 * BuildingManager - Renders buildings on the village map.
 * Each building has a unique visual design using placeholder graphics.
 * Buildings are NOT clickable - only NPCs are interactive.
 */
class BuildingManager {
    constructor(scene, villageMap) {
        this.scene = scene;
        this.map = villageMap;
        this.gfx = scene.add.graphics().setDepth(5);
    }

    drawBuildings() {
        const g = this.gfx;
        const T = this.map.T;
        const S = this.map.TILE;

        for (const b of this.map.buildings) {
            this._drawBuilding(g, b, S);
        }
    }

    _drawBuilding(g, b, S) {
        const px = b.tx * S;
        const py = b.ty * S;
        const bw = b.w * S;
        const bh = b.h * S;

        // Building-specific colors and features
        const config = this._getConfig(b.id);

        // Roof
        g.fillStyle(config.roofColor, 1);
        g.fillRoundedRect(px, py, bw, S, { tl: 4, tr: 4, bl: 0, br: 0 });
        g.lineStyle(1, config.roofDark, 0.5);
        g.strokeRoundedRect(px, py, bw, S, { tl: 4, tr: 4, bl: 0, br: 0 });

        // Roof ridge
        g.fillStyle(config.roofRidge, 0.6);
        g.fillRect(px + 4, py + 2, bw - 8, 3);

        // Walls
        for (let dy = 1; dy < b.h - 1; dy++) {
            for (let dx = 0; dx < b.w; dx++) {
                const wx = px + dx * S;
                const wy = py + dy * S;
                g.fillStyle(config.wallColor, 1);
                g.fillRect(wx, wy, S, S);
                // Wood grain
                g.lineStyle(1, config.wallDark, 0.2);
                g.lineBetween(wx, wy + 4, wx + S, wy + 4);
                g.lineBetween(wx, wy + 10, wx + S, wy + 10);
            }
        }

        // Door
        const dx = px + Math.floor(b.w / 2) * S;
        const dy = py + (b.h - 1) * S;
        g.fillStyle(config.doorColor, 1);
        g.fillRect(dx + 2, dy, S - 4, S);
        g.lineStyle(1, config.doorDark, 0.8);
        g.strokeRect(dx + 2, dy, S - 4, S);
        // Door handle
        g.fillStyle(0xccaa44, 1);
        g.fillCircle(dx + S - 5, dy + S / 2, 2);

        // Windows (if applicable)
        if (config.hasWindows) {
            this._drawWindows(g, px, py, bw, bh, S, config);
        }

        // Building-specific features
        if (config.customDraw) config.customDraw(g, px, py, bw, bh, S);
    }

    _drawWindows(g, px, py, bw, bh, S, config) {
        // Windows on second row
        if (bh > S * 2) {
            const wy = py + S + 3;
            const winW = 6;
            const winH = 7;
            // Left window
            g.fillStyle(config.windowColor, 0.8);
            g.fillRect(px + 5, wy, winW, winH);
            g.lineStyle(1, config.wallDark, 0.5);
            g.strokeRect(px + 5, wy, winW, winH);
            g.lineBetween(px + 5 + winW / 2, wy, px + 5 + winW / 2, wy + winH);
            // Right window
            g.fillStyle(config.windowColor, 0.8);
            g.fillRect(px + bw - 5 - winW, wy, winW, winH);
            g.lineStyle(1, config.wallDark, 0.5);
            g.strokeRect(px + bw - 5 - winW, wy, winW, winH);
            g.lineBetween(px + bw - 5 - winW / 2, wy, px + bw - 5 - winW / 2, wy + winH);
        }
    }

    _getConfig(id) {
        const configs = {
            rumah: {
                roofColor: 0xaa3322, roofDark: 0x882211, roofRidge: 0xcc4433,
                wallColor: 0x8b6b4a, wallDark: 0x6b4b2a,
                doorColor: 0x6b4b2a, doorDark: 0x4a2a0a,
                windowColor: 0x88bbee, hasWindows: true
            },
            gudang: {
                roofColor: 0x6b5b3a, roofDark: 0x4a3a1a, roofRidge: 0x8b7b5a,
                wallColor: 0x7a6a4a, wallDark: 0x5a4a2a,
                doorColor: 0x5a3a1a, doorDark: 0x3a2a0a,
                windowColor: 0x667788, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Crates outside
                    g.fillStyle(0x8b6b4a, 1);
                    g.fillRect(px - 8, py + bh - 14, 10, 12);
                    g.fillRect(px + bw - 2, py + bh - 14, 10, 12);
                    g.lineStyle(1, 0x6b4b2a, 0.6);
                    g.strokeRect(px - 8, py + bh - 14, 10, 12);
                    g.strokeRect(px + bw - 2, py + bh - 14, 10, 12);
                }
            },
            pertanian: {
                roofColor: 0x558833, roofDark: 0x336611, roofRidge: 0x66aa44,
                wallColor: 0x8b7b5a, wallDark: 0x6b5b3a,
                doorColor: 0x5a4a2a, doorDark: 0x3a2a0a,
                windowColor: 0x88bbee, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Fence around field
                    g.fillStyle(0x8b6b4a, 0.7);
                    g.fillRect(px - 6, py + bh - 2, bw + 12, 2);
                    g.fillRect(px - 6, py + bh, 2, 10);
                    g.fillRect(px + bw + 4, py + bh, 2, 10);
                    // Crop rows
                    for (let i = 0; i < 3; i++) {
                        g.fillStyle(0x448822, 0.6);
                        g.fillRect(px + 6 + i * 20, py + bh + 4, 14, 6);
                    }
                }
            },
            dapur: {
                roofColor: 0x995533, roofDark: 0x773311, roofRidge: 0xbb6644,
                wallColor: 0x8b6b4a, wallDark: 0x6b4b2a,
                doorColor: 0x6b4b2a, doorDark: 0x4a2a0a,
                windowColor: 0x88bbee, hasWindows: true,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Chimney
                    g.fillStyle(0x666666, 1);
                    g.fillRect(px + bw - 14, py - 12, 10, 16);
                    g.fillStyle(0x888888, 0.4);
                    g.fillRect(px + bw - 14, py - 14, 10, 3);
                    // Smoke (placeholder circles)
                    g.fillStyle(0xcccccc, 0.25);
                    g.fillCircle(px + bw - 9, py - 20, 5);
                    g.fillStyle(0xcccccc, 0.15);
                    g.fillCircle(px + bw - 7, py - 28, 6);
                }
            },
            blacksmith: {
                roofColor: 0x555555, roofDark: 0x333333, roofRidge: 0x777777,
                wallColor: 0x6b5b4a, wallDark: 0x4b3b2a,
                doorColor: 0x4a2a0a, doorDark: 0x2a1a0a,
                windowColor: 0xff8844, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Anvil
                    g.fillStyle(0x444444, 1);
                    g.fillRect(px + bw + 4, py + bh - 10, 8, 6);
                    g.fillRect(px + bw + 2, py + bh - 14, 12, 4);
                    // Forge fire
                    g.fillStyle(0xff4400, 0.6);
                    g.fillCircle(px - 6, py + bh - 6, 5);
                    g.fillStyle(0xffaa00, 0.4);
                    g.fillCircle(px - 6, py + bh - 8, 3);
                }
            },
            laboratorium: {
                roofColor: 0x445588, roofDark: 0x223366, roofRidge: 0x5566aa,
                wallColor: 0x7a7a8a, wallDark: 0x5a5a6a,
                doorColor: 0x4a4a5a, doorDark: 0x2a2a3a,
                windowColor: 0x88ffcc, hasWindows: true,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Potion bottles on shelf
                    g.fillStyle(0x44cc44, 0.7);
                    g.fillRect(px + 6, py + S + 6, 4, 8);
                    g.fillStyle(0xcc44cc, 0.7);
                    g.fillRect(px + 14, py + S + 6, 4, 8);
                    g.fillStyle(0x4444cc, 0.7);
                    g.fillRect(px + bw - 16, py + S + 6, 4, 8);
                    // Smoke from chimney
                    g.fillStyle(0x88ffcc, 0.2);
                    g.fillCircle(px + bw - 8, py - 10, 4);
                }
            },
            marketplace: {
                roofColor: 0xcc8822, roofDark: 0xaa6611, roofRidge: 0xddaa33,
                wallColor: 0xddccaa, wallDark: 0xbbaa88,
                doorColor: 0x8b6b4a, doorDark: 0x6b4b2a,
                windowColor: 0xffeecc, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Tent awning
                    g.fillStyle(0xcc4444, 0.6);
                    g.beginPath();
                    g.moveTo(px - 8, py + 2);
                    g.lineTo(px + bw / 2, py - 6);
                    g.lineTo(px + bw + 8, py + 2);
                    g.closePath();
                    g.fill();
                    // Goods display
                    g.fillStyle(0xaa8844, 0.7);
                    g.fillRect(px - 6, py + bh, 12, 8);
                    g.fillRect(px + bw - 6, py + bh, 12, 8);
                }
            },
            portal: {
                roofColor: 0x5533aa, roofDark: 0x331188, roofRidge: 0x7755cc,
                wallColor: 0x5a5a6a, wallDark: 0x3a3a4a,
                doorColor: 0x3a3a4a, doorDark: 0x1a1a2a,
                windowColor: 0x8844ff, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Portal glow
                    g.fillStyle(0x8844ff, 0.15);
                    g.fillCircle(px + bw / 2, py + bh + 10, 20);
                    g.fillStyle(0xaa66ff, 0.1);
                    g.fillCircle(px + bw / 2, py + bh + 10, 30);
                    // Stone arch
                    g.fillStyle(0x666677, 1);
                    g.fillRect(px + bw / 2 - 2, py - 4, 4, 8);
                    g.fillStyle(0x8844ff, 0.6);
                    g.fillCircle(px + bw / 2, py, 6);
                }
            },
            portal_quest: {
                roofColor: 0x336644, roofDark: 0x114422, roofRidge: 0x448855,
                wallColor: 0x5a5a6a, wallDark: 0x3a3a4a,
                doorColor: 0x3a3a4a, doorDark: 0x1a1a2a,
                windowColor: 0x88cc44, hasWindows: false,
                customDraw: (g, px, py, bw, bh, S) => {
                    // Quest board sign
                    g.fillStyle(0x8b6b4a, 1);
                    g.fillRect(px + bw / 2 - 2, py - 8, 4, 12);
                    g.fillRect(px + bw / 2 - 10, py - 12, 20, 8);
                    g.fillStyle(0xeeeedd, 0.8);
                    g.fillRect(px + bw / 2 - 8, py - 10, 16, 4);
                    // Scroll icon
                    g.fillStyle(0xddccaa, 0.6);
                    g.fillCircle(px + bw / 2, py + bh + 8, 8);
                }
            }
        };

        return configs[id] || configs.rumah;
    }
}
