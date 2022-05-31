module.exports = {
    map: function(events, eventType) {
        return events.map(event => {
            if(eventType == "pers") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v1/EventiPersonali/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }

            if(eventType == "pub") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v1/EventiPubblici/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }

            if(eventType == "priv") {
                return {
                    id: eventType,
                    idevent: event._id,
                    self: "/api/v1/EventiPrivati/" + event._id,
                    name: event.nomeAtt,
                    category: event.categoria
                }
            }
        });
    }
}