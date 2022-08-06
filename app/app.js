var express = require('express');
const cors = require('cors');
var app = express();
const EventoPubblico = require('./events/EventiPub.js');
const EventoPubIscrCreaDelMod = require('./events/IscrCreDelModEvenPub.js');
const EventoPersonale = require('./events/EventiPers.js');
const EventoPrivato = require('./events/EventiPriv.js');
const calendarEventsPers = require("./events/elencoEventiPersonali.js");
const calendarEventsPub = require("./events/elencoEventiPublic.js");
const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');
const Utente = require('./Utenti.js');
const regandric = require('./regAndRicerca.js');
const recPsw = require('./pswRecovery.js');

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
app.use('/api/v2/authentications', autenticato);
app.use('/api/v2/EventiPubblici', EventoPubblico);
app.use("/api/v2/eventiCalendarioPubblico", calendarEventsPub);
app.use('/api/v2/Utenti', regandric);
app.use('/api/v2/RecuperoPassword', recPsw);


app.use(tokenChecker);


app.use('/api/v2/EventiPubblici', EventoPubIscrCreaDelMod);
app.use('/api/v2/EventiPersonali', EventoPersonale);
app.use('/api/v2/EventiPrivati', EventoPrivato);
app.use('/api/v2/Utenti', Utente);
app.use("/api/v2/eventiCalendarioPersonale", calendarEventsPers);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});

module.exports = app;
