import { addDays, startOfNextMonth, startOfMonth, dateDiffInDays } from './utils/date_utils';
import EventEmitter from './emitter';
import DateInterval from './types/date_interval';

class CalendarModel extends EventEmitter {
  currentMonth: Date;
  daysShown: number;

  constructor(daysShown: number|void) {
    super();
    this.currentMonth = startOfMonth(new Date());
    this.daysShown = daysShown || 42;
  }

  cellIndexFromDate(date: Date): number {
    return dateDiffInDays(this.getMinDate(), date);
  }

  colIndexFromDate(date: Date): number {
    return this.cellIndexFromDate(date) % 7;
  }

  rowIndexFromDate(date: Date): number {
    return Math.floor(this.cellIndexFromDate(date) / 7);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  indexesFromDateInterval({ startDate, endDate }: DateInterval) {
    const minIdx = this.getMinCellIndex();
    const maxIdx = this.getMaxCellIndex();

    let startIdx = this.cellIndexFromDate(startDate);
    startIdx = Math.max(startIdx, minIdx);
    startIdx = Math.min(startIdx, maxIdx);

    let endIdx = this.cellIndexFromDate(endDate);
    endIdx = Math.max(endIdx, minIdx);
    endIdx = Math.min(endIdx, maxIdx);

    return {
      startRow: this.rowIndexFromDate(startDate),
      endRow: this.rowIndexFromDate(endDate),
      startCol: this.colIndexFromDate(startDate),
      endCol: this.colIndexFromDate(endDate),
      startIdx,
      endIdx,
    };
  }

  getMinDate(): Date {
    return addDays(this.currentMonth, -this.currentMonth.getDay() + 1);
  }

  getMaxDate(): Date {
    return addDays(this.getMinDate(), this.daysShown - 1);
  }

  getMinCellIndex(): number {
    return this.cellIndexFromDate(this.getMinDate());
  }

  getMaxCellIndex(): number {
    return this.cellIndexFromDate(this.getMaxDate());
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
