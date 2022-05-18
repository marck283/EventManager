const express = require('express');
const EventoPubblico = require('./iscrizione_evento_pubblico')
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


app.use('/api/v1/EventiPubblici', EventoPubblico);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;