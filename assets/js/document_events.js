
import Dialog from './dialog';
import EventEmitter from './emitter';
import Calendar from './calendar';

import { parseISO, toLocalISODateAndTime } from './date_utils';

const RESIZE_OFFSET = 10;

/**
 *
 * @param {{ dialog: Dialog, eventEmitter: EventEmitter, calendar: Calendar }}
 */
function setupEvents({dialog, eventEmitter, calendar}) {
    let lastMouseDownEvent = null;
    let destinationParent = null;
    let itWasDragAndDrop = false;
    let itWasResize = false;

    /** @param {MouseEvent} e*/
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

    /** @param {MouseEvent} e */
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

            const startDate = parseISO(el.dataset.startDate);
            const endDate = parseISO(el.dataset.endDate);
            const timeDiff = endDate.getTime() - startDate.getTime();

            const newStartDate = parseISO(parentCell.dataset.date);
            newStartDate.setHours(startDate.getHours());
            newStartDate.setMinutes(startDate.getMinutes());

            el.dataset.startDate = toLocalISODateAndTime(newStartDate);
            el.dataset.endDate = toLocalISODateAndTime(new Date(newStartDate.getTime() + timeDiff));
            eventEmitter.emit('interval.drop', el);
        }
    }

    /** @param {MouseEvent} e */
    const doResizing = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, clientX } = lastMouseDownEvent;
            target.style.width = offsetX + (e.clientX - clientX) + 'px';
        }
    }

    /** @param {MouseEvent} e */
    const stopResizing = function(e) {
        document.removeEventListener('mousemove', doResizing);
        document.removeEventListener('mouseup', stopResizing);
        const el = lastMouseDownEvent.target;
        const endDate = parseISO(el.dataset.endDate);
        const newEndDate = parseISO(destinationParent.parentElement.dataset.date);
        newEndDate.setHours(endDate.getHours());
        newEndDate.setMinutes(endDate.getMinutes());

        el.dataset.endDate = newEndDate;
        eventEmitter.emit('interval.resize', el);
        itWasResize = true;
        lastMouseDownEvent = null;
    }

    /** @param {MouseEvent} e */
    const handleMouseDown = function(e) {
        if (e.button !== 0) {
            return;
        }
        itWasDragAndDrop = false;
        itWasResize = false;
        if (e.target.classList.contains('calendar-interval')) {
            const rect = e.target.getBoundingClientRect();
            lastMouseDownEvent = e;
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                document.addEventListener('mousemove', doResizing);
                document.addEventListener('mouseup', stopResizing);
            } else {
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', handleDrop);
            }
        }
    }
    document.addEventListener('mousedown', handleMouseDown);

    const handleClick = function(e) {
        if (itWasDragAndDrop || itWasResize) {
            return;
        }
        if (e.target.classList.contains('calendar-interval')) {
            calendar.selectInterval(e.target);
            dialog.openDialog({ id: e.target.dataset.id });
        }
        else if (e.target.classList.contains('calendar-cell')) {
            if (dialog.dialog.classList.contains('hidden')) {
                dialog.openDialog({ startDate: parseISO(e.target.dataset.date) });
            } else {
                calendar.deselectAllIntervals();
                dialog.closeDialog();
            }
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

}

export { setupEvents };
