var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('EventoPe', new Schema({ 
	data: String,  ora: String, durata: Number, categoria: String, nomeAtt: String, luogoEv: {indirizzo: String, citta: String}, organizzatoreID: String}
));