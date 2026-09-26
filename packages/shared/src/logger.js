export class Logger {
  constructor(context = 'General') { this.context = context; }
  info(msg, data) { console.log(`[INFO][\${this.context}] \${msg}`, data || ''); }
  warn(msg, data) { console.warn(`[WARN][\${this.context}] \${msg}`, data || ''); }
  error(msg, data) { console.error(`[ERROR][\${this.context}] \${msg}`, data || ''); }
  financial(event, data) { console.log(`[FINANCIAL][\${this.context}] \${event}`, data); }
}
