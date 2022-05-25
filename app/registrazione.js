const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');



router.post('', async (req, res) => {

    

    
    try{

        if(req.body.nome == "" || req.body.email == "" || req.body.pass == "" ){
            res.status(400).json({error: "Campo vuoto"}).send();
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
        res.location("/api/v1/Utenti/" + utenteId).status(201).send();

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