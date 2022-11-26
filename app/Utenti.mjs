import { Router } from 'express';
const router = Router();
import Utente from './collezioni/utenti.mjs';
import Biglietto from './collezioni/biglietti.mjs';
import eventPublic from './collezioni/eventPublic.mjs';
import eventPrivat from './collezioni/eventPrivat.mjs';
import Inviti from './collezioni/invit.mjs';
import eventPersonal from './collezioni/eventPersonal.mjs';

router.get('/me', async (req, res) => {
    var IDexample = req.loggedUser.id || req.loggedUser.sub;
    let utente, obj;

    if (IDexample === req.loggedUser.sub) {
        utente = await Utente.find({ email: { $eq: req.loggedUser.email } });
        obj = {
            nome: utente[0].nome,
            email: utente[0].email,
            tel: utente[0].tel,
            url: "/api/v2/Utenti/" + IDexample,
            password: utente[0].password,
            picture: utente[0].profilePic,
            numEvOrg: utente[0].EventiCreati.length,
            valutazioneMedia: utente[0].valutazioneMedia
        };
    } else {
        utente = await Utente.findById(IDexample);
        obj = {
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            url: "/api/v2/Utenti/" + IDexample,
            password: utente.password,
            picture: utente.profilePic,
            numEvOrg: utente.EventiCreati.length,
            valutazioneMedia: utente.valutazioneMedia
        }
    }

    try {
        res.status(200).json(obj);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" });
    }

    return;
});

router.get('/me/Inviti', async (req, res) => {
    try {
        var IDexample = req.loggedUser.id || req.loggedUser.sub, ListaInviti = await Inviti.find({ utenteid: IDexample });

        if (ListaInviti.length == 0) {
            res.status(404).json({ error: "Non ci sono inviti per questo utente" }).send();
            return;
        }

        var ListInvit = [];
        await Utente.findById(IDexample);
        var accettato = false;
        for (var elem of ListaInviti) {
            accettato = false;
            if (elem.tipoevent == "pub") {
                let evento = await eventPublic.findById(elem.eventoid);
                if (evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    if (evento.partecipantiID.includes(IDexample)) {
                        accettato = true;
                    }

                    ListInvit.push({
                        tipoevento: elem.tipoevent,
                        idevento: elem.eventoid,
                        idutente: IDexample,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v2/Utenti/" + elem._id,
                        accettato: accettato
                    });
                }
            }

            if (elem.tipoevent == "priv") {
                let evento = await eventPrivat.findById(elem.eventoid);
                if (evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    if (evento.partecipantiID.includes(IDexample)) {
                        accettato = true;
                    }

                    ListInvit.push({
                        tipoevento: elem.tipoevent,
                        idevento: elem.eventoid,
                        idutente: IDexample,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        urlInvito: "/api/v2/Utenti/" + elem._id,
                        accettato: accettato
                    });
                }
            }
        }

        if (ListInvit.length == 0) {
            res.status(404).json({ error: "Non c'è nessun evento valido associato all'invito" }).send();
            return;
        }

        res.status(200).json(ListInvit);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

router.get('/me/Iscrizioni', async (req, res) => {
    try {
        var IDexample = req.loggedUser.id || req.loggedUser.sub, ListaBiglietti = await Biglietto.find({ utenteid: IDexample });
        if (ListaBiglietti.length == 0) {
            res.status(404).json({ error: "Non ci sono biglietti per questo utente" }).send();
            return;
        }

        var ListBigl = [];
        let utente = await Utente.findById(IDexample);

        for (var elem of ListaBiglietti) {
            if (elem.tipoevento == "pub") {
                let evento = await eventPublic.findById(elem.eventoid);
                if (evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({
                        eventoUrl: "/api/v2/EventiPubblici/" + evento._id,
                        eventoid: evento._id,
                        utenteUrl: "/api/v2/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
                        bigliettoUrl: "/api/v2/Iscrizioni/" + elem._id
                    });
                }
            }

            if (elem.tipoevento == "priv") {
                let evento = await eventPrivat.findById(elem.eventoid);
                if (evento) {
                    let orga = await Utente.findById(evento.organizzatoreID);
                    ListBigl.push({
                        eventoUrl: "/api/v2/EventiPrivati/" + evento._id,
                        eventoid: evento._id,
                        utenteUrl: "/api/v2/Utenti/" + IDexample,
                        utenteid: IDexample,
                        nomeUtente: utente.nome,
                        nomeOrg: orga.nome,
                        nomeAtt: evento.nomeAtt,
                        tipoevento: elem.tipoevento,
                        img: elem.qr,
                        bigliettoid: elem._id,
                        bigliettoUrl: "/api/v2/Iscrizioni/" + elem._id
                    });
                }
            }
        }

        if (ListBigl.length == 0) {
            res.status(403).json({ error: "Non c'è nessun evento valido associato al biglietto" }).send();
            return;
        }

        res.status(200).json(ListBigl);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

var deleteGoogleUser = async (user, which) => {
    user = await Utente.findOneAndDelete({ email: { $eq: user.email } });
    which = "google";
}

var deleteFacebookUser = async (user, which) => {
    user = await Utente.findByIdAndDelete(user.id);
    which = "facebook";
}

router.delete("/deleteMe", async (req, res) => {
    try {
        var which;
        var user = req.loggedUser.id || req.loggedUser.sub;
        (user == req.loggedUser.sub) ? await deleteGoogleUser(user, which) :
            await deleteFacebookUser(user, which);

        if (user != null && user != undefined) {
            //Ora trovo tutti gli eventi organizzati, i biglietti e gli inviti posseduti da questo utente e li invalido.
            var listaEventi = await eventPublic.find({ organizzatoreID: user.id });
            for(let e of listaEventi) {
                await Biglietto.deleteMany({ eventoid: e.id });
            }
            await eventPublic.deleteMany({ organizzatoreID: user.id });
            await eventPersonal.deleteMany({ organizzatoreID: user.id });
            await eventPrivat.deleteMany({ organizzatoreID: user.id });
            await Inviti.deleteMany({ utenteid: user.id });

            var listaBiglietti = await Biglietto.find({ utenteid: user.id });
            for(let b of listaBiglietti) {
                let evento = await eventPublic.findById(b.eventoid);
                if(evento != undefined && evento != null) {
                    let luogo = evento.luogoEv.filter(l => l.giorno == b.giorno && l.ora == b.ora)[0];
                    let index = luogo.partecipantiID.indexOf(user.id);
                    if(index > -1) {
                        luogo.partecipantiID.splice(index, 1);
                    }
                }
                
                evento = await eventPrivat.findById(b.eventoid);
                if(evento != undefined && evento != null) {
                    let luogo = evento.luogoEv.filter(l => l.giorno == b.giorno && l.ora == b.ora)[0];
                    let index = luogo.partecipantiID.indexOf(user.id);
                    if(index > -1) {
                        luogo.partecipantiID.splice(index, 1);
                    }
                }
            }
            await Biglietto.deleteMany({ utenteid: user.id });
            res.status(200).json({ message: "Utente eliminato con successo.", which: which });
        } else {
            res.status(404).json({ error: "Utente non trovato." });
        }
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore interno al server." });
        return;
    }
});

export default router;