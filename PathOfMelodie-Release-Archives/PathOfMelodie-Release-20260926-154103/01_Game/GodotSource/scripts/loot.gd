extends Node3D

signal loot_picked(item)

var elapsed := 0.0
var collected := false
var rarity := "common"
var affixes: Array = []
var item = null

func configure(rarity_pool: Array, affix_pool: Array) -> void:
	if rarity_pool.is_empty() or affix_pool.is_empty():
		return
	rarity = rarity_pool[randi_range(0, rarity_pool.size() - 1)]
	affixes = [affix_pool[randi_range(0, affix_pool.size() - 1)]]
	if rarity in ["rare", "epic", "legendary", "ancient", "mythic", "soul", "phoenix", "maakaras"]:
		affixes.append(affix_pool[randi_range(0, affix_pool.size() - 1)])

func set_item(instance) -> void:
	item = instance

func _ready() -> void:
	var mesh_instance := MeshInstance3D.new()
	var mesh := PrismMesh.new()
	mesh.size = Vector3(0.55, 0.75, 0.55)
	mesh_instance.mesh = mesh
	mesh_instance.material_override = _material()
	mesh_instance.position.y = 0.55
	add_child(mesh_instance)
	var light := OmniLight3D.new()
	light.light_color = Color("#ffc86a")
	light.light_energy = 2.4
	light.omni_range = 3.5
	light.position.y = 0.6
	add_child(light)
	var area := Area3D.new()
	var collider := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 1.3
	collider.shape = shape
	area.add_child(collider)
	area.body_entered.connect(_on_body_entered)
	add_child(area)

func _process(delta: float) -> void:
	elapsed += delta
	rotation.y += delta * 1.8
	position.y = sin(elapsed * 2.4) * 0.12

func _on_body_entered(body: Node3D) -> void:
	if collected or not body.has_method("collect_loot"):
		return
	collected = true
	loot_picked.emit(item)
	body.collect_loot()
	queue_free()

func _material() -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = _rarity_color()
	material.emission_enabled = true
	material.emission = Color("#ff9d35") * 0.65
	material.metallic = 0.65
	material.roughness = 0.18
	return material

func _rarity_color() -> Color:
	return {
		"common": Color("#b9c2d0"),
		"magic": Color("#62a7ff"),
		"rare": Color("#ffe270"),
		"epic": Color("#cf7cff"),
		"legendary": Color("#ff9d35"),
		"ancient": Color("#ff6f61"),
		"mythic": Color("#ff4fc3"),
		"soul": Color("#62dcff"),
		"phoenix": Color("#ff7043"),
		"maakaras": Color("#ffffff")
	}.get(rarity, Color("#ffc86a"))
