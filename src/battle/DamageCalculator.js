/**
 * DamageCalculator - Menghitung damage antara Player dan Monster.
 * Rumus sederhana: damage = attacker_damage - defender_defense / 2.
 * Minimal damage = 1 (selalu ada damage).
 */
class DamageCalculator {
    /**
     * Hitung damage dari attacker ke defender
     * @param {number} attackerDamage - Damage attacker
     * @param {number} defenderDefense - Defense defender (0 untuk monster saat ini)
     * @returns {number} Damage yang diberikan
     */
    static calculate(attackerDamage, defenderDefense = 0) {
        const raw = Math.max(1, attackerDamage - Math.floor(defenderDefense / 2));
        // Variasi kecil +/- 10%
        const variation = 1 + (Math.random() * 0.2 - 0.1);
        return Math.max(1, Math.floor(raw * variation));
    }

    /**
     * Hitung damage player ke monster
     * @param {Object} playerStats - Stats player { attack, defense }
     * @param {Object} monsterStats - Stats monster { damage, defense? }
     * @returns {number}
     */
    static playerToMonster(playerStats, monsterStats) {
        return this.calculate(playerStats.attack || 10, 0);
    }

    /**
     * Hitung damage monster ke player
     * @param {Object} monsterStats - Stats monster { damage }
     * @param {Object} playerStats - Stats player { defense }
     * @returns {number}
     */
    static monsterToPlayer(monsterStats, playerStats) {
        return this.calculate(monsterStats.damage || 5, playerStats.defense || 0);
    }
}
