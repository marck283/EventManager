var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('EventoP', new Schema({ 
	categoria: String,
	nomeAtt: String,
	descrizione: String,
	data: [String],
	ora: String,
	durata: Number,
	maxPers: Number,
	luogoEv: {
		indirizzo: String,
		citta: String
	},
	organizzatoreID: String,
	partecipantiID: [String],
	eventPic: String,
	etaMin: Number,
	etaMax: Number
}));