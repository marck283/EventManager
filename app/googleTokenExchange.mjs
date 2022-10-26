import { Router } from 'express';
const router = Router();
import verify from './googleTokenChecker.mjs';
import User from './collezioni/utenti.mjs';

import { Validator } from 'node-input-validator';

//Siamo sicuri di aver proprio bisogno di questo modulo?
router.get('', (req, res) => {
    const v = new Validator({
        token: req.query.code
    }, {
        token: 'required|string|minLength:1'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                res.status(400).json({ message: "Richiesta malformata." }).send();
                return;
            }

            //Now exchange the authorization token for an access token, then save the refresh token in the database to bind it
            //to the user's account.

            const { tokens } = await oauth2Client.getToken(decodeURIComponent(req.query.code));
            oauth2Client.setCredentials(tokens);
            console.log(tokens);
            await verify(tokens.access_token)
            .then(async ticket => {
                const payload = ticket.getPayload();
                const user = await User.findOne({email: {$eq: payload.email}});
                user.g_refresh_token = tokens.refresh_token;
                await user.save();
                res.status(200).json({ authToken: tokens.access_token}).send();
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ message: "Errore di interno al server." }).send();
            });
            return;
        });
});

export default router;