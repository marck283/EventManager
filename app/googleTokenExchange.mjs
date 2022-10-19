import { Router } from 'express';
const router = Router();
import { google } from 'googleapis';

var web, oauth2Client, url;
import('../credentials.json', {
    assert: {
        type: 'json'
    }
}).then(cred => {
    web = cred.default.web;
    oauth2Client = new google.auth.OAuth2(
        web.client_id,
        web.client_secret,
        web.redirect_uris[5]
    );

    //Now generate an authorization URL for the OAuth 2.0 client
    const scopes = [];

    url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes
    });
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

            //Now exchange the authorization token for an access token
            const { tokens } = oauth2Client.getToken(req.query.code);
            res.status(200).json({ authToken: tokens.access_token }).send();
            return;
        });
});

export default router;