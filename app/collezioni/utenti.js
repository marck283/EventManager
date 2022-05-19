var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Si crea un modello per il modello degli utenti
module.exports = mongoose.model('Utenti', new Schema({ 
	nome: String, email: String, tel: String, password: String, EventiCreati: [String] , EventiIscrtto: [String]}));

