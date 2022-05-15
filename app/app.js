const express = require('express');
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
app.use("/api/v1/events", events); //Non funziona. Come mai?

app.get("/static", (req, res) => {
    res.sendFile("./publicCalendar.html");
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