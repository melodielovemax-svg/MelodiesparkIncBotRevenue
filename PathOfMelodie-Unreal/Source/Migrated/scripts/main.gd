extends Node3D

const Player = preload("res://scripts/player.gd")
const Enemy = preload("res://scripts/enemy.gd")
const Loot = preload("res://scripts/loot.gd")
const ShatteringCore = preload("res://scripts/combat/shattering_core.gd")
const Acts = preload("res://scripts/campaign/acts.gd")
const Catalog = preload("res://scripts/systems/combat_catalog.gd")
const LootRuntime = preload("res://scripts/runtime/loot_runtime.gd")
const InventoryRuntime = preload("res://scripts/runtime/inventory_runtime.gd")
const BuildRuntime = preload("res://scripts/runtime/build_runtime.gd")
const SkillRuntime = preload("res://scripts/runtime/skill_runtime.gd")

# Master System Runtimes
const ReactionRuntime = preload("res://scripts/runtime/reaction_runtime.gd")
const StatusRuntime = preload("res://scripts/runtime/status_runtime.gd")
const SoulCoreRuntime = preload("res://scripts/runtime/soul_core_runtime.gd")
const GuardianRuntime = preload("res://scripts/runtime/guardian_runtime.gd")
const AscensionRuntime = preload("res://scripts/runtime/ascension_runtime.gd")
const EconomyRuntime = preload("res://scripts/runtime/economy_runtime.gd")
const ProtocolsRuntime = preload("res://scripts/runtime/protocols_runtime.gd")
const EquipmentRuntime = preload("res://scripts/runtime/equipment_runtime.gd")
const StatAggregator = preload("res://scripts/runtime/stat_aggregator.gd")
const TelemetryBridge = preload("res://scripts/runtime/telemetry_bridge.gd")

var player: CharacterBody3D
var enemies: Array[CharacterBody3D] = []
var status_label: Label
var hud_stats_label: Label
var inventory_count := 0
var arena_size := 22.0
var combat_core: Node
var current_act := 1
var act_transitioning := false

# Active runtime instances
var inventory_runtime = InventoryRuntime.new()
var build_runtime = BuildRuntime.new()
var reaction_runtime = ReactionRuntime.new()
var soul_core_runtime = SoulCoreRuntime.new()
var guardian_runtime = GuardianRuntime.new("Phoenix Guardian")
var ascension_runtime = AscensionRuntime.new()
var economy_runtime = EconomyRuntime.new()
var protocols_runtime = ProtocolsRuntime.new()
var equipment_runtime = EquipmentRuntime.new()
var telemetry_bridge: TelemetryBridge
var skill_runtimes: Dictionary = {}
var enemy_status_runtimes: Dictionary = {} # Enemy -> StatusRuntime

# Battle stats tracking
var total_damage_dealt: int = 0
var total_shatters: int = 0
var total_reactions: int = 0
var last_reaction_text: String = ""

func _ready() -> void:
	_load_slice()
	_validate_catalogs()
	for profile in Catalog.skills():
		skill_runtimes[profile.get("id", "")] = SkillRuntime.new(profile)

	_build_environment()
	_build_arena()

	combat_core = ShatteringCore.new()
	combat_core.name = "ShatteringCore"
	add_child(combat_core)

	telemetry_bridge = TelemetryBridge.new()
	telemetry_bridge.name = "TelemetryBridge"
	add_child(telemetry_bridge)

	player = Player.new()
	player.name = "Player"
	player.position = Vector3(0, 1, 5)
	add_child(player)
	player.attack_hit.connect(_on_player_attack)
	player.skill_cast.connect(_on_skill_cast)
	player.damaged.connect(_on_player_damaged)
	player.loot_collected.connect(_on_loot_collected)
	player.guardian_pulse_requested.connect(_on_guardian_pulse_requested)

	reaction_runtime.reaction_triggered.connect(_on_elemental_reaction_triggered)
	guardian_runtime.aura_pulsed.connect(_on_aura_pulsed)
	ascension_runtime.phoenix_form_activated.connect(_on_phoenix_form_activated)

	_spawn_act_wave()
	_build_camera()
	_build_hud()

	# Emit initial session telemetry event
	telemetry_bridge.emit_event("session_started", {
		"act_number": current_act,
		"guardian": guardian_runtime.guardian_name,
		"ascension_rank": ascension_runtime.get_current_rank()
	})

