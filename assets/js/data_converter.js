class DataConverter {
  static eventFromJSON(json) {
    const res = { ...json };
    res.startDate = new Date(`${res.startDate.split('+')[0]}Z`);
    res.endDate = new Date(`${res.endDate.split('+')[0]}Z`);

    return res;
  }

  static eventsFromJSON(jsonArray) {
    return jsonArray.map(DataConverter.eventFromJSON);
  }
}

export default DataConverter;
