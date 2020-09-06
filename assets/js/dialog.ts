import '../css/dialog.css';

import { setElementColor } from './utils/color_utils';
import { toLocalISODate, toLocalISOTimeWithoutSeconds } from './utils/date_utils';
import EventEmitter from './emitter';

import { die } from './utils/assertion_utils';

import ApiService from './api';
import CalendarEventPatch from './model/calendar_event_patch';
import CalendarEvent from './model/calendar_event';
import { showElement, setVisibility, hideElement, makeDraggable } from './utils/element_utils';

class Dialog extends EventEmitter {
  currentId: string;
  dialogEl: HTMLElement;
  api: ApiService;
  btnClose: HTMLElement;
  btnActivate: HTMLElement;
  btnCancel: HTMLElement;
  btnDelete: HTMLElement;
  statusEl: HTMLElement;
  colorSwatchEl: HTMLElement;
  formEl: HTMLFormElement;
  colorHiddenEl: HTMLInputElement;

  constructor({ element, api }: { element: HTMLElement, api: ApiService }) {
    super();

    this.currentId = "";
    this.dialogEl = element;
    this.api = api;

    this.formEl = this.dialogEl.querySelector('form') || die();

    this.btnClose = this.dialogEl.querySelector('.btn-close') || die();
    this.btnActivate = this.dialogEl.querySelector('.btn-activate-event') || die();
    this.btnCancel = this.dialogEl.querySelector('.btn-cancel-event') || die();
    this.btnDelete = this.dialogEl.querySelector('.btn-delete') || die();

    this.statusEl = this.dialogEl.querySelector('.status') || die();
    this.colorHiddenEl = this.dialogEl.querySelector('#color') || die();
    this.colorSwatchEl = this.dialogEl.querySelector('.color-swatch') || die();

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

  fillDialog(data: CalendarEvent): void {
    let title = '';
    let status = '';

    if (data.id) {
      title = `Edit event #${data.id}`;
      if (data.isCanceled) {
        status = '[ canceled ]';
        if (!data.isDone()) {
          showElement(this.btnActivate);
        }
      } else if (data.isInProgress()) {
        status = '[ in-progress ]';
        showElement(this.btnCancel);
      } else if (data.isDone()) {
        status = '[ done ]';
      } else if (data.isNew()) {
        status = '[ new ]';
        showElement(this.btnCancel);
      }
    } else {
      title = 'Create new event';
      status = '[ new ]';
    }
    setVisibility(this.btnDelete, !!data.id);

    this.statusEl.textContent = title;

    this.formEl.status.value = status;
    this.formEl.eventId.value = data.id;
    this.formEl['event-title'].value = data.title;
    this.formEl.description.value = data.description;
    this.formEl.startDate.value = toLocalISODate(data.startDate);
    this.formEl.endDate.value = toLocalISODate(data.endDate);

    this.formEl.startTime.value = toLocalISOTimeWithoutSeconds(data.startDate);
    this.formEl.endTime.value = toLocalISOTimeWithoutSeconds(data.endDate);

    this.formEl.color.value = data.color;
    setElementColor(this.colorSwatchEl, data.color);
    this.formEl.author.value = data.author;
  }

  openDialog({ id = '', startDate }: { id?: string, startDate?: Date }): void {
    this.currentId = id;
    this.statusEl.textContent = '';
    hideElement(this.btnCancel);
    hideElement(this.btnActivate);

    if (this.dialogEl) {
      this.dialogEl.classList.remove('hidden');
      this.dialogEl.classList.remove('transparent');
    }
    if (id) {
      this.statusEl.textContent = `[Loading: id: ${id}... ]`;
      this.api.getEvent(id).then(this.fillDialog);
    } else {
      this.fillDialog(new CalendarEvent({ startDate }));
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
    if (this.dialogEl && !this.dialogEl.classList.contains('transparent')) {
      this.dialogEl.classList.add('transparent');
      this.dialogEl.addEventListener('transitionend', this.hideOnTransitionComplete);
    }
    this.fireEvent('dialog.close');
  }

  isHidden(): boolean {
    return this.dialogEl.classList.contains('hidden');
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    const formData = new FormData(this.formEl);

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

  handleColorChange(): void {
    setElementColor(this.colorSwatchEl, this.colorHiddenEl.value);
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
    makeDraggable(this.dialogEl);

    this.btnClose.addEventListener('click', this.closeDialog);

    this.btnCancel.addEventListener('click', this.handleCancel);

    this.btnActivate.addEventListener('click', this.handleActivate);

    this.formEl.addEventListener('submit', this.handleSubmit);

    this.colorHiddenEl.addEventListener('change', this.handleColorChange);

    this.btnDelete.addEventListener('click', this.handleDelete);
  }
}

export default Dialog;
