## DebugPanel - Panel debug untuk menampilkan data pemain
extends Control

var panel: PanelContainer
var labels: Dictionary = {}
var is_visible: bool = false

func _ready() -> void:
	_build_panel()
	visible = false

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_TAB:
			toggle_panel()

func _build_panel() -> void:
	panel = PanelContainer.new()
	panel.name = "DebugPanelBox"
	panel.offset_left = 10
	panel.offset_top = 10
	panel.offset_right = 280
	panel.offset_bottom = 320
	add_child(panel)
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	panel.add_child(vbox)
	var title := Label.new()
	title.text = "== DEBUG PANEL =="
	title.add_theme_font_size_override("font_size", 14)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)
	vbox.add_child(HSeparator.new())
	_add_label(vbox, "name", "Name: -")
	_add_label(vbox, "level", "Level: -")
	_add_label(vbox, "hp", "HP: -")
	_add_label(vbox, "energy", "Energy: -")
	_add_label(vbox, "gold", "Gold: -")
	_add_label(vbox, "diamond", "Diamond: -")
	_add_label(vbox, "attack", "Attack: -")
	_add_label(vbox, "defense", "Defense: -")
	_add_label(vbox, "weapon", "Weapon: -")
	_add_label(vbox, "armor", "Armor: -")
	_add_label(vbox, "location", "Location: -")

func _add_label(parent: Control, key: String, initial_text: String) -> void:
	var label := Label.new()
	label.name = key
	label.text = initial_text
	label.add_theme_font_size_override("font_size", 13)
	parent.add_child(label)
	labels[key] = label

func toggle_panel() -> void:
	is_visible = not is_visible
	visible = is_visible
	if is_visible:
		update_all()

func update_all() -> void:
	if not PlayerManager.is_initialized:
		return
	_set_text("name", "Name: %s" % PlayerManager.get_player_name())
	_set_text("level", "Level: %d (EXP: %d/%d)" % [PlayerManager.get_level(), PlayerManager.get_exp(), PlayerManager.get_exp_to_next()])
	_set_text("hp", "HP: %d/%d" % [PlayerManager.get_hp(), PlayerManager.get_max_hp()])
	_set_text("energy", "Energy: %d/%d" % [PlayerManager.get_energy(), PlayerManager.get_max_energy()])
	_set_text("gold", "Gold: %d" % PlayerManager.get_gold())
	_set_text("diamond", "Diamond: %d" % PlayerManager.get_diamond())
	_set_text("attack", "Attack: %d (+%d eq)" % [PlayerManager.get_attack(), PlayerManager.get_equipment_attack()])
	_set_text("defense", "Defense: %d (+%d eq)" % [PlayerManager.get_defense(), PlayerManager.get_equipment_defense()])
	var weapon: Dictionary = PlayerManager.get_equipment("weapon")
	_set_text("weapon", "Weapon: %s" % (weapon.get("name", "-") if weapon is Dictionary and weapon.has("name") else "-"))
	var armor: Dictionary = PlayerManager.get_equipment("armor")
	_set_text("armor", "Armor: %s" % (armor.get("name", "-") if armor is Dictionary and armor.has("name") else "-"))
	_set_text("location", "Location: %s" % PlayerManager.get_location())

func _set_text(key: String, text: String) -> void:
	if labels.has(key):
		labels[key].text = text
