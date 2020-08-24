import { makeGradient } from './color_utils';

import { toLocalISOTime, toLocalISODate } from './date_utils';

function fillDialog(dialog, data) {
    console.log(data);

    dialog.querySelector('.status').textContent = `[ ${data['status']} ]`;
    const form = dialog.querySelector('form');
    form.title.value = data['title'];
    form.description.value = data['description'];
    form.startDate.value = toLocalISODate(data['startDate']);
    form.endDate.value = toLocalISODate(data['endDate']);

    form.startTime.value = toLocalISOTime(data['startDate']);
    form.endTime.value = toLocalISOTime(data['endDate']);

    form.querySelector('.color-swatch').style.background = makeGradient(data['color']);
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
    if (dialog) {
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

function setupDialogs() {

    document.querySelector('.dialog .btn-close')
        .addEventListener('click', closeDialog)
    ;

    document.querySelectorAll('.dialog').forEach(dialog => {
        makeDraggable(dialog);
    });
}


export { openDialog, closeDialog, setupDialogs };
