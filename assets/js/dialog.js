import { setElementColor } from './color_utils';

import { padWithZero } from './date_utils';

import { toLocalISOTime, toLocalISODate, toLocalISOTimeWithoutSeconds } from './date_utils';
import { deselectAllIntervals } from './calendar';

import { randomColor, randomInt } from './random';

function fillDialog(dialog, data) {
    console.log(data);

    dialog.querySelector('.status').textContent = `[ ${data['status']} ]`;
    const form = dialog.querySelector('form');
    form.eventId.value = data['id'];
    form.title.value = data['title'];
    form.description.value = data['description'];
    form.startDate.value = toLocalISODate(data['startDate']);
    form.endDate.value = toLocalISODate(data['endDate']);

    form.startTime.value = toLocalISOTimeWithoutSeconds(data['startDate']);
    form.endTime.value = toLocalISOTimeWithoutSeconds(data['endDate']);

    form.color.value = data['color'];
    setElementColor(form.querySelector('.color-swatch'), data['color']);
    form.author.value = data['author'];
}

function openDialog(id) {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        dialog.classList.remove('transparent');
    }
    fetch('/api/events/'+id)
        .then(response => response.json())
        .then(data => {
            fillDialog(dialog, data.data);
        });
    dialog.querySelector('.status').textContent = `[ Loading: id: ${id}... ]`;
}

function hideOnTransitionComplete(e) {
    if (e.target.classList.contains('dialog')) {
        console.log('hide');
        e.target.removeEventListener('transitionend', hideOnTransitionComplete);
        e.target.classList.add('hidden');
    }
}

function closeDialog() {
    const dialog = document.querySelector('.dialog')
    if (dialog && !dialog.classList.contains('transparent')) {
        console.log('close');
        dialog.classList.add('transparent');
        dialog.addEventListener('transitionend', hideOnTransitionComplete);
    }
}

function makeDraggable(dialog) {

    let lastMouseDownEvent = null;

    const drag = function(e) {
        dialog.style.left = e.clientX - lastMouseDownEvent.offsetX + 'px';
        dialog.style.top  = e.clientY - lastMouseDownEvent.offsetY + 'px';
    }

    const dragStop = function() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragStop);
    }

    dialog.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('drag-handle')) {
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragStop);
            lastMouseDownEvent = e;
        }
    });
}

function updateInterval(data) {
    const el = document.querySelector(`[data-id="${data.id}"]`);
    el.textContent = data.title;
    setElementColor(el, data.color);
}

function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('submit form...');

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        startDate: new Date(formData.get('startDate') + 'T' + formData.get('startTime')),
        endDate: new Date(formData.get('endDate') + 'T' + formData.get('endTime')),
        color: formData.get('color'),
    };
    const eventId = formData.get('eventId');

    fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        updateInterval(data.data);
    });

    closeDialog();
    deselectAllIntervals();
}

function handleColorChange(e) {
    console.log(e.target.value);
    setElementColor(document.querySelector('.dialog .color-swatch'), e.target.value);
}

function setupDialogs() {

    document.querySelector('.dialog .btn-close')
        .addEventListener('click', closeDialog)
    ;

    document.querySelectorAll('.dialog').forEach(dialog => {
        makeDraggable(dialog);
    });

    document.querySelector('.dialog form').addEventListener('submit', submitHandler);

    document.querySelector('.dialog #color').addEventListener('change', handleColorChange);
}


export { openDialog, closeDialog, setupDialogs };
