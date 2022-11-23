import { Router } from 'express';
const router = Router();
import User from './collezioni/utenti.mjs';
import { Validator } from 'node-input-validator';
import verify from './googleTokenChecker.mjs';

router.patch("/", async (req, res) => {
    let userId = req.loggedUser.id || req.loggedUser.sub, user;

    if(userId == req.loggedUser.sub) {
        user = await User.findOne({ googleAccount: { userId: {$eq: req.loggedUser.sub}}});
        const v = new Validator({
            fbId: req.body.fbId,
            fbToken: req.body.fbToken
        }, {
            fbId: 'required|string|minLength:1',
            fbToken: 'required|string|minLength:1'
        });
        v.check()
        .then(async matched => {
            if(!matched) {
                console.log(v.errors);
                res.status(400).json({ error: "Richiesta malformata" }).send();
                return;
            }

            //Integrazione del solo account Facebook
            if(!user) {
                res.status(404).json({ error: "Utente non trovato"}).send();
                return;
            }
            user.facebookAccount = {
                userId: req.body.fbId
            };
            await user.save();
            res.status(200).json({ message: "Integrazione avvenuta con successo"}).send();
            return;
        });
    } else {
        user = await User.findById(userId);

        //Integrazione del solo account Google
        const v = new Validator({
            googleToken: req.body.googleJwt
        }, {
            googleToken: 'required|string|minLength:1'
        });
        v.check()
        .then(async matched => {
            if(!matched) {
                console.log(v.errors);
                res.status(400).json({ error: "Richiesta malformata"}).send();
                return;
            }
            await verify.verify(req.body.googleJwt)
            .then(async ticket => {
                const payload = ticket.getPayload();
                if(!user) {
                    res.status(404).json({ error: "Utente non trovato"}).send();
                    return;
                }
                user.googleAccount = {
                    userId: payload.sub,
                    g_refresh_token: ""
                };
                await user.save();
                res.status(200).json({ message: "Integrazione avvenuta con successo"}).send();
                return;
            })
        });
    }
})