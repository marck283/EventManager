import express, { json, urlencoded } from 'express';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
var app = express();
import cookieParser from 'cookie-parser';

var limiter = RateLimit({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 100 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

/**
 * Configure Express.js parsing middleware
 */
app.use(json({limit: '200mb'}));
app.use(urlencoded({ extended: true }));
 
app.use(cookieParser());
app.use(cors());
app.disable('x-powered-by'); //Disabling x-powered-by for security reasons
app.enable('access-control-allow-origin'); //Enabling Access-Control-Allow-Origin for security reasons
app.enable('origin');
app.enable('vary');
app.set('origin', 'https://eventmanagerzlf.herokuapp.com');
app.set('access-control-allow-origin', 'https://eventmanagerzlf.herokuapp.com');
app.set('vary', 'origin'); 

/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

//Apply rate limiter to all requests
//Avoids Brute Force attacks by limiting the number of requests per IP
app.use(limiter);

import EventoPubblico from './events/EventiPub.mjs';
import calendarEventsPub from './events/elencoEventiPublic.mjs';
import autenticato from './authentication.mjs';
import regandric from './regAndRicerca.mjs';
import recPsw from './pswRecovery.mjs';
import csrfCreation from './csrfTokenCreation.mjs';
import gTokenExch from './googleTokenExchange.mjs';

app.use('/api/v2/EventiPubblici', EventoPubblico);
app.use('/api/v2/eventiCalendarioPubblico', calendarEventsPub);
app.use('/api/v2/authentications', autenticato);
app.use('/api/v2/Utenti', regandric);
app.use('/api/v2/RecuperoPassword', recPsw);
app.use('/api/v2/CsrfToken', csrfCreation);
app.use('/api/v2/GoogleToken', gTokenExch);

import tokenChecker from './tokenChecker.mjs';
app.use(tokenChecker);

import EventoPubIscrCreaDelMod from './events/IscrCreDelModEvenPub.mjs';
import EventoPersonale from './events/EventiPers.mjs';
import EventoPrivato from './events/EventiPriv.mjs';
import calendarEventsPers from './events/elencoEventiPersonali.mjs';
import Utente from './Utenti.mjs';
import evOrgList from './events/elencoEventiOrg.mjs';
import recensioni from './events/recensioni.mjs';
import infoEventoIscr from './events/infoEventoIscr.mjs';
import infoEventoOrg from './events/infoEventoOrg.mjs';
import qrCodeCheck from './events/checkQR.mjs';
import getTicket from './events/getTicket.mjs';
import annullaEvento from './events/annullaEvento.mjs';
import terminaEvento from './events/terminaEvento.mjs';

app.use('/api/v2/EventiPubblici', EventoPubIscrCreaDelMod);
app.use('/api/v2/EventiPersonali', EventoPersonale);
app.use('/api/v2/EventiPrivati', EventoPrivato);
app.use("/api/v2/eventiCalendarioPersonale", calendarEventsPers);
app.use('/api/v2/Utenti', Utente);
app.use("/api/v2/EventOrgList", evOrgList);
app.use("/api/v2/Recensioni", recensioni);
app.use("/api/v2/InfoEventoOrg", infoEventoOrg);
app.use("/api/v2/QRCodeCheck", qrCodeCheck);
app.use("/api/v2/InfoEventoIscr", infoEventoIscr);
app.use("/api/v2/ticket", getTicket);
app.use("/api/v2/annullaEvento", annullaEvento);
app.use("/api/v2/terminaEvento", terminaEvento);

/* Default 404 handler */
app.use((req, res) => {
    console.log("NOT FOUND");
    res.status(404).json({ error: 'Non Trovato' }).send();
    return;
});

export default app;
