import CalendarEventJson from './model/calendar_event_json';
import CalendarEvent from './model/calendar_event';

class DataConverter {
  static eventFromJSON(json: CalendarEventJson): CalendarEvent {
    const { startDate, endDate, ...rest } = json;
    const res: CalendarEvent = {
      startDate: new Date(`${startDate.split('+')[0]}Z`),
      endDate: new Date(`${endDate.split('+')[0]}Z`),
      ...rest
    };

    return res;
  }

  static eventsFromJSON(jsonArray: Array<CalendarEventJson>): Array<CalendarEvent> {
    return jsonArray.map(DataConverter.eventFromJSON);
  }
}

export default DataConverter;
