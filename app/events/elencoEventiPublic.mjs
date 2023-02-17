import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import map from './eventsMap.mjs';
import pkg from 'jsonwebtoken';
const tVerify = pkg.verify;
import User from '../collezioni/utenti.mjs';
import getOrgNames from './OrgNames.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 10, //Limit each IP to a certain number of requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var queryEvents = async events => {
    events = events.filter(e => {
        e.luogoEv = e.luogoEv.filter(d => new Date(d.data + "Z" + d.ora) >= new Date());
        return e.luogoEv.length > 0;
    });

    if (events == null || events.length == 0) {
        console.log("No events found");
        return null;
    }

    //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
    var events1 = events.sort(async (e, e1) => (await User.findById(e.organizzatoreID)).valutazioneMedia
    - (await User.findById(e1.organizzatoreID)).valutazioneMedia);
    events1.reverse();

    events1 = await map(events1, "pub", await getOrgNames(events));
    events = null;
    return events1;
};

router.get("", async (req, res) => {
    let token = req.header('x-access-token'), user = "";

    let events, nomeAtt = req.header("nomeAtt"), orgName = req.header("orgName");

    console.log("nomeAtt:", nomeAtt);
    console.log("orgName:", orgName);

    if (nomeAtt != undefined && nomeAtt != null && nomeAtt != "") {
        events = eventPublic.find({ nomeAtt: { $eq: nomeAtt }, "luogoEv.terminato": {$eq: false}});
        //nomeAtt = null;
    } else {
        if (orgName != undefined && orgName != null && orgName != "") {
            events = eventPublic.find({ orgName: { $eq: orgName }, "luogoEv.terminato": {$eq: false}});
            //orgName = null;
        } else {
            events = eventPublic.find({"luogoEv.terminato": {$eq: false}});
        }
    }

    events = (await events).filter(e => e.luogoEv/*.filter(l => !l.terminato)*/.length > 0);

    if (token != undefined && token != null && token != "") {
        console.log("pubToken:", token);
        tVerify(token, process.env.SUPER_SECRET, async (err, decoded) => {
            console.log(err); //Tutto ok se il token è null, undefined o una stringa vuota, passiamo oltre.
            if (!err) {
                user = decoded.id;
                events = events.filter(e => e.luogoEv.filter(l => !l.partecipantiID.includes(user)).length > 0 &&
                    e.organizzatoreID != user);
            }

            let events1 = await queryEvents(events);

            events = null;

            if (events1 != null) {
                res.status(200).json({ eventi: events1 }).send();
                events1 = null;
            } else {
                res.status(404).json({ error: "Non sono presenti eventi organizzati." }).send();
            }
        });
        token = null;
    } else {
        let events1 = await queryEvents(events);

        events = null;

        if (events1 != null) {
            res.status(200).json({ eventi: events1 }).send();
            events1 = null;
        } else {
            res.status(404).json({ error: "Non sono presenti eventi organizzati." }).send();
        }
    }
    user = null;
    return;
});

export default router;