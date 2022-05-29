const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const Users = require('../collezioni/utenti.js');
const Biglietto = require('../collezioni/biglietti.js');
const router = express.Router();

router.delete('/:idEvento/Iscrizioni/idIscr', async(req, res) => {
    
    try{
        
        var evento = await eventPublic.findById(idEvento);
        var utente = '628e8c29d108a0e2094d364b'; //Da fixare
        var iscr = await Biglietto.findById(idIscr);
        
        if(evento == undefined){
            res.status(404).json({error: "Non corrisponde alcun evento pubblico all''ID specificato."});
            return;
        }
        
        if(iscr == undefined){
            res.status(404).json({error: "Non corrisponde alcuna iscrizione all''ID specificato."});
            return;
        }
        
        var array = evento.partecipantiID;
        var index = array.indexOf(utente);
        if (index > -1) {
            array.splice(index, 1);
        }else{
            res.status(500).json({error: "Errore nel Server"}).send();
        }
        evento.partecipantiID = array;
        await evento.save(); //Aggiornamento partecipantiID
        
        array = utente.EventiIscrtto;
        index = array.indexOf(idEvento);
        if (index > -1) {
            array.splice(index, 1);
        }else{
            res.status(500).json({error: "Errore nel Server"}).send();
        }
        utente.EventiIscrtto = array;
        await utente.save(); //Aggiornamento EventiIscritto
        
        await Biglietto.deleteById(idIscr); //Aggiornamento Biglietto DB
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
    
});

module.exports = router;
