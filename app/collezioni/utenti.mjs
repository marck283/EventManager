import { Schema, model } from 'mongoose';

// Si crea un modello per il modello degli utenti con indice sull'email

var Users = new Schema({
    nome: String,
    profilePic: String,
    email: {type: String, unique: true},
    tel: String,
    password: String,
    salt: String,
    EventiCreati: [String],
    EventiIscrtto: [String],
    numEvOrg: Number,
    valutazioneMedia: Number,
    googleAccount: {
        userId: String,
        g_refresh_token: String
    },
    facebookAccount: {
        userId: String
    },
    birthday: String
});
export default model('Utenti', Users);


