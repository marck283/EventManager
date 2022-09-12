const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const Biglietto = require('./collezioni/biglietti.js');
const eventPublic = require('./collezioni/eventPublic.js');
const eventPrivat = require('./collezioni/eventPrivat.js');
const Inviti = require('./collezioni/invit.js');

router.get('/me', async (req, res) => {
    IDexample = req.loggedUser.id;
    
    try{
        let utente = await Utente.findById(IDexample);

        res.status(200).json({
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            url: "/api/v2/Utenti/" + IDexample,
            password: utente.password,
            picture: utente.profilePic
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

router.get('/me/Inviti', async (req, res) => {
    try {
        var IDexample = req.loggedUser.id, ListaInviti = await Inviti.find({utenteid:IDexample});

        if(ListaInviti.length == 0) {
            res.status(404).json({error: "Non ci sono inviti per questo utente"}).send();
            return;
        }
        
        var ListInvit = [];
        let utente = await Utente.findById(IDexample);
        var accettato = false;
        for(var elem of ListaInviti) {
            accettato = false;
            if(elem.tipoevent == "pub") {
                let evento = await eventPublic.findById(elem.eventoid);
                if(evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    if(evento.partecipantiID.includes(IDexample)) {
                        accettato = true;
                    }

                    ListInvit.push({
                        tipoevento: elem.tipoevent,
                        idevento: elem.eventoid,
                        idutente: IDexample,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v2/Utenti/" + elem._id,
                        accettato: accettato
                    });
                }
            }

            if(elem.tipoevent == "priv") {
                let evento = await eventPrivat.findById(elem.eventoid);
                if(evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    if(evento.partecipantiID.includes(IDexample)) {
                        accettato = true;
                    }

                    ListInvit.push({
                        tipoevento: elem.tipoevent,
                        idevento: elem.eventoid,
                        idutente: IDexample,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v2/Utenti/" + elem._id,
                        accettato: accettato
                    });
                }
            }
        }

        if(ListInvit.length == 0) {
            res.status(404).json({error: "Non c'è nessun evento valido associato all'invito"}).send();
            return;
        }

        res.status(200).json(ListInvit);
    } catch(error) {
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

router.get('/me/Iscrizioni', async (req, res) => {
    try{
        var IDexample = req.loggedUser.id, ListaBiglietti = await Biglietto.find({utenteid:IDexample});
        if(ListaBiglietti.length == 0) {
            res.status(404).json({error: "Non ci sono biglietti per questo utente"}).send();
            return;
        }
        
        var ListBigl = []; 
        let utente = await Utente.findById(IDexample);

        for(var elem of ListaBiglietti) {
            if(elem.tipoevento == "pub") {
                let evento = await eventPublic.findById(elem.eventoid);
                if(evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({ eventoUrl: "/api/v2/EventiPubblici/" + evento._id,
                        eventoid: evento._id,
                        utenteUrl: "/api/v2/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
                        bigliettoUrl: "/api/v2/Iscrizioni/" + elem._id
                    });
                }
            }

            if(elem.tipoevento == "priv") {
                let evento = await eventPrivat.findById(elem.eventoid);
                if(evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({
                        eventoUrl: "/api/v2/EventiPrivati/" + evento._id,
                        eventoid: evento._id,
                        utenteUrl: "/api/v2/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
                        bigliettoUrl: "/api/v2/Iscrizioni/" + elem._id
                    });
                }
            }
        }

        if(ListBigl.length == 0) {
            res.status(403).json({error: "Non c'è nessun evento valido associato al biglietto"}).send();
            return;
        }

        res.status(200).json(ListBigl);
    } catch(error) {
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

module.exports=router;