export default interface CalendarEventPatch {
    id?: string | null;
    color?: string;
    description?: string;
    title?: string;
    isCanceled?: boolean | false;
    startDate?: Date,
    endDate?: Date,
}
