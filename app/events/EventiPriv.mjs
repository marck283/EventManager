import { Router } from 'express';
import eventPrivat from '../collezioni/eventPrivat.mjs';
import invit from '../collezioni/invit.mjs';
const router = Router();
import biglietti from '../collezioni/biglietti.mjs';
import Users from '../collezioni/utenti.mjs';
import { toDataURL } from 'qrcode';
import { Validator } from 'node-input-validator';
import { validate_body } from '../validate.mjs';
import test from '../hourRegexTest.mjs';
import dateCheck from '../dateCheck.mjs';
import returnUser from '../findUser.mjs';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.patch('/:id', validate_body({
    nomeAtt: 'string|minLength:1',
    categoria: 'string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
    indirizzo: 'string|minLength:1',
    citta: 'string|minLength:1'
}, "Dati dell'evento non validi"), async (req, res) => {
    var utent = await returnUser(req);
    var id_evento = req.params.id;

    try {
        let evento = await eventPrivat.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento privato con l'id specificato." });
            return;
        }

        if (utent.id != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare l'evento." });
            return;
        }

        const nomeAtt = req.body?.nomeAtt;
        const categoria = req.body?.categoria;
        const indirizzo = req.body?.luogoEv?.indirizzo;
        const citta = req.body?.luogoEv?.citta;
        if (nomeAtt != undefined) {
            evento.nomeAtt = nomeAtt;
        }
        if (categoria != undefined) {
            evento.categoria = categoria
        }
        if (indirizzo != undefined) {
            evento.luogoEv.indirizzo = indirizzo
        }
        if (citta != undefined) {
            evento.luogoEv.citta = citta;
        }

        await evento.save();
        res.location("/api/v2/EventiPrivati/" + id_evento).status(200).send();
        console.log('Evento privato modificato con successo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." });
    }
    return;
});

var spliceArr = (param1, param2) => {
    var arr = param1, index = arr.indexOf(param2);
    if (index > -1) {
        return new Promise.resolve(() => {
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
        var utenteObj = await returnUser(req);
        var iscr = await biglietti.findById(req.params.idIscr);

        if (evento == undefined) {
            res.status(404).json({ error: "Non corrisponde alcun evento privato all'ID specificato." });
            return;
        }

        if (iscr == undefined) {
            res.status(404).json({ error: "Non corrisponde alcuna iscrizione all'ID specificato." });
            return;
        }

        if (iscr.eventoid != req.params.idEvento || iscr.utenteid != utenteObj.id) {
            res.status(403).json({ error: "L'iscrizione non corrisponde all'evento specificato." });
            return;
        }

        spliceArr(evento.partecipantiID, utenteObj.id)
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
                res.status(403).json({ error: "L'utente non risulta iscritto all'evento." });
                return;
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" });
    }

});

router.get('/:id', async (req, res) => {
    try {
        let eventoPrivato = await eventPrivat.findById(req.params.id);
        if (eventoPrivato == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" });
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
        res.status(500).json({ error: "Errore nel Server" });
    }
});


router.post('/:id/Iscrizioni', async (req, res) => {
    try {
        var utent = await returnUser(req), utentId = utent._id;
        var id_evento = req.params.id;
        let eventP = await eventPrivat.findById(id_evento);

        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" });
            return;
        }

        for (let elem of eventP.data) {
            let date = new Date(), d1 = new Date(elem);
            let orario = eventP.ora.split(':');

            d1.setHours(orario[0].toString().padStart(2, '0'), orario[1].toString().padStart(2, '0'));
            d1.setDate(d1.getDate() + 1);

            if (d1 < date) {
                res.status(403).json({ error: "Evento non disponibile" })
                return;
            }
        }

        if (!eventP.invitatiID.includes(utentId)) {
            res.status(403).json({ error: "L'utente non è stato invitato a questo evento" });
            return;
        }

        if (eventP.partecipantiID.includes(utentId)) {
            res.status(403).json({ error: "Già iscritto" });
            return;
        }

        let data = {
            idUtente: utentId,
            idEvento: id_evento
        };

        let stringdata = JSON.stringify(data);

        //Print QR code to file using base64 encoding
        var idBigl = "";

        toDataURL(stringdata, async function (err, qrcode) {
            if (err) {
                throw Error("errore creazione biglietto");
            }

            let bigl = new biglietti({ eventoid: id_evento, utenteid: utentId, qr: qrcode, tipoevento: "priv" });
            idBigl = bigl.id;
            await bigl.save();
        });

        eventP.partecipantiID.push(utentId);
        utent.EventiIscrtto.push(id_evento);

        await eventP.save();
        await utent.save();

        res.location("/api/v2/EventiPrivati/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" });
    }
});

