import '../css/app.css';
import '../css/dialog.css';

import EventEmitter from './event-emitter';

import { setupEvents } from './events';

import { updateCalendarCells, renderCalendar, deselectAllIntervals } from './calendar';
import Dialog from './dialog';
import ApiService from './api';

const eventEmitter = new EventEmitter();
const apiService = new ApiService(eventEmitter);

eventEmitter.subscribe('dialog.close', () => deselectAllIntervals());

eventEmitter.subscribe('interval.dragging.stop', el => {
    apiService.patchEvent(el.dataset.id, {
        startDate: new Date(el.dataset.startDate),
        endDate: new Date(el.dataset.endDate),
    });
});

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    emitter: eventEmitter,
    api: apiService,
});

updateCalendarCells();

setupEvents(dialog, eventEmitter);

apiService.getAllEvents().then(renderCalendar);



