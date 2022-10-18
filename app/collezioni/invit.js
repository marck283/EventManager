var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Invito', new Schema({ 
	utenteid: String,  eventoid: String, tipoevent: String}
));
