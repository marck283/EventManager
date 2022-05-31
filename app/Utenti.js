const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const Biglietto = require('./collezioni/biglietti.js');
const eventPublic = require('./collezioni/eventPublic.js');
const eventPrivat = require('./collezioni/eventPrivat.js');







router.get('/me', async (req, res) => {
    console.log("dammi info");
    IDexample = req.loggedUser.id;
    
    try{
        let utente = await Utente.findById(IDexample);

        res.status(200).json({
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            url: "/api/v1/EventiPubblici/" + IDexample,
            password: utente.password,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

router.get('/me/Iscrizioni', async (req, res) => {

    try{
        

        IDexample = req.loggedUser.id;



        ListaBiglietti = await Biglietto.find({utenteid:IDexample});
       
        if(ListaBiglietti.length == 0){
            
            

            res.status(404).json({error: "Non ci sono biglietti per questo utente"}).send();
            return;

        }
        

        var ListBigl = []; 
        let utente = await Utente.findById(IDexample);

        for(var elem of ListaBiglietti){
            if(elem.tipoevento == "pub"){
                let evento = await eventPublic.findById(elem.eventoid);

                if(evento){
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({ eventoUrl: "/api/v1/EventiPubblici/" + evento._id,
                        utenteUrl: "/api/v1/Utenti/" + IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoUrl: "/api/v2/Biglietti/" + elem._id });
                    
                }
            }

            if(elem.tipoevento == "priv"){
                let evento = await eventPrivat.findById(elem.eventoid);

                if(evento){
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({ eventoUrl: "/api/v1/EventiPrivati/" + evento._id,
                        utenteUrl: "/api/v1/Utenti/" + IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoUrl: "/api/v2/Biglietti/" + elem._id });
                    
                }
            }


        }

        if(ListBigl.length==0){
            

            res.status(403).json({error: "Non c'è nessun evento valido associato al biglietto"}).send();
            return;

        }

        


        res.status(200).json(ListBigl);



    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

   
});





module.exports=router;