import { die } from './utils/assertion_utils';
import CalendarModel from './calendar_model';

class CalendarHeading {
  element: Element;
  model: CalendarModel;
  btnNextMonth: Element;
  btnPrevMonth: Element;

  constructor({ element, model }: { element: Element, model: CalendarModel }) {
    this.element = element;
    this.model = model;

    this.btnNextMonth = this.element.querySelector('.btn-next-month') || die();
    this.btnPrevMonth = this.element.querySelector('.btn-prev-month') || die();

    this.handleNextMonthClick = this.handleNextMonthClick.bind(this);
    this.handlePrevMonthClick = this.handlePrevMonthClick.bind(this);

    this.setupEvents();
  }

  handleNextMonthClick(): void {
    this.model.nextMonth();
  }

  handlePrevMonthClick(): void {
    this.model.prevMonth();
  }

  // TODO: refactor this
  setupEvents(): void {
    this.btnNextMonth.addEventListener('click', this.handleNextMonthClick);
    this.btnPrevMonth.addEventListener('click', this.handlePrevMonthClick);

    const correctCalendarHeadingPosition = () => {
      const calendarHeading = document.querySelector('.calendar-heading') as HTMLElement;
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
