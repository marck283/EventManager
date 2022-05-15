const express = require('express');
const router = express.Router();

const Utente = require('./collezioni/Utenti'); // get our mongoose model
const EventPe = require('./collezioni/eventpersonal'); // get our mongoose model


router.post('', async (req, res) => {

	let eventP = new EventPe({data: req.body.data, durata: req.body.durata, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatore: null, partecipanti: []});
    eventP.partecipanti.push(null)
	eventP = await eventP.save();


    
    let eventId = eventP.id;

    console.log('Evento salvato con successo');

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/PersonalEvent/" + eventId).status(201).send();
});

module.exports = router;