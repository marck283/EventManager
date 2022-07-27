const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'marvel00.ml@gmail.com',
        pass: 'Travel012095!'
    }
});

router.post('', async (req, res) => {
    var mailOptions = {
        from: 'Marco Lasagna <marvel00.ml@gmail.com>',
        to: req.body.email,
        subject: "Recuper password",
        text: 'Ecco il link da Lei richiesto per il recupero della password: http://eventmanagerzlf.herokuapp.com/pswRecovery.html',
        html: "<p>Ecco il link da Lei richiesto per il recupero della password: </p><a href=\"http://eventmanagerzlf.herokuapp.com/pswRecovery.html\" target=\"_blank\">http://eventmanagerzlf.herokuapp.com/pswRecovery.html</a>",
        bcc: ""
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
            res.send(200);
        }
    });
});

module.exports = router;