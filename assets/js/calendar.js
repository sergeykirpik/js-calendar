import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    toLocalISODate,
    diffInDays,
    toLocalISODateAndTime,
} from './date_utils';

import {
    setElementColor,
} from './color_utils';
import CalendarModel from './calendar_model';
import ApiService from './api';
import { die, inRange, currentUser } from './utils';

const CALENDAR_INTERVAL_VGAP = 2;

class Calendar {
    /**
     *
     * @param {model: CalendarModel, element: Element, api: ApiService} param0
     */
    constructor({model, element, api}) {
        /** @type CalendarModel */
        this.model_ = model || new CalendarModel();
        /** @type Element */
        this.element_ = element || die('parameter element is required');
        /** @type ApiService */
        this.api_ = api || die('parameter api is required');

        this.render = this.render.bind(this);
        this.updateInterval = this.updateInterval.bind(this);
        this.removeInterval = this.removeInterval.bind(this);
        this.deselectAllIntervals = this.deselectAllIntervals.bind(this);
        this.fixIntervalPosition = this.fixIntervalPosition.bind(this);

        this.setupEvents();
    }
}

Calendar.prototype.setupEvents = function() {
    this.model_.subscribe('calendar-model.change', (model) => {
        this.api_.getAllEvents({
            startDate: model.getMinDate(),
            endDate: model.getMaxDate(),
        }).then(this.render);
    });
}

Calendar.prototype.render = function(data) {

    this.element_.querySelectorAll('.calendar-interval').forEach(el => el.remove());

    this.updateCalendarCells();

    for (let i = 0; i < data.length; i++) {
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

/**
 *
 * @param {Date} date
 */
function formatDayLabel(date) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[date.getMonth()] + ', ' + date.getDate();
}

Calendar.prototype.updateCalendarCells = function() {
    const cells = this.element_.querySelectorAll('.calendar-cell');

    const thisMonth = startOfMonth(this.model_.getCurrentMonth());
    const nextMonth = startOfNextMonth(thisMonth);

    let currentDate = addDays(thisMonth, -thisMonth.getDay()+1);

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
    el.dataset.startDate = toLocalISODateAndTime(data['startDate']);
    el.dataset.endDate = toLocalISODateAndTime(data['endDate']);
    setElementColor(el, data['color']);
    el.style.width = cell.offsetWidth + cell.offsetWidth * (curr.endIdx - curr.startIdx) - 5 + 'px';

    const inner = document.createElement('div');
    inner.className = 'interval-inner';
    el.insertBefore(inner, el.firstChild);

    this.fixAllIntervalsInRow(this.getIntervalParentRow(el));

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

Calendar.prototype.colIndexFromDate = function(date) {
    return this.cellIndexFromDate(date) % 7;
}

Calendar.prototype.fixAllIntervalsInRow = function(calendarRow) {
    calendarRow || die('calendarRow is required');
    calendarRow.classList.contains('calendar-row') || die('parameter calendarRow must be .calendar-row');

    const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

    allIntevalsInRow.forEach(this.fixIntervalPosition);
}

Calendar.prototype.rowIndexFromDate = function(date) {
    return Math.floor(this.cellIndexFromDate(date) / 7);
}

Calendar.prototype.indexesFromJson = function(data) {
    return {
        startRow: this.rowIndexFromDate(data['startDate']),
        endRow: this.rowIndexFromDate(data['endDate']),
        startCol: this.colIndexFromDate(data['startDate']),
        endCol: this.colIndexFromDate(data['endDate']),
        startIdx: this.cellIndexFromDate(data['startDate']),
        endIdx: this.cellIndexFromDate(data['endDate'])
    };
}
/**
 *
 * @param {Date} date
 */
Calendar.prototype.cellIndexFromDate = function(date) {
    return diffInDays(this.model_.getMinDate(), date);
}

export default Calendar;
