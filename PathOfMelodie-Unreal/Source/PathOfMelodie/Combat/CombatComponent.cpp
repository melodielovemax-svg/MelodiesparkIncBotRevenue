#include "CombatComponent.h"

void UCombatComponent::RequestAttack(AActor* Target, float BaseDamage) {
    if (!Target) return;
    UCombatComponent* TargetComp = Target->FindComponentByClass<UCombatComponent>();
    if (TargetComp) {
        float FinalDamage = BaseDamage * (1.0f - TargetComp->Resistance);
        TargetComp->ApplyDamage(FinalDamage);
    }
}
void UCombatComponent::ApplyDamage(float RawDamage) {
    Health -= RawDamage;
    UE_LOG(LogTemp, Log, TEXT("Damage Applied. Remaining HP: %f"), Health);
}
