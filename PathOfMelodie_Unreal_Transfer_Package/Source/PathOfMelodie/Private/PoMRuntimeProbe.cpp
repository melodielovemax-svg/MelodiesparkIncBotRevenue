#include "PoMRuntimeProbe.h"

void APoMRuntimeProbe::BeginPlay()
{
	Super::BeginPlay();
	bGameplayInitialized = true;
	UE_LOG(LogTemp, Display, TEXT("Path of Melodie runtime probe entered BeginPlay."));
}

bool APoMRuntimeProbe::HasGameplayInitialized() const
{
	return bGameplayInitialized;
}
