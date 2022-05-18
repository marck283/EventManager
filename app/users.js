const express = require('express');
const router = express.Router();
const Student = require('./collezioni/utenti');



router.post('', async (req, res) => {
    
	let Utente = new Utente({
        nome: req.body.nome,
        email: req.body.email,
        password: req.body.password,
        tel: req.body.tel
    });

    if (!Utente.email || typeof Utente.email != 'string' || !checkIfEmailInString(Utente.email)) {
        res.status(400).json({ error: 'The field "email" must be a non-empty string, in email format' }).send();
        return;
    }
    
	Utentes = await Utente.save();
    
    let utenteId = Utentes.id;

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/Utenti/" + utenteId).status(201).send();
});


module.exports=router;