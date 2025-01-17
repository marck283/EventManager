import request from 'supertest';
import app from '../app.mjs';
import {jest} from '@jest/globals';
import Utente from '../collezioni/utenti.mjs';

describe('POST /api/v2/RecuperoPassword', () => {

    var userMock;

    beforeAll(() => {
        userMock = jest.spyOn(Utente, "findOne").mockImplementation(criterias => {
            if(criterias.email.$eq == "aabb12@gmail.com") {
                return {
                    _id: 6542,
                    user: "aabb12@gmail.com"
                };
            }
            return null;
        })
    });

    afterAll(() => {
        jest.restoreAllMocks();
        userMock = null;
    });

    it("POST /api/v2/RecuperoPassword test reset password", async () => {
        await request(app).post("/api/v2/RecuperoPassword")
        .set('Accept', 'application/json')
        .send({"email": "aabb12@gmail.com"})
        .expect('Content-Type', /json/)
        .expect(201, {message: "Un'email &egrave; stata appena inviata alla tua casella di posta elettronica. Se non la trovi, prova a cercare nelle cartelle Spam e Cestino."});
    });

    it("POST /api/v2/RecuperoPassword test reset password con utente non trovato", async () => {
        await request(app).post("/api/v2/RecuperoPassword")
        .set('Accept', 'application/json')
        .send({email: "marvel00.ml1@gmail.com"})
        .expect('Content-Type', /json/)
        .expect(404, {error: "Utente non trovato."});
    });

    it("POST /api/v2/RecuperoPassword test reset password senza email", async () => {
        await request(app).post("/api/v2/RecuperoPassword")
        .expect('Content-Type', /json/)
        .expect(400, {error: "Indirizzo email non fornito o non valido."});
    });
})