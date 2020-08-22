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

function setDateInterval() {
    const calendar = document.querySelector('#calendar');
    const cell = document.querySelectorAll('.calendar-cell')[10];

    const rect = cell.getBoundingClientRect();

    let el = document.createElement('div');
    el.className = 'calendar-interval green';
    el.style.width = rect.width*2+'px';
    // el.style.top = rect.top+25+'px';
    // el.style.left = rect.left+'px';
    el.textContent = 'New event';
    cell.appendChild(el);

    el = document.createElement('div');
    el.className = 'calendar-interval red';
    el.style.width = rect.width*2+'px';
    el.textContent = 'New event';
    cell.appendChild(el);

    el = document.createElement('div');
    el.className = 'calendar-interval yellow';
    el.style.width = rect.width*2+'px';
    el.textContent = 'New event';
    cell.appendChild(el);

    el = document.createElement('div');
    el.className = 'calendar-interval blue';
    el.style.width = rect.width*2+'px';
    el.textContent = 'New event';
    cell.appendChild(el);

    el = document.createElement('div');
    el.className = 'calendar-interval violet';
    el.style.width = rect.width*2+'px';
    el.textContent = 'New event';
    cell.appendChild(el);

}

updateLabels();

setDateInterval();

