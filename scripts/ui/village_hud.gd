## VillageHUD - HUD untuk Main Village
extends CanvasLayer

var info_label: Label
var btn_inventory: Button
var btn_warehouse: Button
var btn_quest: Button
var btn_settings: Button


func _ready() -> void:
	layer = 10
	_build_hud()


func _build_hud() -> void:
	# === TOP BAR ===
	var top_bar = PanelContainer.new()
	top_bar.name = "TopBar"
	top_bar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top_bar.offset_right = 0
	top_bar.offset_bottom = 50
	top_bar.offset_left = 0
	add_child(top_bar)
	
	# HBox untuk info player
	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 16)
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	top_bar.add_child(hbox)
	
	# Info label
	info_label = Label.new()
	info_label.name = "InfoLabel"
	info_label.add_theme_font_size_override("font_size", 16)
	hbox.add_child(info_label)
	_update_info()
	
	# === BOTTOM RIGHT BUTTONS ===
	var btn_container = VBoxContainer.new()
	btn_container.name = "BottomButtons"
	btn_container.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	btn_container.offset_left = -140
	btn_container.offset_top = -180
	btn_container.offset_right = -10
	btn_container.offset_bottom = -10
	btn_container.add_theme_constant_override("separation", 8)
	add_child(btn_container)
	
	btn_inventory = _make_button("Inventory")
	btn_warehouse = _make_button("Warehouse")
	btn_quest = _make_button("Quest")
	btn_settings = _make_button("Settings")
	
	btn_container.add_child(btn_inventory)
	btn_container.add_child(btn_warehouse)
	btn_container.add_child(btn_quest)
	btn_container.add_child(btn_settings)
	
	# Hubungkan sinyal
	btn_inventory.pressed.connect(func(): UIManager.show_notification("Inventory belum tersedia"))
	btn_warehouse.pressed.connect(func(): UIManager.show_notification("Warehouse belum tersedia"))
	btn_quest.pressed.connect(func(): UIManager.show_notification("Quest belum tersedia"))
	btn_settings.pressed.connect(func(): SceneManager.change_scene("settings"))


func _make_button(text: String) -> Button:
	var btn = Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(120, 36)
	btn.add_theme_font_size_override("font_size", 13)
	return btn


func _update_info() -> void:
	if not PlayerManager.is_initialized:
		return
	info_label.text = "%s  Lv.%d  HP:%d/%d  E:%d/%d  G:%d  D:%d" % [
		PlayerManager.get_player_name(),
		PlayerManager.get_level(),
		PlayerManager.get_hp(),
		PlayerManager.get_max_hp(),
		PlayerManager.get_energy(),
		PlayerManager.get_max_energy(),
		PlayerManager.get_gold(),
		PlayerManager.get_diamond(),
	]


func refresh() -> void:
	_update_info()
