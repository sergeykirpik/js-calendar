import '../css/calendar-heading.css';

import { die } from './utils/assertion_utils';
import CalendarModel from './calendar_model';

class CalendarHeading {
  element: Element;
  model: CalendarModel;
  btnNextMonth: Element;
  btnPrevMonth: Element;
  btnToggleDropdown: Element;
  dropdown: Element;

  constructor({ element, model }: { element: Element, model: CalendarModel }) {
    this.element = element;
    this.model = model;

    this.btnNextMonth = this.element.querySelector('.btn-next-month') || die();
    this.btnPrevMonth = this.element.querySelector('.btn-prev-month') || die();
    this.btnToggleDropdown  = this.element.querySelector('.btn-toggle-dropdown') || die();
    this.dropdown = this.element.querySelector('.calendar-heading-dropdown') || die();

    this.setupEvents();
  }

  handleNextMonthClick = (): void => {
    this.model.nextMonth();
  };

  handlePrevMonthClick = (): void => {
    this.model.prevMonth();
  };

  handleToggleDropdownClick = (): void => {
    this.dropdown.classList.toggle('opened');
  };

  setupEvents(): void {
    this.btnNextMonth.addEventListener('click', this.handleNextMonthClick);
    this.btnPrevMonth.addEventListener('click', this.handlePrevMonthClick);
    this.btnToggleDropdown.addEventListener('click', this.handleToggleDropdownClick);

    // TODO: refactor this
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
