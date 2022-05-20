module.exports = {
    map: function(events, routeId, userToken) {
        return events.map(event => {
            return {
                id: routeId + '?id=' + event._id + "&token=" + userToken,
                name: event.nomeAtt,
                category: event.categoria
            }
        });
    }
}