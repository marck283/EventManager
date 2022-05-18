const express = require('express');
const eventPublic = require('../collezioni/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var events = await eventPublic.find({data: str});
    console.log(events[0]);
    if(events.length > 0) {
        res.status(200).json(eventsMap.map(events, "layoutPubblico.html"));
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;