module.exports = {
    map: function(events, routeId) {
        return events.map(event => {
            return {
                id: '/api/v1/' + routeId + '/' + event._id,
                name: event.nomeAtt,
                category: event.categoria
            }
        });
    }
}