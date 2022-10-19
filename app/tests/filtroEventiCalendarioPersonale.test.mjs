import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPers from '../collezioni/eventPersonal.mjs';
import eventPub from '../collezioni/eventPublic.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    let mockFindPers, mockFindPub, mockFindPriv, timeout;
    beforeAll(async () => {
        jest.useFakeTimers();
        timeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => {
            return {
                unref: jest.fn()
            };
        });
        mockFindPub = jest.spyOn(eventPub, "find").mockImplementation(criterias => {
            return [{
                _id: "12344",
                data: "06/27/2022",
                ora: "11:00",
                durata: 2,
                maxPers: 200,
                categoria: "svago",
                nomeAtt: "Girare a vuoto",
                lugoEv: {
                    indirizzo: "Via del campo",
                    citta: "Mortara"
                },
                organizzatoreID: "2361627wyuwerye378",
                partecipantiID: ["1234", "2134"]
            }];
        });
        mockFindPers = jest.spyOn(eventPers, "find").mockImplementation(criterias => {
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
            }];
        });
        mockFindPriv = jest.spyOn(eventPriv, "find").mockImplementation(criterias => {
            return [{
                _id: "12346",
                data: "06/27/2023",
                ora: "11:00",
                durata: 2,
                categoria: "svago",
                nomeAtt: "Girare a vuoto",
                lugoEv: {
                    indirizzo: "Via del campo",
                    citta: "Mortara"
                },
                organizzatoreID: "2361627wyuwerye378",
                partecipantiID: ["1234", "2134"],
                invitatiID: ["1234", "2134"]
            }];
        });
    });

    afterAll(async () => {
        mockFindPers.mockRestore();
        mockFindPub.mockRestore();
        mockFindPriv.mockRestore();
        jest.useRealTimers();
        timeout.mockRestore();
        timeout.unref;
        timeout = null;
        mockFindPub = null;
        mockFindPers = null;
        mockFindPriv = null;
    });

    // create a valid token
    var token = createToken("gg.ee@gmail.com", "62993bc81430d0dd9a208934", 86400);

    test("GET /api/v2/eventiCalendarioPersonale con campo 'durata' compilato con un valore non numerico", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale?passato=False")
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

    test("GET /api/v2/eventiCalendarioPersonale con campo 'durata' compilato con un valore minore o uguale a zero", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale?passato=False")
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .set('nomeAtt', 'Girare a vuoto')
        .set('categoria', 'svago')
        .set('durata', '0')
        .set('indirizzo', 'Via del campo')
        .set('citta', 'Mortara')
        .send()
        .expect(400, {error: "Richiesta malformata."});
    });
});
