class_name ShatteringCore
extends Node

## Central ARPG combat resolver.
## Keeps hit detection, damage, poise, shatter and impact events separate
## from player/enemy controllers.

signal damage_dealt(target: Hurtbox3D, packet: DamagePacket, result: Dictionary)
signal hit_impact(position: Vector3, normal: Vector3, packet: DamagePacket)
signal poise_shattered(target: Hurtbox3D, packet: DamagePacket)
signal target_killed(target: Hurtbox3D, packet: DamagePacket)

@export var critical_multiplier := 1.75
@export var shatter_damage_multiplier := 1.25

func resolve_hit(target: Hurtbox3D, packet: DamagePacket) -> Dictionary:
    var result := target.receive_hit(packet)

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

func make_packet(
    source: Node,
    amount: float,
    damage_type: StringName,
    skill_id: StringName,
    position: Vector3,
    normal: Vector3
) -> DamagePacket:
    var packet := DamagePacket.new(source, amount, damage_type, skill_id)
    packet.hit_point = position
    packet.hit_normal = normal.normalized()
    return packet
