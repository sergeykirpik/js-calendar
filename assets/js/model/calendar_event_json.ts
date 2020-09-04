export default interface CalendarEvent {
    id: string;
    author: string;
    color: string;
    description: string;
    title: string;
    isCanceled: boolean;
    startDate: string,
    endDate: string,
    status: string,
}
