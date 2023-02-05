import { Router, json } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import { toDataURL } from 'qrcode';
import Inviti from '../collezioni/invit.mjs';
import Users from '../collezioni/utenti.mjs';
import biglietti from '../collezioni/biglietti.mjs';
import { Validator } from 'node-input-validator';
import test from '../hourRegexTest.mjs';
//import Recensioni from '../collezioni/recensioniPub.mjs';
import dateCheck from '../dateCheck.mjs';
import geoReq from './geocodingRequest.mjs';
import returnUser from '../findUser.mjs';

router.use(json({ limit: "50mb" })); //Limiting the size of the request should avoid "Payload too large" errors

/*router.delete('/:id/annullaEvento', async (req, res) => {
    var utent = await returnUser(req);
    var id_evento = req.params.id;
    console.log(id_evento);

    try {
        let evento = await eventPublic.findById(id_evento);

        if (evento == undefined) {
            console.log("Non esiste alcun evento pubblico con l'id specificato.");
            res.status(404).json({ error: "Non esiste alcun evento pubblico con l'id specificato." });
            return;
        }

        if (utent.id != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare, terminare od annullare l'evento." });
            return;
        }

        //Trova e cancella tutte le recensioni relative all'evento
        var recensioni = evento.recensioni;
        recensioni.forEach(async e => {
            var recensione = await Recensioni.findById(e);
            await recensione.delete();
        });

        //Modificare in modo da cancellare anche i biglietti...
        const biglietti1 = await biglietti.find({ eventoID: { $eq: id_evento }, utenteid: { $eq: utent.id } });
        for (let b of biglietti1) {
            await b.delete();
        }

        //Cancella l'evento dall'array degli eventi organizzati da parte dell'utente
        let index = utent.EventiCreati.indexOf(id_evento);
        if(index > -1) {
            utent.EventiCreati.splice(index, 1);
        } else {
            res.status(404).json({ error: "L'evento non è presente tra quelli creati dall'utente." }).send();
            return;
        }
        await utent.save();
        await evento.delete();

        res.status(200).json({ message: "Evento annullato con successo." }).send();
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore del server." }).send();
    }
    return;
});*/

