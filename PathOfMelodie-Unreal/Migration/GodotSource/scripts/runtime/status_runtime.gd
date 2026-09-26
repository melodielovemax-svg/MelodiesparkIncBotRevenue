class_name StatusRuntime
extends RefCounted

signal status_applied(effect_id: String, stacks: int)
signal status_expired(effect_id: String)
signal tick_damage(effect_id: String, damage: int)

# Active status effects tracking:
# { effect_id: { "duration": float, "stacks": int, "tick_timer": float, "tick_rate": float, "base_dot": int } }
var active_effects: Dictionary = {}

const STATUS_CONFIG := {
	"burn": {"max_duration": 4.0, "max_stacks": 5, "tick_rate": 0.5, "base_dot": 8},
	"freeze": {"max_duration": 2.5, "max_stacks": 1, "tick_rate": 0.0, "base_dot": 0},
	"shock": {"max_duration": 3.0, "max_stacks": 3, "tick_rate": 1.0, "base_dot": 12},
	"stun": {"max_duration": 1.2, "max_stacks": 1, "tick_rate": 0.0, "base_dot": 0},
	"corruption": {"max_duration": 5.0, "max_stacks": 5, "tick_rate": 0.5, "base_dot": 10},
	"shattered": {"max_duration": 3.5, "max_stacks": 1, "tick_rate": 0.0, "base_dot": 0}
}

func apply_status(effect_id: String, duration_multiplier: float = 1.0) -> void:
	var id := effect_id.to_lower()
	if not STATUS_CONFIG.has(id):
		return
	var cfg: Dictionary = STATUS_CONFIG[id]
	var max_dur: float = cfg.max_duration * duration_multiplier

	if active_effects.has(id):
		var current: Dictionary = active_effects[id]
		current.duration = max_dur
		current.stacks = mini(current.stacks + 1, cfg.max_stacks)
		status_applied.emit(id, current.stacks)
	else:
		active_effects[id] = {
			"duration": max_dur,
			"stacks": 1,
			"tick_timer": 0.0,
			"tick_rate": cfg.tick_rate,
			"base_dot": cfg.base_dot
		}
		status_applied.emit(id, 1)

func has_status(effect_id: String) -> bool:
	return active_effects.has(effect_id.to_lower())

func get_stacks(effect_id: String) -> int:
	var id := effect_id.to_lower()
	return active_effects[id].stacks if active_effects.has(id) else 0

func get_active_elements() -> Array:
	var elements := []
	if has_status("burn"): elements.append("fire")
	if has_status("freeze"): elements.append("ice")
	if has_status("shock"): elements.append("lightning")
	if has_status("corruption"): elements.append("corruption")
	return elements

func consume_status(effect_id: String) -> void:
	var id := effect_id.to_lower()
	if active_effects.has(id):
		active_effects.erase(id)
		status_expired.emit(id)

func tick(delta: float) -> void:
	var expired := []
	for id in active_effects.keys():
		var effect: Dictionary = active_effects[id]
		effect.duration -= delta
		if effect.duration <= 0.0:
			expired.append(id)
			continue

		# Process DoT ticks if applicable
		if effect.tick_rate > 0.0:
			effect.tick_timer += delta
			if effect.tick_timer >= effect.tick_rate:
				effect.tick_timer = 0.0
				var damage: int = effect.base_dot * effect.stacks
				tick_damage.emit(id, damage)

	for exp_id in expired:
		active_effects.erase(exp_id)
		status_expired.emit(exp_id)

func is_stunned_or_frozen() -> bool:
	return has_status("stun") or has_status("freeze")

func get_defense_penalty() -> float:
	# Shattered status increases all incoming damage by 50%
	var penalty := 0.0
	if has_status("shattered"):
		penalty += 0.50
	if has_status("corruption"):
		penalty += 0.08 * float(get_stacks("corruption"))
	return penalty
