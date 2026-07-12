/**
 * InteractionDetector - Checks which interactable objects are near the player.
 * Returns the nearest in-range object, or null.
 */
class InteractionDetector {
    constructor() {
        /** @type {InteractionObject[]} */
        this.objects = [];
    }

    /** Register interactable objects */
    setObjects(objects) {
        this.objects = objects;
    }

    /** Add a single object */
    addObject(obj) {
        this.objects.push(obj);
    }

    /** Clear all objects */
    clear() {
        this.objects = [];
    }

    /**
     * Find the nearest interactable object within range.
     * @param {number} playerX - Player world X
     * @param {number} playerY - Player world Y
     * @returns {InteractionObject|null}
     */
    findNearest(playerX, playerY) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const obj of this.objects) {
            if (!obj.canInteract()) continue;
            const dist = obj.distanceTo(playerX, playerY);
            if (dist <= obj.radius && dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }

        return nearest;
    }

    /**
     * Get all objects within range (for multi-interaction scenarios).
     * @param {number} playerX
     * @param {number} playerY
     * @returns {InteractionObject[]}
     */
    findAllInRange(playerX, playerY) {
        return this.objects.filter(obj => obj.canInteract() && obj.isInRange(playerX, playerY));
    }

    /** Show/hide debug for all objects */
    setDebugAll(visible) {
        this.objects.forEach(obj => {
            if (visible) obj.showDebug();
            else obj.hideDebug();
        });
    }
}
