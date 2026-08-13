// Simple event emitter for development
// In production, this would integrate with a proper event system

type EventHandler = (data: any) => void;

class EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}

const eventEmitter = new EventEmitter();

export function emitEvent(eventOrPayload: string | any, data?: any): void {
  if (typeof eventOrPayload === 'string') {
    eventEmitter.emit(eventOrPayload, data);
  } else if (eventOrPayload && eventOrPayload.eventType) {
    eventEmitter.emit(eventOrPayload.eventType, eventOrPayload);
  }
}

export { eventEmitter };
export default eventEmitter;
