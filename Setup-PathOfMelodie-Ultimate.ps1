#requires -Version 5.1
<#
PATH OF MELODIE — MAAKARAS PROTOCOLS — PHOENIX ASCENSION
One-shot Windows workstation + playable Godot vertical slice.

Installs, when WinGet is available:
Godot 4, Epic Games Launcher, Unity Hub, Blender, VS Code,
Git, Git LFS, .NET SDK 8, Vulkan SDK and CMake.

Then creates a playable ARPG prototype with:
movement, combat, enemies, XP, Soul Core, Guardian pulse,
Karma, local MA reward simulation, Ascension and cinematic UI.

The MA value is ONLY a local gameplay variable in this prototype.
No wallet, private key, real-money withdrawal or blockchain transaction is implemented.
#>

[CmdletBinding()]
param(
    [string]$Root = "$env:USERPROFILE\PathOfMelodie",
    [switch]$SkipToolInstall,
    [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Log([string]$m) { Write-Host "[MAAKARAS] $m" -ForegroundColor Cyan }
function Ok([string]$m) { Write-Host "[OK] $m" -ForegroundColor Green }
function Warn([string]$m) { Write-Host "[WARN] $m" -ForegroundColor Yellow }

function Write-TextFile([string]$Path, [string]$Content) {
    $parent = Split-Path -Parent $Path
    if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function Install-WingetPackage([string]$Id) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Warn "WinGet introuvable: $Id sera ignoré."
        return
    }
    Log "Installation/validation: $Id"
    try {
        & winget install --exact --id $Id --accept-source-agreements --accept-package-agreements --silent
        if ($LASTEXITCODE -eq 0) { Ok $Id } else { Warn "WinGet code $LASTEXITCODE pour $Id; poursuite." }
    } catch {
        Warn "Échec non bloquant pour $Id."
    }
}

New-Item -ItemType Directory -Force -Path "$Root\game\scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "$Root\game\assets" | Out-Null

if (-not $SkipToolInstall) {
    @(
        "GodotEngine.GodotEngine",
        "EpicGames.EpicGamesLauncher",
        "Unity.UnityHub",
        "BlenderFoundation.Blender",
        "Microsoft.VisualStudioCode",
        "Git.Git",
        "GitHub.GitLFS",
        "Microsoft.DotNet.SDK.8",
        "KhronosGroup.VulkanSDK",
        "Kitware.CMake"
    ) | ForEach-Object { Install-WingetPackage $_ }
}

Write-TextFile "$Root\game\project.godot" @'
[application]
config/name="Path OF Melodie — Maakaras Protocols"
run/main_scene="res://main.tscn"
config/features=PackedStringArray("4.7", "GL Compatibility")

[display]
window/size/viewport_width=1280
window/size/viewport_height=720
window/size/window_width_override=1280
window/size/window_height_override=720
window/stretch/mode="canvas_items"

[rendering]
renderer/rendering_method="gl_compatibility"
renderer/rendering_method.mobile="gl_compatibility"

[input]
move_up={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":87),Object(InputEventKey,"physical_keycode":4194320)]}
move_down={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":83),Object(InputEventKey,"physical_keycode":4194322)]}
move_left={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":65),Object(InputEventKey,"physical_keycode":4194319)]}
move_right={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":68),Object(InputEventKey,"physical_keycode":4194321)]}
skill_fire={"deadzone":0.5,"events":[Object(InputEventMouseButton,"button_index":1)]}
skill_guardian={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":81)]}
skill_ascension={"deadzone":0.5,"events":[Object(InputEventKey,"physical_keycode":32)]}
'@

Write-TextFile "$Root\game\main.tscn" @'
[gd_scene load_steps=2 format=3]
[ext_resource path="res://scripts/main.gd" type="Script" id="1"]
[node name="Maakaras" type="Node2D"]
script = ExtResource("1")
'@

Write-TextFile "$Root\game\scripts\player.gd" @'
extends CharacterBody2D
class_name Soulbearer

signal stats_changed

var speed := 330.0
var max_hp := 120.0
var hp := 120.0
var power := 18.0
var karma := 0
var xp := 0
var level := 1
var ascension := 0
var ma := 0.0
var cooldown := 0.0
var guardian_cd := 0.0
var invulnerable := 0.0

func _physics_process(delta):
    var v = Input.get_vector("move_left","move_right","move_up","move_down")
    velocity = v * speed
    move_and_slide()
    global_position.x = clamp(global_position.x, 70.0, 1210.0)
    global_position.y = clamp(global_position.y, 115.0, 640.0)
    cooldown = max(0.0, cooldown-delta)
    guardian_cd = max(0.0, guardian_cd-delta)
    invulnerable = max(0.0, invulnerable-delta)

    if Input.is_action_just_pressed("skill_guardian") and guardian_cd <= 0:
        guardian_cd = 5.0
        for e in get_tree().get_nodes_in_group("enemies"):
            if e.global_position.distance_to(global_position) < 220:
                e.take_damage(power*2.5)
        karma += 2
        stats_changed.emit()

    if Input.is_action_just_pressed("skill_ascension") and xp >= xp_to_next():
        xp = 0
        ascension += 1
        power += 18
        max_hp += 60
        hp = max_hp
        karma += 25
        ma += 1.0
        stats_changed.emit()

    queue_redraw()

func _unhandled_input(event):
    if event.is_action_pressed("skill_fire"):
        fire()

func fire():
    if cooldown > 0: return
    cooldown = 0.16
    var d = (get_global_mouse_position()-global_position).normalized()
    var p = preload("res://scripts/projectile.gd").new()
    p.global_position = global_position + d*32
    p.direction = d
    p.damage = power
    get_tree().current_scene.add_child(p)

func gain_xp(amount:int):
    xp += amount
    karma += 1
    ma += 0.01
    while xp >= xp_to_next():
        xp -= xp_to_next()
        level += 1
        max_hp += 10
        hp = max_hp
        power += 3
    stats_changed.emit()

func xp_to_next()->int:
    return 50 + level*30

func take_damage(amount:float):
    if invulnerable > 0: return
    hp -= amount
    invulnerable = 0.35
    if hp <= 0:
        hp = max_hp
        global_position = Vector2(640,410)
        karma = max(0,karma-5)
    stats_changed.emit()

func _draw():
    draw_circle(Vector2.ZERO,22,Color("#d9eaff"))
    draw_circle(Vector2(0,-8),11,Color("#f7e8ff"))
    draw_colored_polygon(PackedVector2Array([Vector2(-16,8),Vector2(0,38),Vector2(16,8),Vector2(10,-2),Vector2(-10,-2)]),Color("#17182d"))
    draw_arc(Vector2.ZERO,29,0,TAU,32,Color("#65d9ff"),3)
    if ascension > 0:
        draw_arc(Vector2.ZERO,39,0,TAU,32,Color("#ffb23e"),4)
'@

Write-TextFile "$Root\game\scripts\enemy.gd" @'
extends CharacterBody2D
class_name MaakarasEnemy

var hp := 50.0
var speed := 85.0
var damage := 8.0
var target:Node2D
var elite := false
var tint := Color("#a92f55")

func setup(t:Node2D,tier:=1):
    target=t
    hp += tier*18
    speed += tier*4
    damage += tier*2
    elite=tier>=4
    if elite:
        tint=Color("#8e5cff")
        scale=Vector2(1.35,1.35)
    queue_redraw()

func _physics_process(delta):
    if not is_instance_valid(target): return
    var d=global_position.distance_to(target.global_position)
    if d>48:
        velocity=global_position.direction_to(target.global_position)*speed
        move_and_slide()
    else:
        target.take_damage(damage*delta)
    queue_redraw()

func take_damage(amount:float):
    hp-=amount
    if hp<=0:
        if is_instance_valid(target):
            target.gain_xp(35 if elite else 10)
        queue_free()

func _draw():
    draw_circle(Vector2.ZERO,19,Color("#130d1d"))
    draw_circle(Vector2(0,2),13,tint)
    draw_circle(Vector2(-5,-2),3,Color("#ffef9b"))
    draw_circle(Vector2(5,-2),3,Color("#ffef9b"))
'@

Write-TextFile "$Root\game\scripts\projectile.gd" @'
extends Area2D
var direction:=Vector2.RIGHT
var speed:=900.0
var damage:=20.0
var life:=1.2

func _ready():
    body_entered.connect(_on_body_entered)
    queue_redraw()

func _physics_process(delta):
    global_position += direction*speed*delta
    life-=delta
    if life<=0: queue_free()
    queue_redraw()

func _on_body_entered(body):
    if body.has_method("take_damage"):
        body.take_damage(damage)
        queue_free()

func _draw():
    draw_circle(Vector2.ZERO,8,Color("#fff1b0"))
    draw_circle(Vector2.ZERO,4,Color("#8de7ff"))
'@

Write-TextFile "$Root\game\scripts\main.gd" @'
extends Node2D

var player:Soulbearer
var spawn_timer:=0.0
var world_time:=0.0
var font:=ThemeDB.fallback_font

func _ready():
    randomize()
    RenderingServer.set_default_clear_color(Color("#070713"))
    player=preload("res://scripts/player.gd").new()
    player.position=Vector2(640,410)
    add_child(player)
    player.stats_changed.connect(queue_redraw)
    for i in 10: spawn_enemy()
    queue_redraw()

func _process(delta):
    world_time+=delta
    spawn_timer-=delta
    if spawn_timer<=0:
        spawn_timer=1.25
        spawn_enemy()
    queue_redraw()

func spawn_enemy():
    var e=preload("res://scripts/enemy.gd").new()
    match randi()%4:
        0: e.position=Vector2(randf_range(80,1200),145)
        1: e.position=Vector2(randf_range(80,1200),630)
        2: e.position=Vector2(85,randf_range(150,620))
        _: e.position=Vector2(1195,randf_range(150,620))
    e.setup(player,min(6,1+int(world_time/45.0)))
    add_child(e)

func _draw():
    draw_rect(Rect2(0,0,1280,720),Color("#080913"))
    draw_rect(Rect2(0,100,640,620),Color("#170b16"))
    draw_rect(Rect2(640,100,640,620),Color("#0d1b2b"))

    for i in range(16):
        var x=35+i*82
        var h=80+int(35.0*sin(i*1.7+world_time*0.2))
        draw_colored_polygon(PackedVector2Array([Vector2(x,620),Vector2(x+34,620),Vector2(x+18,620-h)]),Color("#30101b"))
        draw_colored_polygon(PackedVector2Array([Vector2(x+640,620),Vector2(x+674,620),Vector2(x+657,620-h)]),Color("#173a46"))

    var c=Vector2(640,330)
    draw_arc(c,150,0.12*PI,0.88*PI,48,Color(1,0.55,0.18,0.10),8)
    draw_arc(c,180,1.12*PI,1.88*PI,48,Color(0.4,0.8,1,0.10),8)

    draw_rect(Rect2(24,20,1232,70),Color("#0a0b15cc"))
    draw_line(Vector2(24,90),Vector2(1256,90),Color("#e8b65a"),2)
    draw_string(font,Vector2(45,51),"PATH OF MELODIE",HORIZONTAL_ALIGNMENT_LEFT,-1,30,Color("#f4d08a"))
    draw_string(font,Vector2(45,75),"MAAKARAS PROTOCOLS • PHOENIX ASCENSION",HORIZONTAL_ALIGNMENT_LEFT,-1,16,Color("#9edfff"))
    draw_string(font,Vector2(785,48),"SOUL CORE",HORIZONTAL_ALIGNMENT_LEFT,-1,15,Color("#8de7ff"))
    draw_string(font,Vector2(785,70),"POWER • SOUL • MELODIE • KARMA • ASCENSION",HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("#d8d0f5"))

    draw_string(font,Vector2(930,130),"EVERY SOUL LEAVES A MELODY",HORIZONTAL_ALIGNMENT_LEFT,-1,15,Color("#f7e5b8"))
    draw_string(font,Vector2(930,152),"EVERY CHOICE CHANGES THE WORLD",HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("#d2d8e8"))
    draw_string(font,Vector2(930,171),"EVERY ASCENSION CREATES A LEGEND",HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("#d2d8e8"))

    draw_string(font,Vector2(50,125),"NETHERVALE • ASHEN REALM",HORIZONTAL_ALIGNMENT_LEFT,-1,14,Color("#ff8b73"))
    draw_string(font,Vector2(50,145),"Corruption • Souls • Bosses",HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("#c7a0aa"))
    draw_string(font,Vector2(970,615),"AURELION • PARADISE",HORIZONTAL_ALIGNMENT_LEFT,-1,14,Color("#9ee7ff"))
    draw_string(font,Vector2(970,635),"Harmony • Guardians • Ascension",HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("#b6d9e6"))

    draw_rect(Rect2(24,650,1232,52),Color("#090a12dd"))
    var stats="LV %d   HP %.0f/%.0f   XP %d/%d   KARMA %d   MA %.2f   ASCENSION %d" % [player.level,player.hp,player.max_hp,player.xp,player.xp_to_next(),player.karma,player.ma,player.ascension]
    draw_string(font,Vector2(42,682),stats,HORIZONTAL_ALIGNMENT_LEFT,-1,17,Color("#f2e7d0"))
    draw_string(font,Vector2(865,682),"WASD • LMB ATTACK • Q GUARDIAN • SPACE ASCEND",HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("#b7d7ef"))
'@

Write-TextFile "$Root\game\README.md" @'
# Path OF Melodie — Maakaras Protocols — Phoenix Ascension

Playable Godot 4 vertical slice generated by the one-shot PowerShell setup.

Controls:
- WASD / arrows: move
- Left mouse: attack
- Q: Guardian pulse
- SPACE: Ascension when XP is full

Prototype systems:
- top-down ARPG movement
- combat and enemy scaling
- XP / levels
- Soul Core concept
- Guardian ability
- Karma
- local MA gameplay reward simulation
- Phoenix Ascension
- dark-to-paradise cinematic presentation

Production roadmap:
- original/licensed 3D assets and animation
- VFX, audio and cinematics
- classes, itemization, crafting and skill trees
- multiplayer/server authority/anti-cheat
- persistence and live-service backend
- Guardians and Arc-Angels
- endgame / procedural worlds
- optional external digital-asset layer after legal/economic review

The generated prototype does NOT perform real crypto transfers.
'@

Write-TextFile "$Root\Launch-PathOfMelodie.bat" @'
@echo off
setlocal
where godot >nul 2>nul
if %errorlevel%==0 (
  godot --editor "%~dp0game\project.godot"
  exit /b
)
echo Godot was not found in PATH.
echo Open Godot and import:
echo %~dp0game\project.godot
pause
'@

Write-TextFile "$Root\game\.gitignore" @'
.godot/
.import/
.export/
*.tmp
*.log
'@

Write-TextFile "$Root\BUILD-NOTES.txt" @"
PATH OF MELODIE — ONE SHOT BUILD
Created: $(Get-Date -Format s)

Tools:
Godot 4 / Unreal via Epic Games Launcher / Unity via Unity Hub /
Blender / VS Code / Git / Git LFS / .NET / Vulkan / CMake

Project:
$Root\game\project.godot

Launcher:
$Root\Launch-PathOfMelodie.bat
"@

# A lightweight visual asset based on the supplied concept: infernal-to-paradise Phoenix composition.
$svg = @'
<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
<defs>
 <linearGradient id="bg" x1="0" x2="1"><stop stop-color="#16070b"/><stop offset=".48" stop-color="#3b1522"/><stop offset=".52" stop-color="#18314a"/><stop offset="1" stop-color="#bfe9ff"/></linearGradient>
 <radialGradient id="phoenix"><stop stop-color="#fff9c9"/><stop offset=".35" stop-color="#ffbe48"/><stop offset=".7" stop-color="#ff5d2e"/><stop offset="1" stop-color="#7a142d"/></radialGradient>
</defs>
<rect width="1536" height="1024" fill="url(#bg)"/>
<circle cx="768" cy="440" r="310" fill="url(#phoenix)" opacity=".82"/>
<path d="M768 120 C560 230 420 370 210 310 C390 470 500 490 640 450 C480 590 350 720 150 700 C400 850 610 760 768 560 C926 760 1136 850 1386 700 C1186 720 1056 590 896 450 C1036 490 1146 470 1326 310 C1116 370 976 230 768 120Z" fill="#fff1bd" opacity=".8"/>
<path d="M768 250 C690 310 660 410 768 620 C876 410 846 310 768 250Z" fill="#f9e7ff"/>
<path d="M0 760 L180 510 320 760 480 430 640 760Z" fill="#2b0d17"/>
<path d="M896 760 L1056 430 1216 760 1360 510 1536 760Z" fill="#d5f4ff" opacity=".8"/>
<text x="768" y="90" text-anchor="middle" fill="#ffe6a0" font-family="serif" font-size="56" font-weight="bold">PATH OF MELODIE</text>
<text x="768" y="135" text-anchor="middle" fill="#d6f3ff" font-family="sans-serif" font-size="22" letter-spacing="9">MAAKARAS PROTOCOLS • PHOENIX ASCENSION</text>
<text x="768" y="940" text-anchor="middle" fill="#fff3cf" font-family="sans-serif" font-size="26" letter-spacing="4">EVERY SOUL LEAVES A MELODY • EVERY ASCENSION CREATES A LEGEND</text>
</svg>
'@
Write-TextFile "$Root\game\assets\phoenix_concept.svg" $svg

Ok "Projet créé: $Root"
Ok "Godot project: $Root\game\project.godot"
Ok "Launcher: $Root\Launch-PathOfMelodie.bat"

if (-not $NoLaunch) {
    $godot = $null
    $cmd = Get-Command godot -ErrorAction SilentlyContinue
    if ($cmd) { $godot = $cmd.Source }
    if ($godot) {
        Start-Process $godot -ArgumentList "--editor `"$Root\game\project.godot`""
    } else {
        Warn "Godot n'est pas encore visible dans PATH. Lance Launch-PathOfMelodie.bat."
    }
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Magenta
Write-Host " PATH OF MELODIE — MAAKARAS — READY" -ForegroundColor Magenta
Write-Host "====================================================" -ForegroundColor Magenta
