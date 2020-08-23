import {
    shadeCalendarCell,
    selectInterval,
} from './calendar';

import {
    openDialog,
    closeDialog,
} from './dialog';

const RESIZE_OFFSET = 10;

function setupEvents() {
    let lastMouseDownEvent = null;
    let draggingDetected = false;

    /**
     *
     * @param {MouseEvent} e
     */
    const startDragging = function(e) {
        if (lastMouseDownEvent) {
            const { target, offsetX, offsetY } = lastMouseDownEvent;
            target.style.position = 'absolute';
            target.style.left = e.clientX-offsetX+'px';
            target.style.top  = e.clientY-offsetY+'px';
        }
    }

    /**
     * @param {MouseEvent} e
     */
    const stopDragging = function(e) {
        console.log('stopDragging');
        document.removeEventListener('mousemove', startDragging);
        document.removeEventListener('mouseup', stopDragging);

        draggingDetected =
            e.clientX !== lastMouseDownEvent.clientX
            || e.clientY !== lastMouseDownEvent.clientY
        ;
        lastMouseDownEvent = null;
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
        console.log('stopResizing');
        document.removeEventListener('mousemove', startResizing);
        document.removeEventListener('mouseup', stopResizing);
        lastMouseDownEvent = null;
    }

    /**
     * @param {MouseEvent} e
     */
    const mouseDownHandler = function(e) {
        console.log('mousedown');
        if (e.target.classList.contains('calendar-interval')) {
            const rect = e.target.getBoundingClientRect();
            lastMouseDownEvent = e;
            if (rect.width - e.offsetX < RESIZE_OFFSET) {
                console.log('resizing');
                document.addEventListener('mousemove', startResizing);
                document.addEventListener('mouseup', stopResizing);
            } else {
                console.log('dragging');
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
            console.log('click');
            selectInterval(e.target);
            openDialog(e.target.dataset.id);
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
            }
        });
    });

    const correctCalendarHeadingPosition = function() {
        const calendarHeading = document.querySelector('.calendar-heading');
        const calendar = document.querySelector('.calendar');

        if (calendar && calendarHeading) {

            console.log('resize');
            const rect = calendar.getBoundingClientRect();
            console.log(rect);
            calendarHeading.style.left = rect.left + 'px';
            calendarHeading.style.width = rect.width-10 + 'px';
        }
    }
    window.addEventListener('resize', correctCalendarHeadingPosition);
    correctCalendarHeadingPosition();
}

export { setupEvents };
