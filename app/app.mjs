import express, { json, urlencoded, } from 'express';
import cors from 'cors';
var app = express();
import EventoPubblico from './events/EventiPub.js';
import EventoPubIscrCreaDelMod from './events/IscrCreDelModEvenPub.js';
import EventoPersonale from './events/EventiPers.js';
import EventoPrivato from './events/EventiPriv.js';
import calendarEventsPers from "./events/elencoEventiPersonali.js";
import calendarEventsPub from "./events/elencoEventiPublic.js";
import autenticato from './authentication.js';
import tokenChecker from './tokenChecker.js';
import Utente from './Utenti.js';
import regandric from './regAndRicerca.js';
import recPsw from './pswRecovery.js';

/**
 * Configure Express.js parsing middleware
 */
app.use(json());
app.use(urlencoded({ extended: true }));

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

export default app;
