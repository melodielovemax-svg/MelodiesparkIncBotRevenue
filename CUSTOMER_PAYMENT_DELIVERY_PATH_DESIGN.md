# CUSTOMER → PAYMENT → DELIVERY PATH DESIGN
**Date:** 2026-09-25  
**Status:** DESIGN SPECIFICATION  
**Foundation:** Verified Command Center Components (18/61 features)  
**Constraint:** All financial actions require human approval  

---

## DESIGN PRINCIPLES

1. **Evidence-First:** Every step generates auditable evidence
2. **Human-in-the-Loop:** No automatic financial transactions
3. **Fail-Closed:** Unknown states default to manual review
4. **Separation of Concerns:** Game currency ≠ Real money ≠ Karma
5. **Reversible:** Every step has a documented rollback path

---

## VERIFIED FOUNDATION COMPONENTS

### Authentication & Security
- ✅ **AUTH-001:** Scrypt password hashing with session cookies
- ✅ **AUTH-002:** CSRF protection for all mutations
- ✅ **AUTH-003:** RBAC (admin, operator, analyst, viewer)

### Commerce & Revenue
- ✅ **COM-001:** Product draft system with human review requirement
- ✅ **REV-003:** Revenue ledger with external source deduplication
- ✅ **REV-004:** Revenue dashboard with demo data labeling

### Wallet & Financial
- ✅ **WAL-001:** EIP-191 challenge for wallet control proof
- ✅ **WAL-002:** Signature verification with expiration
- ✅ **WAL-003:** Wallet binding without private key storage
- ✅ **WAL-005:** Withdrawal authorization intents (manual review only)

### Dashboard & Operations
- ✅ **DASH-001:** Control center dashboard
- ✅ **DASH-002:** Revenue visualization
- ✅ **OPS-001:** Five health check controls

---

## PROPOSED CUSTOMER JOURNEY

### Phase 1: Product Discovery & Cart
**Status:** DESIGN (requires implementation)

**Flow:**
```
Anonymous Browse → Product View → Add to Cart → Guest Checkout
```

**Components Needed:**
- Public product catalog (from COM-001 drafts after approval)
- Shopping cart state management
- Guest checkout flow
- Email capture for delivery

**Evidence Generation:**
- Product view events
- Cart addition events
- Checkout initiation events

**Human Approval Points:**
- Product draft publication (COM-001 already requires review)
- Price changes (requires new approval workflow)

---

### Phase 2: Customer Identity & Authentication
**Status:** ✅ VERIFIED (AUTH-001/002/003)

**Flow:**
```
Email/Password Registration → Email Verification → Session Creation → Profile Setup
```

**Existing Components:**
- Scrypt password hashing (AUTH-001)
- Session management (AUTH-001)
- CSRF protection (AUTH-002)
- Role-based access (AUTH-003)

**Evidence Generation:**
- Registration events with audit trail
- Email verification timestamps
- Session creation logs
- Profile modification events

**Human Approval Points:**
- None for standard registration
- Admin approval for elevated roles (if implemented)

---

### Phase 3: Payment Selection & Processing
**Status:** PARTIAL (WAL-001/002/003/005 verified, payment processor needs integration)

**Flow:**
```
Payment Method Selection → 
  Option A: Credit Card (Stripe integration needed)
  Option B: Crypto Wallet (WAL-001/002/003 verified)
→ Payment Authorization → 
  Human Review Required → 
  Payment Execution → 
  Evidence Generation
```

**Existing Components:**
- Wallet challenge/verification (WAL-001/002/003)
- Withdrawal intent system (WAL-005)

**Components Needed:**
- Stripe payment form integration
- Payment method storage (PCI compliant)
- Payment authorization capture
- Human review interface for financial actions

**Evidence Generation:**
- Payment method selection events
- Authorization request events
- Human review decision events
- Payment processor response events
- Ledger entry creation (REV-003)

**Human Approval Points:**
- **CRITICAL:** All payment authorizations require admin/operator review
- **CRITICAL:** All payouts require explicit human approval (WAL-005 already enforces)
- **CRITICAL:** Refund requests require human review

---

