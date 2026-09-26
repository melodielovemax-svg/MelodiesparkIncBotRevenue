# Path of Melodie Unreal Transfer Package

This package is the transfer scaffold for converting the existing Path of Melodie concept/Godot prototype into Unreal Engine.

It contains:
- Master game transfer specification
- Unreal architecture and implementation transfer document
- 30,000-image artwork production specification
- Deterministic 30,000-row artwork manifest
- A minimal Unreal Engine 5.8 C++ project scaffold and runtime smoke test

## Evidence status

- Transfer documents and the artwork manifest are verified planning artifacts.
- The manifest contains 30,000 unique, recorded IDs and prompts; the IDs must be
  read from the manifest, not synthesized from a generic numbering pattern.
- Artwork production is unverified; no rendered image files are included.
- The Unreal project, C++ module, startup configuration, game mode, and
  automation test are a scaffold. No successful project build, editor launch,
  smoke-test run, or packaged build has yet been verified.
- The configured startup map is Unreal's built-in `/Engine/Maps/Entry`; this
  package does not yet contain a custom level or gameplay assets.

## First verification gate

This scaffold targets the installed Unreal Engine 5.8 toolchain. From a
Developer Command Prompt with the Visual Studio C++ workload installed, build
the Editor target:

```bat
"C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.exe" PathOfMelodieEditor Win64 Development -Project="C:\melodie\PathOfMelodie_Unreal_Transfer_Package\PathOfMelodie.uproject" -WaitMutex
```

Then run the runtime smoke test:

```bat
"C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "C:\melodie\PathOfMelodie_Unreal_Transfer_Package\PathOfMelodie.uproject" -unattended -nop4 -NullRHI -ExecCmds="Automation RunTests PathOfMelodie.Runtime.Smoke; Quit" -TestExit="Automation Test Queue Empty"
```

Passing these commands verifies only the minimal module and actor lifecycle.
It does not establish a playable ARPG, a custom level, produced artwork, or a
packaged game. Keep Unreal capabilities unverified until the corresponding
build and runtime evidence is recorded.
