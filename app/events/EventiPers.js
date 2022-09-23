const express = require('express');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const Users = require('../collezioni/utenti.js');
const { Validator } = require('node-input-validator');
const dateTest = require('../dateRegexTest.js');

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
    let utent = req.loggedUser.id;
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento personale

        //Prima validiamo i dati inseriti dall'utente
        const v = new Validator({
            data: req.body.data,
            durata: req.body.durata,
            ora: req.body.ora,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            indirizzo: req.body.luogoEv.indirizzo,
            citta: req.body.luogoEv.citta
        }, {
            data: 'required|string|minLength:9',
            durata: 'required|integer|min:1',
            ora: 'required|string|minLength:1',
            categoria: 'required|string|minLength:1',
            nomeAtt: 'required|string|minLength:1',
            indirizzo: 'required|string|minLength:1',
            citta: 'required|string|minLength:1'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Campo vuoto o indefinito o non del formato corretto." }).send();
                    return;
                } else {
                    var ElencoDate = req.body.data;
                    var dateEv = ElencoDate.split(",");
                    var ora = req.body.ora;

                    for (var elem of dateEv) {
                        //Controllo che la data abbia un formato corretto
                        var data1 = new Date(elem);
                        var data = elem;
                        var date = new Date();
                        dats = data.split('/');
                        elem = dats[1] + "-" + dats[0] + "-" + dats[2] + "T" + ora;
                        let d1 = new Date(elem);
                        if (!dateTest.test(data1, elem)) {
                            res.status(400).json({ error: "Formato data non valido" }).send();
                            return;
                        } else {
                            //controllo che le date non siano ripetute
                            var count = 0;
                            dateEv.forEach(e => { if (e == elem) { count += 1 } });
                            if (count > 1) {
                                res.status(400).json({ error: "date ripetute" }).send()
                                return;
                            }

                            //controllo che le date non siano di una giornata precedente a quella odierna
                            if (d1 < date) {
                                res.status(403).json({ error: "giorno o ora non disponibile" }).send()
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

                            /*//Controllo che l'ora sia del formato corretto
                            var reg = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
                            
                            if (!reg.test(ora)) {
                                res.status(400).json({ error: "formato ora non valido" }).send();
                            } else {
                                strin = ora.split(":");
                                var d = new Date();
                                //Controllo che l'orario non sia precedente all'orario attuale nel caso nell'elenco delle date appare quella attuale
                                if (ElencoDate != "") {
                                    var giorno = d.getDate().toString().padStart(2, '0');
                                    var mese = (d.getMonth() + 1).toString().padStart(2, '0');
                                    var anno = d.getFullYear().toString();

                                    var temp_poz = mese + '/' + giorno + '/' + anno;

                                    if (ElencoDate.includes(temp_poz) && (Number(strin[0]) < d.getHours() || (Number(strin[0]) == d.getHours() && Number(strin[1]) < d.getMinutes()))) {
                                        res.status(403).json({ error: "orario non permesso" }).send()
                                        return;
                                    }
                                }
                            }*/
                        }
                    }
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

module.exports = router;