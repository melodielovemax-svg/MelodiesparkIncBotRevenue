class_name CombatDamagePacket
extends RefCounted

var source: Node
var amount := 0.0
var damage_type: StringName = &"physical"
var skill_id: StringName = &"basic_attack"
var hit_point := Vector3.ZERO
var hit_normal := Vector3.UP
var poise_damage := 0.0
var critical := false
var tags: Array[StringName] = []

func _init(p_source: Node = null, p_amount := 0.0, p_type: StringName = &"physical", p_skill: StringName = &"basic_attack") -> void:
	source = p_source
	amount = p_amount
	damage_type = p_type
	skill_id = p_skill
