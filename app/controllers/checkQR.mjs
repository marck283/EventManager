import biglietti from '../collezioni/biglietti.mjs';
import User from '../collezioni/utenti.mjs';
import hourCheck from '../hourRegexTest.mjs';
import toDataURL from 'qrcode';

var checkQR = async (req, res) => {
    var user = req.loggedUser.id || req.loggedUser.sub;

    if(user === req.loggedUser.sub) {
        user = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    if (!hourCheck(req.headers.hour)) {
        res.status(400).json({error: "Orario non valido. Riprova."});
        return;
    }

    let obj = JSON.parse(req.params.qrcode);
    const qrcode = await toDataURL.toDataURL(req.params.qrcode), biglietto = await biglietti.findOne({qr: {$eq: qrcode},
        eventoid: {$eq: req.headers.eventoid}, utenteid: {$eq: obj.idUtente},
        giorno: {$eq: req.headers.day}, ora: {$eq: req.headers.hour}});
    if(biglietto != null && biglietto != undefined) {
        res.status(200).json({status: "OK"});
    } else {
        res.status(404).json({error: "QR Code non trovato."});
    }
    return;
};

export { checkQR };