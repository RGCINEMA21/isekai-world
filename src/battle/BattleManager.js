/**
 * BattleManager - Controller utama Auto Battle System.
 * Menghubungkan AdventureScene dengan BattleSystem, BattleUI, BattleResult.
 * Menangani: klik monster, auto-walk ke monster, mulai battle, hasil battle.
 */
class BattleManager {
    /**
     * @param {Phaser.Scene} scene - AdventureScene instance
     * @param {AdventureManager} manager - Adventure manager
     * @param {MonsterSpawner} spawner - Monster spawner
     */
    constructor(scene, manager, spawner, rewardManager) {
        this.scene = scene;
        this.manager = manager;
        this.spawner = spawner;
        this.rewardManager = rewardManager;

        // Sub-systems
        this.battleSystem = new BattleSystem(scene);
        this.battleUI = new BattleUI(scene);
        this.battleResult = new BattleResult(scene);
        this.battleAnim = new BattleAnimation(scene);

        // State
        this.isInBattle = false;
        this.targetMonster = null;
        this.isAutoWalking = false;

        // Attack range (pixel)
        this.attackRange = 30;

        // Player base stats (dari save data)
        this.playerStats = {
            attack: scene.saveData?.stats?.attack || 10,
            defense: scene.saveData?.stats?.defense || 5,
            maxHp: scene.saveData?.stats?.maxHp || 100,
            hp: scene.saveData?.stats?.hp || 100
        };

        // Setup callbacks
        this.battleSystem.onMonsterDefeated = () => this._onMonsterDefeated();
        this.battleSystem.onPlayerDefeated = () => this._onPlayerDefeated();
    }

    /**
     * Handle klik/sentuh pada monster
     * @param {MonsterEntity} entity - Monster yang diklik
     */
    onMonsterClicked(entity) {
        if (this.isInBattle) return;
        if (!entity || !entity.active) return;

        this.targetMonster = entity;

        const dist = Phaser.Math.Distance.Between(
            this.manager.playerX, this.manager.playerY,
            entity.x, entity.y
        );

        if (dist <= this.attackRange) {
            this._startBattle();
        } else {
            this._startAutoWalk(entity);
        }
    }

    /** Mulai auto-walk ke target monster */
    _startAutoWalk(entity) {
        this.isAutoWalking = true;
    }

    /** Update auto-walk ke monster */
    _updateAutoWalk(delta) {
        if (!this.isAutoWalking || !this.targetMonster) return;
        if (this.isInBattle) {
            this.isAutoWalking = false;
            return;
        }
        if (!this.targetMonster.active) {
            this.isAutoWalking = false;
            this.targetMonster = null;
            return;
        }

        const target = this.targetMonster;
        const px = this.manager.playerX;
        const py = this.manager.playerY;
        const tx = target.x;
        const ty = target.y;
        const dist = Phaser.Math.Distance.Between(px, py, tx, ty);

        if (dist <= this.attackRange) {
            this.isAutoWalking = false;
            this._startBattle();
            return;
        }

        const dx = tx - px;
        const dy = ty - py;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = this.manager.moveSpeed;
        const dt = delta / 1000;

        this.manager.playerX += (dx / len) * speed * dt;
        this.manager.playerY += (dy / len) * speed * dt;

        // Clamp to bounds
        this.manager.playerX = Phaser.Math.Clamp(
            this.manager.playerX,
            this.manager.bounds.left + 16,
            this.manager.bounds.right - 16
        );
        this.manager.playerY = Phaser.Math.Clamp(
            this.manager.playerY,
            this.manager.bounds.top + 16,
            this.manager.bounds.bottom - 16
        );

        if (Math.abs(dx) > Math.abs(dy)) {
            this.manager.facing = dx > 0 ? 'right' : 'left';
        } else {
            this.manager.facing = dy > 0 ? 'down' : 'up';
        }
        this.manager.isMoving = true;
    }

