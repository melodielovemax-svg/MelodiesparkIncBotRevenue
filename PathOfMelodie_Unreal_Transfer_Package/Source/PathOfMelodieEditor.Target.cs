using UnrealBuildTool;

public class PathOfMelodieEditorTarget : TargetRules
{
	public PathOfMelodieEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V7;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_8;
		ExtraModuleNames.Add("PathOfMelodie");
	}
}
