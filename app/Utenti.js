const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');




router.get('/me', async (req, res) => {

    IDexample = req.loggedUser.id;
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




module.exports=router;