    /** Mulai pertarungan */
    _startBattle() {
        if (!this.targetMonster) return;
        this.isInBattle = true;
        this.isAutoWalking = false;

        this.scene.cameras.main.shake(100, 0.005);

        const mData = this.targetMonster.monsterData;
        const monsterMaxHp = mData.stats ? mData.stats.hp : (mData.baseStats ? mData.baseStats.hp : 20);
        const monsterDamage = mData.stats ? mData.stats.damage : (mData.baseStats ? mData.baseStats.damage : 5);
        const monsterAtkSpeed = mData.stats ? mData.stats.attackSpeed : (mData.baseStats ? mData.baseStats.attackSpeed : 1.0);

        const playerMaxHp = this.playerStats.maxHp;
        const playerCurrentHp = this.scene.saveData?.stats?.hp || playerMaxHp;

        this.battleUI.create();
        this.battleUI.updatePlayerHp(playerCurrentHp, playerMaxHp);
        this.battleUI.showMonsterInfo(mData.name, mData.level || 1, monsterMaxHp, monsterMaxHp);
        this.battleUI.showAutoBattleText();

        this.battleSystem.startBattle(
            {
                maxHp: playerMaxHp,
                hp: playerCurrentHp,
                attack: this.playerStats.attack,
                defense: this.playerStats.defense,
                gfx: this.scene.playerGfx,
                manager: this.manager
            },
            {
                maxHp: monsterMaxHp,
                hp: monsterMaxHp,
                damage: monsterDamage,
                attackSpeed: monsterAtkSpeed,
                entity: this.targetMonster
            },
            () => this._onMonsterDefeated(),
            () => this._onPlayerDefeated()
        );

        this.battleSystem.onDamageDealt = (attacker, damage, x, y) => {
            if (attacker === 'player') {
                const info = this.battleSystem.getMonsterHpInfo();
                if (info) this.battleUI.updateMonsterHp(info.current, info.max);
            } else {
                const info = this.battleSystem.getPlayerHpInfo();
                if (info) {
                    this.battleUI.updatePlayerHp(info.current, info.max);
                    if (this.scene.saveData && this.scene.saveData.stats) {
                        this.scene.saveData.stats.hp = info.current;
                    }
                }
            }
        };
    }

    /** Monster dikalahkan */
    _onMonsterDefeated() {
        this.battleSystem.stop();
        this.isInBattle = false;

        const monsterEntity = this.targetMonster;
        
        this.battleAnim.deathFade(monsterEntity.gfx, 400).then(() => {
            // Kembalikan monster ke spawn point
            if (this.spawner && this.spawner.spawnManager) {
                for (const sp of this.spawner.spawnManager.spawnPoints) {
                    const idx = sp.monsters.indexOf(monsterEntity);
                    if (idx !== -1) {
                        sp.monsters.splice(idx, 1);
                        sp.needsRespawn = true;
                        sp.respawnTimer = sp.respawnTime;
                        break;
                    }
                }
                this.spawner.spawnManager.pool.release(monsterEntity);
            }

            const mData = monsterEntity.monsterData;
            this.battleUI.hideMonsterInfo();

            // Proses hadiah pertarungan
            let rewardResult = null;
            if (this.rewardManager) {
                rewardResult = this.rewardManager.processBattleReward(mData);
            }

            // Tampilkan panel kemenangan
            this.battleResult.showVictory(mData.name, {
                onContinue: () => {
                    if (this.scene.saveData && this.scene.saveData.stats) {
                        this.scene.saveData.stats.hp = this.scene.saveData.stats.maxHp;
                    }
                    // Perbarui UI jika ada
                    if (this.scene.onRewardProcessed) {
                        this.scene.onRewardProcessed(rewardResult);
                    }
                    this.targetMonster = null;
                }
            });
        });
    }

    /** Player kalah */
    _onPlayerDefeated() {
        this.battleSystem.stop();
        this.isInBattle = false;

        this.battleAnim.knockout(this.scene.playerGfx).then(() => {
            this.battleUI.hideMonsterInfo();

            if (this.scene.saveData && this.scene.saveData.stats) {
                this.scene.saveData.stats.hp = this.scene.saveData.stats.maxHp;
            }

            this.battleResult.showDefeat({
                onReturnVillage: () => {
                    this.targetMonster = null;
                    this.scene.exitAdventure();
                },
                onRetry: () => {
                    this.targetMonster = null;
                }
            });
        });
    }

    /** Update tiap frame */
    update(delta) {
        this._updateAutoWalk(delta);

        if (this.isInBattle) {
            this.battleSystem.update(delta);
        }
    }

    /** Cleanup */
    destroy() {
        this.battleSystem.stop();
        this.battleUI.destroy();
        this.battleResult.destroy();
        this.targetMonster = null;
        this.isInBattle = false;
        this.isAutoWalking = false;
    }
}