func _validate_catalogs() -> void:
	var skill_count := Catalog.skills().size()
	var archetype_count := Catalog.archetypes().size()
	var affix_count := Catalog.loot_affixes().size()
	if skill_count == 0 or archetype_count == 0 or affix_count == 0:
		push_error("Path of Melodie data catalogs are incomplete.")

func _process(delta: float) -> void:
	for runtime in skill_runtimes.values():
		runtime.tick(delta)

	guardian_runtime.tick(delta)
	ascension_runtime.tick(delta)

	# Process status effect ticks on alive enemies
	for enemy in enemy_status_runtimes.keys():
		if is_instance_valid(enemy):
			var s_runtime: StatusRuntime = enemy_status_runtimes[enemy]
			s_runtime.tick(delta)

	var alive := enemies.filter(func(item): return is_instance_valid(item))
	if not alive.is_empty():
		var boss := alive.filter(func(item): return item.archetype == "Cinder Warden" or "Warden" in item.name or "Queen" in item.name or "Boss" in item.name)
		var boss_text := "" if boss.is_empty() else "  |  BOSS P%d: %d%%" % [boss[0].boss_phase, boss[0].health_percent()]
		var act := Acts.get_act(current_act)

		var asc_info = ascension_runtime.get_ascension_multipliers()
		var asc_text = "[PHOENIX ACTIVE: %s]" % asc_info.branch if asc_info.is_active else "[SPACE] Phoenix (%d%%)" % player.phoenix

		status_label.text = "ACT %02d  //  %s  //  %s\nREGION: %s  •  BOSS: %s\nWASD Move  •  LMB Attack  •  [Q] Guardian Pulse  •  %s\nEnemies: %d  |  HP: %d%%  |  Guardian: %s (%s)" % [
			current_act, act.title, act.theme.to_upper(), act.region, act.boss, asc_text, alive.size(), player.health, guardian_runtime.guardian_name, ("ARC-ANGEL" if guardian_runtime.tier == GuardianRuntime.Tier.ARC_ANGEL else "Tier 1")
		]
		status_label.text += boss_text
		if last_reaction_text != "":
			status_label.text += "\nREACTION: %s" % last_reaction_text
	else:
		status_label.text = "ACT %02d COMPLETE  //  %s\nLoot: %d   Gold: %d   Soul Essence: %d   Karma: %d\nAdvancing to next act..." % [
			current_act, Acts.get_act(current_act).title, inventory_count, economy_runtime.get_balance("gold"), economy_runtime.get_balance("soul_essence"), economy_runtime.get_balance("karma_points")
		]
		if not act_transitioning and current_act < Acts.DATA.size():
			_advance_act()
		elif Input.is_key_pressed(KEY_R):
			get_tree().reload_current_scene()

	_update_hud_stats()

func _update_hud_stats() -> void:
	if hud_stats_label:
		hud_stats_label.text = "GOLD: %d  |  SHARDS: %d  |  SOUL: %d  |  KARMA: %d  |  POWER: %d  |  MA: %d" % [
			economy_runtime.get_balance("gold"),
			economy_runtime.get_balance("shards"),
			economy_runtime.get_balance("soul_essence"),
			economy_runtime.get_balance("karma_points"),
			economy_runtime.get_balance("power_points"),
			economy_runtime.get_balance("ma")
		]

func _build_environment() -> void:
	var environment := WorldEnvironment.new()
	var settings := Environment.new()
	settings.background_mode = Environment.BG_COLOR
	settings.background_color = Color("#080d1c")
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color("#8497c7")
	settings.ambient_light_energy = 0.35
	settings.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	environment.environment = settings
	add_child(environment)
	var moon := DirectionalLight3D.new()
	moon.rotation_degrees = Vector3(-55, -28, 0)
	moon.light_color = Color("#9bb7ff")
	moon.light_energy = 1.1
	moon.shadow_enabled = true
	add_child(moon)
	var soul_light := OmniLight3D.new()
	soul_light.position = Vector3(0, 3, 0)
	soul_light.light_color = Color("#62dcff")
	soul_light.light_energy = 5.0
	soul_light.omni_range = 13.0
	add_child(soul_light)

