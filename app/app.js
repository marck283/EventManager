var express = require('express');
const cors = require('cors');
var app = express();
const EventoPubblico = require('./events/EventiPub.js');
const EventoPubIscrCrea = require('./events/IscrCreEvenPub.js');
const EventoPersonale = require('./events/EventiPers.js');
const calendarEventsPers = require("./events/elencoEventiPersonali.js");
const calendarEventsPub = require("./events/elencoEventiPublic.js");
const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');
const Utente = require('./Utenti.js');
const registrato = require('./registrazione.js')



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());

/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));
app.use('/api/v1/authentications', autenticato);
app.use('/api/v1/EventiPubblici', EventoPubblico);
app.use("/api/v1/eventiCalendarioPubblico", calendarEventsPub);
app.use('/api/v1/Utenti', registrato);
app.use('/api/v1/Utenti', Utente);
app.use('/api/v1/EventiPubblici', EventoPubIscrCrea);

app.use(tokenChecker);

//********************************************************** attenzione *********************

app.use('/api/v1/EventiPersonali', EventoPersonale);

app.use("/api/v1/eventiCalendarioPersonale", calendarEventsPers);



/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});

module.exports = app;
