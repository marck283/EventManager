import { Router } from 'express';
const router = Router();
import { google } from 'googleapis';

var oauth2Client = new google.auth.OAuth2(
    process.env.GCLIENT_ID,
    process.env.GCLIENT_SECRET,
    process.env.GCLIENT_REDIRECT //Da cambiare ogni volta che si cambia ambiente da "sviluppo" a "distribuzione".
);

//Now generate an authorization URL for the OAuth 2.0 client
const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
});

import { Validator } from 'node-input-validator';

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