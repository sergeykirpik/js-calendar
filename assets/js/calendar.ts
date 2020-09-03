/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable no-plusplus */
import {
  startOfMonth,
  startOfNextMonth,
  addDays,
  isToday,
  toLocalISODate,
  dateDiffInDays,
  toLocalISODateAndTime,
  parseISO,
} from './date_utils';

import {
  setElementColor,
} from './color_utils';
import CalendarModel from './calendar_model';
import { die, inRange, currentUser } from './utils';
import EventEmitter from './emitter';

const CALENDAR_INTERVAL_VGAP = 2;
const RESIZE_OFFSET = 10;

class Calendar extends EventEmitter {
  /**
     *
     * @param {{model: CalendarModel, element: Element}} params
     */
  constructor({ model, element }) {
    super();

    /** @type CalendarModel */
    this.model = model || new CalendarModel();
    /** @type Element */
    this.element = element || die('parameter element is required');

    this.lockUpdates = false;

    this.render = this.render.bind(this);
    this.updateInterval = this.updateInterval.bind(this);
    this.removeInterval = this.removeInterval.bind(this);
    this.deselectAllIntervals = this.deselectAllIntervals.bind(this);
    this.fixIntervalPosition = this.fixIntervalPosition.bind(this);

    this.setupEvents();
  }
}

Calendar.prototype.updatesAllowed = function () {
  return !this.lockUpdates;
};

Calendar.prototype.render = function (data) {
  this.element.querySelectorAll('.calendar-interval').forEach((el) => el.remove());

  this.updateCalendarCells();

  for (let i = 0; i < data.length; i++) {
    const curr = this.indexesFromJson(data[i]);

    if (curr.startIdx > this.cellIndexFromDate(this.model.getMaxDate())) {
      break;
    }

    if (curr.startIdx < this.cellIndexFromDate(this.model.getMinDate())) {
      // eslint-disable-next-line no-continue
      continue;
    }
    this.updateInterval(data[i]);
  }
};

/**
 *
 * @param {Date} date
 */
function formatDayLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]}, ${date.getDate()}`;
}

Calendar.prototype.updateCalendarCells = function () {
  const cells = this.element.querySelectorAll('.calendar-cell');

  const thisMonth = startOfMonth(this.model.getCurrentMonth());
  const nextMonth = startOfNextMonth(thisMonth);

  let currentDate = addDays(thisMonth, -thisMonth.getDay() + 1);

  for (let i = 0; i < cells.length; i++) {
    cells[i].dataset.date = toLocalISODate(currentDate);

    const dayLabel = cells[i].querySelector('.day-label');
    dayLabel.textContent = formatDayLabel(currentDate);

    dayLabel.className = 'day-label';
    if (currentDate >= thisMonth && currentDate < nextMonth) {
      dayLabel.classList.add('this-month');
    }
    if (isToday(currentDate)) {
      dayLabel.classList.add('today');
    }
    currentDate = addDays(currentDate, 1);
  }
};

Calendar.prototype.fixIntervalPosition = function (thisEl) {
  thisEl.style.marginTop = `${CALENDAR_INTERVAL_VGAP}px`;
  const calendarRow = this.getIntervalParentRow(thisEl);
  const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

  // eslint-disable-next-line no-restricted-syntax
  for (const otherEl of allIntevalsInRow) {
    if (thisEl === otherEl) {
      break;
    }
    const thisRect = thisEl.getBoundingClientRect();
    const otherRect = otherEl.getBoundingClientRect();

    if (thisEl !== otherEl) {
      if (otherRect.y + otherRect.height > thisRect.y) {
        if (inRange(otherRect.left, thisRect.left, thisRect.right)
                    || inRange(otherRect.right, thisRect.left, thisRect.right)
                    || inRange(thisRect.left, otherRect.left, otherRect.right)
                    || inRange(thisRect.right, otherRect.left, otherRect.right)
        ) {
          thisEl.style.marginTop = `${(parseInt(thisEl.style.marginTop, 10) || 0)
                        + otherRect.y + otherRect.height - thisRect.y + CALENDAR_INTERVAL_VGAP}px`;
        }
      }
    }
  }
};

Calendar.prototype.getIntervalParentRow = function (interval) {
  return interval.parentElement.parentElement.parentElement;
};

Calendar.prototype.findInterval = function (dataId) {
  return this.element.querySelector(`[data-id="${dataId}"]`);
};

Calendar.prototype.updateInterval = function (data) {
  if (this.lockUpdates) {
    return;
  }
  const cells = this.element.querySelectorAll('.calendar-cell');
  const curr = this.indexesFromJson(data);
  const cell = cells[curr.startIdx];

  let el = this.findInterval(data.id);

  el || (el = document.createElement('div'));

  const newContainer = cell.querySelector('.events-container');
  if (newContainer !== el.parentElement) {
    newContainer.appendChild(el);
  }
  el.className = 'calendar-interval ';
  if (data.author !== currentUser()) {
    el.classList.add('locked');
  }
  el.style.marginTop = `${CALENDAR_INTERVAL_VGAP}px`;
  // refactor this
  el.innerHTML = `
        <span class="status-label">[ ]</span>
        <span class="title-label">${data.title || 'Untitled event'}</span>
    `;
  el.dataset.id = data.id;
  if (!data.isCanceled) {
    delete el.dataset.canceled;
  } else {
    el.dataset.canceled = 1;
  }

  el.dataset.startDate = toLocalISODateAndTime(data.startDate);
  el.dataset.endDate = toLocalISODateAndTime(data.endDate);
  setElementColor(el, data.color);
  el.style.width = `${cell.offsetWidth + cell.offsetWidth * (curr.endIdx - curr.startIdx) - 5}px`;

  const inner = document.createElement('div');
  inner.className = 'interval-inner';
  el.insertBefore(inner, el.firstChild);

  this.fixAllIntervalsInRow(this.getIntervalParentRow(el));
};

Calendar.prototype.removeInterval = function (id) {
  if (this.lockUpdates) {
    return;
  }
  const el = this.findInterval(id);
  if (el) {
    const row = this.getIntervalParentRow(el);
    el.remove();
    this.fixAllIntervalsInRow(row);
  }
};

Calendar.prototype.deselectAllIntervals = function () {
  this.element.querySelectorAll('.selected.calendar-interval')
    .forEach((el) => el.classList.remove('selected'));
};
/**
 *
 * @param {Element} el
 */
Calendar.prototype.selectInterval = function (el) {
  this.deselectAllIntervals();
  el.classList.add('selected');
};

Calendar.prototype.unshadeAllCells = function () {
  this.element.querySelectorAll('.shaded.calendar-cell')
    .forEach((el) => el.classList.remove('shaded'));
};
/**
 *
 * @param {Element} el
 */
Calendar.prototype.shadeCell = function (el) {
  this.unshadeAllCells();
  el.classList.add('shaded');
};

Calendar.prototype.colIndexFromDate = function (date) {
  return this.cellIndexFromDate(date) % 7;
};

Calendar.prototype.fixAllIntervalsInRow = function (calendarRow) {
  calendarRow || die('calendarRow is required');
  calendarRow.classList.contains('calendar-row') || die('parameter calendarRow must be .calendar-row');

  const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

  allIntevalsInRow.forEach(this.fixIntervalPosition);
};

Calendar.prototype.rowIndexFromDate = function (date) {
  return Math.floor(this.cellIndexFromDate(date) / 7);
};

Calendar.prototype.indexesFromJson = function (data) {
  return {
    startRow: this.rowIndexFromDate(data.startDate),
    endRow: this.rowIndexFromDate(data.endDate),
    startCol: this.colIndexFromDate(data.startDate),
    endCol: this.colIndexFromDate(data.endDate),
    startIdx: this.cellIndexFromDate(data.startDate),
    endIdx: this.cellIndexFromDate(data.endDate),
  };
};
/**
 *
 * @param {Date} date
 */
Calendar.prototype.cellIndexFromDate = function (date) {
  return dateDiffInDays(this.model.getMinDate(), date);
};

Calendar.prototype.setupEvents = function () {
  let lastMouseDownEvent = null;
  let destinationParent = null;
  let itWasDragAndDrop = false;
  let itWasResize = false;

  const calendar = this;

  /** @param {MouseEvent} e */
  const handleDrag = function (e) {
    if (lastMouseDownEvent) {
      const { target, offsetX, offsetY } = lastMouseDownEvent;
      if (!target.classList.contains('dragging')) {
        target.classList.add('dragging');
      }
      target.style.left = `${e.clientX - offsetX}px`;
      target.style.top = `${e.clientY - offsetY - (parseInt(target.style.marginTop, 10) || 0)}px`;
    }
  };

  /** @param {MouseEvent} e */
  const handleDrop = function (e) {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDrop);

    calendar.lockUpdates = false;
    itWasDragAndDrop = e.clientX !== lastMouseDownEvent.clientX
            || e.clientY !== lastMouseDownEvent.clientY;
    if (itWasDragAndDrop) {
      const el = lastMouseDownEvent.target;
      const oldParentRow = calendar.getIntervalParentRow(el);
      destinationParent.appendChild(el);
      el.classList.remove('dragging');
      const newParentRow = calendar.getIntervalParentRow(el);
      calendar.fixAllIntervalsInRow(newParentRow);
      if (oldParentRow !== newParentRow) {
        calendar.fixAllIntervalsInRow(oldParentRow);
      }

      lastMouseDownEvent = null;
      const parentCell = destinationParent.parentElement;

      const startDate = parseISO(el.dataset.startDate);
      const endDate = parseISO(el.dataset.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();

      const newStartDate = parseISO(parentCell.dataset.date);
      newStartDate.setHours(startDate.getHours());
      newStartDate.setMinutes(startDate.getMinutes());

      el.dataset.startDate = toLocalISODateAndTime(newStartDate);
      el.dataset.endDate = toLocalISODateAndTime(new Date(newStartDate.getTime() + timeDiff));
      calendar.emit('interval.drop', el);
    }
  };

  /** @param {MouseEvent} e */
  const doResizing = function (e) {
    if (lastMouseDownEvent) {
      const { target, offsetX, clientX } = lastMouseDownEvent;
      target.style.width = `${offsetX + (e.clientX - clientX)}px`;
    }
  };

  /** @param {MouseEvent} e */
  const stopResizing = function () {
    document.removeEventListener('mousemove', doResizing);
    document.removeEventListener('mouseup', stopResizing);

    calendar.lockUpdates = false;
    const el = lastMouseDownEvent.target;
    const endDate = parseISO(el.dataset.endDate);
    const newEndDate = parseISO(destinationParent.parentElement.dataset.date);
    newEndDate.setHours(endDate.getHours());
    newEndDate.setMinutes(endDate.getMinutes());

    el.dataset.endDate = toLocalISODateAndTime(newEndDate);
    calendar.emit('interval.resize', el);
    itWasResize = true;
    lastMouseDownEvent = null;
  };

  /** @param {MouseEvent} e */
  const handleMouseDown = function (evt) {
    if (evt.button !== 0) {
      return;
    }
    itWasDragAndDrop = false;
    itWasResize = false;

    const e = {
      target: evt.target,
      clientX: evt.clientX,
      clientY: evt.clientY,
    };
    if (e.target.parentElement.classList.contains('calendar-interval')) {
      e.target = e.target.parentElement;
    }
    if (e.target.classList.contains('calendar-interval')) {
      const rect = e.target.getBoundingClientRect();
      e.offsetX = e.clientX - rect.x;
      e.offsetY = e.clientY - rect.y;
      lastMouseDownEvent = e;
      if (rect.width - e.offsetX < RESIZE_OFFSET) {
        document.addEventListener('mousemove', doResizing);
        document.addEventListener('mouseup', stopResizing);
      } else {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDrop);
      }
      calendar.lockUpdates = true;
    }
  };
  calendar.element.addEventListener('mousedown', handleMouseDown);

  const handleClick = function (evt) {
    if (itWasDragAndDrop || itWasResize) {
      return;
    }
    const e = {
      target: evt.target,
    };
    if (e.target.parentElement.classList.contains('calendar-interval')) {
      e.target = e.target.parentElement;
    }
    if (e.target.classList.contains('calendar-interval')) {
      calendar.selectInterval(e.target);
      calendar.emit('calendar.interval.click', e.target);
    } else if (e.target.classList.contains('calendar-cell')) {
      calendar.emit('calendar.cell.click', e.target);
    }
  };
  calendar.element.addEventListener('click', handleClick);

  const handleMouseMove = function (e) {
    if (e.target.classList.contains('calendar-interval')) {
      e.target.style.cursor = 'pointer';

      const rect = e.target.getBoundingClientRect();
      if (rect.width - e.offsetX < RESIZE_OFFSET) {
        e.target.style.cursor = 'col-resize';
      }
    }
    document.elementsFromPoint(e.clientX, e.clientY).forEach((el) => {
      if (el.classList.contains('calendar-cell')) {
        // TODO: refactor this
        calendar.shadeCell(el);
        destinationParent = el.querySelector('.events-container');
      }
    });
  };
  calendar.element.addEventListener('mousemove', handleMouseMove);
};

export default Calendar;
