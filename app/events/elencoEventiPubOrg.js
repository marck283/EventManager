var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const RateLimit = require('express-rate-limit');

var limiter = RateLimit ({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("", async (req, res) => {
    const v = new Validator({
        utent: req.loggedUser.id
    }, {
        utent: 'required|string|minLength:1'
    });
    v.check()
    .then(async matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."});
            return;
        }
        var utent = req.loggedUser.id;
        let eventList = await eventPublic.find({organizzatoreID: {$eq: utent}});
        if(eventList.length > 0) {
            res.status(200).json({eventList: eventList}).send();
        } else {
            res.status(404).json({error: "Nessun evento organizzato da questo utente."}).send();
        }
    });    
});

module.exports = router;