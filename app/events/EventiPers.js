const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const Users = require('../collezioni/utenti.js');
var jwt = require('jsonwebtoken');

router.patch('/:id', async (req, res) => {

    //var utent = req.loggedUser.id;
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {

        let evento = await eventPersonal.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento personale con l'id specificato." });
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
        res.location("/api/v2/EventiPersonali/" + id_evento).status(200).send();
        console.log('Evento personale modificato con successo');

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }

});

router.get('/:id', async (req, res) => {

    try {
        let eventoPersonale = await eventPersonal.findById(req.params.id);
        if (eventoPersonale == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
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
            organizzatore: organizzatore.nome
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }

});



router.post('', async (req, res) => {

    utent = req.loggedUser.id;
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
            req.body.luogoEv.citta == "" || req.body.luogoEv.citta == undefined) {
            res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
            return;
        }


        var ElencoDate = req.body.data;
        var dateEv = ElencoDate.split(",");

        for (var elem of dateEv) {
            //controllo che la data ha un formato corretto
            var regu, data1 = new Date(elem);
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
            var d = new Date();
            //Controllo che l'orario non sia precedente all'orario attuale nel caso nell'elenco delle date appare quella attuale
            if (ElencoDate != "") {
                var mm = d.getMonth() + 1
                var dd = d.getDate()
                var yy = d.getFullYear()

                var giorno = dd.toString().padStart(2, '0');
                var mese = mm.toString().padStart(2, '0');
                var anno = "" + yy;

                var temp_poz = mese + '/' + giorno + '/' + anno;

                if (ElencoDate.includes(temp_poz) && (Number(str1) < d.getHours() || (Number(str1) == d.getHours() && Number(str2) < d.getMinutes()))) {
                    res.status(403).json({ error: "orario non permesso" }).send()
                    return;
                }
            }
        } else {
            res.status(400).json({ error: "formato ora non valido" }).send()
            return;
        }

        let eventP = new eventPersonal({ data: req.body.data, durata: req.body.durata, ora: req.body.ora, categoria: req.body.categoria, nomeAtt: req.body.nomeAtt, luogoEv: { indirizzo: req.body.luogoEv.indirizzo, citta: req.body.luogoEv.citta }, organizzatoreID: utent });


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
        res.location("/api/v2/EventiPersonali/" + eventId).status(201).send();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

module.exports = router;