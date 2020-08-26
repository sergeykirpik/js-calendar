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

const CALENDAR_INTERVAL_VGAP = 2;

function updateInterval(data) {
    const el = document.querySelector(`[data-id="${data.id}"]`);
    el.textContent = data.title;
    setElementColor(el, data.color);
}

function deselectAllIntervals() {
    document.querySelectorAll('.selected.calendar-interval')
        .forEach(el => el.classList.remove('selected'))
    ;
}

/**
 *
 * @param {Element} el
 */
function selectInterval(el) {
    deselectAllIntervals();
    el.classList.add('selected');
}

function unshadeAllCalendarCells() {
    document.querySelectorAll('.shaded.calendar-cell')
        .forEach(el => el.classList.remove('shaded'))
    ;
}

/**
 *
 * @param {Element} el
 */
function shadeCalendarCell(el) {
    unshadeAllCalendarCells();
    el.classList.add('shaded');
}

function updateCalendarCells() {

    const cells = document.querySelectorAll('.calendar-cell');

    const thisMonth = startOfMonth(new Date());
    const nextMonth = startOfNextMonth(thisMonth);

    let currentDate = addDays(thisMonth, -thisMonth.getDay()+1);

    for (let i = 0; i < cells.length; i++) {
        cells[i].dataset.date = currentDate.toISOString();

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

function minDate() {
    // TODO: calculate minDate
    return new Date('2020-07-27');
}

function maxDate() {
    // TODO: calculate maxDate
    return new Date('2020-09-06');
}

function colIndexFromJson(jsonDate) {
    return cellIndexFromJson(jsonDate) % 7;
}

function rowIndexFromJson(jsonDate) {
    return Math.floor(cellIndexFromJson(jsonDate) / 7);
}

function indexesFromJson(data) {
    return {
        startRow: rowIndexFromJson(data['startDate']),
        endRow: rowIndexFromJson(data['endDate']),
        startCol: colIndexFromJson(data['startDate']),
        endCol: colIndexFromJson(data['endDate']),
        startIdx: cellIndexFromJson(data['startDate']),
        endIdx: cellIndexFromJson(data['endDate'])
    };
}

function inRange(val, min, max) {
    return val >= min && val <= max;
}

function fixIntervalPosition(thisEl) {
    thisEl.style.marginTop = CALENDAR_INTERVAL_VGAP + 'px';
    const calendarRow = thisEl.parentElement.parentElement.parentElement;
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
                    // debugger;
                    thisEl.style.marginTop = (parseInt(thisEl.style.marginTop, 10) || 0) +
                        otherRect.y + otherRect.height - thisRect.y + CALENDAR_INTERVAL_VGAP + 'px';
                }
            }
        }
    }
}

function fixAllIntervalsInRow(thisEl) {
    const calendarRow = thisEl.parentElement.parentElement.parentElement;
    const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

    allIntevalsInRow.forEach(fixIntervalPosition);
}

function renderCalendar(data) {

    document.querySelectorAll('.calendar-interval').forEach(el => el.remove());

    const cells = document.querySelectorAll('.calendar-cell');
    const cell = cells[0];

    for (let i = 0; i < data.length - 1; i++) {
        const curr = indexesFromJson(data[i]);

        if (curr.startIdx > cellIndexFromDate(maxDate())) {
            break;
        }

        if (curr.startIdx < cellIndexFromDate(minDate())) {
            continue;
        }

        const el = document.createElement('div');
        el.className = 'calendar-interval ';
        el.style.width = cell.offsetWidth - 1 + 'px';
        el.style.marginTop = CALENDAR_INTERVAL_VGAP+'px';
        el.textContent = data[i]['title'];
        el.dataset.id = data[i]['id'];
        el.dataset.startDate = toLocalISODate(data[i]['startDate']);
        el.dataset.endDate = toLocalISODate(data[i]['endDate']);
        setElementColor(el, data[i]['color']);

        el.style.width = cell.offsetWidth + cell.offsetWidth * (curr.endIdx - curr.startIdx) - 5 + 'px';

        cells[curr.startIdx].querySelector('.events-container').appendChild(el);

        fixIntervalPosition(el);

    }
}


/**
 *
 * @param {Date} date
 */
function cellIndexFromDate(date) {
    return diffInDays(minDate(), date);
}

function cellIndexFromJson(jsonDate) {
    return cellIndexFromDate(new Date(toLocalISODate(jsonDate)));
}


export {
    deselectAllIntervals, selectInterval, unshadeAllCalendarCells, shadeCalendarCell,
    updateCalendarCells, updateInterval, renderCalendar, fixAllIntervalsInRow
};
