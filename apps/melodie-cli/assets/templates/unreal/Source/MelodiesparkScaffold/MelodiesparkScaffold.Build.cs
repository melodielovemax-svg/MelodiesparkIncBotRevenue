// Build rules for the {{PLUGIN_NAME}} runtime module.
//
// Dependencies are limited to modules that ship with the engine, so the plugin
// builds in a stock Unreal Engine 5 installation with no Marketplace plugin
// and no third-party source.

using UnrealBuildTool;

public class {{PLUGIN_NAME}} : ModuleRules
{
	public {{PLUGIN_NAME}}(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine"
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
		});
	}
}
