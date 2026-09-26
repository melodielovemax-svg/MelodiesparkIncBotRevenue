class_name SkillRuntime

var definition: Dictionary
var cooldown_remaining := 0.0

func _init(profile: Dictionary) -> void:
	definition = profile.duplicate(true)

func tick(delta: float) -> void:
	cooldown_remaining = maxf(0.0, cooldown_remaining - delta)

func can_cast() -> bool:
	return cooldown_remaining <= 0.0

func cast() -> Dictionary:
	if not can_cast():
		return {}
	cooldown_remaining = float(definition.get("cooldown", 0.0))
	return definition.duplicate(true)
