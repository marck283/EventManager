import { Schema as _Schema, model } from 'mongoose';
var Schema = _Schema;

//Schema per una nuova recensione
export default model("Recensione", new Schema({
    idUtente: String,
    idEvento: String,
    valutazione: Number,
    descrizione: String
}));