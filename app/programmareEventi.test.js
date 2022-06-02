var priv = require('./events/EventiPriv.js'), pub = require("./events/IscrCreDelModEvenPub.js");
var pers = require("./events/EventiPers.js");
const request = require('supertest'), mongoose = require('mongoose');
const app = require('./app.js');
const jwt = require('jsonwebtoken');

module.exports = describe("GET /api/v2/EventiPubblici", () => {
    let saveMock;
    beforeAll(async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(process.env.DB_URL);
    });
    afterAll(async () => {
        mongoose.connection.close(true);
    });

    // create a valid token
    var token = jwt.sign(
        { id: "62993bc81430d0dd9a208934", email: 'gg.ee@gmail.com' },
        process.env.SUPER_SECRET,
        { expiresIn: 86400 }
    );

    test("POST /api/v2/EventiPubblici con utente autenticato e tutti i campi obbligatori compilati correttamente", () => {
        return request(app)
        .post('/api/v2/EventiPubblici')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "06/27/2022",
            ora: "11:00",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            nomeAtt: "Girare a vuoto",
            maxPers: 200,
            categoria: "svago",
            durata: 2
        })
        .expect(201);
    });

    test("POST /api/v2/EventiPubblici con utente non autenticato", () => {
        return request(app)
        .post('/api/v2/EventiPubblici')
        .set('x-access-token', '')
        .set('Accept', 'application/json')
        .send({
            data: "06/27/2022",
            ora: "11:00",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            nomeAtt: "Girare a vuoto 1",
            maxPers: 200,
            categoria: "svago",
            durata: 2
        })
        .expect(401, {success: false, message: 'fallita autenticazione'});
    });

    test("POST /api/v2/EventiPubblici con utente autenticato e campo durata compilato con valore non numerico", () => {
        return request(app)
        .post('/api/v2/EventiPubblici')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "06/27/2022",
            ora: "11:00",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            nomeAtt: "Girare a vuoto 2",
            maxPers: 200,
            categoria: "svago",
            durata: "2 giorni"
        })
        .expect(400, {error: "Campo non del formato corretto"});
    });

    test("POST /api/v2/EventiPubblici con utente autenticato e campo durata compilato con valore numerico negativo", () => {
        return request(app)
        .post('/api/v2/EventiPubblici')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "06/27/2022",
            ora: "11:00",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            nomeAtt: "Girare a vuoto 2",
            maxPers: 200,
            categoria: "svago",
            durata: -20
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });

    test("POST /api/v2/EventiPubblici con utente autenticato e campo durata compilato con valore nullo", () => {
        return request(app)
        .post('/api/v2/EventiPubblici')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: "06/27/2022",
            ora: "11:00",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            nomeAtt: "Girare a vuoto 2",
            maxPers: 200,
            categoria: "svago",
            durata: 0
        })
        .expect(400, {error: "Campo vuoto o indefinito"});
    });
});