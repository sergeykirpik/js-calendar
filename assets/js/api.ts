import { die } from './utils/assertion_utils';
import { showMessage } from './utils/message_utils';
import EventEmitter from './emitter';
import CalendarEvent from './model/calendar_event';
import CalendarEventPatch from './model/calendar_event_patch';
import CalendarEventJson from './model/calendar_event_json';
import DateInterval from './types/date_interval';

enum HTTPMethod {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete'
}

function http(method: HTTPMethod, endpoint: string, data = {}): Promise<unknown> {
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
      return Promise.reject(err);
    });
}

class ApiService extends EventEmitter {

  getEvent(id: string): Promise<CalendarEvent> {
    return (http(HTTPMethod.GET, `/api/events/${id}`) as Promise<CalendarEventJson>)
      .then(CalendarEvent.eventFromJSON);
  }

  patchEvent(id: string, body: CalendarEventPatch): void {
    (http(HTTPMethod.PATCH, `/api/events/${id}`, body) as Promise<CalendarEventJson>)
      .then(CalendarEvent.eventFromJSON)
      .then((data) => this.emit('api.patch.event', data))
      .catch((error) => this.emit('api.patch.event.error', { id, error }));
  }

  postEvent(body: CalendarEventPatch): void {
    (http(HTTPMethod.POST, '/api/events/', body) as Promise<CalendarEventJson>)
      .then(CalendarEvent.eventFromJSON)
      .then((data) => this.emit('api.post.event', data));
  }

  deleteEvent(id: string): void {
    http(HTTPMethod.DELETE, `/api/events/${id}`)
      .then(() => this.emit('api.delete.event', id));
  }

  getAllEvents(
    { startDate, endDate }: DateInterval,
  ): Promise<Array<CalendarEvent>> {
    const qStartDate = startDate ? startDate.toJSON() : '';
    const qEndDate = endDate ? endDate.toJSON() : '';

    return (http(
      HTTPMethod.GET,
      `/api/events/?startDate=${qStartDate}&endDate=${qEndDate}`
    ) as Promise<CalendarEventJson[]>)
      .then(CalendarEvent.eventArrayFromJSON);
  }
}

export default ApiService;
