import { Router } from 'express';
const router = Router();
import User from './collezioni/utenti.mjs';
import tokenChecker from './tokenChecker.mjs';
import { Validator } from 'node-input-validator';

router.patch("/", async (req, res) => {
    let userId = req.loggedUser.id || req.loggedUser.sub, user;

    //Entrambe le integrazioni sono da svolgere previa verifica del token di autorizzazione.
    if(userId == req.loggedUser.sub) {
        user = await User.findOne({ googleAccount: { userId: {$eq: req.loggedUser.sub}}});
        const v = new Validator({
            fbId: req.body.fbId
        }, {
            fbId: 'required|string|minLength:1'
        });
        v.check()
        .then(async matched => {
            if(!matched) {
                console.log(v.errors);
                res.status(400).json({ error: "Richiesta malformata" }).send();
                return;
            }

            //Integrazione del solo account Facebook
        })
    } else {
        user = await User.findById(userId);

        //Integrazione del solo account Google
    }
})