import '../css/app.css';
import '../css/dialog.css';
import '../css/message.css';

import EventEmitter from './emitter';
import Calendar from './calendar';
import CalendarModel from './calendar_model';
import Dialog from './dialog';
import ApiService from './api';

import { setupEvents } from './document_events';

import { showMessage } from './message';
import CalendarHeading from './calendar_heading';
import { parseISO } from './date_utils';

const eventEmitter = new EventEmitter();
const apiService = new ApiService(eventEmitter);

const calendarModel = new CalendarModel();

const calendarHeading = new CalendarHeading({
    element: document.querySelector('.calendar-heading-wrapper'),
    model: calendarModel,
});

const calendar = new Calendar({
    element: document.querySelector('.calendar'),
    model: calendarModel,
    api: apiService,
});

eventEmitter.subscribe('dialog.close', calendar.deselectAllIntervals);

eventEmitter.subscribe('interval.drop', el => {
    apiService.patchEvent(el.dataset.id, {
        startDate: parseISO(el.dataset.startDate),
        endDate: parseISO(el.dataset.endDate),
    });
});

eventEmitter.subscribe('interval.resize', el => {
    apiService.patchEvent(el.dataset.id, {
        endDate: parseISO(el.dataset.endDate),
    });
})

eventEmitter.subscribe('api.patch.event', calendar.updateInterval);

eventEmitter.subscribe('api.patch.event.error', ({id}) => {
    apiService.getEvent(id).then(calendar.updateInterval);
});

eventEmitter.subscribe('api.delete.event', calendar.removeInterval);

eventEmitter.subscribe('api.post.event', calendar.updateInterval);

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    emitter: eventEmitter,
    api: apiService,
});

setupEvents({dialog, eventEmitter, calendar});

calendarModel.setCurrentMonth(new Date());





// window.addEventListener('error', e => {
//     showMessage(e.message);
//     e.preventDefault();
// });
