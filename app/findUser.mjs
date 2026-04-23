import Utente from './collezioni/utenti.mjs';

var returnUser = async req => await Utente.findById(req.loggedUser.id);

export default returnUser;