extends CharacterBody3D

signal attack_hit(origin: Vector3, direction: Vector3)
signal damaged(amount: int)
signal loot_collected
signal skill_cast(skill_index: int, origin: Vector3, direction: Vector3, damage: int, radius: float)
signal guardian_pulse_requested

var speed := 7.0
var attack_cooldown := 0.0
var facing := Vector3.FORWARD
var health := 100
var phoenix := 0
var skill_cooldowns := [0.0, 0.0, 0.0, 0.0]
var dodge_timer := 0.0
var guardian_pulse_cooldown := 0.0

func _ready() -> void:
	var body := MeshInstance3D.new()
	var mesh := CapsuleMesh.new()
	mesh.height = 1.8
	mesh.radius = 0.48
	body.mesh = mesh
	body.material_override = _material(Color("#62dcff"), 0.35)
	body.position.y = 0.9
	add_child(body)
	var glow := OmniLight3D.new()
	glow.light_color = Color("#62dcff")
	glow.light_energy = 1.6
	glow.omni_range = 4.0
	glow.position.y = 1.2
	add_child(glow)
	var collider := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.height = 1.8
	shape.radius = 0.48
	collider.shape = shape
	collider.position.y = 0.9
	add_child(collider)

func _physics_process(delta: float) -> void:
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := Vector3(input.x, 0, input.y)
	if direction.length() > 0.01:
		facing = direction.normalized()
		rotation.y = lerp_angle(rotation.y, atan2(-facing.x, -facing.z), delta * 10.0)
	velocity = direction.normalized() * speed
	move_and_slide()
	global_position.x = clamp(global_position.x, -9.0, 9.0)
	global_position.z = clamp(global_position.z, -9.0, 9.0)
	attack_cooldown = maxf(0.0, attack_cooldown - delta)
	dodge_timer = maxf(0.0, dodge_timer - delta)
	guardian_pulse_cooldown = maxf(0.0, guardian_pulse_cooldown - delta)
	for index in skill_cooldowns.size():
		skill_cooldowns[index] = maxf(0.0, skill_cooldowns[index] - delta)
	if Input.is_action_just_pressed("attack") and attack_cooldown <= 0.0:
		attack_cooldown = 0.45
		phoenix = mini(100, phoenix + 8)
		attack_hit.emit(global_position, facing)
	if Input.is_action_just_pressed("dodge") and dodge_timer <= 0.0:
		dodge_timer = 0.8
		velocity = facing * 16.0
		move_and_slide()
	if (Input.is_action_just_pressed("phoenix") or Input.is_key_pressed(KEY_SPACE)) and phoenix >= 100:
		phoenix = 0
		skill_cast.emit(5, global_position, facing, 100, 4.5)
	if (Input.is_action_just_pressed("guardian_pulse") or Input.is_key_pressed(KEY_Q)) and guardian_pulse_cooldown <= 0.0:
		guardian_pulse_cooldown = 1.5
		guardian_pulse_requested.emit()
	for index in 4:
		if Input.is_action_just_pressed("skill_%d" % (index + 1)) and skill_cooldowns[index] <= 0.0:
			var damages := [48, 30, 38, 64]
			var radii := [2.5, 4.0, 3.0, 5.0]
			var cooldowns := [2.0, 3.5, 4.0, 6.0]
			skill_cooldowns[index] = cooldowns[index]
			phoenix = mini(100, phoenix + 18)
			skill_cast.emit(index + 1, global_position, facing, damages[index], radii[index])
func collect_loot() -> void:
	loot_collected.emit()

func take_damage(amount: int) -> void:
	health = maxi(0, health - amount)
	damaged.emit(amount)
	if health == 0:
		get_tree().reload_current_scene()

func _material(color: Color, metallic: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.emission_enabled = true
	material.emission = color * 0.35
	material.metallic = metallic
	material.roughness = 0.35
	return material
