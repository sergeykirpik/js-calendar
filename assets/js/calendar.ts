import {
    startOfMonth,
    startOfNextMonth,
    addDays,
    isToday,
    toLocalISODate,
    dateDiffInDays,
    toLocalISODateAndTime,
    parseISO,
    formatDayLabel,
} from './date_utils';

import {
    setElementColor,
} from './color_utils';
import CalendarModel from './calendar_model';
import { die, inRange, currentUser } from './utils';
import EventEmitter from './emitter';
import CalendarEvent from './model/calendar_event';
import IntervalElement from './types/interval_element';
import CalendarCellElement from './types/cell_element';

const CALENDAR_INTERVAL_VGAP = 2;
const RESIZE_OFFSET = 10;

class Calendar extends EventEmitter {
    lockUpdates: boolean | false;
    model: CalendarModel;
    element: HTMLElement;
    constructor({ model, element }: { model: CalendarModel, element: HTMLElement }) {
        super();

        this.model = model || new CalendarModel();
        this.element = element;
        this.lockUpdates = false;

        this.render = this.render.bind(this);
        this.updateInterval = this.updateInterval.bind(this);
        this.removeInterval = this.removeInterval.bind(this);
        this.deselectAllIntervals = this.deselectAllIntervals.bind(this);
        this.fixIntervalPosition = this.fixIntervalPosition.bind(this);

        this.setupEvents();
    }


    updatesAllowed(): boolean {
        return !this.lockUpdates;
    }

    render(data: Array<CalendarEvent>): void {
        this.element.querySelectorAll('.calendar-interval').forEach((el) => el.remove());

        this.updateCalendarCells();

        for (let i = 0; i < data.length; i++) {
            const curr = this.indexesFromJson(data[i]);

            if (curr.startIdx > this.cellIndexFromDate(this.model.getMaxDate())) {
                break;
            }

            if (curr.startIdx < this.cellIndexFromDate(this.model.getMinDate())) {
                continue;
            }
            this.updateInterval(data[i]);
        }
    }

    updateInterval(data: CalendarEvent): void {
        if (this.lockUpdates) {
            return;
        }
        const cells = this.element.querySelectorAll('.calendar-cell');
        const curr = this.indexesFromJson(data);
        const cell = cells[curr.startIdx] as HTMLElement;

        let el = this.findInterval(data.id);

        if (!el) {
            el = document.createElement('div') as unknown as IntervalElement;
        }

        const newContainer = cell.querySelector('.events-container') as Element;
        if (newContainer !== el.parentElement) {
            newContainer.appendChild(el);
        }
        el.className = 'calendar-interval ';
        if (data.author !== currentUser()) {
            el.classList.add('locked');
        }
        el.style.marginTop = `${CALENDAR_INTERVAL_VGAP}px`;
        // TODO: refactor this
        el.innerHTML = `
          <span class="status-label">[ ]</span>
          <span class="title-label">${data.title || 'Untitled event'}</span>
      `;
        el.dataset.id = data.id;
        if (!data.isCanceled) {
            delete el.dataset.canceled;
        } else {
            el.dataset.canceled = '1';
        }

        el.dataset.startDate = toLocalISODateAndTime(data.startDate);
        el.dataset.endDate = toLocalISODateAndTime(data.endDate);
        setElementColor(el, data.color);
        el.style.width = `${cell.offsetWidth + cell.offsetWidth * (curr.endIdx - curr.startIdx) - 5}px`;

        const inner = document.createElement('div');
        inner.className = 'interval-inner';
        el.insertBefore(inner, el.firstChild);

        this.fixAllIntervalsInRow(this.getIntervalParentRow(el));
    }

    updateCalendarCells(): void {
        const cells = this.element.querySelectorAll('.calendar-cell') as NodeListOf<HTMLElement>;

        const thisMonth = startOfMonth(this.model.getCurrentMonth());
        const nextMonth = startOfNextMonth(thisMonth);

        let currentDate = addDays(thisMonth, -thisMonth.getDay() + 1);

        for (let i = 0; i < cells.length; i++) {
            cells[i].dataset.date = toLocalISODate(currentDate);

            const dayLabel = cells[i].querySelector('.day-label') as Element;
            dayLabel.textContent = formatDayLabel(currentDate);

            dayLabel.className = 'day-label';
            if (currentDate >= thisMonth && currentDate < nextMonth) {
                dayLabel.classList.add('this-month');
            }
            if (isToday(currentDate)) {
                dayLabel.classList.add('today');
            }
            currentDate = addDays(currentDate, 1);
        }
    }

