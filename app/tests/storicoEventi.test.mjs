import request from 'supertest';
import { connect, connection } from 'mongoose';
import app from '../app.mjs';
import createToken from '../tokenCreation.mjs';

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    var timeout;
    var token;
    beforeAll(async () => {
        token = createToken("gg.ee@gmail.com", "62993bc81430d0dd9a208934", 86400);
        timeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => {
            return {
                unref: jest.fn()
            };
        });
        app.locals.db = connect(process.env.DB_URL_TEST);
    });

    afterAll(async () => {
        timeout.mockRestore();
        timeout.unref;
        timeout = null;
        token = null;
        connection.close(true);
    });

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