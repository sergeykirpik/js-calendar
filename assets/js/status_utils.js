import { parseISO, dateDiffHuman, dateDiffInDays } from './date_utils';

function isEventInProgress({ startDate, endDate }) {
  const now = Date.now();
  return (now >= startDate && now <= endDate);
}

function isEventDone({ endDate }) {
  return (Date.now() > endDate.getTime());
}

function isEventNew({ startDate }) {
  return (Date.now() < startDate);
}

function setupLiveStatusUpdate(calendar) {
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
