const express = require('express');
const app = express();
const authentication = require('./authentication.js');
const Utenti = require('./users.js');
const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * Serve front-end static files
 */



app.use('/api/v1/authentications', autenticato);




app.use(tokenChecker);

app.use('/', express.static('static'));

app.use('/api/v1/Utenti',Utenti)

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});



module.exports = app;