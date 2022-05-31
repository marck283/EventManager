var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Biglietto', new Schema({ 
	eventoid: String, utenteid: String, qr: String, tipoevento: String}
));

