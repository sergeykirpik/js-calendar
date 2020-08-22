/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../css/app.css';

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

const ONE_DAY_MS = 8.64e+7;

function addDays(date, days) {
    return new Date(date.getTime() + ONE_DAY_MS * days)
}

function padWithZero(number) {
    return number < 10 ? "0"+number : ""+number;
}

/**
 *
 * @param {Date} date
 */
function formatDate(date) {
    //const m = date.getMonth()+1;
    const d = date.getDate();
    return `${d}`;
}

/**
 *
 * @param {Date} date
 */
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 *
 * @param {Date} date
 */
function startOfNextMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 *
 * @param {Date} date
 */
function isToday(date) {
    const currentDate = new Date();
    return date.getFullYear() === currentDate.getFullYear()
        && date.getMonth() === currentDate.getMonth()
        && date.getDate() === currentDate.getDate()
    ;
}

function updateLabels() {

    const cells = document.querySelectorAll('.calendar-cell');

    const thisMonth = startOfMonth(new Date());
    const nextMonth = startOfNextMonth(thisMonth);

    let currentDate = addDays(thisMonth, -thisMonth.getDay()+1);

    for (let i = 0; i < cells.length; i++) {
        const dayLabel = cells[i].querySelector('.day-label');
        dayLabel.textContent = formatDate(currentDate);
        if (currentDate >= thisMonth && currentDate < nextMonth) {
            dayLabel.classList.add('this-month');
        }
        if (isToday(currentDate)) {
            dayLabel.classList.add('today');
            //cells[i].classList.add('shaded');
        }
        currentDate = addDays(currentDate, 1);
    }
}

function appendBlock(parent, { color, width })
{
    let el = document.createElement('div');
    el.classList.add('calendar-interval');
    el.classList.add(color);
    el.style.width = width+'px';
    el.textContent = 'New event';
    parent.appendChild(el);
}

function setDateInterval() {
    const calendar = document.querySelector('#calendar');
    const cells = document.querySelectorAll('.calendar-cell');

    const cellWidth = cells[0].getBoundingClientRect().width;

    appendBlock(cells[ 9], { color: 'green'  , width: 2*cellWidth });
    appendBlock(cells[10], { color: 'hidden' , width: 1*cellWidth });

    appendBlock(cells[10], { color: 'red'    , width: 2*cellWidth });

    appendBlock(cells[11], { color: 'hidden' , width: 1*cellWidth });
    appendBlock(cells[11], { color: 'hidden' , width: 1*cellWidth });

    appendBlock(cells[11], { color: 'yellow' , width: 2*cellWidth });

    // appendBlock(cells[9], { color: 'blue'   , width: 2*cellWidth });
    // appendBlock(cells[9], { color: 'violet' , width: 3*cellWidth });
}

updateLabels();

setDateInterval();

function setupDragAndDrop() {
    let lastMouseDownEvent = null;

    /**
     *
     * @param {MouseEvent} e
     */
    const mouseMoveHandler = function(e) {
        //console.log(e.clientX, e.clientY);
        if (lastMouseDownEvent) {
            const { target, offsetX, offsetY } = lastMouseDownEvent;
            target.style.position = 'absolute';
            target.style.left = e.clientX-offsetX+'px';
            target.style.top  = e.clientY-offsetY+'px';
        }
    }

    const mouseUpHandler = function(e) {
        console.log('mouseup');
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        lastMouseDownEvent = null;
    }

    /**
     *
     * @param {MouseEvent} e
     */
    const mouseDownHandler = function(e) {
        console.log('mousedown');
        if (e.target.classList.contains('calendar-interval')) {
            console.log(e.target);
            console.log(e.offsetX, e.offsetY);
            lastMouseDownEvent = e;
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        }
    }

    document.addEventListener('mousedown', mouseDownHandler);

}

setupDragAndDrop();
