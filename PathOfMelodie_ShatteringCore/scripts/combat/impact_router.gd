class_name ImpactRouter
extends Node

## One event surface for VFX/SFX/UI.
## Connect this to your particle, sound and floating-number systems.

signal light_hit(position: Vector3, normal: Vector3)
signal heavy_hit(position: Vector3, normal: Vector3)
signal shatter(position: Vector3, normal: Vector3)
signal death(position: Vector3)

func bind_core(core: ShatteringCore) -> void:
    core.hit_impact.connect(_on_hit)
    core.poise_shattered.connect(_on_shatter)
    core.target_killed.connect(_on_kill)

func _on_hit(_target: Hurtbox3D, packet: DamagePacket) -> void:
    if packet.tags.has(&"shatter") or packet.amount >= 100.0:
        heavy_hit.emit(packet.hit_point, packet.hit_normal)
    else:
        light_hit.emit(packet.hit_point, packet.hit_normal)

func _on_shatter(_target: Hurtbox3D, packet: DamagePacket) -> void:
    shatter.emit(packet.hit_point, packet.hit_normal)

func _on_kill(target: Hurtbox3D, _packet: DamagePacket) -> void:
    death.emit(target.global_position)
