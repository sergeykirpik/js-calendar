
import Dialog from './dialog';
import EventEmitter from './event-emitter';

const RESIZE_OFFSET = 10;

/**
 *
 * @param {Dialog} dialog
 * @param {EventEmitter} eventEmitter
 */
function setupEvents({dialog, eventEmitter, calendar}) {
    let lastMouseDownEvent = null;
    let destinationParent = null;

    /**
     *
     * @param {MouseEvent} e
     */
    const handleDrag = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, offsetY } = lastMouseDownEvent;
            if (!target.classList.contains('dragging')) {
                target.classList.add('dragging');
            }
            target.style.left = e.clientX-offsetX+'px';
            target.style.top  = e.clientY-offsetY-(parseInt(target.style.marginTop, 10) || 0)+'px';

            eventEmitter.emit('interval.drag');
        }
    }

    /**
     * @param {MouseEvent} e
     */
    const handleDrop = function(e) {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDrop);

        const itWasDragAndDrop =
            e.clientX !== lastMouseDownEvent.clientX
            || e.clientY !== lastMouseDownEvent.clientY
        ;

        if (itWasDragAndDrop) {
            const el = lastMouseDownEvent.target;
            destinationParent.appendChild(el);
            el.classList.remove('dragging');
            //TODO: refactor this
            calendar.fixAllIntervalsInRow(calendar.getIntervalParentRow(el));
            lastMouseDownEvent = null;
            const parentCell = destinationParent.parentElement;
            const timeDiff = new Date(el.dataset.endDate).getTime() - new Date(el.dataset.startDate).getTime();
            el.dataset.startDate = parentCell.dataset.date;
            el.dataset.endDate = new Date(new Date(el.dataset.startDate).getTime() + timeDiff);
            eventEmitter.emit('interval.drop', el);
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
    const handleMouseDown = function(e) {
        if (e.button !== 0) {
            return;
        }
        if (e.target.classList.contains('calendar-interval')) {
            const rect = e.target.getBoundingClientRect();
            lastMouseDownEvent = e;
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                document.addEventListener('mousemove', startResizing);
                document.addEventListener('mouseup', stopResizing);
            } else {
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', handleDrop);
            }
        }
    }
    document.addEventListener('mousedown', handleMouseDown);

    const handleClick = function(e) {
        if (e.target.classList.contains('calendar-interval')) {
            calendar.selectInterval(e.target);
            dialog.openDialog({ id: e.target.dataset.id });
        }
        else if (e.target.classList.contains('calendar-cell')) {
            dialog.openDialog({ startDate: new Date(e.target.dataset.date) });
        }
        else if (e.target.classList.contains('calendar-cell')) {
            calendar.deselectAllIntervals();
            dialog.closeDialog();
        }
    }

    document.addEventListener('click', handleClick);

    const handleMouseMove = function(e) {
        if (e.target.classList.contains('calendar-interval')) {
            e.target.style.cursor = 'pointer';

            const rect = e.target.getBoundingClientRect();
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                e.target.style.cursor = 'col-resize';
            }
        }
        document.elementsFromPoint(e.clientX, e.clientY).forEach(el => {
            if (el.classList.contains('calendar-cell')) {
                // TODO: refactor this
                calendar.shadeCell(el);
                destinationParent = el.querySelector('.events-container');
            }
        });
    }

    document.addEventListener('mousemove', handleMouseMove);

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
