const express = require('express');
const eventPriv = require('../collezioni/eventiPrivat.js');
const Users = require('../collezioni/utenti.js');
const Biglietto = require('../collezioni/biglietti.js');
const router = express.Router();

router.delete('/:idEvento/Iscrizioni/:idIscr', async(req, res) => {
    
    try{
        
        var evento = await eventPriv.findById(req.params.idEvento);
        var utente = '628e8c29d108a0e2094d364b'; //Da fixare
        var utenteObj = await Users.findById(utente);
        var iscr = await Biglietto.findById(req.params.idIscr);
        
        if(evento == undefined){
            res.status(404).json({error: "Non corrisponde alcun evento privato all'ID specificato."});
            return;
        }
        
        if(iscr == undefined){
            res.status(404).json({error: "Non corrisponde alcuna iscrizione all'ID specificato."});
            return;
        }
        
        if(iscr.eventoid != req.params.idEvento){
            res.status(403).json({error: "L'iscrizione non corrisponde all'evento specificato."}).send();
            return;
        }
        
        if(iscr.utenteid != utente){
            res.status(403).json({error: "L'iscrizione non corrisponde all'utente specificato."}).send();
            return;
        }
        
        var array1 = evento.partecipantiID;
        var index1 = array1.indexOf(utente);
        if (index1 > -1) {
            array1.splice(index1, 1);
        }else{
            res.status(403).json({error: "L'utente non risulta iscritto all'evento."}).send();
            return;
        }
        evento.partecipantiID = array1;
        await evento.save(); //Aggiornamento partecipantiID
        
        var array2 = utenteObj.EventiIscrtto;
        var index2 = array2.indexOf(req.params.idEvento);
        if (index2 > -1) {
            array2.splice(index2, 1);
        }else{
            res.status(403).json({error: "L'utente non risulta iscritto all'evento."}).send();
            return;
        }
        utenteObj.EventiIscrtto = array2;
        await utenteObj.save(); //Aggiornamento EventiIscritto
        
        await Biglietto.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB
        
        console.log('Annullamento iscrizione effettuato con successo.');
        
        res.status(204).send();
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
    
});

module.exports = router;
