const express = require('express');
const router = express.Router();

const Utente = require('./collezioni/utenti'); // get our mongoose model
const EventPe = require('./collezioni/eventpersonal'); // get our mongoose model


router.post('', async (req, res) => {

    utent="628343ba57afadf76947e95a";
    let utente = await Utente.findById(utent);

	let eventP = new EventPe({data: req.body.data, durata: req.body.durata, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});
    
    eventP = await eventP.save();
    utente.EventiCreati.push(eventP.id)
    await utente.save();


    
    let eventId = eventP.id;

    console.log('Evento salvato con successo');

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/PersonalEvent/" + eventId).status(201).send();
});

module.exports = router;