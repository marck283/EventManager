const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');

router.get("", async (req, res) => {
    var email = req.query.email;

    var utenti = await Utente.find({});
    if (email != undefined) {
        utenti = utenti.filter(e => e.email.includes(email));
        utenti = utenti.map(u => {
            return {
                nome: u.nome,
                email: email,
                urlUtente: "/api/v1/Utenti/" + u._id
            }
        });

        if (utenti.length == 0) {
            res.status(404).json({ error: "Nessun utente trovato per il nome indicato." });
            return;
        }
    }
    res.status(200).json({utenti: utenti});
    return;
});

module.exports = router;