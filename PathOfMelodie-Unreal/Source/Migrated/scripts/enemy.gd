extends CharacterBody3D

const Damage = preload("res://scripts/damage_system.gd")
const Hurtbox = preload("res://scripts/combat/hurtbox_3d.gd")
const Packet = preload("res://scripts/combat/damage_packet.gd")

signal defeated(at: Vector3)

var archetype := "Cinderling"
var health := 100
var max_health := 100
var damage := 8
var move_speed := 1.8
var attack_range := 2.2
var resistances := {}
var boss_phase := 1
var target: Node3D
var pulse := 0.0
var attack_timer := 0.0
var hurtbox: Area3D

func _ready() -> void:
	var body := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 1.0
	mesh.height = 2.0
	body.mesh = mesh
	body.material_override = _material(_archetype_color())
	body.position.y = 1.0
	add_child(body)
	var collider := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 1.0
	collider.shape = shape
	collider.position.y = 1.0
	add_child(collider)
	hurtbox = Hurtbox.new()
	hurtbox.name = "Hurtbox3D"
	hurtbox.health = health
	hurtbox.max_health = health
	hurtbox.armor = float(resistances.get(Damage.Type.PHYSICAL, 0.0)) * 100.0
	var hurt_shape := CollisionShape3D.new()
	var hurt_sphere := SphereShape3D.new()
	hurt_sphere.radius = 1.1
	hurt_shape.shape = hurt_sphere
	hurtbox.add_child(hurt_shape)
	add_child(hurtbox)
	var light := OmniLight3D.new()
	light.light_color = Color("#ff3d72")
	light.light_energy = 2.2
	light.omni_range = 4.5
	light.position.y = 1.2
	add_child(light)
	target = get_parent().get_node_or_null("Player")
	max_health = health

func _process(delta: float) -> void:
	pulse += delta
	scale = Vector3.ONE * (1.0 + sin(pulse * 3.0) * 0.04)
	attack_timer = maxf(0.0, attack_timer - delta)
	if is_instance_valid(target):
		var distance := global_position.distance_to(target.global_position)
		if distance > 2.2:
			velocity = global_position.direction_to(target.global_position) * move_speed
			velocity.y = 0
			move_and_slide()
		elif attack_timer <= 0.0 and target.has_method("take_damage"):
			attack_timer = 1.2
			target.take_damage(damage)

func take_damage(amount: int) -> void:
	if hurtbox:
		var packet = Packet.new(null, amount, &"physical", &"legacy")
		var result: Dictionary = hurtbox.receive_hit(packet)
		health = roundi(hurtbox.health)
		if result.dead:
			defeated.emit(global_position)
			queue_free()
		return
	var damage_type := Damage.Type.PHYSICAL
	health = maxi(0, health - Damage.resolve(amount, damage_type, resistances))
	if archetype == "Cinder Warden" and health <= max_health / 2 and boss_phase == 1:
		boss_phase = 2
		damage = 16
		move_speed = 2.6
	if archetype == "Cinder Warden" and health <= max_health / 4 and boss_phase == 2:
		boss_phase = 3
		damage = 24
		move_speed = 3.2
	if health == 0:
		defeated.emit(global_position)
		queue_free()

func receive_combat_packet(packet, core: Node) -> void:
	if not hurtbox:
		return
	var result: Dictionary = core.resolve_hit(hurtbox, packet)
	health = roundi(hurtbox.health)
	if result.dead:
		defeated.emit(global_position)
		queue_free()

func health_percent() -> int:
	return roundi(float(health) / max_health * 100.0)

func configure(kind: String) -> void:
	archetype = kind
	match kind:
		"Ash Stalker":
			health = 70; damage = 7; move_speed = 3.8; attack_range = 1.8
		"Soul Acolyte":
			health = 85; damage = 12; move_speed = 1.2; attack_range = 5.0
			resistances = {Damage.Type.SOUL: 0.35}
		"Cinder Brute":
			health = 220; damage = 18; move_speed = 0.9; attack_range = 2.6
			resistances = {Damage.Type.PHYSICAL: 0.25}
		"Soul Harvester":
			health = 320; damage = 22; move_speed = 1.5; attack_range = 2.8
			resistances = {Damage.Type.SOUL: 0.5, Damage.Type.PHYSICAL: 0.2}
		"Cinder Warden":
			health = 700; damage = 14; move_speed = 1.4; attack_range = 3.0
			resistances = {Damage.Type.FIRE: 0.45, Damage.Type.PHYSICAL: 0.15}
	max_health = health

func _archetype_color() -> Color:
	return {
		"Cinderling": Color("#d94b77"),
		"Ash Stalker": Color("#a979ff"),
		"Soul Acolyte": Color("#62dcff"),
		"Cinder Brute": Color("#d9784b"),
		"Soul Harvester": Color("#50e3a4"),
		"Cinder Warden": Color("#ff7a45")
	}.get(archetype, Color("#d94b77"))

func _material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.emission_enabled = true
	material.emission = color * 0.28
	material.roughness = 0.42
	return material
