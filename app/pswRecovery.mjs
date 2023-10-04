import { Router } from 'express';
const router = Router();
import { Validator } from 'node-input-validator';
import { Message, SMTPClient } from 'emailjs';
import Utente from './collezioni/utenti.mjs';

const client = new SMTPClient({
	user: process.env.ADMIN_USER,
	password: process.env.EMAIL_PASS,
	host: 'smtp.gmail.com',
	ssl: true,
});

router.post('', async (req, res) => {
    //Implement mail sending
    const v = new Validator({
        user: req.body.email
    }, {
        user: 'required|email'
    });
    v.check().then(async matched => {
        if(!matched) {
            //Send error message
            console.log(v.errors);
            res.status(400).json({ error: "Indirizzo email non fornito o non valido." }).send();
            return;
        }
        let userTo = req.body.email;
        let user = await Utente.findOne({email: {$eq: userTo}});
        if(!user) {
            res.status(404).json({error: "Utente non trovato."}).send();
            return;
        }
        let emailText = "Dear " + userTo + ",\nIn order to reset Your password, go to https://eventmanager-uo29.onrender.com/pswRecovery.html.\
        \nBest regards!\n\nThe EventManager development team";
        console.log("ADMIN EMAIL: " + process.env.ADMIN_EMAIL);
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
            .json({message: "Un'email è stata appena inviata alla tua casella di posta elettronica. Se non la trovi, prova a cercare nelle cartelle Spam e Cestino."})
            .send();
        } catch (err) {
            res.status(500).json({error: "Internal server error."}).send();
            console.log(err);
        } finally {
            user = null;
            emailText = null;
            return;
        }
    })
    .catch(error => {
        if(!res.headersSent) {
            res.status(500).json({error: "Internal server error."}).send();
        }
        console.log(error);
    })
});

export default router;