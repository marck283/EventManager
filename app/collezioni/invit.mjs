import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

// set up a mongoose model
export default model('Invito', new Schema({ 
	utenteid: String,  eventoid: String, tipoevent: String}
));
