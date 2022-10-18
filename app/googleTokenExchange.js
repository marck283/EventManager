const express = require('express');
const router = express.Router();
const credentials = require('../credentials.json');
const {Validator} = require('node-input-validator');

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[5]
);

//Now generate an authorization URL for the OAuth 2.0 client
const scopes = [];

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
});

router.get('', (req, res) => {
    const v = new Validator({
        token: req.query.code
    }, {
        token: 'required|string|minLength:1'
    });
    v.check()
    .then(async matched => {
        if(!matched) {
            res.status(400).json({message: "Richiesta malformata."}).send();
            return;
        }

        //Now exchange the authorization token for an access token
        const {tokens} = oauth2Client.getToken(req.query.code);
        res.status(200).json({authToken: tokens.access_token}).send();
        return;
    });
});

module.exports = router;