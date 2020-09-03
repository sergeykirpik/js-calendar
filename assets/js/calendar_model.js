import { addDays, startOfNextMonth, startOfMonth } from './date_utils';
import EventEmitter from './emitter';

class CalendarModel extends EventEmitter {
  constructor(daysShown) {
    super();
    this.currentMonth = startOfMonth(new Date());
    this.daysShown = daysShown || 42;
  }

  getMinDate() {
    return addDays(this.currentMonth, -this.currentMonth.getDay() + 1);
  }

  getMaxDate() {
    return addDays(this.getMinDate(), this.daysShown - 1);
  }

  nextMonth() {
    this.currentMonth = startOfNextMonth(this.currentMonth);
    this.fireUpdate();
  }

  prevMonth() {
    this.currentMonth = startOfMonth(new Date(this.currentMonth.getTime() - 1));
    this.fireUpdate();
  }

  getCurrentMonth() {
    return this.currentMonth;
  }

  setCurrentMonth(date) {
    this.currentMonth = startOfMonth(date);
    this.fireUpdate();
  }

  fireUpdate() {
    this.emit('calendar-model.change', this);
  }
}

export default CalendarModel;
