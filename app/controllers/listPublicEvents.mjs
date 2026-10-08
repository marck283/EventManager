import map from '../events//eventsMap.mjs';
import pkg from 'jsonwebtoken';
const tVerify = pkg.verify;
import eventPublic from '../collezioni/eventPublic.mjs';
import User from '../collezioni/utenti.mjs';
import getOrgNames from '../events/OrgNames.mjs';

var _queryEvents = async (events, requestId) => {
    console.log(`[${requestId}] _queryEvents input:`, events.length);

    events = events.filter(e => {
        e.luogoEv = e.luogoEv.filter(d => {
            const [day, month, year] = d.data.split("-");
            const eventDate = new Date(
                `${year}-${month}-${day}T${d.ora}:00`
            );

            const future = eventDate >= new Date();

            console.log(`[${requestId}] location:`, {
                data: d.data,
                ora: d.ora,
                eventDate,
                valid: !Number.isNaN(eventDate.getTime()),
                future
            });

            return !Number.isNaN(eventDate.getTime()) && future;
        });

        return e.luogoEv.length > 0;
    });

    console.log(`[${requestId}] after date filter:`, events.length);

    if (events.length === 0) {
        console.log(`[${requestId}] No events found`);
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

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    console.log(`[${requestId}] start`, req.method, req.originalUrl);

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
    console.log(`[${requestId}] Mongo result count:`, events.length);

    events = events.filter(e =>
        Array.isArray(e.luogoEv) && e.luogoEv.length > 0
    );

    console.log(`[${requestId}] After luogoEv filter:`, events.length);

    if (token != undefined && token != null && token != "") {
        tVerify(token, process.env.SUPER_SECRET, async (err, decoded) => {
            if (!err) {
                user = decoded.id;
                events = events.filter(e => e.luogoEv.filter(l => !l.partecipantiID.includes(user)).length > 0 &&
                    e.organizzatoreID != user);
            }

            let events1 = await _queryEvents(events, requestId);

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
        let events1 = await _queryEvents(events, requestId);
        console.log(`[${requestId}] _queryEvents result:`, events1?.length ?? 0);

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