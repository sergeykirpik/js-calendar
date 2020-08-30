import { addDays, startOfNextMonth, startOfMonth } from './date_utils';
import EventEmitter from './event-emitter';

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

    incMonth() {
        this.currentMonth_ = startOfNextMonth(this.currentMonth_);
        this.fireUpdate_();
    }

    decMonth() {
        this.currentMonth_ = startOfMonth(new Date(this.currentMonth_.getTime()-1));
        this.fireUpdate_();
    }

    getCurrentMonth() {
        return this.currentMonth_;
    }

    fireUpdate_() {
        this.emit('change');
    }
}

export default CalendarModel;
