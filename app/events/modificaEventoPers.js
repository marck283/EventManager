const express = require('express');
const res = require('express/lib/response');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const Users = require('../collezioni/utenti.js');

router.patch('/:id', async(req, res) => {
    
    //var utent = req.loggedUser.id;
    var utent = '628e8c29d108a0e2094d364b';
    var id_evento = req.params.id;
    
    try{
        
        let evento = await eventPersonal.findById(id_evento);
        
        if(evento == undefined){
            res.status(404).json({error: "Non esiste alcun evento personale con l'id specificato."});
            return;
        }
        
        if(utent != evento.organizzatoreID){
            res.status(403).json({error: "Non sei autorizzato a modificare l'evento."});
            return;
        }
        
        if(req.body.nomeAtt != ""){
            evento.nomeAtt = req.body.nomeAtt;
        }
        if(req.body.categoria != ""){
            evento.categoria = req.body.categoria
        }
        if(req.body.indirizzo != ""){
            evento.luogoEv.indirizzo = req.body.indirizzo
        }
        if(req.body.citta != ""){
            evento.luogoEv.citta = req.body.citta;
        }
        
        await evento.save();
        res.location("/api/v1/EventiPersonali/" + id_evento).status(200).send();
        console.log('Evento personale modificato con successo');
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore lato server."}).send();
    }
    
});

module.exports = router;
