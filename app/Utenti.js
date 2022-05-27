const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const Inviti = require('./collezioni/invit.js');
const eventPublic = require('./collezioni/eventPublic.js');
const eventPriv = require('./collezioni/eventPrivat.js');





router.get('/me', async (req, res) => {

    IDexample = req.loggedUser.id;
    
    try{
        let utente = await Utente.findById(IDexample);

        res.status(200).json({
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            password: utente.password,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});


router.get('/me/Inviti', async (req, res) => {

    
    try{
        

        IDexample = "628e8c29d108a0e2094d364b";



        ListaInviti = await Inviti.find({utenteid:IDexample});
        
       
        if(ListaInviti.length == 0){
            
            

            res.status(404).json({error: "Non ci sono inviti per questo utente"}).send();
            return;

        }
        

        var ListInvit = [];
        let utente = await Utente.findById(IDexample);
        var accettato = false;
        for(var elem of ListaInviti){
            
            accettato = false;
            if(elem.tipoevent == "pub"){

                let evento = await eventPublic.findById(elem.eventoid);

                if(evento){


                    let orga = await Utente.findById(evento.organizzatoreID);

                 

                    if(evento.partecipantiID.includes(IDexample)){

                        accettato = true;



                    }

                    ListInvit.push({ tipoevento: elem.tipoevent,
                        idevento: IDexample,
                        idutente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v1/Utenti/" + elem._id,
                        accettato: accettato
                        });
                    
                }
            }

            if(elem.tipoevent == "priv"){
                let evento = await eventPriv.findById(elem.eventoid);


                if(evento){


                    let orga = await Utente.findById(evento.organizzatoreID);

                 

                    if(evento.partecipantiID.includes(IDexample)){

                        accettato = true;



                    }

                    ListInvit.push({ tipoevento: elem.tipoevent,
                        idevento: IDexample,
                        idutente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v1/Utenti/" + elem._id,
                        accettato: accettato
                        });
                    
                }
            }


        }

        if(ListInvit.length==0){
            

            res.status(403).json({error: "Non c'è nessun evento valido associato al biglietto"}).send();
            return;

        }

        


        res.status(200).json(ListInvit);



    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});




module.exports=router;