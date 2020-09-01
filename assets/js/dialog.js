import { setElementColor } from './color_utils';
import { toLocalISODate, toLocalISOTimeWithoutSeconds } from './date_utils';
import EventEmitter from './emitter';

import { die, makeDraggable } from './utils';
import ApiService from './api';

import { isEventNew, isEventInProgress, isEventDone } from './status_utils';

function setVisibility(el, shown=false) {
    el.classList.toggle('d-none', !shown);
}

function show(el) {
    setVisibility(el, true);
}

function hide(el) {
    setVisibility(el, false);
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

        this.btnActivate = this.dialog.querySelector('.btn-activate-event');
        this.btnCancel = this.dialog.querySelector('.btn-cancel-event');

        this.hideOnTransitionComplete = this.hideOnTransitionComplete.bind(this);
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fillDialog = this.fillDialog.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleActivate = this.handleActivate.bind(this);

        this.setupDialogEvents();
    }

    fireEvent(evt, data) {
        this.eventEmitter.emit(evt, data);
    }

    fillDialog(data) {
        let title = '';
        let status = '';

        if (data['id']) {
            title = 'Edit event #' + data['id'];
            if (data['isCanceled']) {
                status = '[ canceled ]';
                if (!isEventDone(data)) {
                    show(this.btnActivate);
                }
            }
            else if (isEventInProgress(data)) {
                status = '[ in-progress ]';
                show(this.btnCancel);
            }
            else if (isEventDone(data)) {
                status = '[ done ]';
            }
            else if (isEventNew(data)) {
                status = '[ new ]';
                show(this.btnCancel);
            }
        } else {
            title = 'Create new event'
            status = '[ new ]';
        }

        this.dialog.querySelector('.status').textContent = title;

        const form = this.dialog.querySelector('form');
        form.status.value = status;
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
        this.dialog.querySelector('.status').textContent = ``;
        hide(this.btnCancel);
        hide(this.btnActivate);

        if (this.dialog) {
            this.dialog.classList.remove('hidden');
            this.dialog.classList.remove('transparent');
        }
        if (id) {
            this.dialog.querySelector('.status').textContent = `[Loading: id: ${ id }... ]`;
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
            e.target.removeEventListener('transitionend', this.hideOnTransitionComplete);
            e.target.classList.add('hidden');
        }
    }

    closeDialog() {
        this.currentId = null;
        const dialog = this.dialog;
        if (dialog && !dialog.classList.contains('transparent')) {
            dialog.classList.add('transparent');
            dialog.addEventListener('transitionend', this.hideOnTransitionComplete);
        }
        this.fireEvent('dialog.close');
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            title: formData.get('title') || 'Untitled event',
            description: formData.get('description'),
            startDate: new Date(formData.get('startDate') + 'T' + formData.get('startTime')),
            endDate: new Date(formData.get('endDate') + 'T' + formData.get('endTime')),
            color: formData.get('color'),
            isCanceled: false,
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

    handleCancel(e) {
        this.api.patchEvent(this.currentId, { isCanceled: true });
        this.closeDialog();
    }

    handleActivate(e) {
        this.api.patchEvent(this.currentId, { isCanceled: false });
        this.closeDialog();
    }

    setupDialogEvents() {

        makeDraggable(this.dialog);

        this.dialog.querySelector('.btn-close').addEventListener('click', this.closeDialog);

        this.btnCancel.addEventListener('click', this.handleCancel);

        this.btnActivate.addEventListener('click', this.handleActivate);

        this.dialog.querySelector('form').addEventListener('submit', this.handleSubmit);

        this.dialog.querySelector('#color').addEventListener('change', this.handleColorChange);

        this.dialog.querySelector('.btn-delete').addEventListener('click', this.handleDelete);
    }
}


export default Dialog;
