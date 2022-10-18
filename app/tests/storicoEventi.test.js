import request from 'supertest';
import { connect, connection } from 'mongoose';
import app, { locals } from '../app.js';
import createToken from '../tokenCreation.js';

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        locals.db = connect(process.env.DB_URL_TEST);
    });

    afterAll(async () => {
        connection.close(true);
    });

    // create a valid token
    var token = createToken("gg.ee@gmail.com", "62993bc81430d0dd9a208934", 86400);

    test("GET /api/v2/eventiCalendarioPersonale con campo 'passato' non compilato", () => {
        return request(app)
        .get('/api/v2/eventiCalendarioPersonale')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .expect(400, {error: "Richiesta malformata."});
    });

    test("GET /api/v2/eventiCalendarioPersonale con campo 'passato' compilato con un valore diverso da 'True' o 'False'", () => {
        return request(app)
        .get('/api/v2/eventiCalendarioPersonale?passato=1')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .expect(400, {error: "Richiesta malformata."});
    });
});