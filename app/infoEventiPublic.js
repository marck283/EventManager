const express = require('express');
const router = express.Router();
const EventPub = require('./collezioni/eventpublic');
const Users = require('./collezioni/utenti');

router.get('/:id', async(req, res) => {
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
});

module.exports = router;