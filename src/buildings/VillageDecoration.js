/**
 * VillageDecoration - Renders all map tiles and environmental decorations.
 * Handles: grass, paths, water, trees, flowers, rocks, lamps, fountain, etc.
 * Responsive: tiles adapt to screen.
 */
class VillageDecoration {
    constructor(scene, villageMap) {
        this.scene = scene;
        this.map = villageMap;
        this.gfx = scene.add.graphics().setDepth(0);
        this.animTime = 0;
        this.animGfx = null; // For animated elements (water, fountain)
    }

    drawMap() {
        const g = this.gfx;
        const T = this.map.T;
        const S = this.map.TILE;
        const grid = this.map.grid;

        for (let y = 0; y < this.map.MAP_H; y++) {
            for (let x = 0; x < this.map.MAP_W; x++) {
                const px = x * S;
                const py = y * S;
                const tile = grid[y][x];

                switch (tile) {
                    case T.GRASS:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        if (Math.random() < 0.12) {
                            g.fillStyle(0x4a8a2a, 0.5);
                            g.fillRect(px + 2, py + 4, 2, 5);
                        }
                        break;

                    case T.PATH:
                        g.fillStyle(0xc4a86a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xb8985a, 0.3);
                        g.fillRect(px + 3, py + 2, 4, 3);
                        g.fillRect(px + 8, py + 9, 3, 4);
                        break;

                    case T.WATER:
                        g.fillStyle(0x3388cc, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x44aaee, 0.3);
                        g.fillRect(px + 2, py + 3, 6, 2);
                        break;

                    case T.BRIDGE:
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py, S, S);
                        g.lineStyle(1, 0x6b4b2a, 0.5);
                        g.lineBetween(px, py, px + S, py);
                        g.lineBetween(px, py + S - 1, px + S, py + S - 1);
                        g.lineBetween(px + S / 2, py, px + S / 2, py + S);
                        break;

                    case T.TREE:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1);
                        g.fillRect(px + 6, py + 10, 4, 6);
                        g.fillStyle(0x2d7a1e, 1);
                        g.fillCircle(px + 8, py + 7, 7);
                        g.fillStyle(0x3a9a2a, 0.5);
                        g.fillCircle(px + 7, py + 5, 5);
                        break;

                    case T.TREE_SM:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x5a3a1a, 1);
                        g.fillRect(px + 7, py + 10, 2, 6);
                        g.fillStyle(0x3a8a2a, 1);
                        g.fillCircle(px + 8, py + 8, 5);
                        break;

                    case T.ROCK:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x888888, 1);
                        g.fillCircle(px + 8, py + 9, 6);
                        g.fillStyle(0x999999, 0.6);
                        g.fillCircle(px + 7, py + 8, 4);
                        break;

                    case T.WALL:
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py, S, S);
                        g.lineStyle(1, 0x6b4b2a, 0.4);
                        g.strokeRect(px, py, S, S);
                        break;

                    case T.ROOF:
                        g.fillStyle(0xaa3322, 1);
                        g.fillRect(px, py, S, S);
                        g.lineStyle(1, 0x882211, 0.3);
                        g.lineBetween(px, py + 8, px + S, py + 8);
                        break;

                    case T.DOOR:
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x6b4b2a, 1);
                        g.fillRect(px + 3, py, 10, S);
                        g.fillStyle(0xccaa44, 1);
                        g.fillCircle(px + 11, py + 8, 1.5);
                        break;

                    case T.FENCE:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px, py + 4, S, 3);
                        g.fillRect(px + 3, py + 2, 2, 8);
                        g.fillRect(px + 11, py + 2, 2, 8);
                        break;

                    case T.FLOWERS:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xff6688, 1);
                        g.fillCircle(px + 5, py + 8, 2);
                        g.fillStyle(0xffcc44, 1);
                        g.fillCircle(px + 11, py + 6, 2);
                        g.fillStyle(0xff88cc, 0.6);
                        g.fillCircle(px + 8, py + 12, 2);
                        break;

                    case T.FOUNTAIN:
                        g.fillStyle(0x999999, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xaaaaaa, 0.5);
                        g.fillCircle(px + 8, py + 8, 6);
                        g.fillStyle(0x44aaee, 0.6);
                        g.fillCircle(px + 8, py + 8, 4);
                        break;

                    case T.LAMP:
                        g.fillStyle(0xc4a86a, 1);
                        g.fillRect(px, py, S, S);
                        // Lamp post
                        g.fillStyle(0x666666, 1);
                        g.fillRect(px + 7, py + 4, 2, 10);
                        // Lamp head
                        g.fillStyle(0xffdd66, 0.9);
                        g.fillCircle(px + 8, py + 3, 3);
                        g.fillStyle(0xffee88, 0.3);
                        g.fillCircle(px + 8, py + 3, 6);
                        break;

                    case T.BENCH:
                        g.fillStyle(0xc4a86a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x8b6b4a, 1);
                        g.fillRect(px + 2, py + 6, 12, 4);
                        g.fillRect(px + 2, py + 4, 12, 2);
                        g.fillRect(px + 3, py + 10, 2, 4);
                        g.fillRect(px + 11, py + 10, 2, 4);
                        break;

                    case T.POT:
                        g.fillStyle(0xc4a86a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0xaa5533, 1);
                        g.fillRect(px + 4, py + 8, 8, 6);
                        g.fillStyle(0x44aa44, 0.8);
                        g.fillCircle(px + 8, py + 6, 4);
                        g.fillStyle(0xff6688, 0.7);
                        g.fillCircle(px + 8, py + 4, 2);
                        break;

                    case T.SHRUB:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                        g.fillStyle(0x3a7a2a, 1);
                        g.fillEllipse(px + 8, py + 10, 12, 8);
                        g.fillStyle(0x4a8a3a, 0.5);
                        g.fillEllipse(px + 6, py + 9, 8, 6);
                        break;

                    default:
                        g.fillStyle(0x5a9a3a, 1);
                        g.fillRect(px, py, S, S);
                }
            }
        }
    }

    createAnimatedLayer() {
        this.animGfx = this.scene.add.graphics().setDepth(1);
    }

    updateAnimations(delta) {
        if (!this.animGfx) return;
        this.animTime += delta;

        this.animGfx.clear();

        // Animated water shimmer
        const T = this.map.T;
        const S = this.map.TILE;
        const wave = Math.sin(this.animTime * 0.003);

        for (let y = 0; y < this.map.MAP_H; y++) {
            for (let x = 0; x < this.map.MAP_W; x++) {
                if (this.map.grid[y][x] === T.WATER) {
                    const px = x * S;
                    const py = y * S;
                    const shimmer = Math.sin((x + y) * 0.8 + this.animTime * 0.004) * 0.3 + 0.3;
                    this.animGfx.fillStyle(0x66ccff, shimmer * 0.4);
                    this.animGfx.fillRect(px + 2, py + 4 + wave * 2, 4, 2);
                }
            }
        }

        // Fountain sparkle at center
        const fountainX = 48 * S + S / 2;
        const fountainY = 48 * S + S / 2;
        for (let i = 0; i < 3; i++) {
            const angle = (this.animTime * 0.003 + i * 2.09) % (Math.PI * 2);
            const r = 6 + Math.sin(this.animTime * 0.005 + i) * 2;
            const sx = fountainX + Math.cos(angle) * r;
            const sy = fountainY + Math.sin(angle) * r - 3;
            this.animGfx.fillStyle(0x88ddff, 0.5);
            this.animGfx.fillCircle(sx, sy, 1.5);
        }
    }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        if (this.animGfx) this.animGfx.destroy();
    }
}
