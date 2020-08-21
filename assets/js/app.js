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
    currentDate = addDays(currentDate, 1);
}

