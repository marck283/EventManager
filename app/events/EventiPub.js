<<<<<<< HEAD:app/infoEventiPublic.js
const express = require('express');
const router = express.Router();
const EventPub = require('./collezioni/eventPublic');
const Users = require('./collezioni/utenti');

router.get('/:id', async(req, res) => {

    try{
        let eventoPubblico = await EventPub.findById(req.params.id);
        let organizzatore = await Users.findById(eventoPubblico.organizzatoreID);
        let partecipanti = [];
        for (var i of eventoPubblico.partecipantiID){
            let tmp = await Users.findById(i);
            partecipanti.push(tmp.nome);
        }

        res.status(200).json({
            nomeAtt: eventoPubblico.nomeAtt,
            categoria: eventoPubblico.categoria,
            data: eventoPubblico.data,
            ora: eventoPubblico.ora,
            durata: eventoPubblico.durata,
            luogoEv: eventoPubblico.luogoEv,
            organizzatore: organizzatore.nome,
            maxPers: eventoPubblico.maxPers,
            partecipanti: partecipanti
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

});

=======
const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');



router.get('/:id', async(req, res) => {

    try{
        let eventoPubblico = await eventPublic.findById(req.params.id);
        let organizzatore = await Users.findById(eventoPubblico.organizzatoreID);
        let partecipanti = [];
        for (var i of eventoPubblico.partecipantiID){
            let tmp = await Users.findById(i);
            partecipanti.push(tmp.nome);
        }

        res.status(200).json({
            nomeAtt: eventoPubblico.nomeAtt,
            categoria: eventoPubblico.categoria,
            data: eventoPubblico.data,
            ora: eventoPubblico.ora,
            durata: eventoPubblico.durata,
            luogoEv: eventoPubblico.luogoEv,
            organizzatore: organizzatore.nome,
            maxPers: eventoPubblico.maxPers,
            partecipanti: partecipanti
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

});



>>>>>>> 020c74390c6f108be5711910831143d0fbfea128:app/events/EventiPub.js
module.exports = router;