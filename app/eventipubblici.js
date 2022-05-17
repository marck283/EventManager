const express = require('express');
const router = express.Router();

const Utente = require('./collezioni/utenti'); // get our mongoose model
const EventP = require('./collezioni/eventpublic'); // get our mongoose model


router.post('', async (req, res) => {
    console.log(req.body);
    utent="628343ba57afadf76947e95a";
    let utente = await Utente.findById(utent);
	let eventP = new EventP({data: req.body.data, durata: req.body.durata, maxPers: req.body.maxPers, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});
    eventP.partecipantiID.push(utent);
    

	eventP = await eventP.save();
    utente.EventiCreati.push(eventP.id)
    await utente.save();

    
    let eventId = eventP.id;

    console.log('Evento salvato con successo');

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/PublicEvent/" + eventId).status(201).send();
});

module.exports = router;