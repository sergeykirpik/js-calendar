import { addDays, startOfNextMonth, startOfMonth } from './date_utils';
import EventEmitter from './emitter';

class CalendarModel extends EventEmitter {
  currentMonth: Date;
  daysShown: number;

  constructor(daysShown: number|void) {
    super();
    this.currentMonth = startOfMonth(new Date());
    this.daysShown = daysShown || 42;
  }

  getMinDate(): Date {
    return addDays(this.currentMonth, -this.currentMonth.getDay() + 1);
  }

  getMaxDate(): Date {
    return addDays(this.getMinDate(), this.daysShown - 1);
  }

  nextMonth(): void {
    this.currentMonth = startOfNextMonth(this.currentMonth);
    this.fireUpdate();
  }

  prevMonth(): void {
    this.currentMonth = startOfMonth(new Date(this.currentMonth.getTime() - 1));
    this.fireUpdate();
  }

  getCurrentMonth(): Date {
    return this.currentMonth;
  }

  setCurrentMonth(date: Date): void {
    this.currentMonth = startOfMonth(date);
    this.fireUpdate();
  }

  fireUpdate(): void {
    this.emit('calendar-model.change', this);
  }

}

export default CalendarModel;
