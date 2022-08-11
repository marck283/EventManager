module.exports = {
    map: function(events, eventType) {
        return events.map(event => {
            var apiUrl;
            switch(eventType) {
                case "pers": {
                    apiUrl = "/api/v2/EventiPersonali/" + event._id;
                    break;
                }
                case "pub": {
                   apiUrl = "/api/v2/EventiPubblici/" + event._id;
                   break;
                }
                case "priv": {
                    apiUrl = "/api/v2/EventiPrivati/" + event._id;
                    break;
                }
                default: {
                    //This should never happen
                    return {};
                }
            }
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