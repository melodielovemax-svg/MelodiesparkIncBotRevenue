# Unreal evidence status

## Current gate

| Evidence | Status | Recorded result |
|---|---|---|
| Transfer documents | VERIFIED ARTIFACT | Master specification, implementation transfer, and artwork production specification exist. |
| Artwork manifest | VERIFIED ARTIFACT/DATA | 30,000 rows; 30,000 unique IDs; prompts populated. Preserve the exact IDs in the CSV. |
| Rendered artwork | ABSENT | No image files are included in the package. |
| Unreal Engine 5.8 installation | VERIFIED ENVIRONMENT | Editor and UnrealBuildTool executables exist locally. |
| `.uproject` descriptor | VERIFIED ARTIFACT | JSON parses and declares the `PathOfMelodie` runtime module. |
| C++ source and build targets | SCAFFOLD | Game/Editor targets, primary module, game mode, runtime probe, and smoke-test source are present. |
| Unreal Editor project load | UNVERIFIED | Headless launch exited during platform validation before loading the project. |
| Win64 C++ build | BLOCKED | UnrealBuildTool requires Windows SDK `10.0.19041.0`; the SDK is not installed. No Visual Studio C++ toolchain was detected. |
| Runtime automation test | UNVERIFIED | `PathOfMelodie.Runtime.Smoke` is authored but has not run. |
| Packaged game | UNVERIFIED | No package has been built. |
| Playable ARPG | UNVERIFIED | No playable Unreal gameplay systems, custom map, or game assets have been verified. |

## Attempts

The UnrealBuildTool Editor-target attempt:

```text
UnrealBuildTool.exe PathOfMelodieEditor Win64 Development
  -Project=PathOfMelodie.uproject -WaitMutex
```

UBT created the target makefile, then stopped before compiling C++ because the
required Win64 SDK `10.0.19041.0` was unavailable.

The headless `UnrealEditor-Cmd.exe` launch also exited during platform
validation, before the project or runtime module was loaded. These failed
attempts are not build or runtime evidence.

## Next gate

Install a supported Visual Studio C++ workload and the Windows SDK version
required by the installed UE 5.8 toolchain. Then rerun the Editor-target build,
run `PathOfMelodie.Runtime.Smoke`, and record the actual exit codes and logs.
Only those passing results can verify the module and actor lifecycle. A
packaged-build and playable-game claim still requires separate evidence.
