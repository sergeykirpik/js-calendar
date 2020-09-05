const ONE_DAY_MS = 8.64e+7;

function dateDiffInDays(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / ONE_DAY_MS);
}

function padWithZero(value: number|string): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function dateDiffHuman(date1: Date, date2: Date): string {
  let diffInSec = Math.floor((date2.getTime() - date1.getTime()) / 1000);
  const hours = Math.floor(diffInSec / 3600);
  diffInSec -= hours * 3600;
  const minutes = Math.floor(diffInSec / 60);
  const seconds = diffInSec - minutes * 60;

  return `${hours}:${padWithZero(minutes)}:${padWithZero(seconds)}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + ONE_DAY_MS * days);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isToday(date: Date): boolean {
  const currentDate = new Date();
  return date.getFullYear() === currentDate.getFullYear()
        && date.getMonth() === currentDate.getMonth()
        && date.getDate() === currentDate.getDate();
}

function toLocalISODate(pDate: Date|string): string {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = padWithZero(date.getMonth() + 1);
  const day = padWithZero(date.getDate());

  return `${year}-${month}-${day}`;
}

function toLocalISOTime(pDate: Date|string): string {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const hours = padWithZero(date.getHours());
  const minutes = padWithZero(date.getMinutes());
  const seconds = padWithZero(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

function toLocalISOTimeWithoutSeconds(pDate: Date|string): string {
  let date = pDate;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const hours = padWithZero(date.getHours());
  const minutes = padWithZero(date.getMinutes());

  return `${hours}:${minutes}`;
}

function toLocalISODateAndTime(date: Date|string): string {
  return `${toLocalISODate(date)}T${toLocalISOTime(date)}`;
}

function parseISO(dateTimeString: string): Date {
  const [dateString, timeString = '00:00:00'] = dateTimeString.split('.')[0].split('T');
  const [year, month, date] = dateString.split('-').map(part => parseInt(part, 10));
  const [hours, minutes, seconds] = timeString.split(':').map(part => parseInt(part, 10));

  return new Date(year, month - 1, date, hours, minutes, seconds);
}

function formatDayLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]}, ${date.getDate()}`;
}

export {
  startOfMonth, startOfNextMonth, addDays, isToday, dateDiffInDays, dateDiffHuman,
  padWithZero, toLocalISODate, toLocalISOTime, toLocalISODateAndTime, toLocalISOTimeWithoutSeconds,
  parseISO, startOfDay, formatDayLabel
};
