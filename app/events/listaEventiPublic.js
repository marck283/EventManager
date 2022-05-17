const express = require('express');
const eventPublic = require('../collections/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');

router.get("", async (req, res) => {
    var events = await eventPublic.find({});
    res.status(200).json(eventsMap.map(events, "listaEventi"));
});

module.exports = router;