func _build_arena() -> void:
	var floor := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(arena_size, 0.4, arena_size)
	floor.mesh = mesh
	floor.position.y = -0.2
	floor.material_override = _material(Color("#141d35"), 0.15, 0.7)
	add_child(floor)
	for x in [-10.0, 10.0]:
		for z in [-10.0, 10.0]:
			var pillar := MeshInstance3D.new()
			var pillar_mesh := CylinderMesh.new()
			pillar_mesh.top_radius = 0.65
			pillar_mesh.bottom_radius = 0.9
			pillar_mesh.height = 2.8
			pillar.mesh = pillar_mesh
			pillar.position = Vector3(x, 1.4, z)
			pillar.material_override = _material(Color("#34295b"), 0.2, 0.55)
			add_child(pillar)

func _build_camera() -> void:
	var camera := Camera3D.new()
	camera.position = Vector3(13, 16, 13)
	camera.look_at_from_position(camera.position, Vector3(0, 0, 0), Vector3.UP)
	camera.fov = 48
	add_child(camera)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	status_label = Label.new()
	status_label.position = Vector2(28, 24)
	status_label.add_theme_color_override("font_color", Color("#dce9ff"))
	status_label.add_theme_font_size_override("font_size", 17)
	layer.add_child(status_label)

	hud_stats_label = Label.new()
	hud_stats_label.position = Vector2(28, 640)
	hud_stats_label.add_theme_color_override("font_color", Color("#ffc86a"))
	hud_stats_label.add_theme_font_size_override("font_size", 14)
	layer.add_child(hud_stats_label)

	var title := Label.new()
	title.text = "PATH OF MELODIE — MAAKARAS PROTOCOLS — PHOENIX ASCENSION"
	title.position = Vector2(28, 670)
	title.add_theme_color_override("font_color", Color("#62dcff"))
	title.add_theme_font_size_override("font_size", 18)
	layer.add_child(title)

func _on_player_attack(origin: Vector3, direction: Vector3) -> void:
	var skill := Catalog.skill("basic_attack")
	var base_dmg := int(skill.get("damage", 34))

	# Apply Soul Core & Ascension buffs
	var sc_bonuses = soul_core_runtime.get_bonuses()
	var asc_bonuses = ascension_runtime.get_ascension_multipliers()
	var effective_damage := int(float(base_dmg) * sc_bonuses.damage_multiplier * asc_bonuses.damage_multiplier)

	for enemy in enemies:
		if is_instance_valid(enemy) and enemy.global_position.distance_to(origin + direction * 2.0) < 3.0:
			_resolve_hit_on_enemy(enemy, effective_damage, StringName(skill.get("type", "physical")), "basic_attack", 18)
	_spawn_impact(origin + direction * 1.8)

func _on_skill_cast(skill_index: int, origin: Vector3, direction: Vector3, damage: int, radius: float) -> void:
	var skill_id: String = "shattering_core" if skill_index == 5 else ["", "phoenix_strike", "soul_lance", "frost_break", "storm_arc"][skill_index]
	var skill_runtime = skill_runtimes.get(skill_id)
	var skill: Dictionary = skill_runtime.definition if skill_runtime != null else Catalog.skill(skill_id)

	var base_dmg := int(skill.get("damage", damage))
	var configured_radius := float(skill.get("radius", radius))
	var damage_type: StringName = StringName(skill.get("type", "physical"))
	var poise_dmg: float = float(skill.get("poise_damage", 28.0 if skill_index == 5 else 14.0))

	# Trigger Phoenix Ascension state if ultimate skill cast
	if skill_index == 5:
		ascension_runtime.trigger_phoenix_ascension(soul_core_runtime.get_bonuses().ascension_duration_bonus)

	var sc_bonuses = soul_core_runtime.get_bonuses()
	var asc_bonuses = ascension_runtime.get_ascension_multipliers()
	var effective_damage := int(float(base_dmg) * sc_bonuses.damage_multiplier * asc_bonuses.damage_multiplier)

	for enemy in enemies:
		if is_instance_valid(enemy) and enemy.global_position.distance_to(origin + direction * 2.0) <= configured_radius:
			_resolve_hit_on_enemy(enemy, effective_damage, damage_type, skill_id, poise_dmg)
	_spawn_impact(origin + direction * 2.0)

