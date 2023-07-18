import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('EventoPe', new Schema({
	durata: Number,
	categoria: String,
	nomeAtt: String,
	luogoEv: [{
		indirizzo: String,
		citta: String,
		data: String,
		ora: String
	}],
	organizzatoreID: String
}));