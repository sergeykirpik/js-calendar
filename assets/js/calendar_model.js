import { addDays, startOfNextMonth, startOfMonth } from './date_utils';
import EventEmitter from './emitter';

class CalendarModel extends EventEmitter {
    constructor(daysShown) {
        super();
        this.currentMonth_ = startOfMonth(new Date());
        this.daysShown_ = daysShown || 42;
    }

    getMinDate() {
        return addDays(this.currentMonth_, -this.currentMonth_.getDay()+1);
    }

    getMaxDate() {
        return addDays(this.getMinDate(), this.daysShown_-1);
    }

    nextMonth() {
        this.currentMonth_ = startOfNextMonth(this.currentMonth_);
        this.fireUpdate_();
    }

    prevMonth() {
        this.currentMonth_ = startOfMonth(new Date(this.currentMonth_.getTime()-1));
        this.fireUpdate_();
    }

    getCurrentMonth() {
        return this.currentMonth_;
    }

    setCurrentMonth(date) {
        this.currentMonth_ = startOfMonth(date);
        this.fireUpdate_();
    }

    fireUpdate_() {
        this.emit('calendar-model.change', this);
    }
}

export default CalendarModel;
