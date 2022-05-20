var personalEvents = require("./events/elencoEventiPersonali.js"), personalList = require('./events/listaEventiPersonali.js');
var express = require('express');
var path = require('path');
var app = express();

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

app.use("/api/v1/GiorniCalendarioPersonale", personalEvents);
app.use("/api/v1/EventiPersonali", personalList);

app.get("/static", (req, res) => {
    res.status(200).sendFile(path.resolve("./calendarioPersonale.html"));
});

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;