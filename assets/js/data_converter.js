class DataConverter {
    static eventFromJSON(json) {
        const res = { ...json };
        res['startDate'] = new Date(res['startDate']);
        res['endDate'] = new Date(res['endDate']);

        return res;
    }

    static eventsFromJSON(jsonArray) {
        return jsonArray.map(DataConverter.eventFromJSON);
    }
}

export default DataConverter;