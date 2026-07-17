## SpawnManager - Spawn monster asli berdasarkan data
extends Node2D

var ts: int
var slime_script = null

func _ready() -> void:
	ts = MonsterAreaData.TILE_SIZE
	slime_script = preload("res://scripts/combat/slime_monster.gd")
	_spawn_slimes()


func _spawn_slimes() -> void:
	for sp: Dictionary in MonsterAreaData.SPAWN_POINTS:
		if sp["area"] != "slime":
			continue
		var count: int = sp.get("max", 2)
		for i in range(count):
			var spawn_x: float = sp["x"] * ts + ts * 0.5 + randf_range(-20, 20)
			var spawn_y: float = sp["y"] * ts + ts * 0.5 + randf_range(-20, 20)
			var slime = slime_script.new()
			slime.name = "Slime_%s_%d" % [sp["id"], i]
			slime.position = Vector2(spawn_x, spawn_y)
			slime.spawn_position = slime.position
			slime.add_to_group("monsters")
			slime.died.connect(_on_slime_died)
			add_child(slime)


func _on_slime_died(monster_ref: Node2D) -> void:
	## Cari CombatManager di parent
	var combat_mgr := get_node_or_null("../CombatManager")
	if combat_mgr and combat_mgr.has_method("on_monster_died"):
		combat_mgr.on_monster_died(monster_ref)
