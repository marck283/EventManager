const express = require('express');
const eventPrivat = require('../collezioni/eventPrivat.js');
const invit = require('../collezioni/invit.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const biglietti = require('../collezioni/biglietti.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');
var qrcode = require('qrcode');



router.patch('/:id', async(req, res) => {
    
    //var utent = req.loggedUser.id;
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;
    
    try{
        
        let evento = await eventPrivat.findById(id_evento);
        
        if(evento == undefined){
            res.status(404).json({error: "Non esiste alcun evento privato con l'id specificato."});
            return;
        }
        
        if(utent != evento.organizzatoreID){
            res.status(403).json({error: "Non sei autorizzato a modificare l'evento."});
            return;
        }
        
        if(req.body.nomeAtt != "" && req.body.nomeAtt != undefined){
            evento.nomeAtt = req.body.nomeAtt;
        }
        if(req.body.categoria != "" && req.body.categoria != undefined){
            evento.categoria = req.body.categoria
        }
        if(req.body.indirizzo != "" && req.body.indirizzo != undefined){
            evento.luogoEv.indirizzo = req.body.indirizzo
        }
        if(req.body.citta != "" && req.body.citta != undefined){
            evento.luogoEv.citta = req.body.citta;
        }
        
        await evento.save();
        res.location("/api/v2/EventiPrivati/" + id_evento).status(200).send();
        console.log('Evento privato modificato con successo');
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore lato server."}).send();
    }
    
});

router.delete('/:idEvento/Iscrizioni/:idIscr', async(req, res) => {
    
    try{
        
        var evento = await eventPrivat.findById(req.params.idEvento);
        var utente = req.loggedUser.id; 
        var utenteObj = await Users.findById(utente);
        var iscr = await biglietti.findById(req.params.idIscr);
        
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
        
        await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB
        
        console.log('Annullamento iscrizione effettuato con successo.');
        
        res.status(204).send();
        
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
    
});


router.get('/:id', async(req, res) => {

   try{
        let eventoPrivato = await eventPrivat.findById(req.params.id);
        if(eventoPrivato == undefined ){
            res.status(404).json({error: "Non esiste nessun evento con l'id selezionato"}).send();
            return;

        }
        let organizzatore = await Users.findById(eventoPrivato.organizzatoreID);
        let partecipanti = [];
        for (var i of eventoPrivato.partecipantiID){
            let tmp = await Users.findById(i);
            partecipanti.push(tmp.nome);
        }

        let invitati = [];

        for (var i of eventoPrivato.invitatiID){
            let tmp = await Users.findById(i);
            invitati.push(tmp.nome);
        }


        res.status(200).json({
            nomeAtt: eventoPrivato.nomeAtt,
            categoria: eventoPrivato.categoria,
            data: eventoPrivato.data,
            ora: eventoPrivato.ora,
            durata: eventoPrivato.durata,
            luogoEv: eventoPrivato.luogoEv,
            organizzatore: organizzatore.nome,
            partecipanti: partecipanti,
            invitati: invitati
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }

});


router.post('/:id/Iscrizioni', async (req, res) => {


    var utent = req.loggedUser.id;


    var id_evento= req.params.id;

    
    
    try{

        let eventP = await eventPrivat.findById(id_evento);
        
        

        if(eventP == undefined ){
            res.status(404).json({error: "Non esiste nessun evento con l'id selezionato"}).send();
            return;

        }

        var dati = eventP.data.split(",");

        for(var elem of dati){

            var datta = elem;
            var date = new Date();
            var mm = date.getMonth() + 1
            var dd = date.getDate()
            var yy = date.getFullYear()
            dats = datta.split('/');

           
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

              res.status(403).json({error: "evento non disponibile"}).send()
              return; 

            }else{

           
              if(yy == Number(anno)){
               

                if(mm > Number(mese)){
                  res.status(403).json({error: "evento non disponibile"}).send()
                  return; 
                 
                }else{

                  if(mm == Number(mese)){
                 

                    if(dd > Number(giorno)){
                      res.status(403).json({error: "evento non disponibile"}).send()
                      return; 

                    }

                    if(dd == Number(giorno)){

                        let orario = eventP.ora.split(':');

                        let str1 = orario[0];
                        let str2 = orario[1];
                        if (orario[0][0] == 0) {
                            str1 = orario[0][1];

                        }
                        if (orario[1][0] == 0) {
                            str2 = orario[1][1];
                        }

                        if (Number(str1) >= date.getHours()) {


                            if (Number(str1) == date.getHours()) {



                                if (Number(str2) < date.getMinutes()) {
                                    res.status(403).json({ error: "evento non disponibile" }).send()
                                    return;


                                }


                            }


                        } else {
                            res.status(403).json({ error: "evento non disponibile" }).send()
                            return;

                        }

            

                    }

                  }
               

                }

              }

            }





        }

        if(!eventP.invitatiID.includes(utent)){
            res.status(403).json({ error: "Non sei invitato a questo evento"}).send();
            return;

        }



        

        for(elem of eventP.partecipantiID){
            if(elem==utent){

                 res.status(403).json({ error: "Gi?? iscritto"}).send();
                 return;
            }

        }

        let data = {
            idUtente: utent,
            idEvento: id_evento
        };



        let stringdata = JSON.stringify(data);

        //Print QR code to file using base64 encoding

        var idBigl = "";
        
        qrcode.toDataURL(stringdata, async function(err, qrcode) {
            if(err) {
                throw Error("errore creazione biglietto")
            }

            bigl = new biglietti({eventoid:id_evento,utenteid:utent,qr:qrcode,tipoevento:"priv"});
            idBigl = bigl._id;
            return await bigl.save();

            
            
        });

        

        


        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()

        




        res.location("/api/v2/EventiPrivati/" +id_evento+ "/Iscrizioni/" + idBigl).status(201).send();



    }catch (error){
        console.log(error);
        res.status(500).json({ error: "Errore nel server"}).send();



  
    }



});







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

        if(req.body.data == "" || req.body.data == undefined ||
            req.body.durata <= 0 || req.body.durata == undefined ||
            req.body.ora == "" || req.body.ora == undefined ||
            req.body.categoria == "" || req.body.categoria == undefined ||
            req.body.nomeAtt == "" || req.body.nomeAtt == undefined ||
            req.body.luogoEv.indirizzo == "" || req.body.luogoEv.indirizzo == undefined || 
            req.body.luogoEv.citta == "" || req.body.luogoEv.citta == undefined ||
            req.body.ElencoEmailInviti == undefined || req.body.ElencoEmailInviti.length == 0){
            res.status(400).json({error: "Campo vuoto o indefinito"}).send();
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
                res.status(400).json({error: "formato data non valido"}).send()
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

              res.status(403).json({error: "giorno non disponibile"}).send()
              return; 

            }else{

           
              if(yy == Number(anno)){
               

                if(mm > Number(mese)){
                  res.status(403).json({error: "giorno non disponibile"}).send()
                  return; 
                 
                }else{

                  if(mm == Number(mese)){
                 

                    if(dd > Number(giorno)){
                      res.status(403).json({error: "giorno non disponibile"}).send()
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

                                       res.status(403).json({error: "orario non permesso"}).send()
                                        return;


                                }


                            }


                        }else{
                            res.status(403).json({error: "orario non permesso"}).send()
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

        for(elem of req.body.ElencoEmailInviti){
            //controllo che le date non siano ripetute
            var counti = 0;
            req.body.ElencoEmailInviti.forEach( e => {if(e==elem){counti += 1 }});
            if(counti > 1){
                res.status(400).json({error: "email ripetute"}).send()
                return; 

            }

        }
        
            
        
        //controllo se l'elenco dell'email contiene solo email di utenti nel sistema

        var ListaInvitati = []

        ut = await Users.findById(utent);
        
        for(var elem of req.body.ElencoEmailInviti){

           

            u = await Users.find({email: elem})
            if(u.length == 0){

                res.status(404).json({error: "un email di un utente da invitare non ?? corretto"});
                return;
            }

            if(ut.email==u[0].email){

                res.status(403).json({error: "non puoi invitarti al tuo stesso evento"});
                return;
            }

            ListaInvitati.push(u[0].id);
            console.log(u[0].id);

            



        }
        
        

        let eventP = new eventPrivat({data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt , luogoEv: {indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta}, organizzatoreID: utent, invitatiID: ListaInvitati});

        eventP.partecipantiID.push(utent);

        //Si salva il documento personale
        eventP = await eventP.save();

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id);
        utente.EventiIscrtto.push(eventP.id);




        //Si salva il modulo dell'utente
        await utente.save();



        let eventId = eventP.id;

        //creare gli inviti a questi eventi 

        for(var elem of ListaInvitati){

            let invito = new invit({utenteid:elem, eventoid: eventId, tipoevent: "priv"});

            await invito.save();


        }


        



        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v2/EventiPrivati/" + eventId).status(201).send();

    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel server"}).send();

    }
    
});

module.exports = router;