const request = require('supertest'), mongoose = require('mongoose');
const app = require('../app.js');
const jwt = require('jsonwebtoken');

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(process.env.DB_URL_TEST);
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