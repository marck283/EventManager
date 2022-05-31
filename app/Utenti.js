const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const Biglietto = require('./collezioni/biglietti.js');
const eventPublic = require('./collezioni/eventPublic.js');
const eventPrivat = require('./collezioni/eventPrivat.js');
const Inviti = require('./collezioni/invit.js');






router.get('/me', async (req, res) => {
    console.log("dammi info");
    IDexample = req.loggedUser.id;
    
    try{
        let utente = await Utente.findById(IDexample);

        res.status(200).json({
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            url: "/api/v1/Utenti/" + IDexample,
            password: utente.password
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

router.get('/me/Inviti', async (req, res) => {

    
    try{
        

        IDexample = req.loggedUser.id;



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

                    /**var dati = evento.data.split(",");



                    var disponibie = true;

                    //controllo che inseisco solo gli eventi disponibili
                    for(var elem of dati){

                        var data = elem;
                        var date = new Date();
                        var mm = date.getMonth() + 1
                        var dd = date.getDate()
                        var yy = date.getFullYear()
                        dats = data.split('/');

                       
                        if(dats[0][0] == '0'){

                          mese = dats[0][1];

                        }else{

                          mese = dats[0];

                        }


                        if(dats[1][0] == '0'){

                          giorno = dats[1][1];

                        }else{

                          giorno = dats[1];

                        }

                        anno = dats[2]

                       

                        if(yy > Number(anno)){


                          disponibile = false;
                          console.log("yy5")
                           

                        }else{

                       
                          if(yy == Number(anno)){
                           

                            if(mm > Number(mese)){
                              disponibile = false;
                              console.log("yy6")
                             
                            }else{

                              if(mm == Number(mese)){
                             

                                if(dd > Number(giorno)){
                                  disponibile = false;
                                  console.log("yy7")

                                }

                              }
                           

                            }

                          }

                        }





                    }

                    if(!disponibile){
                        continue;
                    }
                    
                    */




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
                let evento = await eventPrivat.findById(elem.eventoid);


                if(evento){

                    /**var dati = evento.data.split(",")
                    //controllo che inseisco solo gli eventi disponibili
                    for(var elem of dati){

                        var data = elem;
                        var date = new Date();
                        var mm = date.getMonth() + 1
                        var dd = date.getDate()
                        var yy = date.getFullYear()
                        dats = data.split('/');

                       
                        if(dats[0][0] == '0'){

                          mese = dats[0][1];

                        }else{

                          mese = dats[0];

                        }


                        if(dats[1][0] == '0'){

                          giorno = dats[1][1];

                        }else{

                          giorno = dats[1];

                        }

                        anno = dats[2]

                       

                        if(yy > Number(anno)){


                          disponibile = false;
                            console.log("yy1")

                        }else{

                       
                          if(yy == Number(anno)){
                           

                            if(mm > Number(mese)){
                              disponibile = false;
                             console.log("yy2")
                            }else{

                              if(mm == Number(mese)){
                             

                                if(dd > Number(giorno)){
                                  disponibile = false;
                                  console.log("yy3")
                                }

                              }
                           

                            }

                          }

                        }





                    }

                    if(!disponibile){
                        continue;
                    }
                    */

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
            

            res.status(404).json({error: "Non c'è nessun evento valido o disponibile associato all'invito"}).send();
            return;

        }

        


        res.status(200).json(ListInvit);



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
                        eventoid: evento._id,
                        utenteUrl: "/api/v1/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
                        bigliettoUrl: "/api/v2/Biglietti/" + elem._id });
                    
                }
            }

            if(elem.tipoevento == "priv"){
                let evento = await eventPrivat.findById(elem.eventoid);

                if(evento){
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({ eventoUrl: "/api/v1/EventiPrivati/" + evento._id,
                        eventoid: evento._id,
                        utenteUrl: "/api/v1/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
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