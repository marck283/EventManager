const express = require('express');
const app = express();

const authentication = require('./authentication.js');
const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');
const infoUtente = require('./infoUtente.js');

const registrato = require('./registrazione.js');

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */

app.use('/api/v1/authentications', autenticato);
app.use('/', express.static('static'));

app.use('/api/v1/Utenti', infoUtente); //Da cambiare sotto tokenChecker

app.use(tokenChecker);

app.use('/api/v1/Utenti', registrato);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});

module.exports = app;
