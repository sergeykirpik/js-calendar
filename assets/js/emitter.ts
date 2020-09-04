export default class EventEmitter {
  handlers: Record<string, Array<(payload: unknown) => void>>;
  constructor() {
    this.handlers = {};
  }

  subscribe(evt: string, handler: (payload: unknown) => void): () => void {
    if (this.handlers[evt]) {
      this.handlers[evt].push(handler);
    } else {
      this.handlers[evt] = [handler];
    }
    return () => {
      this.handlers[evt].filter((h) => h !== handler);
    };
  }

  emit(evt: string, data: unknown = {}): void {
    // console.log(`emit: [${evt}]`);
    if (this.handlers[evt]) {
      this.handlers[evt].forEach((handler) => handler(data));
    }
  }
}
