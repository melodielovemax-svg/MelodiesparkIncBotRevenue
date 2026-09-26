class_name GuardianRuntime
extends RefCounted

signal guardian_ascended(arc_angel_name: String, specialization: String)
signal aura_pulsed(damage: int, radius: float, targets_hit: int)
signal guardian_leveled_up(new_level: int)

enum Tier { GUARDIAN, ARC_ANGEL }

var tier: Tier = Tier.GUARDIAN
var guardian_name: String = "Phoenix Guardian"
var specialization: String = "Infernal Radiance"
var level: int = 1
var xp: int = 0
var aura_cooldown: float = 8.0
var aura_timer: float = 0.0

const GUARDIAN_PROFILES := {
	"Phoenix Guardian": {
		"element": "fire",
		"aura_desc": "Incinerates incoming projectiles and boosts Player Fire Power by 25%",
		"arc_angel_evolution": "Arc-Angel of Perpetual Flame",
		"specialization": "Infernal Radiance"
	},
	"Seraph Guardian": {
		"element": "holy",
		"aura_desc": "Generates a divine barrier absorbing 150 damage every 10 seconds",
		"arc_angel_evolution": "Arc-Angel of Absolute Grace",
		"specialization": "Celestial Bastion"
	},
	"Void Guardian": {
		"element": "void",
		"aura_desc": "Distorts gravitational field, pulling nearby foes into shatter windows",
		"arc_angel_evolution": "Arc-Angel of the Infinite Abyss",
		"specialization": "Singularity Burst"
	},
	"Dragon Guardian": {
		"element": "lightning",
		"aura_desc": "Discharges thunderbolts on critical strikes, staggering targets",
		"arc_angel_evolution": "Arc-Angel of Draconic Wrath",
		"specialization": "Storm Sovereign"
	},
	"Soul Guardian": {
		"element": "soul",
		"aura_desc": "Extracts Soul Fragments upon enemy defeat, granting cooldown recovery",
		"arc_angel_evolution": "Arc-Angel of Eternal Rebirth",
		"specialization": "Soul Tapestry"
	}
}

func _init(initial_name: String = "Phoenix Guardian") -> void:
	set_guardian(initial_name)

func set_guardian(name: String) -> void:
	if GUARDIAN_PROFILES.has(name):
		guardian_name = name
		specialization = GUARDIAN_PROFILES[name].specialization
		tier = Tier.GUARDIAN

func add_xp(amount: int) -> void:
	xp += amount
	var needed := level * 500
	if xp >= needed:
		xp -= needed
		level += 1
		guardian_leveled_up.emit(level)
		if level >= 10 and tier == Tier.GUARDIAN:
			ascend_to_arc_angel()

func ascend_to_arc_angel() -> void:
	tier = Tier.ARC_ANGEL
	var profile: Dictionary = GUARDIAN_PROFILES.get(guardian_name, {})
	var arc_name: String = profile.get("arc_angel_evolution", "Arc-Angel Prime")
	guardian_ascended.emit(arc_name, specialization)

func tick(delta: float) -> void:
	aura_timer = maxf(0.0, aura_timer - delta)

func can_pulse() -> bool:
	return aura_timer <= 0.0

func trigger_pulse(player_pos: Vector3, enemies: Array) -> Dictionary:
	if not can_pulse():
		return {"pulsed": false, "targets_hit": 0}

	aura_timer = aura_cooldown
	var radius := 7.0 if tier == Tier.ARC_ANGEL else 5.0
	var damage := 60 + (level * 12) * (2 if tier == Tier.ARC_ANGEL else 1)
	var hit_count := 0

	for enemy in enemies:
		if is_instance_valid(enemy) and enemy.has_method("take_hit"):
			var dist := player_pos.distance_to(enemy.global_position)
			if dist <= radius:
				enemy.take_hit(damage, 35) # Deals 35 poise damage
				hit_count += 1

	aura_pulsed.emit(damage, radius, hit_count)
	return {"pulsed": true, "targets_hit": hit_count, "damage": damage, "radius": radius}

func get_passive_buffs() -> Dictionary:
	var mult := 1.5 if tier == Tier.ARC_ANGEL else 1.0
	return {
		"aura_radius": 7.0 if tier == Tier.ARC_ANGEL else 5.0,
		"damage_buff": 1.0 + (0.15 * mult),
		"poise_reduction": 0.20 * mult,
		"arc_angel": tier == Tier.ARC_ANGEL
	}
