const express = require('express');
const router = express.Router();

//si recuperano i modelli degli utenti e degli eventi personali
const Utente = require('./collezioni/utenti');

const EventP = require('./collezioni/eventpubblic'); 


router.post('/:id/Iscrizioni', async (req, res) => {

    utent="6284b7742a0699866a636979";
    console.log(req.header('x-access-token'))


    id_evento=req.params.id

    
    try{

        let eventP = await EventP.findById(id_evento);

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
        let utente = await Utente.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()


        res.location("/api/v1/EventiPubblici/" +id_evento+ "/" + utent).status(201).send();



    }catch (error){
        console.log(error);
        res.status(500).json({ error: "Errore accesso al DB"}).send();



  
    }



});

module.exports = router;