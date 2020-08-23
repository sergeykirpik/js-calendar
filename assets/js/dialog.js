import { makeGradient } from './color_utils';

function fillDialog(dialog, data) {
    dialog.querySelector('.status').textContent = `[ ${data['status']} ]`;
    const form = dialog.querySelector('form');
    form.title.value = data['title'];
    form.description.value = data['description'];
    form.querySelector('.color-swatch').style.background = makeGradient(data['color']);
    form.author.value = data['author'];
}

function openDialog(id) {
    const dialog = document.querySelector('.dialog');
    if (dialog) {
        dialog.classList.remove('hidden');
    }
    fetch('/api/events/'+id)
        .then(response => response.json())
        .then(data => {
            fillDialog(dialog, data.data);
            console.log(Object.keys(data.data));
            dialog.querySelector('.info').textContent =
                Object.keys(data.data).map(k => k+": " + data.data[k]).join('\n');
        });
    dialog.querySelector('.status').textContent = `[ Loading: id: ${id}... ]`;
}

function closeDialog() {
    const dialog = document.querySelector('.dialog')
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

function makeDraggable(dialog) {

    let lastMouseDownEvent = null;

    const drag = function(e) {
        console.log('drag');
        dialog.style.left = e.clientX - lastMouseDownEvent.offsetX + 'px';
        dialog.style.top  = e.clientY - lastMouseDownEvent.offsetY + 'px';
    }

    const dragStop = function() {
        console.log('stop drag');
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

    document.querySelectorAll('.dialog').forEach(dialog => makeDraggable(dialog));
}


export { openDialog, closeDialog, setupDialogs };
