/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import { die } from './utils';
import { showMessage } from './message';
import DataConverter from './data_converter';
import EventEmitter from './emitter';

const GET = 'get';
const POST = 'post';
const PATCH = 'patch';
const DELETE = 'delete';

class ApiService extends EventEmitter {
  http(method, endpoint, data = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (method !== GET) {
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

  getEvent(id) {
    return this.http(GET, `/api/events/${id}`).then(DataConverter.eventFromJSON);
  }

  patchEvent(id, body) {
    return this.http(PATCH, `/api/events/${id}`, body)
      .then(DataConverter.eventFromJSON)
      .then((data) => this.emit('api.patch.event', data))
      .catch((error) => this.emit('api.patch.event.error', { id, error }));
  }

  postEvent(body) {
    return this.http(POST, '/api/events/', body)
      .then(DataConverter.eventFromJSON)
      .then((data) => this.emit('api.post.event', data));
  }

  deleteEvent(id) {
    id || die('Invalid id');
    return this.http(DELETE, `/api/events/${id}`)
      .then(() => this.emit('api.delete.event', id));
  }

  getAllEvents({ startDate, endDate }) {
    const qStartDate = startDate ? startDate.toJSON() : '';
    const qEndDate = endDate ? endDate.toJSON() : '';
    return this.http(GET, `/api/events/?startDate=${qStartDate}&endDate=${qEndDate}`)
      .then(DataConverter.eventsFromJSON);
  }
}

export default ApiService;
