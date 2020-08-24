export default class EventEmitter {

    constructor() {
        this.handlers = {};
    }

    subscribe(evt, handler) {
        this.handlers[evt] ? this.handlers[evt].push(handler) : this.handlers[evt] = [handler];
        return function() {
            this.handlers[evt].filter(h => h !== handler);
        }
    }

    emit(evt, data={}) {
        console.log(`emit: [${evt}]`);
        if (this.handlers[evt]) {
            this.handlers[evt].forEach(handler => handler(data));
        }
    }

}
