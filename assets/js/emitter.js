export default class EventEmitter {
  constructor() {
    this.handlers = {};
  }

  subscribe(evt, handler) {
    if (this.handlers[evt]) {
      this.handlers[evt].push(handler);
    } else {
      this.handlers[evt] = [handler];
    }
    return () => {
      this.handlers[evt].filter((h) => h !== handler);
    };
  }

  emit(evt, data = {}) {
    // console.log(`emit: [${evt}]`);
    if (this.handlers[evt]) {
      this.handlers[evt].forEach((handler) => handler(data));
    }
  }
}
