## InventorySlot - Slot individu dalam grid inventory/warehouse
extends PanelContainer

var slot_index: int = -1
var item_data: Dictionary = {}
var icon_rect: ColorRect
var amount_label: Label
var rarity_border: ColorRect
var slot_size: float = 56.0

signal slot_clicked(index: int, item: Dictionary)

func _ready() -> void:
	custom_minimum_size = Vector2(slot_size, slot_size)
	size = Vector2(slot_size, slot_size)
	_build_slot()

func _build_slot() -> void:
	## Background
	var bg := ColorRect.new()
	bg.name = "SlotBG"
	bg.color = Color(0.18, 0.18, 0.22)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	## Rarity border (tipis)
	rarity_border = ColorRect.new()
	rarity_border.name = "RarityBorder"
	rarity_border.set_anchors_preset(Control.PRESET_FULL_RECT)
	rarity_border.color = Color.TRANSPARENT
	rarity_border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(rarity_border)

	## Icon
	icon_rect = ColorRect.new()
	icon_rect.name = "Icon"
	icon_rect.size = Vector2(slot_size - 16, slot_size - 16)
	icon_rect.position = Vector2(8, 8)
	icon_rect.color = Color.TRANSPARENT
	icon_rect.visible = false
	icon_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(icon_rect)

	## Amount label
	amount_label = Label.new()
	amount_label.name = "Amount"
	amount_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	amount_label.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	amount_label.set_anchors_preset(Control.PRESET_FULL_RECT)
	amount_label.offset_left = -4
	amount_label.offset_top = -2
	amount_label.offset_right = -2
	amount_label.offset_bottom = -1
	amount_label.add_theme_font_size_override("font_size", 11)
	amount_label.add_theme_color_override("font_color", Color.WHITE)
	amount_label.add_theme_color_override("font_shadow_color", Color.BLACK)
	amount_label.add_theme_constant_override("shadow_offset_x", 1)
	amount_label.add_theme_constant_override("shadow_offset_y", 1)
	amount_label.visible = false
	amount_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(amount_label)

	## Input
	gui_input.connect(_on_gui_input)

func set_item(item: Dictionary) -> void:
	item_data = item
	if item.is_empty():
		_clear_slot()
		return

	var item_id: String = item.get("id", "")
	var db_item: Dictionary = ItemDatabase.get_item(item_id)
	var amount: int = item.get("amount", 1)
	var rarity: String = item.get("rarity", db_item.get("rarity", "common"))
	var icon_color: Color = db_item.get("icon_color", Color.MAGENTA)

	icon_rect.color = icon_color
	icon_rect.visible = true
	amount_label.text = str(amount)
	amount_label.visible = amount > 1

	## Rarity border
	rarity_border.color = ItemDatabase.get_rarity_color(rarity)

func _clear_slot() -> void:
	icon_rect.visible = false
	amount_label.visible = false
	rarity_border.color = Color.TRANSPARENT
	item_data = {}

func get_item() -> Dictionary:
	return item_data

func is_empty() -> bool:
	return item_data.is_empty()

func _on_gui_input(event: InputEvent) -> void:
	if (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT) or (event is InputEventScreenTouch and event.pressed):
		slot_clicked.emit(slot_index, item_data)

func set_highlight(value: bool) -> void:
	if value:
		rarity_border.color = Color(1.0, 1.0, 0.5)
	else:
		if not item_data.is_empty():
			var rarity: String = item_data.get("rarity", "common")
			rarity_border.color = ItemDatabase.get_rarity_color(rarity)
		else:
			rarity_border.color = Color.TRANSPARENT
