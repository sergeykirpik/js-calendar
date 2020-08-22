const ONE_DAY_MS = 8.64e+7;

/**
 *
 * @param {Date} date1
 * @param {Date} date2
 */
function diffInDays(date1, date2) {
    return Math.floor((date2.getTime() - date1.getTime()) / ONE_DAY_MS);
}

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
function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

export {startOfMonth, startOfNextMonth, addDays, isToday, diffInDays};
