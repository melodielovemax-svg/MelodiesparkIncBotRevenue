class_name CombatShatteringCore
extends Node

const Hurtbox = preload("res://scripts/combat/hurtbox_3d.gd")
const Packet = preload("res://scripts/combat/damage_packet.gd")

signal damage_dealt(target, packet, result: Dictionary)
signal hit_impact(position: Vector3, normal: Vector3, packet)
signal poise_shattered(target, packet)
signal target_killed(target, packet)

@export var critical_multiplier := 1.75
@export var shatter_damage_multiplier := 1.25

func resolve_hit(target: Area3D, packet) -> Dictionary:
	var result: Dictionary = target.receive_hit(packet)
	if not result.accepted:
		return result
	if packet.critical:
		packet.amount *= critical_multiplier
	if result.poise_broken:
		packet.tags.append(&"shatter")
		packet.amount *= shatter_damage_multiplier
		poise_shattered.emit(target, packet)
	damage_dealt.emit(target, packet, result)
	hit_impact.emit(packet.hit_point, packet.hit_normal, packet)
	if result.dead:
		target_killed.emit(target, packet)
	return result

func make_packet(source: Node, amount: float, damage_type: StringName, skill_id: StringName, position: Vector3):
	var packet := Packet.new(source, amount, damage_type, skill_id)
	packet.hit_point = position
	return packet
