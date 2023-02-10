import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('EventoPr', new Schema({
	descrizione: String,
	categoria: String,
	nomeAtt: String,
	eventPic: String,
	luogoEv: [{
		indirizzo: String,
		civNum: String,
		cap: Number,
		citta: String,
		provincia: String, //A two-letter string that uniquely identifies a province in Italy
		data: String,
		ora: String,
		partecipantiID: [String],
		terminato: Boolean
	}],
	organizzatoreID: String
}));

