import map from '../events//eventsMap.mjs';
import pkg from 'jsonwebtoken';
const tVerify = pkg.verify;
import eventPublic from '../collezioni/eventPublic.mjs';
import User from '../collezioni/utenti.mjs';
import getOrgNames from '../events/OrgNames.mjs';

var _queryEvents = async events => {
    console.log(
        events.map(e => ({
            id: e._id,
            luogoEv: e.luogoEv
        })
    ));
    events = events.filter(e => {
        e.luogoEv = e.luogoEv.filter(d => {
            const [month, day, year] = d.data.split("-");
            const eventDate = new Date(
                `${year}-${month}-${day}T${d.ora}:00`
            );

            const valid = !Number.isNaN(eventDate.getTime());
            const future = eventDate >= new Date();
            console.log({
                data: d.data,
                ora: d.ora,
                eventDate,
                valid,
                future,
                terminato: d.terminato
            });

            return valid && future;
        });

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

var listPublicEvents = async (req, res) => {
    let token = req.header('x-access-token'), user = "";

    let events, nomeAtt = req.header("nomeAtt"), orgName = req.header("orgName");

    if (nomeAtt != undefined && nomeAtt != null && nomeAtt != "") {
        events = eventPublic.find({ nomeAtt: { $eq: nomeAtt }, "luogoEv.terminato": {$eq: false}});
    } else {
        if (orgName != undefined && orgName != null && orgName != "") {
            events = eventPublic.find({ orgName: { $eq: orgName }, "luogoEv.terminato": {$eq: false}});
        } else {
            events = eventPublic.find({"luogoEv.terminato": {$eq: false}});
        }
    }

    events = await events;
    console.log("Events before filtering: ", events.length);
    events = events.filter(e => e.luogoEv.length > 0);

    if (token != undefined && token != null && token != "") {
        tVerify(token, process.env.SUPER_SECRET, async (err, decoded) => {
            if (!err) {
                user = decoded.id;
                events = events.filter(e => e.luogoEv.filter(l => !l.partecipantiID.includes(user)).length > 0 &&
                    e.organizzatoreID != user);
            }

            let events1 = await _queryEvents(events);

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
        let events1 = await _queryEvents(events);

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
};

export { listPublicEvents };