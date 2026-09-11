from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from ..core.status import EvidenceStatus


class Product(BaseModel):
    id: str
    name: str
    status: EvidenceStatus = EvidenceStatus.DRAFT


class Offer(BaseModel):
    id: str
    product_id: str
    currency: str
    amount: Decimal
    status: EvidenceStatus = EvidenceStatus.DRAFT


class PaymentEvidence(BaseModel):
    provider: str
    provider_payment_id: str
    amount: Decimal
    currency: str
    captured: bool = False
    livemode: bool = False
    observed_at: datetime
    status: EvidenceStatus = EvidenceStatus.UNVERIFIED


class FulfillmentEvidence(BaseModel):
    order_id: str
    entitlement_id: str | None = None
    delivered: bool = False
    observed_at: datetime
    status: EvidenceStatus = EvidenceStatus.UNVERIFIED


class RevenueSummary(BaseModel):
    verified_revenue: Decimal = Field(default=Decimal("0"))
    verified_payments: int = 0
    fulfilled_orders: int = 0
    status: EvidenceStatus = EvidenceStatus.UNVERIFIED
