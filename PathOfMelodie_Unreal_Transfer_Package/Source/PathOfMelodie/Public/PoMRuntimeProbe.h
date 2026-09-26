#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "PoMRuntimeProbe.generated.h"

UCLASS()
class PATHOFMELODIE_API APoMRuntimeProbe : public AActor
{
	GENERATED_BODY()

public:
	bool HasGameplayInitialized() const;

protected:
	virtual void BeginPlay() override;

private:
	bool bGameplayInitialized = false;
};
