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

var eventList = require("./events/listaEventiPublic.js"), calendarEvents = require("./events/elencoEventiPublic.js");
app.use("/api/v1/EventiPubblici", eventList);
app.use("/api/v1/GiorniCalendarioPubblico", calendarEvents);

app.get("/static", (req, res) => {
    //Forse bisogna differenziare per la richiesta di risorse statiche differenti?
    res.status(200).sendFile(path.resolve("./static/publicCalendar.html")); //path.resolve() richiede che il path specificato sia assoluto, non relativo
});

app.get("/styles", (req, res) => {
    res.status(200).sendFile(path.resolve("/styles/calendar.css"));
});


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;