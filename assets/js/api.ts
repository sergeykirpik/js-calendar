/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import { die } from './utils.ts';
import { showMessage } from './message.ts';
import DataConverter from './data_converter.ts';
import EventEmitter from './emitter.ts';

enum HTTPMethod {
  GET = 'get',
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete'
}

interface CalendarPatch {
  id: string,
}

interface CalendarEvent {
  id: string,
}

class ApiService extends EventEmitter {
  http(method: HTTPMethod, endpoint: string, data = {}): void {
    const headers = { 'Content-Type': 'application/json' };
    const options: RequestInit = { method, headers };
    if (method !== HTTPMethod.GET) {
      options.body = JSON.stringify(data);
    }
    return fetch(endpoint, options)
      .then((response) => {
        if (response.redirected) {
          window.location = response.url;
          return;
        }

        response.headers.get('Content-Type') === 'application/json' || die('Invalid Content-Type');

        // eslint-disable-next-line consistent-return
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

  getEvent(id: string): Promise {
    return this.http(HTTPMethod.GET, `/api/events/${id}`).then(DataConverter.eventFromJSON);
  }

  patchEvent(id: string, body: CalendarPatch): Promise {
    return this.http(HTTPMethod.PATCH, `/api/events/${id}`, body)
      .then(DataConverter.eventFromJSON)
      .then((data) => this.emit('api.patch.event', data))
      .catch((error) => this.emit('api.patch.event.error', { id, error }));
  }

  postEvent(body: CalendarEvent): Promise {
    return this.http(HTTPMethod.POST, '/api/events/', body)
      .then(DataConverter.eventFromJSON)
      .then((data) => this.emit('api.post.event', data));
  }

  deleteEvent(id: string): Promise {
    id || die('Invalid id');
    return this.http(HTTPMethod.DELETE, `/api/events/${id}`)
      .then(() => this.emit('api.delete.event', id));
  }

  getAllEvents(
    { startDate, endDate }: { startDate: Date, endDate: Date },
  ): Promise {
    const qStartDate = startDate ? startDate.toJSON() : '';
    const qEndDate = endDate ? endDate.toJSON() : '';
    return this.http(HTTPMethod.GET, `/api/events/?startDate=${qStartDate}&endDate=${qEndDate}`)
      .then(DataConverter.eventsFromJSON);
  }
}

export default ApiService;