### Phase 4: Order Confirmation & Entitlement Generation
**Status:** DESIGN (requires implementation)

**Flow:**
```
Payment Success → Order Record Creation → Entitlement Generation → Delivery Trigger
```

**Components Needed:**
- Order record schema (linked to REV-003 ledger)
- Entitlement generation system
- Digital product delivery mechanism
- License key generation (if applicable)

**Evidence Generation:**
- Order creation events with payment reference
- Entitlement generation events
- Delivery trigger events
- Customer notification events

**Human Approval Points:**
- High-value orders may require manual fulfillment review
- Failed deliveries require manual intervention

---

### Phase 5: Product Delivery
**Status:** DESIGN (requires implementation)

**Flow:**
```
Entitlement Verified → Delivery Method Execution → Confirmation → Support Access
```

**Delivery Methods:**
- Digital download (automated after entitlement verification)
- License key delivery (automated)
- Physical product (third-party integration, manual review)
- Service activation (manual or automated based on risk)

**Evidence Generation:**
- Delivery attempt events
- Success/failure status
- Customer access events
- Support ticket creation (if delivery fails)

**Human Approval Points:**
- Failed delivery automatic retries (3 attempts)
- Manual intervention after 3 failures
- High-value physical product fulfillment

---

### Phase 6: Post-Payment Reconciliation
**Status:** ✅ VERIFIED (REV-003/004)

**Flow:**
```
Payment Provider Webhook → Ledger Update → Reconciliation Run → Dashboard Update
```

**Existing Components:**
- Revenue ledger (REV-003)
- Revenue dashboard (REV-004)
- External source deduplication (REV-003)

**Evidence Generation:**
- Webhook receipt events
- Ledger update events
- Reconciliation run reports
- Discrepancy alerts

**Human Approval Points:**
- **CRITICAL:** All reconciliation discrepancies require manual review
- Large transaction anomalies require investigation
- Refund requests require approval

---

## IMPLEMENTATION PRIORITY MATRIX

### Priority 1: Critical Path (Immediate)
1. **Product Catalog from Drafts** - Extend COM-001 to publish approved drafts
2. **Shopping Cart System** - New component, session-based
3. **Stripe Integration** - Extend REV-001 scaffold to production
4. **Order Record System** - New component, linked to REV-003
5. **Human Review Interface** - New component for financial approvals

### Priority 2: Enhancement (Short-term)
1. **Email Notification System** - Order confirmations, delivery notices
2. **Entitlement Management** - Digital product licensing
3. **Delivery Automation** - Download links, license keys
4. **Customer Portal** - Order history, download access
5. **Reconciliation Automation** - Extend REV-005 from PLANNED to implementation

### Priority 3: Optimization (Long-term)
1. **Multiple Payment Methods** - Additional processors, crypto
2. **Subscription Management** - COM-003 implementation
3. **Advanced Analytics** - Customer lifetime value, churn
4. **Fraud Detection** - Automated risk scoring
5. **Multi-tenant Support** - White-label capabilities

---

## SECURITY & COMPLIANCE REQUIREMENTS

### Payment Security
- **PCI DSS:** Never store raw card data (use Stripe)
- **TLS 1.3:** All payment endpoints require HTTPS
- **CSRF Protection:** All payment mutations (AUTH-002 verified)
- **Rate Limiting:** Payment endpoint throttling (SEC-002 verified)

### Financial Controls
- **Human Approval:** All financial actions require explicit approval
- **Dual Control:** High-value transactions require 2-admin approval
- **Separation of Duties:** Payment processing vs. reconciliation roles
- **Audit Trail:** Every financial action logged (SEC-001 verified)

### Data Protection
- **PII Minimization:** Only collect necessary customer data
- **Data Retention:** Define retention policy for payment records
- **Right to Deletion:** Implement GDPR-compliant deletion
- **Breach Notification:** Define incident response process

---

## EVIDENCE GENERATION SPECIFICATION

