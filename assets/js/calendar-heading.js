import { die } from './utils';
import CalendarModel from './calendar_model';

class CalendarHeading {
    constructor({element, model}) {
        this.element_ = element || die('parameter element is required');
        this.model_ = model || new CalendarModel();

        this.handleNextMonthClick = this.handleNextMonthClick.bind(this);
        this.handlePrevMonthClick = this.handlePrevMonthClick.bind(this);

        this.setupEvents();
    }

    handleNextMonthClick() {
        this.model_.nextMonth();
    };

    handlePrevMonthClick() {
        this.model_.prevMonth();
    };

    setupEvents() {
        this.element_.querySelector('.btn-next-month')
            .addEventListener('click', this.handleNextMonthClick)
        ;
        this.element_.querySelector('.btn-prev-month')
            .addEventListener('click', this.handlePrevMonthClick)
        ;

        const correctCalendarHeadingPosition = function() {
            const calendarHeading = document.querySelector('.calendar-heading');
            const calendar = document.querySelector('.calendar');

            if (calendar && calendarHeading) {
                const rect = calendar.getBoundingClientRect();
                calendarHeading.style.left = rect.left + 'px';
                calendarHeading.style.width = rect.width-10 + 'px';
            }
        }
        window.addEventListener('resize', correctCalendarHeadingPosition);
        correctCalendarHeadingPosition();
    }
}

export default CalendarHeading;
