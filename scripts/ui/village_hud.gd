## VillageHUD - HUD untuk Main Village
extends CanvasLayer

var info_label: Label
var inv_ui: CanvasLayer
var wh_ui: CanvasLayer

func _ready() -> void:
	layer = 10
	_build_hud()

func _build_hud() -> void:
	## Top bar
	var top_bar = PanelContainer.new()
	top_bar.name = "TopBar"
	top_bar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top_bar.offset_right = 0
	top_bar.offset_bottom = 50
	top_bar.offset_left = 0
	add_child(top_bar)

	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 16)
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	top_bar.add_child(hbox)

	info_label = Label.new()
	info_label.name = "InfoLabel"
	info_label.add_theme_font_size_override("font_size", 16)
	hbox.add_child(info_label)
	_update_info()

	## Bottom buttons
	var btn_container = VBoxContainer.new()
	btn_container.name = "BottomButtons"
	btn_container.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	btn_container.offset_left = -140
	btn_container.offset_top = -180
	btn_container.offset_right = -10
	btn_container.offset_bottom = -10
	btn_container.add_theme_constant_override("separation", 8)
	add_child(btn_container)

	var btn_inv = _make_button("📦 Inventory")
	var btn_wh = _make_button("🏠 Warehouse")
	var btn_quest = _make_button("📜 Quest")
	var btn_settings = _make_button("⚙ Settings")

	btn_container.add_child(btn_inv)
	btn_container.add_child(btn_wh)
	btn_container.add_child(btn_quest)
	btn_container.add_child(btn_settings)

	btn_inv.pressed.connect(_open_inventory)
	btn_wh.pressed.connect(_open_warehouse)
	btn_quest.pressed.connect(func(): UIManager.show_notification("Quest belum tersedia"))
	btn_settings.pressed.connect(func(): SceneManager.change_scene("settings"))

	## Load UI panels
	inv_ui = preload("res://scripts/inventory/inventory_ui.gd").new()
	inv_ui.name = "InventoryUI"
	add_child(inv_ui)
	wh_ui = preload("res://scripts/warehouse/warehouse_ui.gd").new()
	wh_ui.name = "WarehouseUI"
	add_child(wh_ui)


func _make_button(text: String) -> Button:
	var btn = Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(120, 36)
	btn.add_theme_font_size_override("font_size", 13)
	return btn


func _open_inventory() -> void:
	if inv_ui:
		inv_ui.open("inventory")


func _open_warehouse() -> void:
	if wh_ui:
		wh_ui.open("warehouse")


func _update_info() -> void:
	if not PlayerManager.is_initialized:
		return
	info_label.text = "%s  Lv.%d  HP:%d/%d  E:%d/%d  G:%d  D:%d" % [
		PlayerManager.get_player_name(),
		PlayerManager.get_level(),
		PlayerManager.get_hp(), PlayerManager.get_max_hp(),
		PlayerManager.get_energy(), PlayerManager.get_max_energy(),
		PlayerManager.get_gold(), PlayerManager.get_diamond(),
	]


func refresh() -> void:
	_update_info()
