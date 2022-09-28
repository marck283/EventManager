const express = require('express');
const RateLimit = require('express-rate-limit');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');
const crypto = require('bcrypt');
const { Validator } = require('node-input-validator');

const saltRounds = 10;

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.use(express.json({limit: '25mb'}));

router.get("", async (req, res) => {
    var email = req.query.email;

    const v = new Validator({
        email: req.query.email
    }, {
        email: 'required|string'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                res.status(400).json({
                    error: "Indirizzo email non fornito."
                }).send();
            } else {
                var utenti = await Utente.find({});
                utenti = utenti.filter(e => e.email.includes(email));
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
                res.status(200).json({ utenti: utenti });
            }
        })
    return;
});

router.patch('', async (req, res) => {
    const v = new Validator({
        email: req.body.email,
        psw: req.body.psw
    }, {
        email: 'required|email',
        psw: 'required|string'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                res.status(400).json({ error: "Campo vuoto o indefinito." }).send();
            } else {
                var utente = await Utente.findOne({ email: { $eq: req.body.email } }).exec();
                if (utente == undefined) {
                    res.status(404).json({ error: "Utente non trovato." }).send();
                    return;
                }
                crypto.hash(req.body.psw, saltRounds, (err, hash) => {
                    utente.password = hash;
                });
                await utente.save();
                res.status(200).json({ message: "Password modificata con successo." }).send();
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Errore interno al server." }).send();
        });
    return;
});

router.post('', async (req, res) => {
    let email1 = req.body.email;
    const v = new Validator({
        csrfToken: req.body.csrfToken
    }, {
        csrfToken: 'required|string'
    });
    v.check()
        .then(matched1 => {
            if (!matched1) {
                res.status(400).json({ error: "Errore in autenticazione." }).send();
                return;
            }
            const v1 = new Validator({
                nome: req.body.nome,
                email: req.body.email,
                pass: req.body.pass,
                tel: req.body.tel,
                picture: req.body.picture
            }, {
                nome: 'required|string',
                email: 'required|email',
                pass: 'required|string',
                tel: 'phoneNumber|minLength:8',
                picture: 'base64'
            });
            v1.check()
                .then(async matched => {
                    if (!matched) {
                        res.status(400).json({ error: "Campo vuoto o indefinito o indirizzo email errato." }).send();
                    } else {
                        let ut = await Utente.findOne({ email: { $eq: req.body.email } });

                        if (ut) {
                            res.status(409).json({ error: 'L\'email inserita corrisponde ad un profilo già creato.' }).send();
                            return;
                        }

                        //Hashing + salting to mitigate digest clashes and pre-computation
                        await crypto.genSalt(saltRounds)
                            .then(salt => {
                                crypto.hash(req.body.pass, salt, async (err, hash) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        let Utent = new Utente({
                                            nome: req.body.nome,
                                            email: email1,
                                            password: hash,
                                            salt: salt,
                                            tel: req.body.tel,
                                            profilePic: "data:image/png;base64," + req.body.picture
                                        });

                                        let Utentes = await Utent.save(), utenteId = Utentes.id;

                                        /**
                                         * Link to the newly created resource is returned in the Location header
                                         * https://www.restapitutorial.com/lessons/httpmethods.html
                                         */
                                        res.location("/api/v2/Utenti/" + utenteId).status(201).send();
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: 'Errore Server' }).send();
                            });
                    }
                });
        });
    return;
});

module.exports = router;