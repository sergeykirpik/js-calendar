import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    toLocalISODate,
    diffInDays,
} from './date_utils';

import {
    setElementColor,
} from './color_utils';
import CalendarModel from './calendar_model';
import { die, inRange, currentUser } from './utils';

const CALENDAR_INTERVAL_VGAP = 2;

class Calendar {
    constructor({model, element}) {
        this.model_ = model || new CalendarModel();
        this.element_ = element || die('Calendar(): element is required');

        this.render = this.render.bind(this);
        this.colIndexFromJson = this.colIndexFromJson.bind(this);
        this.updateInterval = this.updateInterval.bind(this);
        this.removeInterval = this.removeInterval.bind(this);
        this.deselectAllIntervals = this.deselectAllIntervals.bind(this);
        this.fixIntervalPosition = this.fixIntervalPosition.bind(this);
    }
}

Calendar.prototype.fixIntervalPosition = function(thisEl) {
    thisEl.style.marginTop = CALENDAR_INTERVAL_VGAP + 'px';
    const calendarRow = this.getIntervalParentRow(thisEl);
    const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

    for (let otherEl of allIntevalsInRow) {

        if (thisEl === otherEl) {
            break;
        }
        let thisRect = thisEl.getBoundingClientRect();
        let otherRect = otherEl.getBoundingClientRect();

        if (thisEl !== otherEl) {
            if (otherRect.y + otherRect.height > thisRect.y) {
                if (inRange(otherRect.left, thisRect.left, thisRect.right)
                    || inRange(otherRect.right, thisRect.left, thisRect.right)
                    || inRange(thisRect.left, otherRect.left, otherRect.right)
                    || inRange(thisRect.right, otherRect.left, otherRect.right)
                ) {
                    thisEl.style.marginTop = (parseInt(thisEl.style.marginTop, 10) || 0) +
                        otherRect.y + otherRect.height - thisRect.y + CALENDAR_INTERVAL_VGAP + 'px';
                }
            }
        }
    }
}

Calendar.prototype.getIntervalParentRow = function(interval) {
    return interval.parentElement.parentElement.parentElement;
}

Calendar.prototype.findInterval = function(dataId) {
    return this.element_.querySelector(`[data-id="${dataId}"]`);
}

Calendar.prototype.updateInterval = function(data) {
    const cells = this.element_.querySelectorAll('.calendar-cell');
    const curr = this.indexesFromJson(data);
    const cell = cells[curr.startIdx];

    let el = this.findInterval(data.id);

    el || (el = document.createElement('div'));

    const newContainer = cell.querySelector('.events-container')
    if (newContainer !== el.parentElement) {
        newContainer.appendChild(el);
    }
    el.className = 'calendar-interval ';
    if (data['author'] !== currentUser()) {
        el.classList.add('locked');
    }
    el.style.marginTop = CALENDAR_INTERVAL_VGAP + 'px';
    el.textContent = data['title'] || 'Untitled event';
    el.dataset.id = data['id'];
    el.dataset.startDate = toLocalISODate(data['startDate']);
    el.dataset.endDate = toLocalISODate(data['endDate']);
    setElementColor(el, data['color']);
    el.style.width = cell.offsetWidth + cell.offsetWidth * (curr.endIdx - curr.startIdx) - 5 + 'px';

    this.fixIntervalPosition(el);

    return el;
}

Calendar.prototype.removeInterval = function(id) {
    const el = this.findInterval(id);
    if (el) {
        const row = this.getIntervalParentRow(el);
        el.remove();
        this.fixAllIntervalsInRow(row);
    }
}

Calendar.prototype.deselectAllIntervals = function() {
    this.element_.querySelectorAll('.selected.calendar-interval')
        .forEach(el => el.classList.remove('selected'))
    ;
}
/**
 *
 * @param {Element} el
 */
Calendar.prototype.selectInterval = function(el) {
    this.deselectAllIntervals();
    el.classList.add('selected');
}

Calendar.prototype.unshadeAllCells = function() {
    this.element_.querySelectorAll('.shaded.calendar-cell')
        .forEach(el => el.classList.remove('shaded'))
    ;
}
/**
 *
 * @param {Element} el
 */
Calendar.prototype.shadeCell = function(el) {
    this.unshadeAllCells();
    el.classList.add('shaded');
}

Calendar.prototype.updateCalendarCells = function() {
    const cells = this.element_.querySelectorAll('.calendar-cell');

    const thisMonth = startOfMonth(new Date());
    const nextMonth = startOfNextMonth(thisMonth);

    let currentDate = addDays(thisMonth, -thisMonth.getDay()+1);

    for (let i = 0; i < cells.length; i++) {
        cells[i].dataset.date = toLocalISODate(currentDate);

        const dayLabel = cells[i].querySelector('.day-label');
        dayLabel.textContent = currentDate.getDate();
        if (currentDate >= thisMonth && currentDate < nextMonth) {
            dayLabel.classList.add('this-month');
        }
        if (isToday(currentDate)) {
            dayLabel.classList.add('today');
        }
        currentDate = addDays(currentDate, 1);
    }
}

Calendar.prototype.colIndexFromJson = function(jsonDate) {
    return this.cellIndexFromJson(jsonDate) % 7;
}

Calendar.prototype.render = function(data) {

    this.element_.querySelectorAll('.calendar-interval').forEach(el => el.remove());

    this.updateCalendarCells();

    for (let i = 0; i < data.length - 1; i++) {
        const curr = this.indexesFromJson(data[i]);

        if (curr.startIdx > this.cellIndexFromDate(this.model_.getMaxDate())) {
            break;
        }

        if (curr.startIdx < this.cellIndexFromDate(this.model_.getMinDate())) {
            continue;
        }
        this.updateInterval(data[i]);
    }
}

Calendar.prototype.fixAllIntervalsInRow = function(calendarRow) {
    calendarRow || die('calendarRow is required');
    calendarRow.classList.contains('calendar-row') || die('parameter calendarRow must be .calendar-row');

    const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

    allIntevalsInRow.forEach(this.fixIntervalPosition);
}


Calendar.prototype.rowIndexFromJson = function(jsonDate) {
    return Math.floor(this.cellIndexFromJson(jsonDate) / 7);
}

Calendar.prototype.indexesFromJson = function(data) {
    return {
        startRow: this.rowIndexFromJson(data['startDate']),
        endRow: this.rowIndexFromJson(data['endDate']),
        startCol: this.colIndexFromJson(data['startDate']),
        endCol: this.colIndexFromJson(data['endDate']),
        startIdx: this.cellIndexFromJson(data['startDate']),
        endIdx: this.cellIndexFromJson(data['endDate'])
    };
}
/**
 *
 * @param {Date} date
 */
Calendar.prototype.cellIndexFromDate = function(date) {
    return diffInDays(this.model_.getMinDate(), date);
}

Calendar.prototype.cellIndexFromJson = function(jsonDate) {
    return this.cellIndexFromDate(new Date(toLocalISODate(jsonDate)));
}

export default Calendar;
