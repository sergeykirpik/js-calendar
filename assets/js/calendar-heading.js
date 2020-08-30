import { die } from './utils';

class CalendarHeading {
    constructor({element}) {
        this.element_ = element || die('parameter element is required');
    }

    handleNextMonthClick = () => {
        console.log('next month');
    };

    handlePrevMonthClick = () => {
        console.log('prev month');
    };

    setupEvents() {
        this.element_.querySelector('.btn-next-month')
            .addEventListener('click', this.nextMonthClick)
        ;
        this.element_.querySelector('.btn-prev-month')
            .addEventListener('click', this.handlePrevMonthClick)
        ;
    }
}

export default CalendarHeading;
