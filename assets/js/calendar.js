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

function _renderCalendar(data) {
    const cells = document.querySelectorAll('.calendar-cell');
    data.forEach(e => placeEvent(cells, e));
}

function colIndexFromJson(jsonDate) {
    return cellIndexFromJson() % 7;
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
    };
}

function renderCalendar(data) {
    const cells = document.querySelectorAll('.calendar-cell');
    const rect = cells[0].getBoundingClientRect();

    for (let i = 0; i < data.length-1; i++) {

        const el = document.createElement('div');
        el.className = 'calendar-interval ';
        el.style.width = rect.width + 'px';
        // el.style.top = rect.top + 'px';
        el.textContent = data[i]['title'];
        el.dataset.id = data[i]['id'];

        // if (el.classList.contains('tail')) {
        //     el.style.width = width + 200 + 'px';
        //     el.style.marginLeft = "-200px";
        //     el.style.paddingLeft = "200px";
        // }
        if (color) {
            setElementColor(el, data[i]['color']);
        }
        el.style.position = 'relative';

        const startIdx = cellIndexFromJson(data[i]['startDate']);
        const endIdx = cellIndexFromJson(data[i]['endDate']);

        const curr = indexesFromJson(data[i]);

        //const left = rect.left + rect.width  * colIdx;
        //const top  = rect.top  + rect.height * rowIdx;

        //el.style.left = left + 'px';
        //el.style.top  = top  + 'px';
        el.style.width = rect.width + rect.width * (endIdx - startIdx) + 'px';

        if (curr.startRow > 0) {
            let marginTop = 0;
            let bottom = 0;
            for (let j = 1; j <= i; j++) {
                const prev = indexesFromJson(data[i-j]);
                if (prev.startCol < curr.startCol && prev.endCol >= curr.startCol) {
                    const prevEl = document.querySelector(`[data-id="${data[i-j]['id']}"]`);
                    const prevRect = prevEl.getBoundingClientRect();
                    if (prevRect.bottom > bottom) {
                        bottom = prevRect.bottom;
                        marginTop = Math.max(marginTop, prevEl.offsetTop + prevEl.offsetHeight);
                    }
                }
            }
            el.style.marginTop = marginTop + 'px';
        }

        if (cells[startIdx]) {
            cells[startIdx].appendChild(el);
        }
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
    updateCalendarCells, updateInterval, renderCalendar
};
