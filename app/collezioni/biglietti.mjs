import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('Biglietto', new Schema({ 
	eventoid: String,
	utenteid: String,
	qr: String,
	tipoevento: String,
	giorno: String,
	ora: String
}));

