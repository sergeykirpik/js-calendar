import { die } from './utils';
import { showMessage } from './message';

//TODO: add exception handling

const GET = 'get';
const POST = 'post';
const PATCH = 'patch';
const DELETE = 'delete';

class ApiService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter || die('eventEmitter is required');
    }

    http(method, endpoint, data={}) {
        const headers = { 'Content-Type': 'application/json' };
        const options = { method, headers };
        if (method !== GET) {
            options.body = JSON.stringify(data);
        }
        return fetch(endpoint, options)
            .then(response => {
                response.headers.get('Content-Type') === 'application/json' || die('Invalid Content-Type');

                return response.json().then(json => {
                    if (!response.ok) {
                        throw json.message;
                    }
                    return json.data;
                });
            })
            .catch(err => {
                showMessage(err);
                throw err;
            })
        ;
    }

    getEvent(id) {
        return this.http(GET, `/api/events/${id}`);
    }

    patchEvent(id, data) {
        return this.http(PATCH, `/api/events/${id}`, data)
            .then(data => this.eventEmitter.emit('api.patch.event', data))
            .catch(error => this.eventEmitter.emit('api.patch.event.error', {id, error}))
        ;
    }

    postEvent(data) {
        return this.http(POST, '/api/events/', data)
            .then(data => this.eventEmitter.emit('api.post.event', data))
        ;
    }

    deleteEvent(id) {
        id || die('Invalid id');
        return this.http(DELETE, `/api/events/${id}`)
            .then(data => this.eventEmitter.emit('api.delete.event', id))
        ;
    }

    getAllEvents() {
        return this.http(GET, '/api/events/');
    }
}


export default ApiService;
