import eventPublic from '../collezioni/eventPublic.mjs';
import mongoose from 'mongoose';

var endPublicEvent = async (req, res) => {
    try {
        await eventPublic.findOneAndUpdate({
            _id: { $eq: new mongoose.Types.ObjectId(req.params.id) },
            "luogoEv.data": { $eq: req.body.data }, "luogoEv.ora": { $eq: req.body.ora }
        }, { $set: { "luogoEv.$.terminato": true } });

        res.status(200).json({ message: "Evento terminato con successo." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore interno al server" });
    }
    return;
};

export { endPublicEvent };