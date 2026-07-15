/**
 * BattleSystem - Core logic auto battle.
 * Mengelola timer serangan otomatis berdasarkan attack speed.
 * Player dan Monster saling menyerang secara berkala.
 */
class BattleSystem {
    constructor(scene) {
        this.scene = scene;
        this.active = false;

        this.playerHealth = null;
        this.monsterHealth = null;
        this.playerStats = null;
        this.monsterStats = null;

        this.playerAttackTimer = 0;
        this.monsterAttackTimer = 0;

        this.playerGfx = null;
        this.playerManager = null; // reference to AdventureManager
        this.monsterEntity = null;

        this.battleAnim = new BattleAnimation(scene);
        this.isAnimating = false;

        this.onMonsterDefeated = null;
        this.onPlayerDefeated = null;
        this.onDamageDealt = null;
    }

    startBattle(playerData, monsterData, onMonsterDefeated, onPlayerDefeated) {
        this.active = true;
        this.isAnimating = false;

        this.playerHealth = new HealthSystem(playerData.maxHp, playerData.hp);
        this.monsterHealth = new HealthSystem(monsterData.maxHp, monsterData.hp);

        this.playerStats = {
            attack: playerData.attack || 10,
            defense: playerData.defense || 0
        };
        this.monsterStats = {
            damage: monsterData.damage || 5,
            attackSpeed: monsterData.attackSpeed || 1.0
        };

        this.playerGfx = playerData.gfx;
        this.playerManager = playerData.manager; // AdventureManager
        this.monsterEntity = monsterData.entity;

        this.playerAttackTimer = 0;
        this.monsterAttackTimer = 0;

        this.onMonsterDefeated = onMonsterDefeated;
        this.onPlayerDefeated = onPlayerDefeated;

        this.playerHealth.onDeath = () => {
            if (this.onPlayerDefeated) this.onPlayerDefeated();
        };
        this.monsterHealth.onDeath = () => {
            if (this.onMonsterDefeated) this.onMonsterDefeated();
        };
    }

    update(delta) {
        if (!this.active) return;
        // Safety: if stuck in animation for too long, reset
        if (this.isAnimating) {
            this._animSafetyTimer = (this._animSafetyTimer || 0) + delta;
            if (this._animSafetyTimer > 2000) {
                this.isAnimating = false;
                this._animSafetyTimer = 0;
            }
            return;
        }
        this._animSafetyTimer = 0;
        if (!this.playerHealth || !this.monsterHealth) return;
        if (this.playerHealth.isDead || this.monsterHealth.isDead) return;

        this.playerAttackTimer += delta;
        this.monsterAttackTimer += delta;

        const playerInterval = 1000 / (this.playerStats.attackSpeed || 1.0);
        if (this.playerAttackTimer >= playerInterval) {
            this.playerAttackTimer -= playerInterval;
            this._playerAttack();
        }

        const monsterInterval = 1000 / (this.monsterStats.attackSpeed || 1.0);
        if (this.monsterAttackTimer >= monsterInterval) {
            this.monsterAttackTimer -= monsterInterval;
            this._monsterAttack();
        }
    }

    _getPlayerWorldPos() {
        if (this.playerManager) {
            return { x: this.playerManager.playerX, y: this.playerManager.playerY };
        }
        return { x: 0, y: 0 };
    }

    _playerAttack() {
        if (!this.monsterHealth || this.monsterHealth.isDead) return;
        this.isAnimating = true;

        const damage = DamageCalculator.playerToMonster(this.playerStats, this.monsterStats);
        this.monsterHealth.takeDamage(damage);

        const pos = this._getPlayerWorldPos();
        const mx = this.monsterEntity.x;
        const my = this.monsterEntity.y;

        this.battleAnim.attackLunge(this.playerGfx, pos.x, pos.y, mx, my, 6, 120, this.playerManager).then(() => {
            this.battleAnim.showDamageNumber(mx, my - 16, damage, '#ff4444',
                this.scene.cameras.main.zoom);
            return this.battleAnim.hurtFlash(this.monsterEntity.gfx, 150);
        }).then(() => {
            this.isAnimating = false;
            if (this.onDamageDealt) {
                this.onDamageDealt('player', damage, mx, my);
            }
        });
    }

    _monsterAttack() {
        if (!this.playerHealth || this.playerHealth.isDead) return;
        this.isAnimating = true;

        const damage = DamageCalculator.monsterToPlayer(this.monsterStats, this.playerStats);
        this.playerHealth.takeDamage(damage);

        const mx = this.monsterEntity.x;
        const my = this.monsterEntity.y;
        const pos = this._getPlayerWorldPos();

        this.battleAnim.attackLunge(this.monsterEntity.gfx, mx, my, pos.x, pos.y, 6, 120, null).then(() => {
            this.battleAnim.showDamageNumber(pos.x, pos.y - 16, damage, '#ffaa44',
                this.scene.cameras.main.zoom);
            return this.battleAnim.hurtFlash(this.playerGfx, 150);
        }).then(() => {
            this.isAnimating = false;
            if (this.onDamageDealt) {
                this.onDamageDealt('monster', damage, pos.x, pos.y);
            }
        });
    }

    stop() {
        this.active = false;
        this.isAnimating = false;
        this._animSafetyTimer = 0;
    }

    getPlayerHpInfo() {
        return this.playerHealth ? this.playerHealth.getInfo() : null;
    }

    getMonsterHpInfo() {
        return this.monsterHealth ? this.monsterHealth.getInfo() : null;
    }

    isActive() {
        return this.active;
    }
}
