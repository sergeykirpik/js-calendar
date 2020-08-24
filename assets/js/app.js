import '../css/app.css';
import '../css/dialog.css';


import EventEmitter from './event-emitter'

import { setupEvents } from './events';

import { updateCalendarCells, renderCalendar, deselectAllIntervals } from './calendar';
import { Dialog } from './dialog';


function loadData() {

    fetch('/api/events')
        .then(response => {
            return response.json()
        })
        .then(data => {
            renderCalendar(data.data);
        })
        .catch(reason => {
            console.error(reason);
        })
    ;
}

const eventEmitter = new EventEmitter();

eventEmitter.subscribe('dialog.close', () => deselectAllIntervals());

const dialog = new Dialog(document.querySelector('.dialog'), eventEmitter);



updateCalendarCells();

setupEvents(dialog);

loadData();


