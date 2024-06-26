import { Router, json } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import Utente from './collezioni/utenti.mjs';
import { hash as _hash, genSalt } from 'bcrypt';
import { Validator } from 'node-input-validator';

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

router.use(json({ limit: '50mb' }));

router.get("", async (req, res) => {
    var email = req.query.email;

    const v = new Validator({
        email: req.query.email
    }, {
        email: 'required|email'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                res.status(400).json({ error: "Indirizzo email non fornito." }).send();
                return;
            }

            var utenti = await Utente.find({ email: { $regex: email, $options: 'i' } });

            if (utenti.length == 0) {
                res.status(404).json({ error: "Nessun utente trovato per la email indicata." });
                return;
            }

            utenti = utenti.map(u => {
                return {
                    nome: u.nome,
                    email: u.email,
                    urlUtente: "/api/v2/Utenti/" + u._id
                };
            });

            res.status(200).json({ utenti: utenti });
            return;
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({error: "Errore interno al server."});
            return;
        })
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
                        await genSalt(saltRounds)
                            .then(salt => {
                                _hash(req.body.pass, salt, async (err, hash) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        let Utent = new Utente({
                                            nome: req.body.nome,
                                            email: email1,
                                            password: hash,
                                            salt: salt,
                                            tel: req.body.tel,
                                            profilePic: "data:image/png;base64," + req.body.picture,
                                            numEvOrg: Number('0'),
                                            valutazioneMedia: Number('0.0'),
                                            g_refresh_token: ""
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

export default router;