    fixIntervalPosition(thisEl: IntervalElement): void {
        thisEl.style.marginTop = `${CALENDAR_INTERVAL_VGAP}px`;
        const calendarRow = this.getIntervalParentRow(thisEl);
        const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval');

        for (const otherEl of allIntevalsInRow) {
            if (thisEl === otherEl) {
                break;
            }
            const thisRect = thisEl.getBoundingClientRect();
            const otherRect = otherEl.getBoundingClientRect();

            if (thisEl !== otherEl) {
                if (otherRect.y + otherRect.height > thisRect.y) {
                    if (inRange(otherRect.left, thisRect.left, thisRect.right)
                        || inRange(otherRect.right, thisRect.left, thisRect.right)
                        || inRange(thisRect.left, otherRect.left, otherRect.right)
                        || inRange(thisRect.right, otherRect.left, otherRect.right)
                    ) {
                        thisEl.style.marginTop = `${(parseInt(thisEl.style.marginTop, 10) || 0)
                            + otherRect.y + otherRect.height - thisRect.y + CALENDAR_INTERVAL_VGAP}px`;
                    }
                }
            }
        }
    }

    getIntervalParentRow(interval: IntervalElement): HTMLElement {
        const eventsContainer = interval.parentElement;
        const calendarCell = eventsContainer?.parentElement;
        const calendarRow = calendarCell?.parentElement as HTMLElement;
        return calendarRow;
    }

    findInterval(dataId: string): IntervalElement|null {
        return this.element.querySelector(`[data-id="${dataId}"]`);
    }

    removeInterval(id: string): void {
        if (this.lockUpdates) {
            return;
        }
        const el = this.findInterval(id);
        if (el) {
            const row = this.getIntervalParentRow(el);
            el.remove();
            this.fixAllIntervalsInRow(row);
        }
    }

    deselectAllIntervals(): void {
        this.element.querySelectorAll('.selected.calendar-interval')
            .forEach((el) => el.classList.remove('selected'));
    }

    selectInterval(el: IntervalElement): void {
        this.deselectAllIntervals();
        el.classList.add('selected');
    }

    unshadeAllCells(): void {
        this.element.querySelectorAll('.shaded.calendar-cell')
            .forEach((el) => el.classList.remove('shaded'));
    }

    shadeCell(el: Element): void {
        this.unshadeAllCells();
        el.classList.add('shaded');
    }

    colIndexFromDate(date: Date): number {
        return this.cellIndexFromDate(date) % 7;
    }

    fixAllIntervalsInRow(calendarRow: HTMLElement): void {
        calendarRow.classList.contains('calendar-row') || die('parameter calendarRow must be .calendar-row');

        const allIntevalsInRow = calendarRow.querySelectorAll('.calendar-interval') as NodeListOf<IntervalElement>;

        allIntevalsInRow.forEach(this.fixIntervalPosition);
    }

    rowIndexFromDate(date: Date): number {
        return Math.floor(this.cellIndexFromDate(date) / 7);
    }

    indexesFromJson(data: CalendarEvent): { startRow: number, endRow: number, startCol: number, endCol: number, startIdx: number, endIdx: number } {
        return {
            startRow: this.rowIndexFromDate(data.startDate),
            endRow: this.rowIndexFromDate(data.endDate),
            startCol: this.colIndexFromDate(data.startDate),
            endCol: this.colIndexFromDate(data.endDate),
            startIdx: this.cellIndexFromDate(data.startDate),
            endIdx: this.cellIndexFromDate(data.endDate),
        };
    }

    cellIndexFromDate(date: Date): number {
        return dateDiffInDays(this.model.getMinDate(), date);
    }

    setupEvents(): void {
        let lastMouseDownEvent: {
            target: Element|null,
            offsetX: number,
            offsetY: number,
            clientX: number,
            clientY: number
        }|null = null;
        let destinationParent: HTMLElement|null = null;
        let itWasDragAndDrop = false;
        let itWasResize = false;

        const handleDrag = (e: MouseEvent) => {
            if (lastMouseDownEvent) {
                const { target, offsetX, offsetY } = lastMouseDownEvent;
                const el = target as IntervalElement;
                if (!el.classList.contains('dragging')) {
                    el.classList.add('dragging');
                }
                el.style.left = `${e.clientX - offsetX}px`;
                el.style.top = `${e.clientY - offsetY - (parseInt(el.style.marginTop, 10) || 0)}px`;
            }
        };

        const handleDrop = (e: MouseEvent) => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDrop);

            if (!lastMouseDownEvent || !destinationParent) {
                return;
            }

