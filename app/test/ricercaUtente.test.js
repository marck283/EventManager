const request = require('supertest'), mongoose = require('mongoose');
const app = require('./app.js');
const jwt = require('jsonwebtoken');

module.exports = describe("GET /api/v2/Utenti", () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(process.env.DB_URL_TEST);
    });

    afterAll(async () => {
        mongoose.connection.close(true);
    });

    test("GET /api/v2/Utenti non restituisce alcun utente", () => {
        return request(app)
            .get('/api/v2/Utenti?email=gg.ea@gmail.com')
            .set('Accept', 'application/json')
            .expect(404, { error: "Nessun utente trovato per la email indicata." });
    });

    //Perché ritorna un risultato in questa forma? Non dovrebbe ritornarne uno come sotto?
    test("GET /api/v2/Utenti con campo 'email' non compilato", () => {
        return request(app)
            .get('/api/v2/Utenti')
            .set('Accept', 'application/json')
            .expect(200, {
                utenti: [{
                    "nome": "geronimo",
                    "email": "gg.ee@gmail.com",
                    "urlUtente": "/api/v2/Utenti/62993bc81430d0dd9a208934"
                }, {
                    "nome": "giacomo",
                    "email": "gg.aa@gmail.com",
                    "urlUtente": "/api/v2/Utenti/629a28681289fe12b1f1eae9"
                }]
            });
    });

    test("GET /api/v2/Utenti con campo email compilato con email parziale", () => {
        return request(app)
            .get("/api/v2/Utenti?email=gg.a")
            .set("Accept", "application/json")
            .expect(200, {
                utenti: [{
                    "nome": 'giacomo',
                    "email": 'gg.aa@gmail.com',
                    "urlUtente": '/api/v2/Utenti/629a28681289fe12b1f1eae9'
                }
                ]
            });
    });
});