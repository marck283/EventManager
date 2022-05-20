var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Si crea un modello per l'evento personale.
module.exports = mongoose.model('EventoP', new Schema({ 
	data: String,  ora: String, durata: Number, maxPers: Number, categoria: String, nomeAtt: String, luogoEv: {indirizzo: String, citta: String}, organizzatoreID: String, partecipantiID: [String]}));