const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');

router.get('/:id', async(req, res) => {

    try{
        let eventoPersonale = await eventPersonal.findById(req.params.id);
        if(eventoPersonale == undefined ){
            res.status(404).json({error: "Non esiste nessun evento con l'id selezionato"}).send();
            return;

        }
        let organizzatore = await Users.findById(eventoPersonale.organizzatoreID);

        res.status(200).json({
            nomeAtt: eventoPersonale.nomeAtt,
            categoria: eventoPersonale.categoria,
            data: eventoPersonale.data,
            ora: eventoPersonale.ora,
            durata: eventoPersonale.durata,
            luogoEv: eventoPersonale.luogoEv,
            organizzatore: organizzatore.nome,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

});

//*******************************************

router.post('', async (req, res) => {

    utent= req.loggedUser.id;
    try{


        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento personale

        if(typeof req.body.durata === "number"){


        }else{

            res.status(400).json({error: "Campo non del formato corretto"}).send();
            return;

        }

        if(req.body.data == "" || req.body.durata <= 0 || req.body.ora == "" || req.body.categoria == "" || req.body.nomeAtt == "" || req.body.luogoEv.indirizzo == "" || req.body.luogoEv.citta == ""){
            res.status(400).json({error: "Campo vuoto"}).send();
            return;

        }

        
        var ElencoDate = req.body.data;
        var dateEv = ElencoDate.split(",");

        for(var elem of dateEv){
            //controllo che la data ha un formato corretto
            var regu = /[0-9]+\/[0-9]+\/[0-9]+/i;
            if(regu.test(elem)){
                strin=elem.split("/");
                if(strin.length>3){
                    res.status(400).json({error: "formato data non valido"}).send()
                    return;
                }else{
                    if(strin[0].length==2 && strin[1].length==2 && strin[2].length==4) {
                        str1 = strin[0];
                        str2 = strin[1];
                        str3 = strin[3];
                        if(strin[0][0]==0){
                            str1=strin[0][1];

                        }
                        if(strin[1][0]==0){
                            str2=strin[1][1];
                        }
                        switch(str1){
                            case "1":{
                                if(Number(str2)>31 || Number(str2)<0){
                                        res.status(400).json({error: "formato data non valido"}).send()
                                        return;

                                }
                                break;
                            }
                            case "2":{
                                if((Number(str3) % 400) == 0 || ((Number(str3) % 4) == 0 && (Number(str3) % 100) != 0)){
                                    if(Number(str2)>29 || Number(str2)<0){
                                        res.status(400).json({error: "formato data non valido"}).send()
                                        return;

                                    }
                                }else{
                                    if(Number(str2)>28 || Number(str2)<0){
                                        res.status(400).json({error: "formato data non valido"}).send()
                                        return;

                                    }


                                }
                                
                                break;

                            }
                            case "3":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;

                            }
                            case "4":{
                                if(Number(str2)>30 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;

                            }
                            case "5":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;

                            }
                            case "6":{
                                if(Number(str2)>30 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;
                            }
                            case "7":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;

                            }
                            case "8":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;
                            }
                            case "9":{
                                if(Number(str2)>30 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;

                            }
                            case "10":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;
                            }
                            case "11":{
                                if(Number(str2)>30 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;
                            }
                            case "12":{
                                if(Number(str2)>31 || Number(str2)<0){
                                    res.status(400).json({error: "formato data non valido"}).send()
                                    return;

                                }
                                break;
                            }
                            default: {res.status(400).json({error: "formato data non valido"}).send()
                                        return;}



                        }
                        

                    }else{

                        res.status(400).json({error: "formato data non valido"}).send()
                        return;


                    }


                }

            }else{
                res.status(400).json({error: "formato data errato"}).send()
                return; 

            }

            //controllo che le date non siano ripetute
            var count = 0;
            dateEv.forEach( e => {if(e==elem){count += 1 }});
            if(count > 1){
                res.status(400).json({error: "date ripetute"}).send()
                return; 

            }



            //controllo che le date non siano di una giornata precedente a quella odierna
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

              res.status(400).json({error: "giorno non disponibile"}).send()
              return; 

            }else{

           
              if(yy == Number(anno)){
               

                if(mm > Number(mese)){
                  res.status(400).json({error: "giorno non disponibile"}).send()
                  return; 
                 
                }else{

                  if(mm == Number(mese)){
                 

                    if(dd > Number(giorno)){
                      res.status(400).json({error: "giorno non disponibile"}).send()
                      return; 

                    }

                  }
               

                }

              }

            }






        }

    

        //controllo che l'ora sia del formato corretto
        var reg= /([0-9]+):([0-9]+)/
        var ora = req.body.ora;
        if(reg.test(ora)){
            strin=ora.split(":");
            if(strin.length>2){
                res.status(400).json({error: "formato ora non valido"}).send()
                return;
            }else{
                if(strin[0].length==2 && strin[1].length==2) {
                    str1 = strin[0];
                    str2 = strin[1];
                    if(strin[0][0]==0){
                        str1=strin[0][1];

                    }
                    if(strin[1][0]==0){
                        str2=strin[1][1];
                    }
                    if(Number(str1)<=23 && Number(str1)>=0 && Number(str2)<=59 && Number(str2)>=0){
                        var d = new Date()
                        //controllo che l'orario non sia precedente all'orario attuale nel caso nell'elenco delle date appare quella attuale
                        if(ElencoDate != ""){
                                var mm = d.getMonth() + 1
                                var dd = d.getDate()
                                var yy = d.getFullYear()

                                var giorno = ""
                                var mese = ""

                                if(dd < 10){

                                    giorno = "0" + dd;

                                }else{

                                    giorno = "" + dd;
                                }

                                if(mm < 10){

                                    mese = "0" + mm;

                                }else{

                                    mese = "" + mm;
                                }

                                var anno = "" + yy;

                                var temp_poz = mese + '/' + giorno + '/' + anno;

                                if(ElencoDate.includes(temp_poz) == true){


                                    if(Number(str1) >= d.getHours()){
                            
                         
                            if(Number(str1) == d.getHours()){

                                

                                if(Number(str2) < d.getMinutes()){

                                       res.status(400).json({error: "orario non permesso"}).send()
                                        return;


                                }


                            }


                        }else{
                            res.status(400).json({error: "orario non permesso"}).send()
                            return;

                        }



                                }


                        }
                    

                    }else{
                        res.status(400).json({error: "formato ora non valido"}).send()
                        return;
                    }
                    
                }else{
                    res.status(400).json({error: "formato ora non valido"}).send()
                    return;
                }
            }
            

        }else{
                res.status(400).json({error: "formato ora non valido"}).send()
                return;
        }
            
        
    
        
        

        let eventP = new eventPersonal({data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent});


        //Si salva il documento personale
        eventP = await eventP.save();

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id)

        //Si salva il modulo dell'utente
        await utente.save();



        let eventId = eventP.id;

        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v1/EventiPersonali/" + eventId).status(201).send();

    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel server"}).send();

    }
    
});

module.exports = router;