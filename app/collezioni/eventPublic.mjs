import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('EventoP', new Schema({ 
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
	etaMax: Number,
	terminato: Boolean,
	recensioni: [String], //Array di id delle recensioni
	valMedia: Number
}));