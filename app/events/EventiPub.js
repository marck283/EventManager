const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');

router.get("", async (req, res) => {
    var events = await eventPublic.find({});

    var token = req.header('x-access-token');

    var autenticato = false;
    var user = "";

    if (token) {
        
    
        jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded){

            if (!err) {
                var user = decoded.id;
                autenticato = true;
            }

        });


    }

    if(autenticato == true){
        events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    }

    if(events.length > 0) {
        res.status(200).json(eventsMap.map(events, "layoutPubblico.html", token));
    } else {
        res.status(404).json({"error": "Non sono presenti eventi organizzati."});
    }
});


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



module.exports = router;