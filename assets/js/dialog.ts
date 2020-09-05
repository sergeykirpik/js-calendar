/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { setElementColor } from './color_utils';
import { toLocalISODate, toLocalISOTimeWithoutSeconds } from './date_utils';
import EventEmitter from './emitter';

import { makeDraggable, die } from './utils';

import { isEventNew, isEventInProgress, isEventDone } from './status_utils';
import ApiService from './api';
import CalendarEventPatch from './model/calendar_event_patch';

function setVisibility(el: HTMLElement, shown = false) {
  el.classList.toggle('d-none', !shown);
}

function show(el: HTMLElement) {
  setVisibility(el, true);
}

function hide(el: HTMLElement) {
  setVisibility(el, false);
}

class Dialog extends EventEmitter {
  currentId: string;
  dialog: HTMLElement;
  api: ApiService;
  btnActivate: HTMLElement;
  btnCancel: HTMLElement;
  btnDelete: HTMLElement;

  constructor({ element, api }: { element: HTMLElement, api: ApiService }) {
    super();

    this.currentId = "";
    this.dialog = element;
    this.api = api;

    this.btnActivate = this.dialog.querySelector('.btn-activate-event') || die();
    this.btnCancel = this.dialog.querySelector('.btn-cancel-event') || die();
    this.btnDelete = this.dialog.querySelector('.btn-delete') || die();

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

  fireEvent(evt: string, data?: unknown): void {
    this.emit(evt, data);
  }

  fillDialog(data: { id?: string, isCanceled?: boolean, startDate: Date, endDate: Date, title: string, description: string, color: string, author: string, status: string }): void {
    let title = '';
    let status = '';

    if (data.id) {
      title = `Edit event #${data.id}`;
      if (data.isCanceled) {
        status = '[ canceled ]';
        if (!isEventDone(data)) {
          show(this.btnActivate);
        }
      } else if (isEventInProgress(data)) {
        status = '[ in-progress ]';
        show(this.btnCancel);
      } else if (isEventDone(data)) {
        status = '[ done ]';
      } else if (isEventNew(data)) {
        status = '[ new ]';
        show(this.btnCancel);
      }
    } else {
      title = 'Create new event';
      status = '[ new ]';
    }
    setVisibility(this.btnDelete, !!data.id);

    this.dialog.querySelector('.status')!.textContent = title;

    const form = this.dialog.querySelector('form') as HTMLFormElement;
    form.status.value = status;
    form.eventId.value = data.id;
    form['event-title'].value = data.title;
    form.description.value = data.description;
    form.startDate.value = toLocalISODate(data.startDate);
    form.endDate.value = toLocalISODate(data.endDate);

    form.startTime.value = toLocalISOTimeWithoutSeconds(data.startDate);
    form.endTime.value = toLocalISOTimeWithoutSeconds(data.endDate);

    form.color.value = data.color;
    setElementColor(form.querySelector('.color-swatch') as HTMLElement, data.color);
    form.author.value = data.author;
  }

  openDialog({ id = '', startDate, endDate }: { id?: string, startDate?: Date, endDate?: Date }): void {
    this.currentId = id;
    this.dialog.querySelector('.status')!.textContent = '';
    hide(this.btnCancel);
    hide(this.btnActivate);

    if (this.dialog) {
      this.dialog.classList.remove('hidden');
      this.dialog.classList.remove('transparent');
    }
    if (id) {
      this.dialog.querySelector('.status')!.textContent = `[Loading: id: ${id}... ]`;
      this.api.getEvent(id).then(this.fillDialog);
    } else {
      this.fillDialog({
        status: 'new',
        title: '',
        description: '',
        startDate: startDate || new Date(),
        endDate: (endDate || startDate || new Date()),
        color: '#aaaaaa',
        author: 'You',
      });
    }
  }

  hideOnTransitionComplete(e: TransitionEvent): void {
    const el = e.target as HTMLElement;
    if (el.classList.contains('dialog')) {
      el.removeEventListener('transitionend', this.hideOnTransitionComplete);
      el.classList.add('hidden');
    }
  }

  closeDialog(): void {
    this.currentId = '';
    const { dialog } = this;
    if (dialog && !dialog.classList.contains('transparent')) {
      dialog.classList.add('transparent');
      dialog.addEventListener('transitionend', this.hideOnTransitionComplete);
    }
    this.fireEvent('dialog.close');
  }

  isHidden(): boolean {
    return this.dialog.classList.contains('hidden');
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data: CalendarEventPatch = {
      title: formData.get('title') as string || 'Untitled event',
      description: formData.get('description') as string,
      startDate: new Date(`${formData.get('startDate')}T${formData.get('startTime')}`),
      endDate: new Date(`${formData.get('endDate')}T${formData.get('endTime')}`),
      color: formData.get('color') as string,
      isCanceled: false,
    };

    if (this.currentId) {
      this.api.patchEvent(this.currentId, data);
    } else {
      this.api.postEvent(data);
    }
    this.closeDialog();
  }

  handleColorChange(e: Event): void {
    setElementColor(
      this.dialog.querySelector('.color-swatch') as HTMLElement,
      (e.target as HTMLInputElement).value
    );
  }

  handleDelete(): void {
    this.api.deleteEvent(this.currentId);
    this.closeDialog();
  }

  handleCancel(): void {
    this.api.patchEvent(this.currentId, { isCanceled: true });
    this.closeDialog();
  }

  handleActivate(): void {
    this.api.patchEvent(this.currentId, { isCanceled: false });
    this.closeDialog();
  }

  setupDialogEvents(): void {
    makeDraggable(this.dialog);

    this.dialog.querySelector('.btn-close')?.addEventListener('click', this.closeDialog);

    this.btnCancel.addEventListener('click', this.handleCancel);

    this.btnActivate.addEventListener('click', this.handleActivate);

    this.dialog.querySelector('form')?.addEventListener('submit', this.handleSubmit);

    this.dialog.querySelector('#color')?.addEventListener('change', this.handleColorChange);

    this.dialog.querySelector('.btn-delete')?.addEventListener('click', this.handleDelete);
  }
}

export default Dialog;
