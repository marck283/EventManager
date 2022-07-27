const request = require('supertest'), mongoose = require('mongoose');
const app = require('../app.js');
const jwt = require('jsonwebtoken');
const utenti = require('../collezioni/utenti.js');

describe("GET /api/v2/Utenti", () => {
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

    test("GET /api/v2/Utenti con campo 'email' non compilato", () => {
        return request(app)
            .get('/api/v2/Utenti')
            .set('Accept', 'application/json')
            .expect(200, {
                utenti: [
                    {
                        nome: 'Marco Villa',
                        email: 'marco.villa@gmail.com',
                        urlUtente: '/api/v2/Utenti/62e1667818bfa6ca7793fdeb'
                    },
                    {
                        nome: 'Marco Lasagna',
                        email: 'marcolasagna9@gmail.com',
                        urlUtente: '/api/v2/Utenti/62e167ad18bfa6ca7793fded'
                    }
                ]
            });
    });

    test("GET /api/v2/Utenti con campo email compilato con email parziale", () => {
        return request(app)
            .get("/api/v2/Utenti?email=marc")
            .set("Accept", "application/json")
            .expect(200, {
                utenti: [
                    {
                        nome: 'Marco Villa',
                        email: 'marco.villa@gmail.com',
                        urlUtente: '/api/v2/Utenti/62e1667818bfa6ca7793fdeb'
                    },
                    {
                        nome: 'Marco Lasagna',
                        email: 'marcolasagna9@gmail.com',
                        urlUtente: '/api/v2/Utenti/62e167ad18bfa6ca7793fded'
                    }
                ]
            });
    });
});