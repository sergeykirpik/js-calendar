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
        this.eventEmitter = emitter || new EventEmitter();
        this.dialog = element || die('element parameter is required');
        this.api = api || die('api is required');

        this.hideOnTransitionComplete = this.hideOnTransitionComplete.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.fillDialog = this.fillDialog.bind(this);

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

    openDialog(id) {
        const dialog = document.querySelector('.dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
            dialog.classList.remove('transparent');
        }
        this.api.getEvent(id).then(this.fillDialog);
        dialog.querySelector('.status').textContent = `[Loading: id: ${ id }... ]`;
    }

    hideOnTransitionComplete(e) {
        if (e.target.classList.contains('dialog')) {
            console.log('hide');
            e.target.removeEventListener('transitionend', this.hideOnTransitionComplete);
            e.target.classList.add('hidden');
        }
    }

    closeDialog() {
        const dialog = this.dialog;
        if (dialog && !dialog.classList.contains('transparent')) {
            console.log('close');
            dialog.classList.add('transparent');
            dialog.addEventListener('transitionend', this.hideOnTransitionComplete);
        }
        this.fireEvent('dialog.close');
    }

    submitHandler(e) {
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

        this.api.patchEvent(formData.get('eventId'), data);

        this.closeDialog();
    }

    handleColorChange(e) {
        console.log(e.target.value);
        setElementColor(this.dialog.querySelector('.color-swatch'), e.target.value);
    }

    setupDialogEvents() {
        this.dialog.querySelector('.btn-close').addEventListener('click', this.closeDialog);
        makeDraggable(this.dialog);

        this.dialog.querySelector('form').addEventListener('submit', this.submitHandler);

        this.dialog.querySelector('#color').addEventListener('change', this.handleColorChange);
    }
}


export default Dialog;