func _resolve_hit_on_enemy(enemy: CharacterBody3D, dmg: int, elem_type: StringName, skill_id: String, poise_dmg: float) -> void:
	if not enemy_status_runtimes.has(enemy):
		var s_rt = StatusRuntime.new()
		s_rt.tick_damage.connect(func(_type, d):
			if is_instance_valid(enemy):
				enemy.take_hit(d, 0)
		)
		enemy_status_runtimes[enemy] = s_rt

	var s_runtime: StatusRuntime = enemy_status_runtimes[enemy]
	var active_elems := s_runtime.get_active_elements()

	# Check for elemental reaction
	var react_result := reaction_runtime.process_reaction(String(elem_type), active_elems, dmg, enemy)
	var final_damage := dmg + int(react_result.get("bonus_damage", 0))
	var final_poise := poise_dmg + float(react_result.get("shatter_bonus", 0.0))

	# Apply defense penalty from shatter / corruption
	var penalty := s_runtime.get_defense_penalty()
	if penalty > 0.0:
		final_damage = int(float(final_damage) * (1.0 + penalty))

	var packet = combat_core.make_packet(player, final_damage, elem_type, StringName(skill_id), enemy.global_position)
	packet.poise_damage = final_poise
	enemy.receive_combat_packet(packet, combat_core)

	total_damage_dealt += final_damage

	# Apply status corresponding to elemental type
	match String(elem_type):
		"fire": s_runtime.apply_status("burn")
		"ice": s_runtime.apply_status("freeze")
		"lightning": s_runtime.apply_status("shock")
		"corruption": s_runtime.apply_status("corruption")

	if react_result.get("triggered", false):
		total_reactions += 1

func _on_guardian_pulse_requested() -> void:
	var result = guardian_runtime.trigger_pulse(player.global_position, enemies)
	if result.pulsed:
		_spawn_impact(player.global_position)

func _on_elemental_reaction_triggered(reaction_type: String, _target: Node, bonus: int, desc: String) -> void:
	last_reaction_text = "%s (+%d dmg) — %s" % [reaction_type.to_upper(), bonus, desc]

func _on_aura_pulsed(damage: int, radius: float, hits: int) -> void:
	last_reaction_text = "GUARDIAN PULSE: %d dmg in %.1fm radius (%d targets hit)" % [damage, radius, hits]

func _on_phoenix_form_activated(branch: String, duration: float) -> void:
	last_reaction_text = "PHOENIX ASCENSION: %s activated for %.1fs!" % [branch, duration]
	telemetry_bridge.emit_event("ascension_activated", {
		"branch": branch,
		"duration": duration,
		"act": current_act
	})

func _on_player_damaged(amount: int) -> void:
	status_label.text = "PHOENIX ASCENSION  //  IMPACT RECEIVED (%d)\nWASD Move  •  Click Attack" % amount

func _on_loot_collected() -> void:
	inventory_count += 1
	economy_runtime.add_currency("gold", 50)
	economy_runtime.add_currency("shards", 5)
	economy_runtime.add_currency("items", 1)
	_save_slice()

func _load_slice() -> void:
	if not FileAccess.file_exists("user://path_of_melodie_save.json"):
		return
	var file := FileAccess.open("user://path_of_melodie_save.json", FileAccess.READ)
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary and int(parsed.get("version", 0)) >= 1:
		inventory_count = int(parsed.get("inventory_count", 0))
		current_act = clampi(int(parsed.get("act", 1)), 1, Acts.DATA.size())
		if parsed.has("economy"):
			economy_runtime.deserialize(parsed.get("economy", {}))
		if parsed.has("soul_core"):
			soul_core_runtime.deserialize(parsed.get("soul_core", {}))

