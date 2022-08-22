const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const Users = require('../collezioni/utenti.js');

router.get('/:id', async(req, res) => {
    try{
        let eventoPubblico = await eventPublic.findById(req.params.id);
        if(eventoPubblico == undefined) {
            res.status(404).json({error: "Non esiste nessun evento con l'id selezionato"}).send();
            return;
        }
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
    } catch(error) {
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

module.exports = router;