var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema per una nuova recensione
module.exports = mongoose.model("Recensione", new Schema({
    idUtente: String,
    idEvento: String,
    valutazione: Number,
    descrizione: String
}));