import '../css/app.css';
import '../css/dialog.css';
import '../css/message.css';

import Calendar from './calendar';
import CalendarModel from './calendar_model';
import Dialog from './dialog';
import ApiService from './api';

import CalendarHeading from './calendar_heading';
import { parseISO } from './date_utils';
import { setupLiveStatusUpdate } from './status_utils';

const apiService = new ApiService();

const calendarModel = new CalendarModel();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
});

dialog.subscribe('dialog.close', calendar.deselectAllIntervals);

calendar.subscribe('interval.drop', (el) => {
  apiService.patchEvent(el.dataset.id, {
    startDate: parseISO(el.dataset.startDate),
    endDate: parseISO(el.dataset.endDate),
  });
});

calendar.subscribe('interval.resize', (el) => {
  apiService.patchEvent(el.dataset.id, {
    endDate: parseISO(el.dataset.endDate),
  });
});

calendar.subscribe('calendar.interval.click', (el) => {
  dialog.openDialog({ id: el.dataset.id });
});

calendar.subscribe('calendar.cell.click', (el) => {
  if (dialog.isHidden()) {
    dialog.openDialog({ startDate: parseISO(el.dataset.date) });
  } else {
    calendar.deselectAllIntervals();
    dialog.closeDialog();
  }
});

apiService.subscribe('api.patch.event', calendar.updateInterval);

apiService.subscribe('api.patch.event.error', ({ id }) => {
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

// eslint-disable-next-line no-shadow
function setupLiveCalendarUpdate(calendar, initialData) {
  const UPDATE_TIMEOUT = 1000;

  const oldData = {};
  initialData.forEach((event) => {
    oldData[event.id] = event;
  });

  function handleTimeout() {
    if (!calendar.updatesAllowed()) {
      setTimeout(handleTimeout, UPDATE_TIMEOUT);
      return;
    }
    apiService.getAllEvents({
      startDate: calendarModel.getMinDate(),
      endDate: calendarModel.getMaxDate(),
    })
      .then((events) => {
        const currentData = {};
        events.forEach((event) => {
          let needUpdate = true;
          const oldEvent = oldData[event.id];
          if (oldEvent) {
            needUpdate = oldEvent.title !== event.title
                        || oldEvent.startDate.getTime() !== event.startDate.getTime()
                        || oldEvent.endDate.getTime() !== event.endDate.getTime()
                        || oldEvent.isCanceled !== event.isCanceled
                        || oldEvent.color !== event.color;
          }
          if (needUpdate) {
            // console.log('update');
            calendar.updateInterval(event);
          }
          currentData[event.id] = event;
          oldData[event.id] = event;
        });
        Object.keys(oldData).forEach((id) => {
          if (!currentData[id]) {
            calendar.removeInterval(id);
            delete oldData[id];
          }
        });
      })
      .then(() => setTimeout(handleTimeout, UPDATE_TIMEOUT));
  }
  setTimeout(handleTimeout, UPDATE_TIMEOUT);
}

apiService.getAllEvents({
  startDate: calendarModel.getMinDate(),
  endDate: calendarModel.getMaxDate(),
})
  .then((data) => setupLiveCalendarUpdate(calendar, data));
