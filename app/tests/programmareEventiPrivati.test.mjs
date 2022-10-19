import request from 'supertest';
import { connect, connection } from 'mongoose';
import app from '../app.mjs';
import evPriv from '../collezioni/eventPrivat.mjs';
import invit from '../collezioni/invit.mjs';
import createToken from '../tokenCreation.mjs';

describe("POST /api/v2/EventiPrivati", () => {
    beforeAll(async () => {
        jest.setTimeout(8000);
        app.locals.db = connect(process.env.DB_URL_TEST);
    });
    afterAll(async () => {
        await evPriv.deleteMany({});
        await invit.deleteMany({});
        connection.close(true);
    });

    // create a valid token
    var token = createToken("marco.villa@gmail.com", "62e1667818bfa6ca7793fdeb", 86400);

    test("POST /api/v2/EventiPrivati con utente autenticato e tutti i campi obbligatori compilati correttamente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto",
            categoria: "Sport",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["marcolasagna9@gmail.com"]
        })
        .expect(201);
    });

    test("POST /api/v2/EventiPrivati con utente non autenticato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', '')
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 1",
            categoria: "Spettacolo",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(401, {success: false, message: 'fallita autenticazione'});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore non numerico", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 6",
            categoria: "Manifestazione",
            durata: "2 giorni",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore numerico negativo", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 2",
            categoria: "Viaggio",
            durata: -20,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo durata compilato con valore nullo", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 2",
            categoria: "Altro",
            durata: 0,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Sport",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo più volte la stessa data", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022","07-08-2024","07-09-2023","11-11-2022","11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Spettacolo",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo almeno una data non conforme al formato 'mese/gorno/anno'", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["13-06-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Manifestazione",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    //Test case scritto il 3 giugno
    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'data' compilato inserendo una data antecedente a quella corrente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["02-06-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Viaggio",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'indirizzo' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Altro",
            durata: 2,
            luogoEv: {
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'citta' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Sport",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'indirizzo' compilato come stringa vuota", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Spettacolo",
            durata: 2,
            luogoEv: {
                indirizzo: "",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'ora' compilato in formato diverso da hh:mm", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11|00",
            nomeAtt: "Girare a vuoto 4",
            categoria: "Manifestazione",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Data o ora non valida."});
    });

    let dateObj = new Date();
    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'ora' compilato con un orario antecedente all'ora corrente per la data corrente", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: [(dateObj.getMonth() + 1).toString().padStart(2, '0') + "-" + dateObj.getDate().toString().padStart(2, '0') + "-" + dateObj.getFullYear()],
            durata: 2,
            ora: dateObj.getHours().toString().padStart(2, '0') + ":" + (dateObj.getMinutes() - 1).toString().padStart(2, '0'),
            categoria: "Viaggio",
            nomeAtt: "Girare a vuoto 4",
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.ee@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'nomeAtt' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            categoria: "Altro",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });

    test("POST /api/v2/EventiPrivati con utente autenticato e campo 'categoria' non compilato", () => {
        return request(app)
        .post('/api/v2/EventiPrivati')
        .set('x-access-token', token)
        .set('Accept', 'application/json')
        .send({
            data: ["11-11-2022"],
            ora: "11:00",
            nomeAtt: "Girare a vuoto 4",
            durata: 2,
            luogoEv: {
                indirizzo: "Via del campo",
                citta: "Mortara"
            },
            ElencoEmailInviti: ["gg.aa@gmail.com"]
        })
        .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    });
});