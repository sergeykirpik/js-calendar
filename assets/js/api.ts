import { die } from './utils';
import { showMessage } from './message';
import DataConverter from './data_converter';
import EventEmitter from './emitter';
import CalendarEvent from './model/calendar_event';
import CalendarEventPatch from './model/calendar_event_patch';

enum HTTPMethod {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete'
}

class ApiService extends EventEmitter {
    http(method: HTTPMethod, endpoint: string, data = {}): Promise<unknown> {
        const headers = { 'Content-Type': 'application/json' };
        const options: RequestInit = { method, headers };
        if (method !== HTTPMethod.GET) {
            options.body = JSON.stringify(data);
        }
        return fetch(endpoint, options)
            .then((response) => {
                if (response.redirected) {
                    return window.location.replace(response.url);
                }

                response.headers.get('Content-Type') === 'application/json' || die('Invalid Content-Type');

                return response.json()
                    .then((json) => {
                        if (!response.ok) {
                            throw json.message;
                        }
                        return json.data;
                    });
            })
            .catch((err) => {
                showMessage(err);
                throw err;
            });
    }

    getEvent(id: string): Promise<CalendarEvent> {
        return this.http(HTTPMethod.GET, `/api/events/${id}`).then(DataConverter.eventFromJSON);
    }

    patchEvent(id: string, body: CalendarEventPatch): void {
        this.http(HTTPMethod.PATCH, `/api/events/${id}`, body)
            .then(DataConverter.eventFromJSON)
            .then((data) => this.emit('api.patch.event', data))
            .catch((error) => this.emit('api.patch.event.error', { id, error }));
    }

    postEvent(body: CalendarEventPatch): void {
        this.http(HTTPMethod.POST, '/api/events/', body)
            .then(DataConverter.eventFromJSON)
            .then((data) => this.emit('api.post.event', data));
    }

    deleteEvent(id: string): Promise<unknown> {
        id || die('Invalid id');
        return this.http(HTTPMethod.DELETE, `/api/events/${id}`)
            .then(() => this.emit('api.delete.event', id));
    }

    getAllEvents(
        { startDate, endDate }: { startDate: Date, endDate: Date },
    ): Promise<Array<CalendarEvent>> {
        const qStartDate = startDate ? startDate.toJSON() : '';
        const qEndDate = endDate ? endDate.toJSON() : '';
        return this.http(HTTPMethod.GET, `/api/events/?startDate=${qStartDate}&endDate=${qEndDate}`)
            .then(DataConverter.eventsFromJSON);
    }
}

export default ApiService;
