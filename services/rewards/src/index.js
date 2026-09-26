import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '@melodiespark/shared/logger';

export class RewardsService {
  constructor() { this.logger = new Logger('RewardsService'); this.dataDir = 'C:/Melodie/data/rewards'; this.accounts = new Map(); }
  async initialize() { if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true }); this.logger.info('Rewards service initialized'); }
  awardKarma(userId, amount, category) {
    const user = this.accounts.get(userId) || { id: userId, karma: 0, ma: 0 };
    user.karma += amount; user.ma += (amount * 0.001);
    this.accounts.set(userId, user);
    fs.writeFileSync(path.join(this.dataDir, 'accounts.json'), JSON.stringify(Object.fromEntries(this.accounts), null, 2));
    return user;
  }
}
