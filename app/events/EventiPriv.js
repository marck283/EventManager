const express = require('express');
const eventPrivat = require('../collezioni/eventPrivat.js');
const invit = require('../collezioni/invit.js');
const router = express.Router();
const biglietti = require('../collezioni/biglietti.js');
const Users = require('../collezioni/utenti.js');
var qrcode = require('qrcode');



router.patch('/:id', async (req, res) => {
    //var utent = req.loggedUser.id;
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {
        let evento = await eventPrivat.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento privato con l'id specificato." });
            return;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare l'evento." });
            return;
        }

        if (req.body.nomeAtt != "" && req.body.nomeAtt != undefined) {
            evento.nomeAtt = req.body.nomeAtt;
        }
        if (req.body.categoria != "" && req.body.categoria != undefined) {
            evento.categoria = req.body.categoria
        }
        if (req.body.indirizzo != "" && req.body.indirizzo != undefined) {
            evento.luogoEv.indirizzo = req.body.indirizzo
        }
        if (req.body.citta != "" && req.body.citta != undefined) {
            evento.luogoEv.citta = req.body.citta;
        }

        await evento.save();
        res.location("/api/v2/EventiPrivati/" + id_evento).status(200).send();
        console.log('Evento privato modificato con successo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }
    return;
});

var spliceArr = (param1, param2) => {
    var arr = param1, index = arr.indexOf(param2);
    if(index > -1) {
        return new Promise.resolve(() =>{
            arr.splice(index, 1);
            param1 = arr;
        });
    } else {
        return new Promise.reject("L'utente non risulta iscritto all'evento.");
    }
}

router.delete('/:idEvento/Iscrizioni/:idIscr', async (req, res) => {
    try {
        var evento = await eventPrivat.findById(req.params.idEvento);
        var utente = req.loggedUser.id;
        var utenteObj = await Users.findById(utente);
        var iscr = await biglietti.findById(req.params.idIscr);

        if (evento == undefined) {
            res.status(404).json({ error: "Non corrisponde alcun evento privato all'ID specificato." });
            return;
        }

        if (iscr == undefined) {
            res.status(404).json({ error: "Non corrisponde alcuna iscrizione all'ID specificato." });
            return;
        }

        if (iscr.eventoid != req.params.idEvento || iscr.utenteid != utente) {
            res.status(403).json({ error: "L'iscrizione non corrisponde all'evento specificato." }).send();
            return;
        }

        spliceArr(evento.partecipantiID, utente)
        .then(async () => {
            await evento.save(); //Aggiornamento partecipantiID
            return spliceArr(utenteObj.EventiIscrtto, req.params.idEvento)
            .then(async () => {
                utenteObj.EventiIscrtto = array2;
                await utenteObj.save(); //Aggiornamento EventiIscritto
                await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB
                console.log('Annullamento iscrizione effettuato con successo.');
                res.status(204).send();
                return;
            });
        })
        //The error in the promise gets propagated to the catch block
        .catch(err => {
            res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
            return;
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }

});


router.get('/:id', async (req, res) => {

    try {
        let eventoPrivato = await eventPrivat.findById(req.params.id);
        if (eventoPrivato == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;

        }
        let organizzatore = await Users.findById(eventoPrivato.organizzatoreID);
        let partecipanti = [];
        for (var i of eventoPrivato.partecipantiID) {
            let tmp = await Users.findById(i);
            partecipanti.push(tmp.nome);
        }

        let invitati = [];

        for (var i of eventoPrivato.invitatiID) {
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }

});


router.post('/:id/Iscrizioni', async (req, res) => {


    var utent = req.loggedUser.id;


    var id_evento = req.params.id;



    try {

        let eventP = await eventPrivat.findById(id_evento);



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

                            if (dd == Number(giorno)) {

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

        if (!eventP.invitatiID.includes(utent)) {
            res.status(403).json({ error: "Non sei invitato a questo evento" }).send();
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

            bigl = new biglietti({ eventoid: id_evento, utenteid: utent, qr: qrcode, tipoevento: "priv" });
            idBigl = bigl._id;
            return await bigl.save();



        });






        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()






        res.location("/api/v2/EventiPrivati/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();



    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();




    }



});







router.post('', async (req, res) => {

    var utent = req.loggedUser.id;
    try {


        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento personale

        if (typeof req.body.durata !== "number") {
            res.status(400).json({ error: "Campo non del formato corretto" }).send();
            return;
        }

        if (req.body.data == "" || req.body.data == undefined ||
            req.body.durata <= 0 || req.body.durata == undefined ||
            req.body.ora == "" || req.body.ora == undefined ||
            req.body.categoria == "" || req.body.categoria == undefined ||
            req.body.nomeAtt == "" || req.body.nomeAtt == undefined ||
            req.body.luogoEv.indirizzo == "" || req.body.luogoEv.indirizzo == undefined ||
            req.body.luogoEv.citta == "" || req.body.luogoEv.citta == undefined ||
            req.body.ElencoEmailInviti == undefined || req.body.ElencoEmailInviti.length == 0) {
            res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
            return;
        }



        var ElencoDate = req.body.data;
        var dateEv = ElencoDate.split(",");

        for (var elem of dateEv) {
            //controllo che la data ha un formato corretto
            var data1 = new Date(elem);
            console.log("Data: " + (data1.getMonth() + 1));
            var regu;
            switch (data1.getMonth() + 1) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12: {
                    regu = /^(01|03|05|07|08|10|12)\/(20|3[0-1]|[0-2][1-9])\/\d{4}$/;
                    break;
                }
                case 2: {
                    regu = /^02\/(19|20|[0-2][1-8])\/\d{4}$/;
                    break;
                }
                case 4:
                case 6:
                case 9:
                case 11: {
                    regu = /^(04|06|09|11)\/(20|30|[0-2][1-9])\/\d{4}$/;
                    break;
                }
                default: {
                    res.status(400).json({ error: "Formato data non valido" }).send();
                    return;
                }
            }
            if (!regu.test(elem)) {
                res.status(400).json({ error: "formato data non valido" }).send()
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
            anno = dats[2];
            if (yy > Number(anno) || (yy == Number(anno) && (mm > Number(mese) || (mm == Number(mese) && dd > Number(giorno))))) {
                res.status(403).json({ error: "giorno non disponibile" }).send()
                return;
            }
        }

        //controllo che l'ora sia del formato corretto
        var reg = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        var ora = req.body.ora;
        if (reg.test(ora)) {
            strin = ora.split(":");
            str1 = strin[0];
            str2 = strin[1];
            if (strin[0][0] == 0) {
                str1 = strin[0][1];
            }
            if (strin[1][0] == 0) {
                str2 = strin[1][1];
            }
            var d = new Date()
            //controllo che l'orario non sia precedente all'orario attuale nel caso nell'elenco delle date appare quella attuale
            if (ElencoDate != "") {
                var mm = d.getMonth() + 1
                var dd = d.getDate()
                var yy = d.getFullYear()

                var giorno = dd.toString().padStart(2, '0');
                var mese = mm.toString().padStart(2, '0');
                var anno = "" + yy;

                var temp_poz = mese + '/' + giorno + '/' + anno;

                if (ElencoDate.includes(temp_poz) && ((Number(str1) >= d.getHours() && Number(str1) == d.getHours() && Number(str2) < d.getMinutes()) || Number(str1) < d.getHours())) {
                    res.status(403).json({ error: "orario non permesso" }).send()
                    return;
                }
            }
        } else {
            res.status(400).json({ error: "formato ora non valido" }).send()
            return;
        }

        for (elem of req.body.ElencoEmailInviti) {
            //controllo che le date non siano ripetute
            var counti = 0;
            req.body.ElencoEmailInviti.forEach(e => { if (e == elem) { counti += 1 } });
            if (counti > 1) {
                res.status(400).json({ error: "email ripetute" }).send()
                return;
            }
        }

        //controllo se l'elenco dell'email contiene solo email di utenti nel sistema
        var ListaInvitati = []

        var ut = await Users.findById(utent);
        for (var elem of req.body.ElencoEmailInviti) {
            u = await Users.find({ email: { $eq: elem } });
            if (u.length == 0) {
                res.status(404).json({ error: "un email di un utente da invitare non è corretto" });
                return;
            }

            if (ut.email == u[0].email) {
                res.status(403).json({ error: "non puoi invitarti al tuo stesso evento" });
                return;
            }
            ListaInvitati.push(u[0].id);
            console.log(u[0].id);
        }

        let eventP = new eventPrivat({ data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt, luogoEv: { indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta }, organizzatoreID: utent, invitatiID: ListaInvitati });
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
        for (var elem of ListaInvitati) {
            let invito = new invit({ utenteid: elem, eventoid: eventId, tipoevent: "priv" });
            await invito.save();
        }
        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v2/EventiPrivati/" + eventId).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

module.exports = router;