const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const Users = require('../collezioni/utenti.js');



router.post('/:id/Iscrizioni', async (req, res) => {

    
    var utent = req.loggedUser.id;


    var id_evento=req.params.id;

    
    try{

        let eventP = await eventPublic.findById(id_evento);

        if(eventP.partecipantiID.length==eventP.partecipantiID.maxPers){

            res.status(403).json({ error: "Non spazio nell'evento"}).send();
            return;
            
        }

        for(elem of eventP.partecipantiID){
            if(elem==utent){

                 res.status(403).json({ error: "Già iscritto"}).send();
                 return;
            }

        }

        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()


        res.location("/api/v1/EventiPubblici/" +id_evento+ "/" + utent).status(201).send();



    }catch (error){
        console.log(error);
        res.status(500).json({ error: "Errore nel server"}).send();



  
    }



});


router.post('', async (req, res) => {

    
    var utent = req.loggedUser.id;
    try{
        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento pubblico
        let eventP = new eventPublic({data: req.body.data, durata: req.body.durata, ora: req.body.ora, maxPers: req.body.maxPers, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});
        //eventP.partecipantiID.push(utent); *****************************************

        //Si salva il documento pubblico
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
        res.location("/api/v1/EventiPubblici/" + eventId).status(201).send();
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore del server"}).send();

    }
    
});

module.exports = router;