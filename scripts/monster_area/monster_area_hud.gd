## MonsterAreaHUD - HUD Monster Area dengan Combat + Inventory
extends CanvasLayer

var info_label: Label
var exp_label: Label
var exp_bar_bg: ColorRect
var exp_bar_fill: ColorRect
var level_label: Label
var inv_ui: CanvasLayer
var wh_ui: CanvasLayer

func _ready() -> void:
	layer = 10
	_build_hud()
	_update_all()
	if PlayerManager:
		PlayerManager.hp_changed.connect(func(_c, _m): _update_all())
		PlayerManager.exp_changed.connect(func(_c, _t): _update_all())
		PlayerManager.level_changed.connect(func(_l): _update_all())
	## Load UI scripts
	inv_ui = preload("res://scripts/inventory/inventory_ui.gd").new()
	inv_ui.name = "InventoryUI"
	add_child(inv_ui)
	wh_ui = preload("res://scripts/warehouse/warehouse_ui.gd").new()
	wh_ui.name = "WarehouseUI"
	add_child(wh_ui)

func _build_hud() -> void:
	## Top bar
	var top = PanelContainer.new()
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.offset_bottom = 50
	add_child(top)

	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 12)
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	top.add_child(hbox)

	level_label = Label.new()
	level_label.add_theme_font_size_override("font_size", 16)
	level_label.add_theme_color_override("font_color", Color(1.0, 0.9, 0.3))
	hbox.add_child(level_label)

	info_label = Label.new()
	info_label.add_theme_font_size_override("font_size", 13)
	hbox.add_child(info_label)

	var exp_container = VBoxContainer.new()
	exp_container.add_theme_constant_override("separation", 1)
	hbox.add_child(exp_container)

	exp_label = Label.new()
	exp_label.add_theme_font_size_override("font_size", 10)
	exp_label.add_theme_color_override("font_color", Color(0.7, 0.8, 1.0))
	exp_container.add_child(exp_label)

	exp_bar_bg = ColorRect.new()
	exp_bar_bg.size = Vector2(100, 6)
	exp_bar_bg.color = Color(0.15, 0.15, 0.25)
	exp_container.add_child(exp_bar_bg)

	exp_bar_fill = ColorRect.new()
	exp_bar_fill.size = Vector2(0, 6)
	exp_bar_fill.color = Color(0.3, 0.5, 1.0)
	exp_bar_bg.add_child(exp_bar_fill)

	## Buttons
	var btn_hbox = HBoxContainer.new()
	btn_hbox.add_theme_constant_override("separation", 6)
	hbox.add_child(btn_hbox)

	var inv_btn = Button.new()
	inv_btn.text = "📦 Inv"
	inv_btn.custom_minimum_size = Vector2(60, 30)
	inv_btn.add_theme_font_size_override("font_size", 11)
	inv_btn.pressed.connect(func(): if inv_ui: inv_ui.toggle())
	btn_hbox.add_child(inv_btn)

	var back_btn = Button.new()
	back_btn.text = "← Back"
	back_btn.custom_minimum_size = Vector2(80, 30)
	back_btn.add_theme_font_size_override("font_size", 11)
	back_btn.pressed.connect(func(): SceneManager.change_scene("main_village"))
	btn_hbox.add_child(back_btn)

	## Attack button (bottom right)
	var atk_layer = CanvasLayer.new()
	atk_layer.layer = 61
	add_child(atk_layer)

	var atk_btn = Button.new()
	atk_btn.text = "⚔"
	atk_btn.custom_minimum_size = Vector2(70, 70)
	atk_btn.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	atk_btn.offset_left = -90
	atk_btn.offset_top = -90
	atk_btn.offset_right = -10
	atk_btn.offset_bottom = -10
	atk_btn.add_theme_font_size_override("font_size", 24)
	atk_btn.pressed.connect(func():
		var players := get_tree().get_nodes_in_group("player")
		if players.size() > 0 and players[0].has_method("perform_attack"):
			players[0].perform_attack()
	)
	atk_layer.add_child(atk_btn)

func _update_all() -> void:
	if not PlayerManager.is_initialized:
		return
	level_label.text = "Lv.%d" % PlayerManager.get_level()
	info_label.text = "HP:%d/%d  Gold:%d" % [
		PlayerManager.get_hp(), PlayerManager.get_max_hp(), PlayerManager.get_gold(),
	]
	var exp: int = PlayerManager.get_exp()
	var exp_next: int = PlayerManager.get_exp_to_next()
	exp_label.text = "EXP: %d/%d" % [exp, exp_next]
	exp_bar_fill.size.x = 100.0 * float(exp) / float(maxi(exp_next, 1))
