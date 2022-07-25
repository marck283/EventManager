const elastic = require('@elasticemail/elasticemail-client');
const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {
    let defaultClient = elastic.ApiClient.instance;

    let apikey = defaultClient.authentications['apikey'];
    apikey.apiKey = process.env.EMAIL_API_KEY;

    let api = new elastic.EmailsApi();

    let email = elastic.EmailMessageData.constructFromObject({
        Recipients: [
            new elastic.EmailRecipient(req.body.email)
        ],
        Content: {
            Body: [
                elastic.BodyPart.constructFromObject({
                    ContentType: "HTML",
                    Content: "<p>Ecco il link da Lei richiesto per il recupero della Sua password: </p>\
                    <a href=\"http://eventmanagerzlf.herokuapp.com/pswRecovery.html\" target=\"_blank\"></a>"
                })
            ],
            Subject: "Recupero password",
            From: "marvel00.ml@gmail.com"
        }
    });

    var callback = function (error, data, response) {
        if (error) {
            console.log(error);
            res.status(500).json({error: "Errore durante l'invio dell'email."}).send();
        } else {
            res.status(201).json({message: "Email inviata correttamente."}).send();
        }
    };
    api.emailsPost(email, callback);
});

module.exports = router;