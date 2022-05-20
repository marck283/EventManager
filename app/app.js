var express = require('express');
var path = require('path');
var app = express();
const infoEventoPubblico = require('./infoEventiPublic');
const infoEventoPersonale = require('./infoEventiPersonal');



//Si recuperano i router per la gestione della creazione degli eventi
const eventspublics = require('./eventipubblici.js');
const eventspersonals = require('./eventiPersonali.js');

var personalEvents = require("./events/elencoEventiPersonali.js"), personalList = require('./events/listaEventiPersonali.js');


const eventList = require("./events/listaEventiPublic.js"), calendarEvents = require("./events/elencoEventiPublic.js");

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

app.use('/api/v1/EventiPubblici', infoEventoPubblico);
app.use('/api/v1/EventiPersonali', infoEventoPersonale);

app.use('/api/v1/Utenti', infoUtente); //Da cambiare sotto tokenChecker

app.use('/api/v1/Utenti', registrato);
app.use("/api/v1/GiorniCalendarioPersonale", personalEvents);
app.use("/api/v1/EventiPersonali", personalList);

app.use("/api/v1/EventiPubblici", eventList);
app.use("/api/v1/GiorniCalendarioPubblico", calendarEvents);

app.use('/api/v1/Utenti',registrato);
app.use(tokenChecker);


//Si posizionano i middleware pre la gestione della creazione degli eventi
app.use('/api/v1/EventiPubblici', eventspublics);
app.use('/api/v1/EventiPersonali', eventspersonals);

app.use('/api/v1/EventiPubblici', EventoPubblico);


/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});



module.exports = app;
