const request = require('supertest'), mongoose = require('mongoose');
const app = require('../app.js');
const jwt = require('jsonwebtoken');
const EventPriv = require('../collezioni/eventPrivat.js'), inviti = require('../collezioni/invit.js');

describe("POST /api/v2/EventiPrivati", () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(process.env.DB_URL_TEST);
    });
    afterAll(async () => {
        await EventPriv.deleteMany({});
        await inviti.deleteMany({});
        mongoose.connection.close(true);
    });

    // create a valid token
    var token = jwt.sign(
        { id: "62993bc81430d0dd9a208934", email: 'gg.ee@gmail.com' },
        process.env.SUPER_SECRET,
        { expiresIn: 86400 }
    );

    test("POST /api/v2/EventiPrivati con utente autenticato e tutti i campi obbligatori compilati correttamente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(201);
    });

    test("POST /api/v2/EventiPrivati con utente non autenticato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', '')
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 1",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(401, {success: false, message: 'fallita autenticazione'});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore non numerico", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 6",
            categoria: "svago",
            durata: "2 giorni",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo non del formato corretto"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore numerico negativo", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 2",
            categoria: "svago",
            durata: -20,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore nullo", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 2",
            categoria: "svago",
            durata: 0,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo pi?? volte la stessa data", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022,07/08/2024,07/09/2023,11/11/2022,11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "date ripetute"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo almeno una data non conforme al formato 'mese/gorno/anno'", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "13/06/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "formato data non valido"});
    });

    //Test case scritto il 3 giugno
    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo una data antecedente a quella corrente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "02/06/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(403, {error: "giorno non disponibile"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'indirizzo' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'citta' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'indirizzo' compilato come stringa vuota", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'ora' compilato in formato diverso da hh:mm", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11|00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "formato ora non valido"});
    });

    let dateObj = new Date();
    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'ora' compilato con un orario antecedente all'ora corrente per la data corrente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: String(dateObj.getMonth() + 1).padStart(2, '0') + "/" + String(dateObj.getDate()).padStart(2, '0') + "/" + dateObj.getFullYear(),
            ora: String(dateObj.getHours()).padStart(2, '0') + ":" + String(dateObj.getMinutes() - 1).padStart(2, '0'),
            nomeAtt: "Girare a vuoto 4",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(403, {error: "orario non permesso"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'nomeAtt' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            categoria: "svago",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'categoria' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "11/11/2022",
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });
});