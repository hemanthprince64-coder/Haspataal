'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConsumerRegistry = void 0;
class ConsumerRegistry {
  consumers = new Map();
  register(consumer) {
    if (this.consumers.has(consumer.consumerName)) {
      throw new Error(`Consumer ${consumer.consumerName} is already registered.`);
    }
    this.consumers.set(consumer.consumerName, consumer);
  }
  getConsumersForEvent(eventType) {
    const matched = [];
    for (const consumer of this.consumers.values()) {
      if (consumer.supportedEvents().includes(eventType)) {
        matched.push(consumer);
      }
    }
    return matched;
  }
  getAllConsumers() {
    return Array.from(this.consumers.values());
  }
}
exports.ConsumerRegistry = ConsumerRegistry;
