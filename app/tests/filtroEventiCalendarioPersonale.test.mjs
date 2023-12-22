import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPers from '../collezioni/eventPersonal.mjs';
import eventPub from '../collezioni/eventPublic.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';
import {jest} from '@jest/globals';
import User from '../collezioni/utenti.mjs';

describe("GET /api/v2/eventiCalendarioPersonale", () => {
    let mockFindPers, mockFindPub, mockFindPriv, mockFindUser;
    beforeAll(() => {
        jest.useFakeTimers();
        mockFindPub = jest.spyOn(eventPub, "find").mockImplementation(criterias => {
            return [{
                _id: "12344",
                durata: 2,
                categoria: "svago",
                nomeAtt: "Girare a vuoto",
                luogoEv: [{
                    indirizzo: "Via del campo",
                    citta: "Mortara",
                    data: "06/27/2022",
                    ora: "11:00",
                    maxPers: 200,
                    partecipantiID: ["1234", "2134"]
                }],
                organizzatoreID: "2361627wyuwerye378"
            }];
        });
        mockFindPers = jest.spyOn(eventPers, "find").mockImplementation(criterias => {
            return [{
                _id: "12345",
                nomeAtt: "Girare a vuoto",
                categoria: "svago",
                durata: 2,
                luogoEv: {
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
                luogoEv: {
                    indirizzo: "Via del campo",
                    citta: "Mortara"
                },
                organizzatoreID: "2361627wyuwerye378",
                partecipantiID: ["1234", "2134"],
                invitatiID: ["1234", "2134"]
            }];
        });
        mockFindUser = jest.spyOn(User, "findById").mockImplementation(criterias => {
            if(criterias == "62993bc81430d0dd9a208934") {
                return {
                    nome: "Giulio",
                    EventiIscrtto: [],
                    EventiCreati: ["12344", "12345", "12346"]
                };
            }
            return {};
        });
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        jest.clearAllTimers();
        mockFindPub = null;
        mockFindPers = null;
        mockFindPriv = null;
        mockFindUser = null;
    });

    // create a valid token
    var token = createToken("gg.ee@gmail.com", "62993bc81430d0dd9a208934", 86400);

    it("GET /api/v2/eventiCalendarioPersonale con campo 'durata' compilato con un valore non numerico", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale?passato=false")
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

    it("GET /api/v2/eventiCalendarioPersonale con campo 'durata' compilato con un valore minore o uguale a zero", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale?passato=false")
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

    it("GET /api/v2/eventiCalendarioPersonale per cui nessun evento e' organizzato per la data richiesta", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPersonale/06-27-2023")
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send()
        .expect(404, {error: "Non esiste alcun evento programmato per la giornata selezionata."});
    });
});
