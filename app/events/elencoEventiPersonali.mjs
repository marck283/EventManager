import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
const router = Router();
import { map } from './eventsMap.mjs';
import { Validator } from 'node-input-validator';
import User from '../collezioni/utenti.mjs';

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var obj = {};
    
    var user = req.loggedUser.id || req.loggedUser.sub;

    //Eseguire la funzione verify, poi cercare gli eventi nel database
    eventsPers = await eventPersonal.find({organizzatoreID: user}); //Richiedi gli eventi personali per la data selezionata.
    eventsPers = eventsPers.filter(e => e.data.includes(str));
    eventsPub = await eventPublic.find({});
    eventsPub = eventsPub.filter(e => (e.partecipantiID.find(e => e == user) != undefined || (e.organizzatoreID == user)) && e.data.includes(str));
    eventsPriv = await eventPrivate.find({});
    eventsPriv = eventsPriv.filter(e => (e.partecipantiID.find(e => e == user) != undefined || (e.organizzatoreID == user)) && e.data.includes(str));
    
    if(eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
        eventsPers = map(eventsPers, "pers");
        eventsPub = map(eventsPub, "pub");
        eventsPriv = map(eventsPriv, "priv");
        eventsPub.forEach(e => eventsPers.push(e));
        eventsPriv.forEach(e => eventsPers.push(e));
        obj.eventi = eventsPers;
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento programmato per la giornata selezionata."});
    }
});

var findPubEvents = async (user) => {
    var eventsPub = await eventPublic.find({});
    console.log("Pre-filtering:");
    console.log(eventsPub);

    //Il motivo per vui qui non restituisce nulla nel caso in cui un utente sia autenticato con Google potrebbe essere che,
    //all'iscrizione dell'utente all'evento, non utilizzo il campo "sub" ma l'id di MongoDB?
    //In tal caso, il problema si potrebbe risolvere semplicemente usando il campo "sub" sia qui che per l'iscrizione all'evento...
    eventsPub = eventsPub.filter(e => (e.partecipantiID.includes(user) || e.organizzatoreID == user));
    console.log("Post-filtering:");
    console.log(eventsPub);
    return eventsPub;
};

var filterEvents = (eventsArr, passato) => {
    var curr = new Date();
    if(passato) {
        return eventsArr.filter(e => new Date(e.data + "T" + e.ora) < curr);
    }
    return eventsArr.filter(e => new Date(e.data + "T" + e.ora) >= curr);
};

router.get("", async (req, res) => {
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var user = req.loggedUser.id || req.loggedUser.sub;
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");
    console.log(user);
    if(user === req.loggedUser.sub) {
        //Se l'utente è autenticato con Google, allora devo prima trovare il documento dell'utente nel database, per poi
        //ottenere l'id di MongoDB e utilizzarlo per cercare gli eventi pubblici a cui l'utente è iscritto.
        user = await User.findOne({email: {$eq: req.loggedUser.email}});
        user = user.id;
    }
    console.log(user);

    eventsPers = await eventPersonal.find({organizzatoreID: user}).catch(err => console.log(err)); //Richiedi gli eventi personali.
    console.log("After event find");

    eventsPub = await findPubEvents(user);
    eventsPriv = await eventPrivate.find({});
    eventsPriv = eventsPriv.filter(e => (e.partecipantiID.find(e => e == user) != undefined || e.organizzatoreID == user));
    console.log("Before validation...");
    const v = new Validator({
        durata: durata,
        passato: req.query.passato
    }, {
        durata: 'integer|min:1',
        passato: 'required|string|in:True,False'
    });
    v.check()
    .then(matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."}).send();
            return;
        }
        console.log("OK");
        if(nomeAtt != undefined && nomeAtt != "") {
            eventsPers = eventsPers.filter(e => e.nomeAtt.includes(nomeAtt));
            eventsPub = eventsPub.filter(e => e.nomeAtt.includes(nomeAtt));
            eventsPriv = eventsPriv.filter(e => e.nomeAtt.includes(nomeAtt));
        }
    
        if(categoria != undefined && categoria != "") {
            eventsPers = eventsPers.filter(e => e.categoria == categoria);
            eventsPub = eventsPub.filter(e => e.categoria == categoria);
            eventsPriv = eventsPriv.filter(e => e.categoria == categoria);
        }

        //Since "durata" is not required, it can still be undefined or an empty value.
        if(durata != undefined && durata != "") {
            eventsPers = eventsPers.filter(e => e.durata == durata);
            eventsPub = eventsPub.filter(e => e.durata == durata);
            eventsPriv = eventsPriv.filter(e => e.durata == durata);
        }
        
        if(indirizzo != undefined && indirizzo != "") {
            eventsPers = eventsPers.filter(e => e.luogoEv.indirizzo == indirizzo);
            eventsPub = eventsPub.filter(e => e.luogoEv.indirizzo == indirizzo);
            eventsPriv = eventsPriv.filter(e => e.luogoEv.indirizzo == indirizzo);
        }
    
        if(citta != undefined && citta != "") {
            eventsPers = eventsPers.filter(e => e.luogoEv.citta == citta);
            eventsPub = eventsPub.filter(e => e.luogoEv.citta == citta);
            eventsPriv = eventsPriv.filter(e => e.luogoEv.citta == citta);
        }
    
        switch (req.query.passato) {
            case "True": {
                //Filtro per date passate
                eventsPub = filterEvents(eventsPub, true);
                eventsPriv = filterEvents(eventsPriv, true);
                break;
            }
            case "False": {
                eventsPub = filterEvents(eventsPub, false);
                console.log(eventsPub);
                eventsPriv = filterEvents(eventsPriv, false);
                console.log(eventsPriv);
                break;
            }
        }
    
        if(eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
            eventsPers = map(eventsPers, "pers");
            eventsPub = map(eventsPub, "pub");
            eventsPub.forEach(e => eventsPers.push(e));
            eventsPriv = map(eventsPriv, "priv");
            eventsPriv.forEach(e => eventsPers.push(e));
    
            res.status(200).json({eventi: eventsPers});
        } else {
            res.status(404).json({error: "Non esiste alcun evento programmato."});
        }
    });
});

export default router;