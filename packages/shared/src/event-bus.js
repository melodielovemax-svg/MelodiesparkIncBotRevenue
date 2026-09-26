import { EventEmitter } from 'node:events';
class MelodieEventBus extends EventEmitter {
  publish(channel, event, data) {
    this.emit(`\${channel}.\${event}`, { id: crypto.randomUUID(), data, timestamp: new Date().toISOString() });
  }
}
export const getEventBus = () => {
  if (!global.melodieBus) global.melodieBus = new MelodieEventBus();
  return global.melodieBus;
};
