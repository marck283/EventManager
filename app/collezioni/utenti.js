var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Si crea un modello per il modello degli utenti con indice sull'email

var Users = new Schema({ nome: String, email: {type: String, unique: true}, tel: String, password: String, salt: String, EventiCreati: [String] , EventiIscrtto: [String]});
module.exports = mongoose.model('Utenti', Users);


