## DropPopup - Menampilkan item yang dijatuhkan monster
extends CanvasLayer

var timer: float = 0.0
var duration: float = 3.0
var labels: Array[Label] = []

func _ready() -> void:
	layer = 75

func show_drops(drop_names: Array[String], gold_amount: int = 0) -> void:
	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.offset_top = -80
	vbox.offset_bottom = 80
	vbox.offset_left = -150
	vbox.offset_right = 150
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 4)
	add_child(vbox)

	## Title
	var title := Label.new()
	title.text = "— LOOT —"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	vbox.add_child(title)

	## Gold
	if gold_amount > 0:
		var gold_lbl := Label.new()
		gold_lbl.text = "💰 Gold +%d" % gold_amount
		gold_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		gold_lbl.add_theme_font_size_override("font_size", 14)
		gold_lbl.add_theme_color_override("font_color", Color(1.0, 0.9, 0.3))
		vbox.add_child(gold_lbl)
		labels.append(gold_lbl)

	## Items
	for item_name: String in drop_names:
		var lbl := Label.new()
		lbl.text = "📦 %s" % item_name
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.add_theme_font_size_override("font_size", 13)
		lbl.add_theme_color_override("font_color", Color(0.8, 0.9, 0.8))
		vbox.add_child(lbl)
		labels.append(lbl)

	if drop_names.is_empty() and gold_amount == 0:
		var empty := Label.new()
		empty.text = "No drops..."
		empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty.add_theme_font_size_override("font_size", 12)
		empty.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		vbox.add_child(empty)
		labels.append(empty)

	## Animation fade
	modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.2)
