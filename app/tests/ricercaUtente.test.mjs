import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.mjs';

describe("GET /api/v2/Utenti", () => {
    let timeout;
    beforeAll(() => {
        app.locals.db = mongoose.connect(process.env.DB_URL_TEST);
    });

    beforeEach(() => {
        timeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => {
            return {
                unref: jest.fn()
            };
        });
    });

    afterEach(() => {
        timeout.mockRestore();
        timeout.unref;
        timeout = null;
    });

    afterAll(async () => {
        await mongoose.connection.close(true);
    }, 20000);

    test("GET /api/v2/Utenti non restituisce alcun utente", async () => {
        await request(app)
            .get('/api/v2/Utenti?email=gg.ea@gmail.com')
            .set('Accept', 'application/json')
            .expect(404, { error: "Nessun utente trovato per la email indicata." });
    });

    test("GET /api/v2/Utenti con campo 'email' non compilato", async () => {
        await request(app)
            .get('/api/v2/Utenti')
            .set('Accept', 'application/json')
            .expect(400, {error: "Indirizzo email non fornito."});
    });

    test("GET /api/v2/Utenti con campo email compilato con email parziale", async () => {
        await request(app)
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