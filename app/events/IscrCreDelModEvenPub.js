const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
var qrcode = require('qrcode');
const Inviti = require('../collezioni/invit.js');
const Users = require('../collezioni/utenti.js');
const biglietti = require('../collezioni/biglietti.js')

router.patch('/:id', async (req, res) => {

    //var utent = req.loggedUser.id;
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {

        let evento = await eventPublic.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento pubblico con l'id specificato." });
            return;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare l'evento." });
            return;
        }

        if (req.body.nomeAtt != "" && req.body.nomeAtt != undefined) {
            evento.nomeAtt = req.body.nomeAtt;
        }
        if (req.body.categoria != "" && req.body.nomeAtt != undefined) {
            evento.categoria = req.body.categoria
        }
        if (req.body.indirizzo != "" && req.body.indirizzo != undefined) {
            evento.luogoEv.indirizzo = req.body.indirizzo
        }
        if (req.body.citta != "" && req.body.citta != undefined) {
            evento.luogoEv.citta = req.body.citta;
        }
        console.log(req.body.maxPers);
        if (req.body.maxPers != "" && req.body.maxPers != undefined) {
            if (Number.isNaN(parseInt(req.body.maxPers))) {
                res.status(400).json({ error: "Numero massimo partecipanti non valido: formato non valido." });
                return;
            }
            if (req.body.maxPers < 2) {
                res.status(400).json({ error: "Numero massimo partecipanti non valido: inferiore a 2." });
                return;
            }
            evento.maxPers = Math.max(req.body.maxPers, evento.partecipantiID.length);
        }

        await evento.save();
        res.location("/api/v2/EventiPubblici/" + id_evento).status(200).send();
        console.log('Evento pubblico modificato con successo');

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }

});

router.delete('/:idEvento/Iscrizioni/:idIscr', async (req, res) => {

    try {

        var evento = await eventPublic.findById(req.params.idEvento);
        var utente = req.loggedUser.id;
        var utenteObj = await Users.findById(utente);
        var iscr = await biglietti.findById(req.params.idIscr);

        if (evento == undefined) {
            res.status(404).json({ error: "Non corrisponde alcun evento pubblico all'ID specificato." });
            return;
        }

        if (iscr == undefined) {
            res.status(404).json({ error: "Non corrisponde alcuna iscrizione all'ID specificato." });
            return;
        }

        if (iscr.eventoid != req.params.idEvento) {
            res.status(403).json({ error: "L'iscrizione non corrisponde all'evento specificato." }).send();
            return;
        }

        if (iscr.utenteid != utente) {
            res.status(403).json({ error: "L'iscrizione non corrisponde all'utente specificato." }).send();
            return;
        }

        var array1 = evento.partecipantiID;
        var index1 = array1.indexOf(utente);
        if (index1 > -1) {
            array1.splice(index1, 1);
        } else {
            res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
            return;
        }
        evento.partecipantiID = array1;
        await evento.save(); //Aggiornamento partecipantiID

        var array2 = utenteObj.EventiIscrtto;
        var index2 = array2.indexOf(req.params.idEvento);
        if (index2 > -1) {
            array2.splice(index2, 1);
        } else {
            res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
            return;
        }
        utenteObj.EventiIscrtto = array2;
        await utenteObj.save(); //Aggiornamento EventiIscritto

        await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB

        console.log('Annullamento iscrizione effettuato con successo.');

        res.status(204).send();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }

});

