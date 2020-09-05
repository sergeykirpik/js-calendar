import CalendarEventPatch from './calendar_event_patch';
import CalendarEventJson from './calendar_event_json';
import { dateDiffInDays, dateDiffHuman } from '../utils/date_utils';

export default class CalendarEvent {
  id: string;
  isCanceled: boolean;
  title: string;
  description: string;
  author: string;
  color: string;
  startDate: Date;
  endDate: Date;

  constructor(data: CalendarEventPatch) {
    this.id = data.id || '';
    this.isCanceled = data.isCanceled || false;
    this.title = data.title || 'Untitled event';
    this.description = data.description || '';
    this.author = data.author || 'You';
    this.color = data.color || '#aaaaaa';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || data.startDate || new Date();
  }

  static eventFromJSON(json: CalendarEventJson): CalendarEvent {
    const { startDate, endDate, ...rest } = json;
    return new CalendarEvent({
      startDate: new Date(`${startDate.split('+')[0]}Z`),
      endDate: new Date(`${endDate.split('+')[0]}Z`),
      ...rest
    });
  }

  static eventArrayFromJSON(jsonArray: Array<CalendarEventJson>): Array<CalendarEvent> {
    return jsonArray.map(CalendarEvent.eventFromJSON);
  }

  isInProgress(): boolean {
    const now = Date.now();
    return (now >= this.startDate.getTime() && now <= this.endDate.getTime());
  }

  isDone(): boolean {
    return (Date.now() > this.endDate.getTime());
  }

  isNew(): boolean {
    return (Date.now() < this.startDate.getTime());
  }


  getCurrentStatus(): string {
    let status = '[ ]';
    if (this.isCanceled) {
      status = '[ canceled ]';
    } else if (this.isDone()) {
      status = '[ done ]';
    } else if (this.isInProgress()) {
      status = '[ in-progress ]';
    } else if (this.isNew()) {
      const now = new Date();
      if (dateDiffInDays(now, this.startDate) < 2) {
        status = `[ starts in  ${dateDiffHuman(now, this.startDate)} ]`;
      } else {
        status = '[ new ]';
      }
    }

    return status;
  }
}
