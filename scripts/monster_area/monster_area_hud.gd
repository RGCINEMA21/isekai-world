## MonsterAreaHUD - HUD untuk Monster Area
extends CanvasLayer

var info_label: Label

func _ready() -> void:
	layer = 10
	_build_hud()

func _build_hud() -> void:
	## Top bar
	var top = PanelContainer.new()
	top.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top.offset_bottom = 44
	add_child(top)

	var hbox = HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 16)
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	top.add_child(hbox)

	info_label = Label.new()
	info_label.add_theme_font_size_override("font_size", 14)
	hbox.add_child(info_label)
	_update_info()

	## Back button
	var back_btn = Button.new()
	back_btn.text = "← Back to Village"
	back_btn.custom_minimum_size = Vector2(140, 32)
	back_btn.add_theme_font_size_override("font_size", 12)
	back_btn.pressed.connect(func():
		SceneManager.change_scene("main_village")
	)
	hbox.add_child(back_btn)

func _update_info() -> void:
	if not PlayerManager.is_initialized:
		return
	info_label.text = "%s  Lv.%d  HP:%d/%d" % [
		PlayerManager.get_player_name(),
		PlayerManager.get_level(),
		PlayerManager.get_hp(),
		PlayerManager.get_max_hp(),
	]
