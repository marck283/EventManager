var express = require('express');
var path = require('path');
const cors = require('cors');
var app = express();
<<<<<<< HEAD
const infoEventoPubblico = require('./infoEventiPublic');
const infoEventoPersonale = require('./infoEventiPersonal');



//Si recuperano i router per la gestione della creazione degli eventi
const eventspublics = require('./eventipubblici.js');
const eventspersonals = require('./eventiPersonali.js');

var personalEvents = require("./events/elencoEventiPersonali.js"), personalList = require('./events/listaEventiPersonali.js');


const eventList = require("./events/listaEventiPublic.js"), calendarEvents = require("./events/elencoEventiPublic.js");

=======
const EventoPubblico = require('./events/EventiPub.js');
const EventoPubIscrCrea = require('./events/IscrCreEvenPub.js');
const EventoPersonale = require('./events/EventiPers.js');
const calendarEventsPers = require("./events/elencoEventiPersonali.js")
const calendarEventsPub = require("./events/elencoEventiPublic.js");
>>>>>>> 020c74390c6f108be5711910831143d0fbfea128
const autenticato = require('./authentication.js');
const tokenChecker = require('./tokenChecker.js');
const Utente = require('./Utenti.js');
const registrato = require('./registrazione.js')



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


<<<<<<< HEAD
/**
 * Serve front-end static files
 */

app.use('/api/v1/authentications', autenticato);


=======
app.use(cors());

/**
 * Serve front-end static files
 */
>>>>>>> 020c74390c6f108be5711910831143d0fbfea128
app.use('/', express.static('static'));
app.use('/api/v1/authentications', autenticato);
app.use('/api/v1/EventiPubblici', EventoPubblico);
app.use("/api/v1/eventiCalendarioPubblico", calendarEventsPub);
app.use('/api/v1/Utenti', registrato);

app.use('/api/v1/Utenti',registrato);
app.use(tokenChecker);

<<<<<<< HEAD

//Si posizionano i middleware pre la gestione della creazione degli eventi
app.use('/api/v1/EventiPubblici', eventspublics);
app.use('/api/v1/EventiPersonali', eventspersonals);
=======
//********************************************************** attenzione *********************
app.use('/api/v1/EventiPubblici', EventoPubIscrCrea);
app.use('/api/v1/EventiPersonali', EventoPersonale);
app.use('/api/v1/Utenti', Utente);
app.use("/api/v1/eventiCalendarioPersonale", calendarEventsPers);
>>>>>>> 020c74390c6f108be5711910831143d0fbfea128



/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Non Trovato' });
});



module.exports = app;