router.post('', validate_body({
    descrizione: 'required|string|minLength:1|maxLength:140',
    categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
    eventPic: 'required|string|minLength:1',
    nomeAtt: 'required|string|minLength:1',
    'ElencoEmailInviti': 'arrayUnique|minLength:1',
    luogoEv: 'required|array|minLength:1',
    'luogoEv.*.data': 'required|string|dateFormat:MM-DD-YYYY',
    'luogoEv.*.ora': 'required|string|minLength:5|maxLength:5',
    'luogoEv.*.indirizzo': 'required|string|minLength:1',
    'luogoEv.*.civNum': 'required|string|minLength:1',
    'luogoEv.*.cap': 'required|numeric|min:1',
    'luogoEv.*.citta': 'required|string|minLength:1',
    'luogoEv.*.provincia': 'required|string|in:AG,AL,AN,AO,AR,AP,AT,AV,BA,BT,BL,BN,BG,BI,BO,BZ,BS,\
            BR,CA,CL,CB,CE,CI,CT,CZ,CH,CO,CS,CR,KR,CN,EN,FM,FE,FI,FG,FC,FR,GE,GO,GR,IM,\
            IS,AQ,SP,LT,LE,LI,LO,LU,MC,MN,MS,MT,VS,ME,MI,MO,MB,NA,NO,NU,OG,OT,\
            OR,PD,PA,PR,PV,PG,PU,PE,PC,PI,PT,PN,PZ,PO,RG,RA,RC,RE,RI,RN,RM,RO,SA,SS,SV,\
            SI,SR,SO,SU,TA,TE,TR,TO,TP,TN,TV,TS,UD,VA,VE,VB,VC,VR,VV,VI,VT'
}, "Dati evento non validi"), async (req, res) => {
    //Si cerca l'utente organizzatore dell'evento
    let utente = await returnUser(req);
    //Si crea un documento evento personale
    const v = new Validator({
        'ElencoEmailInviti': req.body.ElencoEmailInviti
    }, {
        'ElencoEmailInviti.*': 'required|email|minLength:1|notIn:' + utente.email,
    });
    v.check().then(async matched => {
        if (!matched) {
            console.log(v.errors);
            res.status(400).json({ error: "Uno o più indirizzi email degli invitati non sono validi o corrispondono all'email dell'organizzatore." });
            return;
        }
        // Controllo se l'elenco dell'email contiene solo email di utenti nel sistema
        var ListaInvitati = [];
        if (req.body.ElencoEmailInviti != null && req.body.ElencoEmailInviti != undefined && req.body.ElencoEmailInviti.length > 0) {
            for (var elem of req.body.ElencoEmailInviti) {
                let u = await Users.find({ email: { $eq: elem } });
                if (u.length > 0) {
                    ListaInvitati.push(u.id);
                } else {
                    res.status(404).json({ error: "email non trovata" });
                    return;
                }
            }
        }

        var luogoEv = [];
        if (!dateCheck(req.body.luogoEv)) {
            res.status(400).json({ error: "Data non valida." });
            return;
        }

        for (let o of req.body.luogoEv) {
            if (!test(o.ora)) {
                res.status(400).json({ error: "Ora non valida." });
                return;
            }

            luogoEv.push({
                data: o.data,
                ora: o.ora,
                indirizzo: o.indirizzo,
                civNum: o.civNum,
                cap: o.cap,
                citta: o.citta,
                provincia: o.provincia,
                partecipantiID: [],
                terminato: false
            });
        }

        let eventP = new eventPrivat({
            //durata: req.body.durata.join(":"),
            descrizione: req.body.descrizione,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            luogoEv: luogoEv,
            eventPic: req.body.eventPic,
            organizzatoreID: utente.id,
            durata: '0:0:0'
        });

        //Si salva il documento personale
        eventP = await eventP.save();

        console.log(eventP.eventPic == undefined);

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id);
        utente.numEvOrg += 1; //Incremento il numero di eventi organizzati dall'utente

        //Si salva il modulo dell'utente
        await utente.save();

        let eventId = eventP.id;

        //creare gli inviti a questi eventi 
        ListaInvitati.forEach(async elem => {
            let invito = new invit({ utenteid: elem, eventoid: eventId, tipoevent: "priv" });
            await invito.save();
        });
        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposta
         */
        res.status(201).location("/api/v2/EventiPrivati/" + eventId).send();
    }).catch(err => {
        console.log(err);
        res.status(400).json({ error: "Uno o più indirizzi email degli invitati non sono validi o corrispondono all'email dell'organizzatore." });
        return;
    });
});

export default router;