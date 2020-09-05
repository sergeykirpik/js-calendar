/* eslint-disable @typescript-eslint/no-explicit-any */
export default class EventEmitter {
  handlers: Record<string, Array<(payload: any) => void>>;
  constructor() {
    this.handlers = {};
  }

  subscribe<T>(evt: string, handler: (payload: T) => void): () => void {
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
