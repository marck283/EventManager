const express = require('express');
const res = require('express/lib/response');
const eventPublic = require('../collezioni/eventPrivat.js');
const router = express.Router();
const Users = require('../collezioni/utenti.js');

router.patch('/:id', async(req, resp) => {
    
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;
    
    try{
        
        let utente = await Users.findById(utent);
        let evento = await eventPublic.findById(id_evento);
        
        if(evento == undefined){
            res.status(404).json({error: "Non esiste alcun evento privato con l'id specificato."});
            return;
        }
        
        if(utent != evento.organizzatoreID){
            res.status(403).json({error: "Non sei autorizzato a modificare l'evento."});
            return;
        }
        
        if(req.body.nomeAtt == ""){
            evento.nomeAtt = req.body.nomeAtt;
        }
        if(req.body.categoria == ""){
            evento.categoria = req.body.categoria
        }
        if(req.body.luogoEv.indirizzo == ""){
            evento.luogoEv.indirizzo = req.body.luogoEv.indirizzo
        }
        if(req.body.luogoEv.citta == ""){
            evento.luogoEv.citta = req.body.luogoEv.citta;
        }
        
        await evento.save();
        
        console.log('Evento privato modificato con successo');
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore lato server."}).send();
    }
    
});

module.exports = router;
