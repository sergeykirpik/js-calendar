import '../css/app.css';
import '../css/dialog.css';
import '../css/message.css';

import EventEmitter from './event-emitter';

import { setupEvents } from './events';

import { updateCalendarCells, renderCalendar, deselectAllIntervals, updateInterval, removeInterval, appendInterval } from './calendar';
import Dialog from './dialog';
import ApiService from './api';
import { showMessage } from './message';

const eventEmitter = new EventEmitter();
const apiService = new ApiService(eventEmitter);

eventEmitter.subscribe('dialog.close', () => deselectAllIntervals());

eventEmitter.subscribe('interval.dragging.stop', el => {
    apiService.patchEvent(el.dataset.id, {
        startDate: new Date(el.dataset.startDate),
        endDate: new Date(el.dataset.endDate),
    });
});

eventEmitter.subscribe('api.patch.event', updateInterval);

eventEmitter.subscribe('api.delete.event', removeInterval);

eventEmitter.subscribe('api.post.event', appendInterval);

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    emitter: eventEmitter,
    api: apiService,
});

updateCalendarCells();

setupEvents(dialog, eventEmitter);

window.addEventListener('error', e => {
    showMessage(e.message);
    e.preventDefault();
});

apiService.getAllEvents().then(renderCalendar);



