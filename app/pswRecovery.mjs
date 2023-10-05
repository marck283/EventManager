import { Router } from 'express';
const router = Router();
import { Validator } from 'node-input-validator';
import { Message, SMTPClient } from 'emailjs';
import Utente from './collezioni/utenti.mjs';
import { hash as _hash, genSalt } from 'bcrypt';

const saltRounds = 10;

router.post('', async (req, res) => {
    //Implement mail sending
    const v = new Validator({
        user: req.body.email
    }, {
        user: 'required|email'
    });
    v.check().then(async matched => {
        if (!matched) {
            //Send error message
            console.log(v.errors);
            res.status(400).json({ error: "Indirizzo email non fornito o non valido." }).send();
            return;
        }

        console.log("ADMIN EMAIL: " + process.env.ADMIN_EMAIL);
        const client = new SMTPClient({
            user: process.env.ADMIN_USER,
            password: process.env.EMAIL_PASS,
            host: 'smtp.gmail.com',
            ssl: true,
        });

        let userTo = req.body.email;
        let user = await Utente.findOne({ email: { $eq: userTo } });
        if (!user) {
            res.status(404).json({ error: "Utente non trovato." }).send();
            return;
        }
        let emailText = "Dear " + userTo + ",\nIn order to reset Your password, go to https://eventmanager-uo29.onrender.com/pswRecovery.html.\
        \nBest regards!\n\nThe EventManager development team";
        try {
            let msg = new Message({
                text: emailText,
                from: process.env.ADMIN_EMAIL,
                to: userTo,
                subject: 'Password reset',
            });
            await client.sendAsync(msg);
            console.log("EMAIL SENT");
            msg = null;
            res.status(201)
                .json({ message: "Un'email è stata appena inviata alla tua casella di posta elettronica. Se non la trovi, prova a cercare nelle cartelle Spam e Cestino." })
                .send();
        } catch (err) {
            res.status(500).json({ error: "Internal server error." }).send();
            console.log(err);
        } finally {
            user = null;
            emailText = null;
            return;
        }
    })
        .catch(error => {
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal server error." }).send();
            }
            console.log(error);
        })
});

router.patch('', async (req, res) => {
    const v = new Validator({
        email: req.body.email,
        newPsw: req.body.psw
    }, {
        email: 'required|email',
        newPsw: 'required|string|minLength:8'
    });
    v.check().then(async matched => {
        if (!matched) {
            console.log(v.errors);
            res.status(400).json({ error: "One of the two required parameters (email and password) has not been given or contains an illegal value." });
            return;
        }
        let email = req.body.email;
        let user = await Utente.findOne({ email: { $eq: email } });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        await genSalt(saltRounds)
            .then(salt => {
                _hash(req.body.psw, salt, async (err, hash) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        user.password = hash;
                        user.salt = salt;
                        await user.save();
                        res.status(201).json({ message: "Password successfully updated!" });
                        return;
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: "Internal server error." });
                return;
            });
    })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "Internal server error." });
            return;
        })
});

export default router;