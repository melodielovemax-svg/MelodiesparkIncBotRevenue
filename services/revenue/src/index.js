import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Logger } from '@melodiespark/shared/logger';
import { getEventBus } from '@melodiespark/shared/event-bus';
import { validate, RevenueLedgerEntrySchema } from '@melodiespark/schemas';

export class RevenueService {
  constructor() { this.logger = new Logger('RevenueService'); this.eventBus = getEventBus(); this.ledgerDir = 'C:/Melodie/data/ledger'; this.ledger = []; }
  async initialize() { if (!fs.existsSync(this.ledgerDir)) fs.mkdirSync(this.ledgerDir, { recursive: true }); this.logger.info('Revenue service initialized'); }
  recordVerifiedPayment(orderId, providerData) {
    const entry = { id: crypto.randomUUID(), orderId, amount: providerData.amount, paymentProvider: providerData.provider, paymentVerifiedAt: providerData.verifiedAt, status: 'verified', createdAt: new Date().toISOString() };
    const v = validate(entry, RevenueLedgerEntrySchema);
    if (!v.valid) throw new Error('Invalid Ledger Entry');
    this.ledger.push(entry);
    fs.writeFileSync(path.join(this.ledgerDir, 'ledger.json'), JSON.stringify(this.ledger, null, 2));
    this.logger.financial('PAYMENT_VERIFIED', entry);
    this.eventBus.publish('revenue', 'payment.verified', entry);
    return entry;
  }
  getStatus() { return { totalEntries: this.ledger.length, totalRevenue: this.ledger.reduce((s, e) => s + e.amount, 0) }; }
}
