const express = require('express');
const router = express.Router();
const EventPers = require('./collezioni/eventpersonal');
const Users = require('./collezioni/utenti');

router.get('/:id', async(req, res) => {
    let eventoPersonale = await EventPers.findById(req.params.id);
    let organizzatore = await Users.findById(eventoPersonale.organizzatoreID);

    res.status(200).json({
        nomeEv: eventoPersonale.nomeAtt,
        categoria: eventoPersonale.categoria,
        data: eventoPersonale.data,
        durata: eventoPersonale.durata,
        luogoEv: eventoPersonale.luogoEv,
        organizzatore: organizzatore.nome,
    });
});

module.exports = router;