### Event Schema Extension
```json
{
  "eventId": "uuid",
  "eventType": "commerce.action",
  "version": 1,
  "occurredAt": "ISO-8601",
  "producer": "command-center",
  "subjectId": "order-id",
  "tenantId": "customer-id",
  "correlationId": "payment-id",
  "causationId": "checkout-id",
  "data": {
    "action": "payment_authorized",
    "amount": 9999,
    "currency": "USD",
    "paymentMethod": "stripe",
    "approvalRequired": true,
    "approvedBy": "admin-id",
    "approvedAt": "ISO-8601"
  },
  "evidenceRef": "ledger-entry-id"
}
```

### Ledger Entry Extension (REV-003)
```json
{
  "id": "ledger-entry-id",
  "source": "stripe",
  "externalId": "payment-intent-id",
  "amount": 9999,
  "currency": "USD",
  "status": "completed",
  "customerId": "customer-id",
  "orderId": "order-id",
  "approvedBy": "admin-id",
  "evidence": {
    "paymentProviderResponse": "...",
    "humanApprovalRecord": "...",
    "reconciliationMatch": true
  }
}
```

---

## ROLLBACK & ERROR HANDLING

### Payment Failures
1. **Payment Declined:** Notify customer, retry option, preserve cart
2. **Network Error:** Queue for retry, notify customer of delay
3. **Approval Timeout:** Escalate to senior admin, notify customer
4. **Processor Outage:** Maintain queue, manual processing option

### Delivery Failures
1. **Entitlement Generation Error:** Retry with backoff, manual fallback
2. **Delivery System Error:** Queue for retry, notify support team
3. **Customer Access Error:** Manual entitlement assignment, log incident

### Reconciliation Discrepancies
1. **Amount Mismatch:** Hold order, manual investigation, customer notification
2. **Missing Webhook:** Manual webhook retry, processor support contact
3. **Duplicate Detection:** Alert admin, prevent duplicate fulfillment

---

## SUCCESS METRICS

### Technical Metrics
- **Payment Success Rate:** >95% (excluding fraud declines)
- **Delivery Success Rate:** >99%
- **Reconciliation Match Rate:** >99.9%
- **Human Review Response Time:** <4 hours during business hours

### Business Metrics
- **Checkout Completion Rate:** >60%
- **Payment Authorization Time:** <2 minutes (excluding human review)
- **Delivery Time:** <5 minutes for digital products
- **Customer Support Tickets:** <2% of transactions

### Security Metrics
- **Failed Fraud Attempts:** Track and alert on spikes
- **Approval Bypass Attempts:** Zero tolerance
- **Data Breach Incidents:** Zero tolerance
- **Compliance Violations:** Zero tolerance

---

## IMPLEMENTATION ROADMAP

### Week 1-2: Foundation
- [ ] Extend COM-001 for product catalog publishing
- [ ] Implement shopping cart system
- [ ] Create order record schema
- [ ] Build human review interface

### Week 3-4: Payment Integration
- [ ] Complete Stripe integration (REV-001)
- [ ] Implement payment authorization flow
- [ ] Connect to REV-003 ledger
- [ ] Add webhook handlers

### Week 5-6: Delivery & Entitlement
- [ ] Build entitlement generation system
- [ ] Implement digital delivery automation
- [ ] Create customer portal
- [ ] Add email notification system

### Week 7-8: Testing & Launch
- [ ] End-to-end testing with sandbox payments
- [ ] Security audit and penetration testing
- [ ] Compliance review (PCI, GDPR)
- [ ] Gradual rollout with monitoring

---

## DISCLAIMER

This design is based on currently verified components (18/61 features). Implementation requires:

1. **External Service Integration:** Stripe account, webhook configuration
2. **Legal Review:** Payment processing terms, refund policy, privacy policy
3. **Security Audit:** Penetration testing, PCI DSS assessment
4. **Operational Readiness:** Support team training, incident response procedures

No real payments should be processed until:
- All Priority 1 components are implemented and tested
- Security audit is completed with no critical findings
- Legal review is completed with documented approval
- Human approval workflows are tested and documented

---

**Design Status:** READY FOR IMPLEMENTATION REVIEW  
**Next Step:** Stakeholder approval of Priority 1 scope  
**Evidence Requirement:** Implementation must generate evidence for each step