const ONE_DAY_MS = 8.64e+7;

/**
 *
 * @param {Date} date1
 * @param {Date} date2
 */
function dateDiffInDays(date1, date2) {
  return Math.floor((date2.getTime() - date1.getTime()) / ONE_DAY_MS);
}

function padWithZero(number) {
  return number < 10 ? `0${number}` : `${number}`;
}

/**
 *
 * @param {Date} date1
 * @param {Date} date2
 */
function dateDiffHuman(date1, date2) {
  let diffInSec = Math.floor((date2.getTime() - date1.getTime()) / 1000);
  const hours = Math.floor(diffInSec / 3600);
  diffInSec -= hours * 3600;
  const minutes = Math.floor(diffInSec / 60);
  const seconds = diffInSec - minutes * 60;

  return `${hours}:${padWithZero(minutes)}:${padWithZero(seconds)}`;
}

function addDays(date, days) {
  return new Date(date.getTime() + ONE_DAY_MS * days);
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
        && date.getDate() === currentDate.getDate();
}

function toLocalISODate(pDate) {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = padWithZero(date.getMonth() + 1);
  const day = padWithZero(date.getDate());

  return `${year}-${month}-${day}`;
}

/**
 *
 * @param {Date|string} date
 */
function toLocalISOTime(pDate) {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const hours = padWithZero(date.getHours());
  const minutes = padWithZero(date.getMinutes());
  const seconds = padWithZero(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

/**
 *
 * @param {Date|string} date
 */
function toLocalISOTimeWithoutSeconds(pDate) {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const hours = padWithZero(date.getHours());
  const minutes = padWithZero(date.getMinutes());

  return `${hours}:${minutes}`;
}

function toLocalISODateAndTime(date) {
  return `${toLocalISODate(date)}T${toLocalISOTime(date)}`;
}

function parseISO(dateTimeString) {
  const [dateString, timeString = '00:00:00'] = dateTimeString.split('.')[0].split('T');
  const [year, month, date] = dateString.split('-');
  const [hours, minutes, seconds] = timeString.split(':');

  return new Date(year, month - 1, date, hours, minutes, seconds);
}

export {
  startOfMonth, startOfNextMonth, addDays, isToday, dateDiffInDays, dateDiffHuman,
  padWithZero, toLocalISODate, toLocalISOTime, toLocalISODateAndTime, toLocalISOTimeWithoutSeconds,
  parseISO, startOfDay,
};
