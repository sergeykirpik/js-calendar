import '../css/app.css';

import Calendar from './calendar';
import CalendarModel from './calendar_model';
import Dialog from './dialog';
import ApiService from './api';

import CalendarHeading from './calendar_heading';
import { parseISO } from './utils/date_utils';
import { setupLiveStatusUpdate, setupLiveCalendarUpdate } from './live_updates';
import { die } from './utils/assertion_utils';
import IntervalElement from './types/interval_element';
import CalendarCellElement from './types/cell_element';
import { showMessage } from './message_utils';

window.addEventListener('error', e => {
  showMessage('!!' + e.message);
});

const apiService = new ApiService();

const calendarModel = new CalendarModel();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calendarHeading = new CalendarHeading({
  element: document.querySelector('.calendar-heading-wrapper') || die(),
  model: calendarModel,
});

const dialog = new Dialog({
  element: document.querySelector('.dialog') || die(),
  api: apiService,
});

const calendar = new Calendar({
  element: document.querySelector('.calendar') || die(),
  model: calendarModel,
});

dialog.subscribe('dialog.close', calendar.deselectAllIntervals);

calendar.subscribe<IntervalElement>('interval.drop', (el) => {
  apiService.patchEvent(el.dataset.id, {
    startDate: parseISO(el.dataset.startDate),
    endDate: parseISO(el.dataset.endDate),
  });
});

calendar.subscribe<IntervalElement>('interval.resize', (el) => {
  apiService.patchEvent(el.dataset.id, {
    endDate: parseISO(el.dataset.endDate),
  });
});

calendar.subscribe<IntervalElement>('calendar.interval.click', (el) => {
  dialog.openDialog({ id: el.dataset.id });
});

calendar.subscribe<CalendarCellElement>('calendar.cell.click', (el) => {
  if (dialog.isHidden()) {
    dialog.openDialog({ startDate: parseISO(el.dataset.date) });
  } else {
    calendar.deselectAllIntervals();
    dialog.closeDialog();
  }
});

apiService.subscribe('api.patch.event', calendar.updateInterval);

apiService.subscribe('api.patch.event.error', ({ id }: { id: string }) => {
  apiService.getEvent(id).then(calendar.updateInterval);
});

apiService.subscribe('api.delete.event', calendar.removeInterval);

apiService.subscribe('api.post.event', calendar.updateInterval);

calendarModel.subscribe('calendar-model.change', (model: CalendarModel) => {
  apiService.getAllEvents({
    startDate: model.getMinDate(),
    endDate: model.getMaxDate(),
  }).then(calendar.render);
});
calendarModel.setCurrentMonth(new Date());

setupLiveStatusUpdate(calendar);

apiService.getAllEvents({
  startDate: calendarModel.getMinDate(),
  endDate: calendarModel.getMaxDate(),
})
  .then((data) => setupLiveCalendarUpdate({
    calendar,
    initialData: data,
    apiService,
    updateTimeout: 10000,
  }));
