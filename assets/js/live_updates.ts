/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { parseISO } from './utils/date_utils';
import Calendar from './calendar';
import IntervalElement from './types/interval_element';
import CalendarEvent from './model/calendar_event';
import ApiService from './api';

const STATUS_UPDATE_INTERVAL = 1000;
const DATA_UPDATE_TIMEOUT = 5000;

function setupLiveStatusUpdate(calendar: Calendar): void {
  function handleTimeout() {
    calendar.element.querySelectorAll('.calendar-interval').forEach((el1) => {
      const el = el1 as IntervalElement;
      const calendarEvent = new CalendarEvent({
        startDate: parseISO(el.dataset.startDate),
        endDate: parseISO(el.dataset.endDate),
        isCanceled: !!el.dataset.canceled,
      });
      el.querySelector('.status-label')!.textContent = calendarEvent.getCurrentStatus();
    });
    setTimeout(handleTimeout, STATUS_UPDATE_INTERVAL);
  }
  setTimeout(handleTimeout, STATUS_UPDATE_INTERVAL);
}

function setupLiveCalendarUpdate({
  calendar, initialData, apiService, updateTimeout = DATA_UPDATE_TIMEOUT
}: { calendar: Calendar, initialData: CalendarEvent[], apiService: ApiService, updateTimeout?: number }): void
{
  const oldData: Record<string, CalendarEvent> = {};
  initialData.forEach((event) => {
    oldData[event.id] = event;
  });

  function handleTimeout() {
    if (!calendar.updatesAllowed()) {
      setTimeout(handleTimeout, updateTimeout);
      return;
    }
    apiService.getAllEvents({
      startDate: calendar.getModel().getMinDate(),
      endDate: calendar.getModel().getMaxDate(),
    })
      .then((events) => {
        const currentData: Record<string, CalendarEvent> = {};
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
      .then(() => setTimeout(handleTimeout, updateTimeout));
  }
  setTimeout(handleTimeout, updateTimeout);
}

export {
  setupLiveStatusUpdate, setupLiveCalendarUpdate
};
