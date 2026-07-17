## VillageTileMap - Ground, paths, dan plaza
extends Node2D

var ts: int

func _ready() -> void:
	ts = VillageData.TILE_SIZE
	_create_ground()
	_create_plaza()
	_create_paths()

func _create_ground() -> void:
	var bg := ColorRect.new()
	bg.size = Vector2(VillageData.MAP_WIDTH * ts, VillageData.MAP_HEIGHT * ts)
	bg.color = Color(0.32, 0.58, 0.27)
	bg.z_index = -10
	add_child(bg)
	for v: Vector2 in [Vector2(3,3),Vector2(8,5),Vector2(22,4),Vector2(5,15),Vector2(25,10),Vector2(15,22),Vector2(7,22),Vector2(20,6),Vector2(2,8),Vector2(30,3),Vector2(35,20),Vector2(10,26),Vector2(18,2),Vector2(32,26),Vector2(5,26)]:
		var p := ColorRect.new()
		p.size = Vector2(3*ts, 2*ts)
		p.position = Vector2(v.x*ts, v.y*ts)
		p.color = Color(0.35, 0.62, 0.29)
		p.z_index = -9
		add_child(p)

func _create_plaza() -> void:
	var pd: Dictionary = VillageData.PLAZA
	var c1 := Color(0.68, 0.65, 0.58)
	var c2 := Color(0.62, 0.59, 0.52)
	for x in range(pd.x, pd.x + pd.w):
		for y in range(pd.y, pd.y + pd.h):
			var t := ColorRect.new()
			t.size = Vector2(ts, ts)
			t.position = Vector2(x*ts, y*ts)
			t.color = c1 if (x+y)%2==0 else c2
			t.z_index = -8
			add_child(t)

func _create_paths() -> void:
	var c1 := Color(0.62, 0.58, 0.50)
	var c2 := Color(0.55, 0.51, 0.44)
	for path: Dictionary in VillageData.PATHS:
		_draw_road(path["from"].x, path["from"].y, path["to"].x, path["to"].y, c1, c2)

func _draw_road(x1:int, y1:int, x2:int, y2:int, c1:Color, c2:Color) -> void:
	if x1==x2:
		for y in range(mini(y1,y2), maxi(y1,y2)+1):
			_add_tile(x1, y, c1, c2)
	elif y1==y2:
		for x in range(mini(x1,x2), maxi(x1,x2)+1):
			_add_tile(x, y1, c1, c2)

func _add_tile(x:int, y:int, c1:Color, c2:Color) -> void:
	var t := ColorRect.new()
	t.size = Vector2(ts, ts)
	t.position = Vector2(x*ts, y*ts)
	t.color = c1 if (x+y)%2==0 else c2
	t.z_index = -7
	add_child(t)
