function deselectAllIntervals() {
    document.querySelectorAll('.selected.calendar-interval')
        .forEach(el => el.classList.remove('selected'))
    ;
}

/**
 *
 * @param {Element} el
 */
function selectInterval(el) {
    deselectAllIntervals();
    el.classList.add('selected');
}

function unshadeAllCalendarCells() {
    document.querySelectorAll('.shaded.calendar-cell')
        .forEach(el => el.classList.remove('shaded'))
    ;
}

/**
 *
 * @param {Element} el
 */
function shadeCalendarCell(el) {
    unshadeAllCalendarCells();
    el.classList.add('shaded');
}

export { deselectAllIntervals, selectInterval, unshadeAllCalendarCells, shadeCalendarCell }
