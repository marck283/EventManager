import request from 'supertest';
import { connect, connection } from 'mongoose';
import app from '../app.mjs';
import createToken from '../tokenCreation.mjs';
import { jest } from '@jest/globals';

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    var token;
    beforeAll(() => {
        token = createToken("gg.ee@gmail.com", "62f2d9d8374c7cfeeb8f1713", 86400);
        jest.useFakeTimers();
        app.locals.db = connect(process.env.DB_URL_TEST);
    });

    afterAll(() => {
        jest.clearAllTimers();
        token = null;
        connection.close(true);
    });

    test("GET /api/v2/eventiCalendarioPersonale con campo 'passato' non compilato", async () => {
        await request(app)
        .get('/api/v2/eventiCalendarioPersonale')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .expect(400, {error: "Richiesta malformata."});
    });

    /*test("GET /api/v2/eventiCalendarioPersonale con campo 'passato' compilato con un valore diverso da 'True' o 'False'", async () => {
        await request(app)
        .get('/api/v2/eventiCalendarioPersonale?passato=1')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .expect(400, {error: "Richiesta malformata."});
    });*/
});