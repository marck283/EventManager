module.exports = {
    map: function(events, eventType) {
        return events.map(event => {
            var apiUrl = "/api/v2/";
            switch(eventType) {
                case "pers": {
                    apiUrl += "EventiPersonali";
                    break;
                }
                case "pub": {
                   apiUrl += "EventiPubblici";
                   break;
                }
                case "priv": {
                    apiUrl += "EventiPrivati";
                    break;
                }
                default: {
                    //This should never happen
                    return {};
                }
            }
            apiUrl += "/" + event._id;
            return {
                id: eventType,
                idevent: event._id,
                self: apiUrl,
                name: event.nomeAtt,
                category: event.categoria
            }
        });
    }
}