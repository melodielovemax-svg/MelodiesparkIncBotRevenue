#include "GuardianManager.h"
#include "SoulCoreSystem.h"

bool UGuardianManager::SummonGuardian(EGuardianType Type, FVector Location) {
    USoulCoreSystem* SoulCore = GetOwner()->FindComponentByClass<USoulCoreSystem>();
    if (SoulCore && SoulCore->CurrentSoul >= 50.0f && ActiveGuardians < MaxGuardians) {
        SoulCore->ConsumeSoul(50.0f);
        ActiveGuardians++;
        UE_LOG(LogTemp, Warning, TEXT("Guardian Summoned! Total: %d"), ActiveGuardians);
        return true;
    }
    return false;
}
void UGuardianManager::CommandGuardians(FVector TargetLocation) {
    UE_LOG(LogTemp, Log, TEXT("Guardians commanded to move to: %s"), *TargetLocation.ToString());
}
void UGuardianManager::OnGuardianDeath() {
    ActiveGuardians = FMath::Max(0, ActiveGuardians - 1);
}
