import '../css/app.css';
import '../css/dialog.css';
import '../css/message.css';

import EventEmitter from './emitter';
import Calendar from './calendar';
import CalendarModel from './calendar_model';
import Dialog from './dialog';
import ApiService from './api';

import { showMessage } from './message';
import CalendarHeading from './calendar_heading';
import { parseISO, dateDiffHuman, dateDiffInDays } from './date_utils';
import { isEventDone, isEventInProgress, isEventNew } from './status_utils';

const eventEmitter = new EventEmitter();
const apiService = new ApiService(eventEmitter);

const calendarModel = new CalendarModel();

const calendarHeading = new CalendarHeading({
    element: document.querySelector('.calendar-heading-wrapper'),
    model: calendarModel,
});

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    emitter: eventEmitter,
    api: apiService,
});

const calendar = new Calendar({
    element: document.querySelector('.calendar'),
    model: calendarModel,
    api: apiService,
    dialog
});

eventEmitter.subscribe('dialog.close', calendar.deselectAllIntervals);

calendar.subscribe('interval.drop', el => {
    apiService.patchEvent(el.dataset.id, {
        startDate: parseISO(el.dataset.startDate),
        endDate: parseISO(el.dataset.endDate),
    });
});

calendar.subscribe('interval.resize', el => {
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

calendarModel.setCurrentMonth(new Date());


function handleTimeout() {
    calendar.element_.querySelectorAll('.calendar-interval').forEach(el => {
        const startDate = parseISO(el.dataset.startDate);
        const endDate = parseISO(el.dataset.endDate);
        const isCanceled = el.dataset.canceled;
        const now = Date.now();
        let status = '';
        if (isCanceled) {
            status = '[ canceled ]'
        }
        else if (isEventDone({endDate})) {
            status = '[ done ]';
        }
        else if (isEventInProgress({startDate, endDate})) {
            status = '[ in-progress ]';
        }
        else if (isEventNew({startDate})) {
            if (dateDiffInDays(new Date(now), startDate) < 2) {
                status = `[ starts in  ${dateDiffHuman(new Date(now), startDate)} ]`;
            }
        }
        el.querySelector('.status-label').textContent = status;
    });
    setTimeout(handleTimeout, 1000);
}
setTimeout(handleTimeout, 1000);



// window.addEventListener('error', e => {
//     showMessage(e.message);
//     e.preventDefault();
// });