func _spawn_impact(at: Vector3) -> void:
	var particles := GPUParticles3D.new()
	var process_material := ParticleProcessMaterial.new()
	process_material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	process_material.emission_sphere_radius = 0.25
	process_material.direction = Vector3.UP
	process_material.spread = 180.0
	process_material.initial_velocity_min = 2.0
	process_material.initial_velocity_max = 4.0
	process_material.gravity = Vector3(0, -4, 0)
	particles.amount = 18
	particles.lifetime = 0.45
	particles.one_shot = true
	particles.process_material = process_material
	var draw := QuadMesh.new()
	draw.size = Vector2(0.12, 0.12)
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("#ffc86a")
	material.emission_enabled = true
	material.emission = Color("#ff9d35")
	material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw.material = material
	particles.draw_pass_1 = draw
	particles.global_position = at
	add_child(particles)

func _save_slice() -> void:
	var file := FileAccess.open("user://path_of_melodie_save.json", FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify({
			"version": 4,
			"inventory_count": inventory_count,
			"act": current_act,
			"inventory": inventory_runtime.snapshot(),
			"build": build_runtime.stat_summary(),
			"economy": economy_runtime.serialize(),
			"soul_core": soul_core_runtime.serialize()
		}))

func _on_enemy_defeated(at: Vector3) -> void:
	total_shatters += 1
	economy_runtime.add_currency("soul_essence", 25)
	economy_runtime.add_currency("karma_points", 5)
	guardian_runtime.add_xp(120)

	var loot := Loot.new()
	loot.configure(Catalog.rarities(), Catalog.loot_affixes())
	loot.set_item(LootRuntime.roll(Catalog.rarities(), Catalog.loot_affixes(), Catalog.legendary_examples()))
	loot.loot_picked.connect(_on_loot_item_picked)
	loot.position = at
	add_child(loot)

	# Telemetry event on kill
	telemetry_bridge.emit_event("enemy_slain", {
		"act_number": current_act,
		"damage_dealt": total_damage_dealt,
		"shatters_triggered": total_shatters,
		"reactions_triggered": total_reactions,
		"karma_earned": 5
	})

func _on_loot_item_picked(item) -> void:
	if item != null and inventory_runtime.add_item(item):
		build_runtime.equip(item)
		inventory_count = inventory_runtime.count()
		_save_slice()

func _advance_act() -> void:
	act_transitioning = true
	current_act += 1
	player.health = 100
	player.phoenix = 0
	economy_runtime.add_currency("power_points", 50)
	ascension_runtime.ascend_next_rank()

	# Emit Act Cleared Telemetry Event
	var act_info = Acts.get_act(current_act - 1)
	telemetry_bridge.emit_event("act_cleared", {
		"act_number": current_act - 1,
		"boss_defeated": act_info.boss,
		"damage_dealt": total_damage_dealt,
		"shatters_triggered": total_shatters,
		"reactions_triggered": total_reactions,
		"karma_earned": 50
	})

	_save_slice()
	await get_tree().create_timer(1.0).timeout
	_spawn_act_wave()
	act_transitioning = false

func _spawn_act_wave() -> void:
	var act = Acts.get_act(current_act)
	var boss_name: String = act.boss
	for spawn in [
		["Cinderling", Vector3(0, 1, -4)],
		["Ash Stalker", Vector3(-5, 1, -3)],
		["Soul Acolyte", Vector3(5, 1, -3)],
		["Cinder Brute", Vector3(-5, 1, -7)],
		[boss_name, Vector3(0, 1, -9)]
	]:
		var spawned: CharacterBody3D = Enemy.new()
		spawned.name = "%s_Act_%02d" % [spawn[0].replace(" ", "_"), current_act]
		spawned.position = spawn[1]
		spawned.configure(spawn[0])
		add_child(spawned)
		spawned.target = player
		spawned.defeated.connect(_on_enemy_defeated)
		enemies.append(spawned)

func _material(color: Color, metallic: float, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = metallic
	material.roughness = roughness
	return material
