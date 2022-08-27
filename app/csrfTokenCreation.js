const express = require('express');
const router = express.Router();
const csurf = require('csurf');

var csrfProtection = csurf({cookie: {
        httpOnly: true,
        secure: true
    }
});

router.get('/', csrfProtection, (req, res) => {
    try {
        res.status(200).json({csrfToken: req.csrfToken()}).send();
    } catch(err) {
        res.status(500).json({error: "Errore interno al server."}).send();
    }
    return;
});

module.exports = router;