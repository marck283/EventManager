import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('EventoPr', new Schema({ 
	data: [String],
	ora: String,
	durata: Number,
	categoria: String,
	nomeAtt: String,
	luogoEv: {
		indirizzo: String,
		civNum: String,
		cap: Number,
		citta: String,
		provincia: String //A two-letter string that uniquely identifies a province in Italy
	},
	organizzatoreID: String,
	partecipantiID: [String],
	invitatiID: [String]
}));