router.post('/:id/Iscrizioni', async (req, res) => {


    var utent = req.loggedUser.id;


    var id_evento = req.params.id;



    try {

        let eventP = await eventPublic.findById(id_evento);
        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;

        }

        var dati = eventP.data.split(",");

        for (var elem of dati) {

            var datta = elem;
            var date = new Date();
            var mm = date.getMonth() + 1
            var dd = date.getDate()
            var yy = date.getFullYear()
            dats = datta.split('/');


            if (dats[0][0] == '0') {

                mese = dats[0][1];

            } else {

                mese = dats[0];

            }


            if (dats[1][0] == '0') {

                giorno = dats[1][1];

            } else {

                giorno = dats[1];

            }

            anno = dats[2]



            if (yy > Number(anno)) {

                res.status(403).json({ error: "evento non disponibile" }).send()
                return;

            } else {


                if (yy == Number(anno)) {


                    if (mm > Number(mese)) {
                        res.status(403).json({ error: "evento non disponibile" }).send()
                        return;

                    } else {

                        if (mm == Number(mese)) {


                            if (dd > Number(giorno)) {
                                res.status(403).json({ error: "evento non disponibile" }).send()
                                return;

                            }

                        }


                    }

                }

            }





        }



        if (eventP.partecipantiID.length == eventP.partecipantiID.maxPers) {

            res.status(403).json({ error: "Non spazio nell'evento" }).send();
            return;

        }

        for (elem of eventP.partecipantiID) {
            if (elem == utent) {

                res.status(403).json({ error: "Già iscritto" }).send();
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

        qrcode.toDataURL(stringdata, async function (err, qrcode) {
            if (err) {
                throw Error("errore creazione biglietto")
            }

            bigl = new biglietti({ eventoid: id_evento, utenteid: utent, qr: qrcode, tipoevento: "pub" });

            idBigl = bigl._id;
            return await bigl.save();



        });






        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()






        res.location("/api/v2/EventiPubblici/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();




    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();




    }



});


router.post('/:id/Inviti', async (req, res) => {



    try {

        var utent = req.loggedUser.id;

        var id_evento = req.params.id;


        if (req.body.email == "" || req.body.email == undefined) {

            res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
            return;
        }



        let eventP = await eventPublic.findById(id_evento);
        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;

        }

        //controllo che le date non siano di una giornata precedente a quella odierna

        var dati = eventP.data.split(",");

        for (var elem of dati) {
            var data = elem;
            var date = new Date();
            var mm = date.getMonth() + 1
            var dd = date.getDate()
            var yy = date.getFullYear()
            dats = data.split('/');

            if (dats[0][0] == '0') {

                mese = dats[0][1];

            } else {

                mese = dats[0];

            }


            if (dats[1][0] == '0') {

                giorno = dats[1][1];

            } else {

                giorno = dats[1];

            }

            anno = dats[2]



            if (yy > Number(anno)) {

                res.status(403).json({ error: "evento non disponibile" }).send()
                return;

            } else {


                if (yy == Number(anno)) {


                    if (mm > Number(mese)) {
                        res.status(403).json({ error: "evento non disponibile" }).send()
                        return;

                    } else {

                        if (mm == Number(mese)) {


                            if (dd > Number(giorno)) {
                                res.status(403).json({ error: "evento non disponibile" }).send()
                                return;

                            }

                        }


                    }

                }

            }





        }





        if (eventP.organizzatoreID != utent) {
            res.status(403).json({ error: "L'utente non può invitare ad un evento che non è suo" }).send();
            return;

        }

        var utenteorg = await Users.findById(utent)

        if (utenteorg.email == req.body.email) {
            res.status(403).json({ error: "L'utente non può auto invitarsi" }).send();
            return;

        }





        var utente = await Users.find({ email: req.body.email })

        if (utente.length == 0) {
            res.status(404).json({ error: "Non esiste un utente con quella email" }).send();
            return;

        }



        var ListaInviti = await Inviti.find({ utenteid: utente[0]._id })

        if (ListaInviti.length > 0) {

            for (var elem of ListaInviti) {

                if (elem.eventoid == id_evento) {

                    res.status(403).json({ error: "L'utente con quella email è già invitato a quell'evento" }).send();
                    return;


                }
            }

        }

        if (eventP.partecipantiID.includes(utente[0]._id)) {

            res.status(403).json({ error: "L'utente con quella email è già partecipante all'evento" }).send();
            return;


        }









        let invito = new Inviti({ utenteid: utente[0]._id, eventoid: id_evento, tipoevent: "pub" });

        await invito.save();

        res.location("/api/v2/EventiPubblici/" + id_evento + "/Inviti/" + invito._id).status(201).send();





    } catch (error) {

        console.log(error)
        res.status(500).json({ error: "Errore nel server" }).send();
        return;


    }





});



router.post('', async (req, res) => {




    var utent = req.loggedUser.id;
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        if ((typeof req.body.durata !== "number") || (typeof req.body.maxPers !== "number")) {
            res.status(400).json({ error: "Campo non del formato corretto" }).send();
            return;
        }

        if (req.body.data == "" || req.body.data == undefined ||
            req.body.durata <= 0 || req.body.durata == undefined ||
            req.body.ora == "" || req.body.ora == undefined ||
            req.body.maxPers <= 1 || req.body.maxPers == undefined ||
            req.body.categoria == "" || req.body.categoria == undefined ||
            req.body.nomeAtt == "" || req.body.nomeAtt == undefined ||
            req.body.luogoEv.indirizzo == "" || req.body.luogoEv.indirizzo == undefined ||
            req.body.luogoEv.citta == "" || req.body.luogoEv.citta == undefined) {
            res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
            return;

        }


        var ElencoDate = req.body.data;
        var dateEv = ElencoDate.split(",");

        for (var elem of dateEv) {
            //controllo che la data ha un formato corretto
            var regu = /[0-9]+\/[0-9]+\/[0-9]+/i;
            if (regu.test(elem)) {
                strin = elem.split("/");
                if (strin.length > 3) {
                    res.status(400).json({ error: "formato data non valido" }).send()
                    return;
                } else {
                    //Non bisognerebbe controllare che tutti i campi della data siano espressi in formato numerico?
                    /* 
                    strin.forEach(e => {
                        if(Number.isNaN(parseInt(e))) {
                            res.status(400).json({error: "Formato data non numerico."});
                            return;
                        }
                    }) */
                    if (strin[0].length == 2 && strin[1].length == 2 && strin[2].length == 4) {
                        str1 = strin[0];
                        str2 = strin[1];
                        str3 = strin[3];
                        if (strin[0][0] == 0) {
                            str1 = strin[0][1];

                        }
                        if (strin[1][0] == 0) {
                            str2 = strin[1][1];
                        }
                        switch (str1) {
                            case "1": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            case "2": {
                                if ((Number(str3) % 400) == 0 || ((Number(str3) % 4) == 0 && (Number(str3) % 100) != 0)) {
                                    if (Number(str2) > 29 || Number(str2) < 0) {
                                        res.status(400).json({ error: "formato data non valido" }).send()
                                        return;

                                    }
                                } else {
                                    if (Number(str2) > 28 || Number(str2) < 0) {
                                        res.status(400).json({ error: "formato data non valido" }).send()
                                        return;

                                    }


                                }

                                break;

                            }
                            case "3": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;

                            }
                            case "4": {
                                if (Number(str2) > 30 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;

                            }
                            case "5": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;

                            }
                            case "6": {
                                if (Number(str2) > 30 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            case "7": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;

                            }
                            case "8": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            case "9": {
                                if (Number(str2) > 30 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;

                            }
                            case "10": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            case "11": {
                                if (Number(str2) > 30 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            case "12": {
                                if (Number(str2) > 31 || Number(str2) < 0) {
                                    res.status(400).json({ error: "formato data non valido" }).send()
                                    return;

                                }
                                break;
                            }
                            default: {
                                res.status(400).json({ error: "formato data non valido" }).send()
                                return;
                            }



                        }


                    } else {

                        res.status(400).json({ error: "formato data non valido" }).send()
                        return;


                    }


                }

            } else {
                res.status(400).json({ error: "formato data errato" }).send()
                return;

            }

            //controllo che le date non siano ripetute
            var count = 0;
            dateEv.forEach(e => { if (e == elem) { count += 1 } });
            if (count > 1) {
                res.status(400).json({ error: "date ripetute" }).send()
                return;

            }



            //controllo che le date non siano di una giornata precedente a quella odierna
            var data = elem;
            var date = new Date();
            var mm = date.getMonth() + 1
            var dd = date.getDate()
            var yy = date.getFullYear()
            dats = data.split('/');


            if (dats[0][0] == '0') {

                mese = dats[0][1];

            } else {

                mese = dats[0];

            }


            if (dats[1][0] == '0') {

                giorno = dats[1][1];

            } else {

                giorno = dats[1];

            }

            anno = dats[2]



            if (yy > Number(anno)) {

                res.status(403).json({ error: "giorno non disponibile" }).send()
                return;

            } else {


                if (yy == Number(anno)) {


                    if (mm > Number(mese)) {
                        res.status(403).json({ error: "giorno non disponibile" }).send()
                        return;

                    } else {

                        if (mm == Number(mese)) {


                            if (dd > Number(giorno)) {
                                res.status(403).json({ error: "giorno non disponibile" }).send()
                                return;

                            }

                        }


                    }

                }

            }






        }



        //controllo che l'ora sia del formato corretto
        var reg = /([0-9]+):([0-9]+)/
        var ora = req.body.ora;
        if (reg.test(ora)) {
            strin = ora.split(":");
            if (strin.length > 2) {
                res.status(400).json({ error: "formato ora non valido" }).send()
                return;
            } else {
                if (strin[0].length == 2 && strin[1].length == 2) {
                    str1 = strin[0];
                    str2 = strin[1];
                    if (strin[0][0] == 0) {
                        str1 = strin[0][1];

                    }
                    if (strin[1][0] == 0) {
                        str2 = strin[1][1];
                    }
                    if (Number(str1) <= 23 && Number(str1) >= 0 && Number(str2) <= 59 && Number(str2) >= 0) {
                        var d = new Date()
                        //controllo che l'orario non sia precedente all'orario attuale nel caso nell'elenco delle date appare quella attuale
                        if (ElencoDate != "") {
                            var mm = d.getMonth() + 1
                            var dd = d.getDate()
                            var yy = d.getFullYear()

                            var giorno = ""
                            var mese = ""

                            if (dd < 10) {

                                giorno = "0" + dd;

                            } else {

                                giorno = "" + dd;
                            }

                            if (mm < 10) {

                                mese = "0" + mm;

                            } else {

                                mese = "" + mm;
                            }

                            var anno = "" + yy;

                            var temp_poz = mese + '/' + giorno + '/' + anno;

                            if (ElencoDate.includes(temp_poz) == true) {


                                if (Number(str1) >= d.getHours()) {


                                    if (Number(str1) == d.getHours()) {



                                        if (Number(str2) < d.getMinutes()) {
                                            res.status(403).json({ error: "orario non permesso" }).send()
                                            return;


                                        }


                                    }


                                } else {
                                    res.status(403).json({ error: "orario non permesso" }).send()
                                    return;

                                }



                            }


                        }


                    } else {
                        res.status(400).json({ error: "formato ora non valido" }).send()
                        return;
                    }

                } else {
                    res.status(400).json({ error: "formato ora non valido" }).send()
                    return;
                }
            }


        } else {
            res.status(400).json({ error: "formato ora non valido" }).send()
            return;
        }
        //Si crea un documento evento pubblico
        let eventP = new eventPublic({ data: req.body.data, durata: req.body.durata, ora: req.body.ora, maxPers: req.body.maxPers, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt, luogoEv: { indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta }, organizzatoreID: utent });
        eventP.partecipantiID.push(utent);


        //Si salva il documento pubblico
        eventP = await eventP.save();

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id)

        utente.EventiIscrtto.push(eventP.id);

        //Si salva il modulo dell'utente
        await utente.save();


        let eventId = eventP.id;

        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v2/EventiPubblici/" + eventId).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore del server" }).send();

    }

});

module.exports = router;
