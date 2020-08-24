import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    toLocalISODate,
    toLocalISOTime,
    diffInDays,
} from './date_utils';

import {
    setElementColor,
} from './color_utils';


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

function placeEvent(cells, { id, color, startDate, endDate, title }) {

    let startIndex = getIndex(new Date(toLocalISODate(startDate)));
    let endIndex = getIndex(new Date(toLocalISODate(endDate)));
    // let maxIndex = getIndex(maxDate());

    const text = toLocalISOTime(startDate).slice(0, 5) + ' ' + title;

    renderInterval(cells, { id, startIndex, endIndex, text, color });
    // TODO: make interval wrap

    // startIndex += 7 - startIndex % 6;
    // while (startIndex < endIndex && startIndex < maxIndex) {
    //     renderInterval(cells, {id, startIndex, endIndex, id, title, color, className: 'green tail' });
    //     startIndex += 7;
    // }
}


function renderInterval(cells, { startIndex, endIndex, id, text, color, className = '' }) {
    const cellWidth = cells[0].getBoundingClientRect().width;
    const maxIndex = getIndex(maxDate());

    appendInterval(cells[startIndex], { className, width: cellWidth * (endIndex - startIndex + 1), id, color, text });
    for (let i = startIndex + 1; i <= endIndex; i++) {
        if (i % 7 === 0 || i > maxIndex) {
            break;
        }
        const hiddenCellsToAppend = cells[i - 1].childElementCount - cells[i].childElementCount;
        if (i % 6 === 0) {
            break;
        }
        for (let j = 0; j < hiddenCellsToAppend; j++) {
            appendInterval(cells[i], { className: 'hidden', cellWidth, id });
        }
    }
}


function appendInterval(parent, { id, color, className='', width, text = 'NewEvent' }) {
    if (!parent) {
        return;
    }
    const el = document.createElement('div');
    el.className = 'calendar-interval ' + className;
    el.style.width = width + 'px';
    el.textContent = text;
    el.dataset.id = id;
    if (el.classList.contains('tail')) {
        el.style.width = width + 200 + 'px';
        el.style.marginLeft = "-200px";
        el.style.paddingLeft = "200px";
    }
    if (color) {
        setElementColor(el, color);
    }
    parent.appendChild(el);
}

function renderCalendar(data) {
    const cells = document.querySelectorAll('.calendar-cell');
    data.forEach(e => placeEvent(cells, e));
}

/**
 *
 * @param {Date} date
 */
function getIndex(date) {
    return diffInDays(minDate(), date);
}


export {
    deselectAllIntervals, selectInterval, unshadeAllCalendarCells, shadeCalendarCell,
    updateCalendarCells, updateInterval, renderCalendar
};
