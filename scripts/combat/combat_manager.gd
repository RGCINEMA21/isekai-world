## CombatManager - Mengkoordinasi seluruh sistem combat di area
extends Node

var drop_popup: CanvasLayer
var respawn_timers: Array[Dictionary] = []

func _ready() -> void:
	pass

func _process(delta: float) -> void:
	var to_remove: Array[int] = []
	for i in range(respawn_timers.size()):
		respawn_timers[i]["time"] -= delta
		if respawn_timers[i]["time"] <= 0.0:
			var monster: Node = respawn_timers[i]["monster"]
			if monster and is_instance_valid(monster):
				monster.respawn()
			to_remove.append(i)
	to_remove.reverse()
	for idx: int in to_remove:
		respawn_timers.remove_at(idx)


func on_monster_died(monster: Node) -> void:
	## Hitung drop
	var drops: Array[Dictionary] = DropManager.roll_drops(DropManager.SLIME_DROPS)
	## Apply drops ke inventory
	var result: Dictionary = DropManager.apply_drops(drops)
	var gold_amount: int = result.get("gold", 0)
	var items_added: Array[Dictionary] = result.get("items_added", [])
	var is_full: bool = result.get("full", false)
	## Tambah EXP
	if monster.has_method("get") and monster.get("exp_reward"):
		var exp_reward: int = int(monster.get("exp_reward"))
		PlayerManager.add_experience(exp_reward)
	## Tampilkan drop popup
	_show_drop_popup(items_added, gold_amount, is_full)
	## Mulai respawn timer
	var respawn_t: float = monster.get("respawn_time") if monster.has_method("get") and monster.get("respawn_time") else 8.0
	respawn_timers.append({"monster": monster, "time": respawn_t})


func _show_drop_popup(items_added: Array[Dictionary], gold_amount: int, is_full: bool) -> void:
	if drop_popup and is_instance_valid(drop_popup):
		drop_popup.queue_free()

	var drop_names: Array[String] = DropManager.get_drop_names(items_added)
	var popup_script = preload("res://scripts/combat/drop_popup.gd")
	drop_popup = popup_script.new()
	drop_popup.name = "DropPopup"
	add_child(drop_popup)
	drop_popup.show_drops(drop_names, gold_amount, is_full)

	var timer := get_tree().create_timer(3.0)
	timer.timeout.connect(func():
		if drop_popup and is_instance_valid(drop_popup):
			drop_popup.queue_free()
			drop_popup = null
	)
