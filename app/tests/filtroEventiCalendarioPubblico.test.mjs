import request from 'supertest';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import {jest} from '@jest/globals';

describe("GET /api/v2/eventiCalendarioPubblico", () => {
    let mockFind;
    beforeAll(() => {
        jest.useFakeTimers();
        mockFind = jest.spyOn(eventPublic, "find").mockImplementation(criterias => {
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
                maxPers: 200,
                organizzatoreID: "2361627wyuwerye378",
                partecipantiID: ["qq78273qeu8e9", "7298u8fyru87"]
            }]
        });
    });

    afterAll(() => {
        jest.clearAllTimers();
        jest.restoreAllMocks();
        mockFind = null;
    });

    it("GET /api/v2/eventiCalendarioPubblico con campo 'durata' compilato con un valore non numerico", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPubblico")
        .set('Accept', 'application/json')
        .set('nomeAtt', 'Girare a vuoto')
        .set('categoria', 'svago')
        .set('durata', '2 giorni')
        .set('indirizzo', 'Via del campo')
        .set('citta', 'Mortara')
        .send()
        .expect(400, {error: "Richiesta malformata."});
    });

    it("GET /api/v2/eventiCalendarioPubblico con campo 'durata' compilato con un valore minore o uguale a 0", () => {
        return request(app)
        .get("/api/v2/eventiCalendarioPubblico")
        .set('Accept', 'application/json')
        .set('nomeAtt', 'Girare a vuoto')
        .set('categoria', 'svago')
        .set('durata', 0)
        .set('indirizzo', 'Via del campo')
        .set('citta', 'Mortara')
        .send()
        .expect(400, {error: "Richiesta malformata."});
    });
});