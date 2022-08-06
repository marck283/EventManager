const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const crypto = require('bcrypt');
const utenti = require('./collezioni/utenti.js');

const saltRounds = 10;

router.get("", async (req, res) => {
    var email = req.query.email;

    var utenti = await Utente.find({});
    if (email != undefined && email != "") {
        utenti = utenti.filter(e => e.email.includes(email));
    }
    utenti = utenti.map(u => {
        return {
            nome: u.nome,
            email: u.email,
            urlUtente: "/api/v2/Utenti/" + u._id
        }
    });

    if (utenti.length == 0) {
        res.status(404).json({ error: "Nessun utente trovato per la email indicata." });
        return;
    }
    res.status(200).json({utenti: utenti});
    return;
});

router.patch('', async (req, res) => {
    try {
        if(req.body.email == "" || req.body.email == undefined || req.body.psw == "" || req.body.psw == undefined) {
            res.status(400).json({error: "Campo vuoto o indefinito."}).send();
            return;
        }
        var utente = await utenti.findOne({email: {$eq: req.body.email}}).exec();
        if(utente == undefined) {
            res.status(404).json({error: "Utente non trovato."}).send();
            return;
        }
        crypto.hash(req.body.psw, saltRounds, (err, hash) => {
            utente.password = hash;
        });
        //Old hashing instruction
        //utente.password = crypto.createHash('sha3-512').update(req.body.psw).digest('hex');
        let user = await utente.save();
        res.status(200).json({message: "Password modificata con successo."}).send();
    } catch(error) {
        console.log(error);
        res.status(500).json({error: "Errore interno al server."}).send();
    }
    return;
});


router.post('', async (req, res) => {
    try {
        if(req.body.nome == "" || req.body.nome == undefined ||
         req.body.email == "" || req.body.email == undefined ||
         req.body.pass == "" || req.body.pass == undefined){
            res.status(400).json({error: "Campo vuoto o indefinito"}).send();
            return;
        }

        let ut = await Utente.findOne({email: {$eq: req.body.email} });

        if(ut){
            res.status(409).json({ error: 'L\'email inserita corrisponde ad un profilo già creato.' }).send();
            return;
        }

        let email1 = req.body.email;
        if (!email1 || typeof email1 != 'string' || !checkIfEmailInString(email1)) {
            res.status(400).json({ error: 'Formato email errato' }).send();
            return;
        }

        let salt1, psw;
        
        //Hashing + salting to mitigate digest clashes and pre-computation
        await crypto.genSalt(saltRounds)
        .then(salt => {
            salt1 = salt;
            crypto.hash(req.body.pass, salt, (err, hash) => {
                if(err) {
                    throw err;
                } else {
                    psw = hash;
                }
            });
        })
        .catch(err => {
            console.log(err);
            throw err;
        });

        let Utent = new Utente({
            nome: req.body.nome,
            email: email1,
            password: psw,
            salt: salt1,
            tel: req.body.tel
        });
        
        let Utentes = await Utent.save(), utenteId = Utentes.id;

        /**
         * Link to the newly created resource is returned in the Location header
         * https://www.restapitutorial.com/lessons/httpmethods.html
         */
        res.location("/api/v2/Utenti/" + utenteId).status(201).send();

    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Errore Server' }).send();

    }

    
});

function checkIfEmailInString(text) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}
module.exports = router;