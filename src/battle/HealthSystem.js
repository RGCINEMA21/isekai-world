/**
 * HealthSystem - Mengelola HP Player dan Monster.
 * Menangani perubahan HP, cek hidup/matikan, dan reset.
 */
class HealthSystem {
    /**
     * @param {number} maxHp - HP maksimum
     * @param {number} currentHp - HP saat ini (opsional, default = maxHp)
     */
    constructor(maxHp, currentHp) {
        this.maxHp = maxHp;
        this.currentHp = currentHp !== undefined ? currentHp : maxHp;
        this.isDead = false;
        this.onDamage = null;   // callback(damage, currentHp, maxHp)
        this.onHeal = null;     // callback(amount, currentHp, maxHp)
        this.onDeath = null;    // callback()
    }

    /** Terima damage, kurangi HP */
    takeDamage(amount) {
        if (this.isDead || amount <= 0) return 0;
        const actualDamage = Math.min(amount, this.currentHp);
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
        if (this.onDamage) this.onDamage(actualDamage, this.currentHp, this.maxHp);
        if (this.currentHp <= 0) {
            this.isDead = true;
            if (this.onDeath) this.onDeath();
        }
        return actualDamage;
    }

    /** Heal HP */
    heal(amount) {
        if (this.isDead) return 0;
        const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
        this.currentHp = Math.min(this.maxHp, this.currentHp + actualHeal);
        if (this.onHeal) this.onHeal(actualHeal, this.currentHp, this.maxHp);
        return actualHeal;
    }

    /** Reset HP ke maksimum */
    reset() {
        this.currentHp = this.maxHp;
        this.isDead = false;
    }

    /** Dapatkan persentase HP (0-1) */
    getHpPercent() {
        return this.maxHp > 0 ? this.currentHp / this.maxHp : 0;
    }

    /** Cek apakah masih hidup */
    isAlive() {
        return !this.isDead && this.currentHp > 0;
    }

    /** Dapatkan info untuk UI */
    getInfo() {
        return {
            current: this.currentHp,
            max: this.maxHp,
            percent: this.getHpPercent(),
            isDead: this.isDead
        };
    }
}
