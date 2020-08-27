import { setElementColor } from './color_utils';
import { toLocalISOTime, toLocalISODate, toLocalISOTimeWithoutSeconds } from './date_utils';
import EventEmitter from './event-emitter';

import { die } from './utils';
import ApiService from './api';

function makeDraggable(dialog) {

    let lastMouseDownEvent = null;

    const drag = function (e) {
        dialog.style.left = e.clientX - lastMouseDownEvent.offsetX + 'px';
        dialog.style.top = e.clientY - lastMouseDownEvent.offsetY + 'px';
    }

    const dragStop = function () {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragStop);
    }

    dialog.addEventListener('mousedown', function (e) {
        if (e.target.classList.contains('drag-handle')) {
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragStop);
            lastMouseDownEvent = e;
        }
    });
}


class Dialog {
    /**
     *
     * @param {Element} dialog
     * @param {EventEmitter} emitter
     * @param {ApiService} api
     */
    constructor({ element, emitter, api }) {
        this.currentId = null;

        this.eventEmitter = emitter || new EventEmitter();
        this.dialog = element || die('element parameter is required');
        this.api = api || die('api is required');

        this.hideOnTransitionComplete = this.hideOnTransitionComplete.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fillDialog = this.fillDialog.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.setupDialogEvents();
    }

    fireEvent(evt, data) {
        this.eventEmitter.emit(evt, data);
    }

    fillDialog(data) {
        console.log(data);

        this.dialog.querySelector('.status').textContent = `[ ${data['status']} ]`;
        const form = this.dialog.querySelector('form');
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

    openDialog({id, startDate, endDate}) {
        this.currentId = id;
        const dialog = document.querySelector('.dialog');
        dialog.querySelector('.status').textContent = ``;
        if (dialog) {
            dialog.classList.remove('hidden');
            dialog.classList.remove('transparent');
        }
        if (id) {
            dialog.querySelector('.status').textContent = `[Loading: id: ${ id }... ]`;
            this.api.getEvent(id).then(this.fillDialog);
        } else {
            this.fillDialog({
                status: 'new',
                title: '',
                description: '',
                startDate,
                endDate: (endDate || startDate),
                color: '#aaaaaa',
                author: 'You',
            });
        }
    }

    hideOnTransitionComplete(e) {
        if (e.target.classList.contains('dialog')) {
            console.log('hide');
            e.target.removeEventListener('transitionend', this.hideOnTransitionComplete);
            e.target.classList.add('hidden');
        }
    }

    closeDialog() {
        this.currentId = null;
        const dialog = this.dialog;
        if (dialog && !dialog.classList.contains('transparent')) {
            console.log('close');
            dialog.classList.add('transparent');
            dialog.addEventListener('transitionend', this.hideOnTransitionComplete);
        }
        this.fireEvent('dialog.close');
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('submit form...');

        const data = {
            title: formData.get('title') || 'Untitled event',
            description: formData.get('description'),
            startDate: new Date(formData.get('startDate') + 'T' + formData.get('startTime')),
            endDate: new Date(formData.get('endDate') + 'T' + formData.get('endTime')),
            color: formData.get('color'),
        };

        if (this.currentId) {
            this.api.patchEvent(formData.get('eventId'), data);
        } else {
            this.api.postEvent(data);
        }
        this.closeDialog();
    }

    handleColorChange(e) {
        setElementColor(this.dialog.querySelector('.color-swatch'), e.target.value);
    }

    handleDelete(e) {
        this.api.deleteEvent(this.currentId);
        this.closeDialog();
    }

    setupDialogEvents() {

        makeDraggable(this.dialog);

        this.dialog.querySelector('.btn-close').addEventListener('click', this.closeDialog);

        this.dialog.querySelector('form').addEventListener('submit', this.handleSubmit);

        this.dialog.querySelector('#color').addEventListener('change', this.handleColorChange);

        this.dialog.querySelector('.btn-delete').addEventListener('click', this.handleDelete);
    }
}


export default Dialog;
