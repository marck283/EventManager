const request = require('supertest');
const app = require('./app.js');
const jwt = require('jsonwebtoken');

module.exports = describe("GET /api/v2/eventiCalendarioPersonale", () => {
    let mockFind;
    beforeAll(async () => {
        const eventPers = require('./collezioni/eventPersonal.js');

        jest.setTimeout(8000);
        mockFind = jest.spyOn(eventPers, "find").mockImplementation(criterias => {
            return [{
                _id: "12345",
                nomeAtt: "Girare a vuoto",
                categoria: "svago",
                durata: 2,
                lugoEv: {
                    indirizzo: "Via del campo",
                    citta: "Mortara"
                },
                data: "06/27/2022",
                ora: "11:00",
                organizzatoreID: "2361627wyuwerye378"
            }]
        });
    });

    afterAll(async () => {
        jest.restoreAllMocks();
    });

    // create a valid token
    var token = jwt.sign(
        { id: "62993bc81430d0dd9a208934", email: 'gg.ee@gmail.com' },
        process.env.SUPER_SECRET,
        { expiresIn: 86400 }
    );

    test("GET /api/v2/eventiCalendarioPersonale con campo 'data' compilato con un valore non numerico", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale")
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .set('nomeAtt', 'Girare a vuoto')
        .set('categoria', 'svago')
        .set('durata', '2 giorni')
        .set('indirizzo', 'Via del campo')
        .set('citta', 'Mortara')
        .send()
        .expect(400, {error: "Richiesta malformata."});
    });
});