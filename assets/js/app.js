import '../css/app.css';

import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    diffInDays,
} from './date_utils';

const RESIZE_OFFSET = 10;

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

function appendBlock(parent, { color, width, tail=false, text='New Event' })
{
    let el = document.createElement('div');
    el.classList.add('calendar-interval');
    el.classList.add(color);
    el.style.width = width+'px';
    el.textContent = text;
    parent.appendChild(el);
    if (tail) {
        el.style.width = width+200+'px';
        el.style.marginLeft = "-200px";
        el.style.paddingLeft = "200px";
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

function loadData() {
    const cells = document.querySelectorAll('.calendar-cell');
    //positionWithDate(cells, '2020-07-27', '2020-09-06', { color: 'green', text: 'Event #2' });
    //positionWithDate(cells, '2020-07-28', '2020-09-01', { color: 'violet', text: 'Event #3' });
    //positionWithDate(cells, '2020-07-30', '2020-09-05', { color: 'red', text: 'Event #1' });

    /*
    positionBlock(cells, { startIndex: 9, endIndex: 10, color: 'green', text: '09:00 Встреча с поставщиками' });

    positionBlock(cells, { startIndex:  9, endIndex: 14, color: 'violet', text: '14:30 Встреча с представителями рекламного агенства' });
    positionBlock(cells, { startIndex: 14, endIndex: 14, color: 'violet', text: 'Встреча с нашими партнерами в Китае', tail: true });

    positionBlock(cells, { startIndex: 10, endIndex: 11, color: 'red', text: '17:00 День Рождения фирмы' });
    positionBlock(cells, { startIndex: 11, endIndex: 12, color: 'yellow', text: '08:30 Совещание по поводу новой бизнес-стратегии' });
    */
}

function positionWithDate(cells, startISODate, endISODate, { color, text }) {
    let startIndex = getIndex(new Date(startISODate));
    let endIndex = getIndex(new Date(endISODate));
    let maxIndex = getIndex(maxDate());

    positionBlock(cells, { startIndex, endIndex, color, text });
    startIndex += 7 - startIndex % 6;
    while (startIndex < endIndex && startIndex < maxIndex) {
        positionBlock(cells, { startIndex, endIndex, color, text, tail: true});
        startIndex += 7;
    }
}

function positionBlock(cells, { startIndex, endIndex, color, tail, text })
{
    const cellWidth = cells[0].getBoundingClientRect().width;

    appendBlock(cells[startIndex], { color, width: cellWidth * (endIndex - startIndex + 1), text, tail });
    for (let i = startIndex + 1; i <= endIndex; i++) {
        const hiddenCellsToAppend = cells[i-1].childElementCount - cells[i].childElementCount;
        if (i % 6 === 0) {
            break;
        }
        for (let j = 0; j < hiddenCellsToAppend; j++) {
            appendBlock(cells[i], { color: 'hidden', cellWidth });
        }
    }
}

function openDialog() {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
        dialog.classList.remove('hidden');
    }
}

function closeDialog() {
    const dialog = document.querySelector('.dialog')
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

function deselectAllIntervals() {
    document.querySelectorAll('.selected.calendar-interval')
        .forEach(el => el.classList.remove('selected'))
    ;
    closeDialog();
}

/**
 *
 * @param {Element} el
 */
function selectInterval(el) {
    el.classList.add('selected');
    openDialog();
}

function unshadeAllCalendarCells() {
    document.querySelectorAll('.shaded.calendar-cell').forEach(el => el.classList.remove('shaded'));
}

/**
 *
 * @param {Element} el
 */
function shadeCalendarCell(el) {
    unshadeAllCalendarCells();
    el.classList.add('shaded');
}

function setupEvents() {
    let lastMouseDownEvent = null;
    let draggingDetected = false;

    /**
     *
     * @param {MouseEvent} e
     */
    const startDragging = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, offsetY } = lastMouseDownEvent;
            target.style.position = 'absolute';
            target.style.left = e.clientX-offsetX+'px';
            target.style.top  = e.clientY-offsetY+'px';
        }
    }

    /**
     *
     * @param {MouseEvent} e
     */
    const stopDragging = function(e) {
        console.log('stopDragging');
        document.removeEventListener('mousemove', startDragging);
        document.removeEventListener('mouseup', stopDragging);

        draggingDetected =
            e.clientX !== lastMouseDownEvent.clientX
            || e.clientY !== lastMouseDownEvent.clientY
        ;
        lastMouseDownEvent = null;
    }

    /**
     *
     * @param {MouseEvent} e
     */
    const startResizing = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, clientX } = lastMouseDownEvent;
            target.style.width = offsetX + (e.clientX - clientX) + 'px';
        }
    }

    /**
     *
     * @param {MouseEvent} e
     */
    const stopResizing = function(e) {
        console.log('stopResizing');
        document.removeEventListener('mousemove', startResizing);
        document.removeEventListener('mouseup', stopResizing);
        lastMouseDownEvent = null;
    }

    /**
     *
     * @param {MouseEvent} e
     */
    const mouseDownHandler = function(e) {
        console.log('mousedown');
        if (e.target.classList.contains('calendar-interval')) {
            const rect = e.target.getBoundingClientRect();
            lastMouseDownEvent = e;
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                console.log('resizing');
                document.addEventListener('mousemove', startResizing);
                document.addEventListener('mouseup', stopResizing);
            } else {
                console.log('dragging');
                document.addEventListener('mousemove', startDragging);
                document.addEventListener('mouseup', stopDragging);
            }
        }
    }
    document.addEventListener('mousedown', mouseDownHandler);

    document.addEventListener('click', function(e) {
        if (draggingDetected) {
            return;
        }
        deselectAllIntervals();
        if (e.target.classList.contains('calendar-interval')) {
            console.log('click');
            const dialog = document.querySelector('.dialog');
            dialog.classList.remove('hidden');

            selectInterval(e.target);
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (e.target.classList.contains('calendar-interval')) {
            e.target.style.cursor = 'pointer';

            const rect = e.target.getBoundingClientRect();
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                e.target.style.cursor = 'col-resize';
            }
        }
        document.elementsFromPoint(e.clientX, e.clientY).forEach(el => {
            if (el.classList.contains('calendar-cell')) {
                shadeCalendarCell(el);
            }
        });
    });
}

updateCalendarCells();

loadData();

setupEvents();

