const express = require('express');
const router = express.Router();
const eventPublic = require('../collezioni/eventPublic.js');
const { Validator } = require('node-input-validator');
const Recensione = require('../collezioni/recensioniPub.js');

router.post("/:id", async (req, res) => {
    try {
        var id = req.params.id, evento = await eventPublic.findById(id);

        const v = new Validator({
            valutazione: req.body.evaluation,
            motivazione: req.body.description
        }, {
            valutazione: 'required|integer|min:1|max:10',
            motivazione: 'required|string|minLength:1'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Richiesta malformata" }).send();
                    return;
                }
                var recensione = new Recensione({
                    idUtente: req.loggedUser.id,
                    idEvento: id,
                    valutazione: req.body.evaluation,
                    descrizione: req.body.description
                });
                var recensione1 = await recensione.save();

                evento.recensioni.push(recensione1.id);
                evento.valMedia = (evento.valMedia*(evento.recensioni.length - 1) + recensione1.valutazione)/evento.recensioni.length;
                await evento.save();

                res.status(201).json({ message: "Recensione aggiunta con successo" }).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

module.exports = router;