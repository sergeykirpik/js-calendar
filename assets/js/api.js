import { die } from './utils';

//TODO: add exception handling

class ApiService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter || die('eventEmitter is required');
    }

    getEvent(id) {
        return fetch(`/api/events/${id}`)
            .then(response => response.json())
            .then(json => json.data);
    }

    patchEvent(id, data) {
        return fetch(`/api/events/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(json => {
            this.eventEmitter.emit('api.patch.event', json['data']);
        });
    }

    getAllEvents() {
        return fetch('/api/events')
        .then(response => response.json())
        .then(json => json.data);
    }
}

export default ApiService;
