interface IntervalElement extends HTMLElement {
    dataset: {
        id: string,
        startDate: string,
        endDate: string,
        canceled?: string,
    },
}

export default IntervalElement;
