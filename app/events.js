const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get("./", (req, res) => {
    res.status(200).json(fs.readFile(path.resolve("./events.json"), (err, data) => {
        return data;
    }));
});

module.exports = router;