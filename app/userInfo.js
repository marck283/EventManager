const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js');

router.get("", async (req, res) => {
    var email = req.query.email;
    if (email != "") {
        var utenti = await Utente.find({});
        utenti = utenti.filter(e => e.email.includes(email));
        if (utenti.length > 0) {
            res.status(200).json({ email: email, utenti: utenti });
        } else {
            res.status(404).json({ error: "Nessun utente trovato per il nome indicato." });
        }
    } else {
        res.status(400).json({error: "Il campo di ricerca è stato lasciato vuoto."});
    }
});

module.exports = router;