const express = require('express');
const app = express();

//Si recuperano i router per la gestione della creazione degli eventi
const eventspublics = require('./eventipubblici.js');
const eventspersonals = require('./eventiPersonali.js');

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));



//Si posizionano i middleware pre la gestione della creazione degli eventi
app.use('/api/v1/EventiPubblici', eventspublics);
app.use('/api/v1/EventiPersonali', eventspersonals);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;