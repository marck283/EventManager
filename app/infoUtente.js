const express = require('express');
const router = express.Router();

const Utente = require('./collezioni/utenti');

router.get('/me', async (req, res) => {

    IDexample = '6285628586b410b578cf004d'; // Da cambiare con un token vero e proprio
    try{
        let utente = await Utente.findById(IDexample);

        res.status(200).json({
            nome: utente.nome,
            email: utente.email,
            tel: utente.tel,
            password: utente.password,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

module.exports = router;
