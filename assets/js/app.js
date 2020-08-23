import '../css/app.css';
import '../css/dialog.css';

import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    diffInDays,
} from './date_utils';

import { makeGradient } from './color_utils';

import { setupEvents } from './events';

import { setupDialogs } from './dialog';

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

/**
 *
 * @param {Date} date
 */
function getIndex(date) {
    return diffInDays(minDate(), date);
}

function renderCalendar(data) {
    const cells = document.querySelectorAll('.calendar-cell');

    console.log(data[0]);
    data.forEach(e => placeEvent(cells, e));
}

function loadData() {

    fetch('/api/events')
        .then(response => {
            return response.json()
        })
        .then(data => {
            renderCalendar(data.data);
        })
        .catch(reason => {
            console.error(reason);
        })
    ;
}

function placeEvent(cells, {id, color, startDate, endDate, title }) {
    let startIndex = getIndex(new Date(startDate));
    let endIndex = getIndex(new Date(endDate));
    let maxIndex = getIndex(maxDate());

    renderInterval(cells, {id, startIndex, endIndex, text: title, color });
    // TODO: make interval wrap

    // startIndex += 7 - startIndex % 6;
    // while (startIndex < endIndex && startIndex < maxIndex) {
    //     renderInterval(cells, {id, startIndex, endIndex, id, title, color, className: 'green tail' });
    //     startIndex += 7;
    // }
}

function colorBrightness(hexColor) {
        //http://www.w3.org/TR/AERT#color-contrast

        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        return Math.round((299 * r + 587 * g + 114 * b) / 1000);
}

function renderInterval(cells, { startIndex, endIndex, id, text, color, className })
{
    const cellWidth = cells[0].getBoundingClientRect().width;
    const maxIndex = getIndex(maxDate());

    appendInterval(cells[startIndex], { className, width: cellWidth * (endIndex - startIndex + 1), id, color, text });
    for (let i = startIndex + 1; i <= endIndex; i++) {
        if (i > maxIndex) {
            break;
        }
        const hiddenCellsToAppend = cells[i-1].childElementCount - cells[i].childElementCount;
        if (i % 6 === 0) {
            break;
        }
        for (let j = 0; j < hiddenCellsToAppend; j++) {
            appendInterval(cells[i], { className: 'hidden', cellWidth, id });
        }
    }
}

function appendInterval(parent, { id, color, className, width, text='NewEvent' })
{
    if (!parent) {
        return;
    }
    const el = document.createElement('div');
    el.className = 'calendar-interval ' + className;
    el.style.width = width+'px';
    el.textContent = text;
    el.dataset.id = id;
    if (el.classList.contains('tail')) {
        el.style.width = width+200+'px';
        el.style.marginLeft = "-200px";
        el.style.paddingLeft = "200px";
    }
    if (color) {
        el.style.background = makeGradient(color);
    }
    if (color && colorBrightness(color) <= 125) {
        el.style.color = 'white';
    }
    parent.appendChild(el);
}


updateCalendarCells();

setupEvents();

setupDialogs();

loadData();
