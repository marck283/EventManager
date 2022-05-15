const express = require('express');
const path = require('path');
const app = express();



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

var events = require("./events.js");
app.use("/api/v1/events", events);

app.get("/static", (req, res) => {
    //Forse bisogna differenziare per la richiesta di risorse statiche differenti?
    res.sendFile(path.resolve("./static/publicCalendar.html")); //path.resolve() richiede che il path specificato sia assoluto, non relativo
});

app.get("/styles", (req, res) => {
    res.sendFile(path.resolve("/styles/calendar.css"));
});


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;