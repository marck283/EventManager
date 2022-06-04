const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');

router.get("", async (req, res) => {
    var email = req.query.email;

    var utenti = await Utente.find({});
    if (email != undefined && email != "") {
        utenti = utenti.filter(e => e.email.includes(email));
    }
    utenti = utenti.map(u => {
        return {
            nome: u.nome,
            email: u.email,
            urlUtente: "/api/v2/Utenti/" + u._id
        }
    });

    if (utenti.length == 0) {
        res.status(404).json({ error: "Nessun utente trovato per la email indicata." });
        return;
    }
    res.status(200).json({utenti: utenti});
    return;
});


router.post('', async (req, res) => {

    

    
    try{

        if(req.body.nome == "" || req.body.nome == undefined ||
         req.body.email == "" || req.body.email == undefined ||
         req.body.pass == "" || req.body.pass == undefined){
            res.status(400).json({error: "Campo vuoto o indefinito"}).send();
            return;

        }

        let ut = await Utente.findOne({email: req.body.email })

        if(ut){
            res.status(409).json({ error: 'Non si può registrarsi perchè si ha messo la stessa email' }).send();
            return;
        }
        
        let Utent = new Utente({
            nome: req.body.nome,
            email: req.body.email,
            password: req.body.pass,
            tel: req.body.tel
        });

        if (!Utent.email || typeof Utent.email != 'string' || !checkIfEmailInString(Utent.email)) {
            res.status(400).json({ error: 'Formato email errato' }).send();
            return;
        }
        
        Utentes = await Utent.save();
        
        let utenteId = Utentes.id;

        /**
         * Link to the newly created resource is returned in the Location header
         * https://www.restapitutorial.com/lessons/httpmethods.html
         */
        res.location("/api/v2/Utenti/" + utenteId).status(201).send();

    }catch(error){
        console.log(error)
        res.status(500).json({ error: 'Errore Server' }).send();

    }

    
});

function checkIfEmailInString(text) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}

module.exports = router;