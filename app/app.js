var express = require('express');
const RateLimit = require('express-rate-limit');
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
app.disable('x-powered-by'); //Disabling x-powered-by for security reasons

/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));
app.use('/api/v2/authentications', autenticato);
app.use('/api/v2/EventiPubblici', EventoPubblico);
app.use("/api/v2/eventiCalendarioPubblico", calendarEventsPub);
app.use('/api/v2/Utenti', regandric);
app.use('/api/v2/RecuperoPassword', recPsw);

var limiter = RateLimit({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 100 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
app.use(limiter);


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
