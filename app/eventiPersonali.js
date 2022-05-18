const express = require('express');
const router = express.Router();

//si recuperano i modelli degli utenti e degli eventi personali
const Utente = require('./collezioni/utenti');
const EventPe = require('./collezioni/eventpersonal'); 


router.post('', async (req, res) => {

    utent="628343ba57afadf76947e95a";
    console.log(req.header('x-access-token'))
    try{


        //Si cerca l'utente organizzatore dell'evento
        let utente = await Utente.findById(utent);
        //Si crea un documento evento personale
        let eventP = new EventPe({data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});


        //Si salva il documento personale
        eventP = await eventP.save();

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id)

        //Si salva il modulo dell'utente
        await utente.save();



        let eventId = eventP.id;

        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v1/EventiPersonali/" + eventId).status(201).send();

    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel server"}).send();

    }
    
});

module.exports = router;