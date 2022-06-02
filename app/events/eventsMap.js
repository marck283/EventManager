module.exports = {
    map: function(events, eventType) {
        return events.map(event => {
            if(eventType == "pers") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v2/EventiPersonali/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }

            if(eventType == "pub") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v2/EventiPubblici/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }

            if(eventType == "priv") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v2/EventiPrivati/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }
        });
    }
}