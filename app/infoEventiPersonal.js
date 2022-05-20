const express = require('express');
const router = express.Router();
const EventPers = require('./collezioni/eventpersonal');
const Users = require('./collezioni/utenti');

router.get('/:id', async(req, res) => {

    try{
        let eventoPersonale = await EventPers.findById(req.params.id);
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

module.exports = router;
