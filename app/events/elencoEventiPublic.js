const express = require('express');
const eventPublic = require('../collections/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');

router.get("", async (req, res) => {
    var events = await eventPublic.find({data: req.query.giorno});
    res.status(200).json(eventsMap.map(events, "eventiCalendario"));
});

module.exports = router;