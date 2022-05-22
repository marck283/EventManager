const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');



router.get('/:id', async(req, res) => {

    try{
        let eventoPersonale = await eventPersonal.findById(req.params.id);
        let organizzatore = await Users.findById(eventoPersonale.organizzatoreID);

        res.status(200).json({
            nomeAtt: eventoPersonale.nomeAtt,
            categoria: eventoPersonale.categoria,
            data: eventoPersonale.data,
            ora: eventoPersonale.ora,
            durata: eventoPersonale.durata,
            luogoEv: eventoPersonale.luogoEv,
            organizzatore: organizzatore.nome,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

});



router.post('', async (req, res) => {

    utent= req.loggedUser.id;
    try{


        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento personale
        let eventP = new eventPersonal({data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});


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