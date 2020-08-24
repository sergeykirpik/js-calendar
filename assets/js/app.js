import '../css/app.css';
import '../css/dialog.css';

import {
    diffInDays,
    toLocalISOTime,
    toLocalISODate,
} from './date_utils';

import { makeGradient, colorBrightness } from './color_utils';

import { setupEvents } from './events';

import { setupDialogs } from './dialog';

import { updateCalendarCells } from './calendar';


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

    let startIndex = getIndex(new Date(toLocalISODate(startDate)));
    let endIndex = getIndex(new Date(toLocalISODate(endDate)));
    // let maxIndex = getIndex(maxDate());

    const text = toLocalISOTime(startDate).slice(0, 5)+' '+title;

    renderInterval(cells, {id, startIndex, endIndex, text, color });
    // TODO: make interval wrap

    // startIndex += 7 - startIndex % 6;
    // while (startIndex < endIndex && startIndex < maxIndex) {
    //     renderInterval(cells, {id, startIndex, endIndex, id, title, color, className: 'green tail' });
    //     startIndex += 7;
    // }
}


function renderInterval(cells, { startIndex, endIndex, id, text, color, className })
{
    const cellWidth = cells[0].getBoundingClientRect().width;
    const maxIndex = getIndex(maxDate());

    appendInterval(cells[startIndex], { className, width: cellWidth * (endIndex - startIndex + 1), id, color, text });
    for (let i = startIndex + 1; i <= endIndex; i++) {
        if (i % 7 === 0 || i > maxIndex) {
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
