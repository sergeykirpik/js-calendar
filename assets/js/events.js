import {
    shadeCalendarCell,
    selectInterval,
    deselectAllIntervals,
    fixAllIntervalsInRow,
} from './calendar';
import Dialog from './dialog';
import EventEmitter from './event-emitter';

const RESIZE_OFFSET = 10;

/**
 *
 * @param {Dialog} dialog
 * @param {EventEmitter} eventEmitter
 */
function setupEvents(dialog, eventEmitter) {
    let lastMouseDownEvent = null;
    let draggingDetected = false;
    let destinationParent = null;

    /**
     *
     * @param {MouseEvent} e
     */
    const startDragging = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, offsetY } = lastMouseDownEvent;
            if (!target.classList.contains('dragging')) {
                target.classList.add('dragging');
            }
            target.style.left = e.clientX-offsetX+'px';
            target.style.top  = e.clientY-offsetY-(parseInt(target.style.marginTop, 10) || 0)+'px';

            eventEmitter.emit('interval.dragging');
        }
    }

    /**
     * @param {MouseEvent} e
     */
    const stopDragging = function(e) {
        document.removeEventListener('mousemove', startDragging);
        document.removeEventListener('mouseup', stopDragging);

        draggingDetected =
            e.clientX !== lastMouseDownEvent.clientX
            || e.clientY !== lastMouseDownEvent.clientY
        ;

        if (draggingDetected) {
            const el = lastMouseDownEvent.target;
            destinationParent.appendChild(el);
            el.classList.remove('dragging');
            fixAllIntervalsInRow(el);
            lastMouseDownEvent = null;
            const parentCell = destinationParent.parentElement;
            const timeDiff = new Date(el.dataset.endDate).getTime() - new Date(el.dataset.startDate).getTime();
            el.dataset.startDate = parentCell.dataset.date;
            el.dataset.endDate = new Date(new Date(el.dataset.startDate).getTime() + timeDiff);
            eventEmitter.emit('interval.dragging.stop', el);
        }
    }

    /**
     * @param {MouseEvent} e
     */
    const startResizing = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, clientX } = lastMouseDownEvent;
            target.style.width = offsetX + (e.clientX - clientX) + 'px';
        }
    }

    /**
     * @param {MouseEvent} e
     */
    const stopResizing = function(e) {
        document.removeEventListener('mousemove', startResizing);
        document.removeEventListener('mouseup', stopResizing);
        lastMouseDownEvent = null;
    }

    /**
     * @param {MouseEvent} e
     */
    const mouseDownHandler = function(e) {
        if (e.target.classList.contains('calendar-interval')) {
            const rect = e.target.getBoundingClientRect();
            lastMouseDownEvent = e;
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                document.addEventListener('mousemove', startResizing);
                document.addEventListener('mouseup', stopResizing);
            } else {
                document.addEventListener('mousemove', startDragging);
                document.addEventListener('mouseup', stopDragging);
            }
        }
    }
    document.addEventListener('mousedown', mouseDownHandler);

    document.addEventListener('click', function(e) {
        if (draggingDetected) {
            return;
        }
        if (e.target.classList.contains('calendar-interval')) {
            selectInterval(e.target);
            dialog.openDialog(e.target.dataset.id);
        }
        else if (e.target.classList.contains('calendar-cell')) {
            dialog.openDialog(null);
        }
        else if (e.target.classList.contains('calendar-cell')) {
            deselectAllIntervals();
            dialog.closeDialog();
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (e.target.classList.contains('calendar-interval')) {
            e.target.style.cursor = 'pointer';

            const rect = e.target.getBoundingClientRect();
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                e.target.style.cursor = 'col-resize';
            }
        }
        document.elementsFromPoint(e.clientX, e.clientY).forEach(el => {
            if (el.classList.contains('calendar-cell')) {
                shadeCalendarCell(el);
                destinationParent = el.querySelector('.events-container');
            }
        });
    });

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

export { setupEvents };
