class_name SkillProfile
extends Resource

@export var skill_id: StringName = &"skill"
@export var display_name := "Skill"
@export var damage := 35.0
@export var damage_type: StringName = &"physical"
@export var radius := 1.5
@export var range := 3.0
@export var poise_damage := 20.0
@export var cooldown := 2.0
@export var phoenix_gain := 10.0
@export var tags: Array[StringName] = []