router.patch('/:id', async (req, res) => {
    try {
        var utent = (await returnUser(req))._id;
        console.log(utent);
        var id_evento = req.params.id;
        let evento = await eventPublic.findById(id_evento);

        if (evento == null || evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento pubblico con l'id specificato." });
            return;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare, terminare od annullare l'evento." });
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
        if (req.body.terminato != "" && req.body.terminato != undefined) {
            evento.terminato = req.body.terminato;
        }

        const v = new Validator({
            maxPers: req.body.maxPers
        }, {
            maxPers: 'integer|min:2'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Numero massimo partecipanti non valido: formato non valido o valore inferiore a 2." });
                    return;
                } else {
                    if (req.body.maxPers != "" && req.body.maxPers != undefined && Number(req.body.maxPers)) {
                        evento.maxPers = Math.max(req.body.maxPers, evento.partecipantiID.length);
                    }
                    await evento.save();
                    res.location("/api/v2/EventiPubblici/" + id_evento).status(200).send();
                    console.log('Evento pubblico modificato con successo');
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }
});

router.delete('/:idEvento/Iscrizioni/:idIscr', async (req, res) => {
    try {
        //Lega il processo alla data e all'ora comunicate
        const v = new Validator({
            data: req.headers.data,
            ora: req.headers.ora
        }, {
            data: 'required|string|minLength:10|maxLength:10',
            ora: 'required|string|minLength:5|maxLength:5'
        });

        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Richiesta malformata." }).send();
                    return;
                }
                var evento = await eventPublic.findById(req.params.idEvento);
                var utente = req.loggedUser.id || req.loggedUser, utenteObj = req.loggedUser.id;

                if (utente != req.loggedUser.id) {
                    utenteObj = (await Users.findOne({ email: { $eq: utente.email } })).id;
                }

                var iscr = await biglietti.findById(req.params.idIscr);

                if (evento == undefined) {
                    res.status(404).json({ error: "Non corrisponde alcun evento pubblico all'ID specificato." });
                    return;
                }

                if (iscr == undefined) {
                    res.status(404).json({ error: "Non corrisponde alcuna iscrizione all'ID specificato." });
                    return;
                }

                let found = false;
                for (let l of evento.luogoEv) {
                    var array1 = l.partecipantiID;
                    var index1 = array1.indexOf(utenteObj);
                    if (index1 > -1 && l.data == req.headers.data && l.ora == req.headers.ora) {
                        array1.splice(index1, 1);
                        found = true;
                        evento.partecipantiID = array1;
                        await evento.save(); //Aggiornamento partecipantiID
                        break;
                    }
                }

                if (!found) {
                    console.log("OK1");
                    res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
                    return;
                }

                utenteObj = await Users.findById(utenteObj);

                if (utenteObj != undefined) {
                    var array2 = utenteObj.EventiIscrtto;
                    var index2 = array2.indexOf(req.params.idEvento);
                    if (index2 > -1) {
                        array2.splice(index2, 1);
                    } else {
                        console.log("OK2");
                        res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
                        return;
                    }
                    utenteObj.EventiIscrtto = array2;
                    await utenteObj.save(); //Aggiornamento EventiIscritto
                    await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB

                    console.log('Annullamento iscrizione effettuato con successo.');

                    res.status(204).send();
                } else {
                    console.log("OK3");
                    res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
                    return;
                }
            })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

router.post('/:id/Iscrizioni', async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser.sub;
    var id_evento = req.params.id;

    if (utent == req.loggedUser.sub) {
        utent = await Users.findOne({ email: { $eq: utent.email } });
        console.log("utent:", utent);
        utent = utent.id;
    }

    const v = new Validator({
        giorno: req.body.data,
        ora: req.body.ora
    }, {
        giorno: 'required|string|minLength:10|maxLength:10|dateFormat:MM-DD-YYYY',
        ora: 'required|string|minLength:5|maxLength:5'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                console.log(v.errors);
                res.status(400).json({ error: "Richiesta malformata" }).send();
                return;
            }
            try {
                let error = false;
                console.log("OK");
                //var eventP1 = await eventPublic.find({luogoEv: {$elemMatch: {data: req.body.data, ora: req.body.ora}}});
                var eventP1 = await eventPublic.findById(id_evento);
                console.log("OK");
                if (eventP1 == undefined) {
                    res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
                    return;
                }
                console.log("OK");
                for (let l of eventP1.luogoEv) {
                    if (l.partecipantiID.length == l.maxPers) {
                        res.status(403).json({ error: "Limite massimo di partecipanti raggiunto per questo evento." }).send();
                        return;
                    }

                    if (l.partecipantiID.includes(utent)) {
                        if (error) {
                            res.status(403).json({ error: "L'utente è già iscritto a questo evento." }).send();
                            return;
                        }
                        error = true;
                    }

                    if (!error && l.data == req.body.data && l.ora == req.body.ora) {
                        l.partecipantiID.push(utent);
                        await eventP1.save();

                        console.log("OK");

                        let data = {
                            idUtente: utent,
                            idEvento: id_evento
                        };

                        let stringdata = JSON.stringify(data);

                        //Print QR code to file using base64 encoding
                        var idBigl = "";

                        toDataURL(stringdata, async function (err, qrcode) {
                            if (err) {
                                throw Error("Errore creazione biglietto");
                            }

                            var bigl = new biglietti({
                                eventoid: id_evento, utenteid: utent, qr: qrcode, tipoevento: "pub", giorno: req.body.data,
                                ora: req.body.ora
                            });

                            idBigl = bigl._id;
                            return await bigl.save();
                        });
                        console.log("OK");

                        //Si cerca l'utente da iscrivere all'evento
                        let utente = await Users.findById(utent);
                        utente.EventiIscrtto.push(id_evento);
                        await utente.save();
                        console.log("OK");

                        res.location("/api/v2/EventiPubblici/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();

                        break;
                    }
                }
            } catch (error) {
                console.log(error);
                res.status(500).json({ error: "Errore nel server" }).send();
            }
        });
    return;
});

router.post('/:id/Inviti', async (req, res) => {
    try {
        var utent = (await returnUser(req))._id;
        console.log(utent);
        var id_evento = req.params.id;

        const v = new Validator({
            email: req.body.email
        }, {
            email: 'required|email'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    console.log(v.errors);
                    res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
                    return;
                }
                let eventP = await eventPublic.findById(id_evento);
                if (eventP == undefined) {
                    res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
                    return;
                }

                //controllo che le date non siano di una giornata precedente a quella odierna
                if (eventP.data.filter(d => {
                    var date = new Date(), d1 = new Date(d);
                    let orario = eventP.ora.split(':');

                    d1.setHours(orario[0].toString().padStart(2, '0'), orario[1].toString().padStart(2, '0'));
                    d1.setDate(d1.getDate() + 1);
                    return d1 < date;
                }).length > 0) {
                    res.status(403).json({ error: "evento non disponibile" }).send();
                    return;
                }

                if (eventP.organizzatoreID != utent) {
                    res.status(403).json({ error: "L'utente non può invitare ad un evento che non è suo" }).send();
                    return;
                }

                var utenteorg = await Users.findById(utent);
                console.log(utenteorg);
                if (utenteorg.email == req.body.email) {
                    res.status(403).json({ error: "L'utente non può auto invitarsi" }).send();
                    return;
                }

                var utente = await Users.find({ email: { $eq: req.body.email } });
                if (utente.length == 0) {
                    res.status(404).json({ error: "Non esiste un utente con quella email" }).send();
                    return;
                }

                var ListaInviti = await Inviti.find({ utenteid: utente[0]._id });
                if (ListaInviti.length > 0 && ListaInviti.filter(elem => elem.eventoid == id_evento).length > 0) {
                    res.status(403).json({ error: "L'utente con quella email è già invitato a quell'evento" }).send();
                    return;
                }

                if (eventP.partecipantiID.includes(utente[0]._id)) {
                    res.status(403).json({ error: "L'utente con quella email è già partecipante all'evento" }).send();
                    return;
                }

                let invito = new Inviti({ utenteid: utente[0]._id, eventoid: id_evento, tipoevent: "pub" });
                let invitii = await invito.save();
                res.location("/api/v2/EventiPubblici/" + id_evento + "/Inviti/" + invitii.id).status(201).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
        return;
    }
});

router.post('', async (req, res) => {
    try {
        //Si cerca l'utente organizzatore dell'evento
        var utente = await returnUser(req);

        console.log(req.body.luogoEv);
        var options = {
            durata: req.body.durata,
            descrizione: req.body.descrizione,
            eventPic: req.body.eventPic,
            luogoEv: req.body.luogoEv,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            etaMin: req.body.etaMin,
            etaMax: req.body.etaMax
        };
        const v1 = new Validator(options, {
            'durata': 'required|array|minLength:3', //Later formatted as durata[0]:durata[1]:durata[2]; field 1 represents days, field 2 represents hours and field 3 represents minutes.
            'durata.0': 'required|numeric|min:0',
            'durata.1': 'required|numeric|min:0',
            'durata.2': 'required|numeric|min:0',
            descrizione: 'required|string|minLength:1|maxLength:140',
            eventPic: 'required|string|minLength:1',
            'luogoEv.*.ora': 'required|string|minLength:5|maxLength:5',
            'luogoEv.*.maxPers': 'required|integer|min:1',
            categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
            nomeAtt: 'required|string|minLength:1',
            luogoEv: 'required|array|minLength:1',
            'luogoEv.*.indirizzo': 'required|string|minLength:1',
            'luogoEv.*.citta': 'required|string|minLength:1',
            etaMin: 'integer|min:0',
            etaMax: 'integer|gte:etaMin',
            'luogoEv.*.data': 'required|string|dateFormat:MM-DD-YYYY',
            'luogoEv.*.civNum': 'required|string|minLength:1',
            'luogoEv.*.cap': 'required|integer|min:1',
            'luogoEv.*.provincia': 'required|string|in:AG,AL,AN,AO,AR,AP,AT,AV,BA,BT,BL,BN,BG,BI,BO,BZ,BS,\
        BR,CA,CL,CB,CE,CI,CT,CZ,CH,CO,CS,CR,KR,CN,EN,FM,FE,FI,FG,FC,FR,GE,GO,GR,IM,\
        IS,AQ,SP,LT,LE,LI,LO,LU,MC,MN,MS,MT,VS,ME,MI,MO,MB,NA,NO,NU,OG,OT,\
        OR,PD,PA,PR,PV,PG,PU,PE,PC,PI,PT,PN,PZ,PO,RG,RA,RC,RE,RI,RN,RM,RO,SA,SS,SV,\
        SI,SR,SO,SU,TA,TE,TR,TO,TP,TN,TV,TS,UD,VA,VE,VB,VC,VR,VV,VI,VT'
        });
        v1.check()
            .then(async matched => {
                if (!matched || req.body.durata.length > 3) {
                    //console.log(req.body.eventPic);
                    console.log(v1.errors);
                    console.log(req.body.categoria);
                    res.status(400).json({ error: "Campo vuoto o indefinito o non del formato corretto." }).send();
                    return;
                }

                let durata = req.body.durata;
                if (durata[0] == 0 && durata[1] == 0 && durata[2] == 0) {
                    res.status(400).json({ error: "La durata non può essere nulla." }).send();
                    return;
                }

                for (let o of req.body.luogoEv) {
                    if (!test(o.ora)) {
                        res.status(400).json({ error: "Formato ora non valido" }).send();
                        return;
                    }
                }

                if (dateCheck(req.body.luogoEv).length == 0) {
                    res.status(400).json({ error: "Data non valida." }).send();
                    return;
                }

                let obj = [];
                for (let o of req.body.luogoEv) {
                    try {
                        //Esempio di indirizzo da utilizzare: Vicolo Giorgio Tebaldeo, 3, 27036, Mortara, PV
                        let r = await geoReq(o.indirizzo + ", " + o.civNum + ", " + o.cap + ", " + o.citta + ", " + o.provincia);
                        console.log(r.data.status);
                        if (!r.data.status == "OK") {
                            console.log("err: " + r.data.error_message);
                            throw new Error("Indirizzo non valido");
                        } else {
                            obj.push({
                                indirizzo: o.indirizzo,
                                civNum: o.civNum,
                                cap: o.cap,
                                citta: o.citta,
                                provincia: o.provincia,
                                data: o.data,
                                ora: o.ora,
                                maxPers: o.maxPers,
                                partecipantiID: []
                            });
                        }
                    } catch (err) {
                        console.log(err);
                        res.status(400).json({ error: "Indirizzo non valido." });
                        return;
                    }
                }

                let eventoPub = await eventPublic.find({ nomeAtt: req.body.nomeAtt, eventPic: req.body.eventPic });
                if (eventoPub.length > 0) {
                    res.status(400).json({ error: "Evento già esistente." });
                    return;
                }

                let etaMin = null, etaMax = null;
                if (req.body.etaMin != undefined) {
                    etaMin = Number(req.body.etaMin);
                }
                if (req.body.etaMax != undefined) {
                    etaMax = Number(req.body.etaMax);
                }

                //Si crea un documento evento pubblico
                let eventP = new eventPublic({
                    durata: req.body.durata.join(":"),
                    categoria: req.body.categoria,
                    nomeAtt: req.body.nomeAtt,
                    luogoEv: obj,
                    organizzatoreID: utente.id,
                    eventPic: "data:image/png;base64," + req.body.eventPic,
                    etaMin: etaMin,
                    etaMax: etaMax,
                    terminato: false,
                    recensioni: [],
                    valMedia: 0.0,
                    orgName: utente.nome
                });

                //Si salva il documento pubblico
                eventP = await eventP.save();

                //Si indica fra gli eventi creati dell'utente, l'evento appena creato
                utente.EventiCreati.push(eventP.id);
                utente.numEvOrg += 1; //Incremento il numero di eventi organizzati dall'utente

                //Si salva il modulo dell'utente
                await utente.save();

                console.log('Evento salvato con successo');

                /**
                 * Si posiziona il link alla risorsa appena creata nell'header location della risposta
                 */
                res.location("/api/v2/EventiPubblici/" + eventP.id).status(201).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore del server" }).send();
    }
});

export default router;
