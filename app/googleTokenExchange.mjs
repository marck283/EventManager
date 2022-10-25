import { Router } from 'express';
const router = Router();

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
            //const token = decodeURIComponent(req.query.code);
            //console.log(token);

            const { tokens } = await oauth2Client.getToken(decodeURIComponent(req.query.code));
            oauth2Client.setCredentials(tokens);
            console.log(tokens);
            res.status(200).json({ authToken: tokens.access_token}).send();
            return;
        });
});

export default router;