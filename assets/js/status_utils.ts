import { parseISO, dateDiffHuman, dateDiffInDays } from './date_utils';
import Calendar from './calendar.ts';

function isEventInProgress({ startDate, endDate }: { startDate: Date, endDate: Date }): boolean {
  const now = Date.now();
  return (now >= startDate && now <= endDate);
}

function isEventDone({ endDate }: { endDate: Date }): boolean {
  return (Date.now() > endDate.getTime());
}

function isEventNew({ startDate }: { startDate: Date }): boolean {
  return (Date.now() < startDate);
}

function setupLiveStatusUpdate(calendar: Calendar): void {
  function handleTimeout() {
    calendar.element.querySelectorAll('.calendar-interval').forEach((el) => {
      const startDate = parseISO(el.dataset.startDate);
      const endDate = parseISO(el.dataset.endDate);
      const isCanceled = el.dataset.canceled;
      const now = Date.now();
      let status = '';
      if (isCanceled) {
        status = '[ canceled ]';
      } else if (isEventDone({ endDate })) {
        status = '[ done ]';
      } else if (isEventInProgress({ startDate, endDate })) {
        status = '[ in-progress ]';
      } else if (isEventNew({ startDate })) {
        if (dateDiffInDays(new Date(now), startDate) < 2) {
          status = `[ starts in  ${dateDiffHuman(new Date(now), startDate)} ]`;
        } else {
          status = '[ new ]';
        }
      }
      el.querySelector('.status-label').textContent = status;
    });
    setTimeout(handleTimeout, 1000);
  }
  setTimeout(handleTimeout, 1000);
}

export {
  setupLiveStatusUpdate, isEventNew, isEventInProgress, isEventDone,
};
