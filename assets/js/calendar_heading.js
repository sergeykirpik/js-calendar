import { die } from './utils';
import CalendarModel from './calendar_model';

class CalendarHeading {
  constructor({ element, model }) {
    this.element = element || die('parameter element is required');
    this.model = model || new CalendarModel();

    this.handleNextMonthClick = this.handleNextMonthClick.bind(this);
    this.handlePrevMonthClick = this.handlePrevMonthClick.bind(this);

    this.setupEvents();
  }

  handleNextMonthClick() {
    this.model.nextMonth();
  }

  handlePrevMonthClick() {
    this.model.prevMonth();
  }

  setupEvents() {
    this.element.querySelector('.btn-next-month')
      .addEventListener('click', this.handleNextMonthClick);
    this.element.querySelector('.btn-prev-month')
      .addEventListener('click', this.handlePrevMonthClick);

    const correctCalendarHeadingPosition = () => {
      const calendarHeading = document.querySelector('.calendar-heading');
      const calendar = document.querySelector('.calendar');

      if (calendar && calendarHeading) {
        const rect = calendar.getBoundingClientRect();
        calendarHeading.style.width = `${rect.width - 20}px`;
      }
    };
    window.addEventListener('resize', correctCalendarHeadingPosition);
    correctCalendarHeadingPosition();
  }
}

export default CalendarHeading;