            this.lockUpdates = false;
            itWasDragAndDrop = (e.clientX !== lastMouseDownEvent.clientX
                || e.clientY !== lastMouseDownEvent.clientY);
            if (itWasDragAndDrop) {
                const el = lastMouseDownEvent.target as IntervalElement;
                const oldParentRow = this.getIntervalParentRow(el);
                destinationParent.appendChild(el);
                el.classList.remove('dragging');
                const newParentRow = this.getIntervalParentRow(el);
                this.fixAllIntervalsInRow(newParentRow);
                if (oldParentRow !== newParentRow) {
                    this.fixAllIntervalsInRow(oldParentRow);
                }

                lastMouseDownEvent = null;
                const parentCell = destinationParent.parentElement as CalendarCellElement;

                const startDate = parseISO(el.dataset.startDate);
                const endDate = parseISO(el.dataset.endDate);
                const timeDiff = endDate.getTime() - startDate.getTime();

                const newStartDate = parseISO(parentCell.dataset.date);
                newStartDate.setHours(startDate.getHours());
                newStartDate.setMinutes(startDate.getMinutes());

                el.dataset.startDate = toLocalISODateAndTime(newStartDate);
                el.dataset.endDate = toLocalISODateAndTime(new Date(newStartDate.getTime() + timeDiff));
                this.emit('interval.drop', el);
            }
        };

        const doResizing = function (e: MouseEvent) {
            if (lastMouseDownEvent) {
                const { target, offsetX, clientX } = lastMouseDownEvent;
                const el = target as IntervalElement;
                el.style.width = `${offsetX + (e.clientX - clientX)}px`;
            }
        };

        const stopResizing = () => {
            document.removeEventListener('mousemove', doResizing);
            document.removeEventListener('mouseup', stopResizing);

            if (!lastMouseDownEvent) {
                return;
            }

            this.lockUpdates = false;
            const el = lastMouseDownEvent.target as IntervalElement;
            const endDate = parseISO(el.dataset.endDate);
            const destinationCell = destinationParent?.parentElement as CalendarCellElement;
            const newEndDate = parseISO(destinationCell.dataset.date);
            newEndDate.setHours(endDate.getHours());
            newEndDate.setMinutes(endDate.getMinutes());

            el.dataset.endDate = toLocalISODateAndTime(newEndDate);
            this.emit('interval.resize', el);
            itWasResize = true;
            lastMouseDownEvent = null;
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) {
                return;
            }
            itWasDragAndDrop = false;
            itWasResize = false;

            lastMouseDownEvent = {
                target: e.target as IntervalElement,
                offsetX: e.offsetX,
                offsetY: e.offsetY,
                clientX: e.clientX,
                clientY: e.clientY,
            };

            let interval = e.target as Element;

            if (interval.parentElement?.classList.contains('calendar-interval')) {
                interval = interval.parentElement;
                lastMouseDownEvent.target = interval;
                lastMouseDownEvent.offsetX = 0;
                lastMouseDownEvent.offsetY = 0;
            }

            if (interval.classList.contains('calendar-interval')) {
                const rect = interval.getBoundingClientRect();
                lastMouseDownEvent.offsetX = e.clientX - rect.x;
                lastMouseDownEvent.offsetY = e.clientY - rect.y;
                if (rect.width - lastMouseDownEvent.offsetX < RESIZE_OFFSET) {
                    document.addEventListener('mousemove', doResizing);
                    document.addEventListener('mouseup', stopResizing);
                } else {
                    document.addEventListener('mousemove', handleDrag);
                    document.addEventListener('mouseup', handleDrop);
                }
                this.lockUpdates = true;
            }
        };
        this.element.addEventListener('mousedown', handleMouseDown);

        const handleClick = (e: MouseEvent) => {
            if (itWasDragAndDrop || itWasResize) {
                return;
            }
            let target = e.target as Element;

            if (target.parentElement?.classList.contains('calendar-interval')) {
                target = target.parentElement;
            }
            if (target.classList.contains('calendar-interval')) {
                this.selectInterval(target as IntervalElement);
                this.emit('calendar.interval.click', target);
            } else if (target.classList.contains('calendar-cell')) {
                this.emit('calendar.cell.click', target);
            }
        };
        this.element.addEventListener('click', handleClick);

        const handleMouseMove = (e: MouseEvent) => {
            let interval = e.target as HTMLElement;

            if (interval.parentElement?.classList.contains('calendar-interval')) {
                interval = interval.parentElement;
            }

            if (interval.classList.contains('calendar-interval')) {
                interval.style.cursor = 'pointer';

                const rect = interval.getBoundingClientRect();
                if (rect.width - e.offsetX < RESIZE_OFFSET) {
                    interval.style.cursor = 'col-resize';
                }
            }
            document.elementsFromPoint(e.clientX, e.clientY).forEach((el) => {
                if (el.classList.contains('calendar-cell')) {
                    this.shadeCell(el);
                    destinationParent = el.querySelector('.events-container');
                }
            });
        };
        this.element.addEventListener('mousemove', handleMouseMove);
    }
}


export default Calendar;
