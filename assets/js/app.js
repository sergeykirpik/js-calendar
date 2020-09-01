import '../css/app.css';
import '../css/dialog.css';
import '../css/message.css';

import Calendar from './calendar';
import CalendarModel from './calendar_model';
import Dialog from './dialog';
import ApiService from './api';

import { showMessage } from './message';
import CalendarHeading from './calendar_heading';
import { parseISO } from './date_utils';
import { setupLiveStatusUpdate } from './status_utils';

const apiService = new ApiService();

const calendarModel = new CalendarModel();

const calendarHeading = new CalendarHeading({
    element: document.querySelector('.calendar-heading-wrapper'),
    model: calendarModel,
});

const dialog = new Dialog({
    element: document.querySelector('.dialog'),
    api: apiService,
});

const calendar = new Calendar({
    element: document.querySelector('.calendar'),
    model: calendarModel,
    dialog
});

dialog.subscribe('dialog.close', calendar.deselectAllIntervals);

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

apiService.subscribe('api.patch.event', calendar.updateInterval);

apiService.subscribe('api.patch.event.error', ({id}) => {
    apiService.getEvent(id).then(calendar.updateInterval);
});

apiService.subscribe('api.delete.event', calendar.removeInterval);

apiService.subscribe('api.post.event', calendar.updateInterval);

calendarModel.subscribe('calendar-model.change', (model) => {
    apiService.getAllEvents({
        startDate: model.getMinDate(),
        endDate: model.getMaxDate(),
    }).then(calendar.render);
});
calendarModel.setCurrentMonth(new Date());

setupLiveStatusUpdate(calendar);


// window.addEventListener('error', e => {
//     showMessage(e.message);
//     e.preventDefault();
// });
