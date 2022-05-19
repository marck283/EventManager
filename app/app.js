const express = require('express');
const app = express();

const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');

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
app.use('/api/v1/Utenti',registrato);


app.use('/', express.static('static'));

app.use(tokenChecker);









/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});



module.exports = app;