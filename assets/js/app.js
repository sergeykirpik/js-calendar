import '../css/app.css';
import '../css/dialog.css';


import EventEmitter from './event-emitter';

import { setupEvents } from './events';

import { updateCalendarCells, renderCalendar, deselectAllIntervals, updateInterval } from './calendar';
import Dialog from './dialog';
import ApiService from './api';


const eventEmitter = new EventEmitter();
const apiService = new ApiService(eventEmitter);

eventEmitter.subscribe('dialog.close', () => deselectAllIntervals());

eventEmitter.subscribe('api.patch.event', updateInterval);

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    emitter: eventEmitter,
    api: apiService,
});

updateCalendarCells();

setupEvents(dialog);

apiService.getAllEvents().then(renderCalendar);



