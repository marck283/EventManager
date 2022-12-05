import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('EventoP', new Schema({ 
	categoria: String,
	nomeAtt: String,
	descrizione: String,
	durata: String,
	luogoEv: [{
		indirizzo: String,
		civNum: String,
		cap: Number,
		citta: String,
		provincia: String,
		maxPers: Number,
		data: String,
		ora: String,
		partecipantiID: [String]
	}],
	organizzatoreID: String,
	eventPic: String,
	etaMin: Number,
	etaMax: Number,
	terminato: Boolean,
	recensioni: [String], //Array di id delle recensioni
	valMedia: Number,
	orgName: String
}));