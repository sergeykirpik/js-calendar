function isEventInProgress({ startDate, endDate }) {
    const now = Date.now();
    return (now >= startDate && now <= endDate);
}

function isEventDone({ endDate }) {
    return (Date.now() > endDate.getTime());
}

function isEventNew({ startDate }) {
    return (Date.now() < startDate);
}

export { isEventNew, isEventInProgress, isEventDone };