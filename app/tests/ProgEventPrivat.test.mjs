import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import Users from '../collezioni/utenti.mjs';
import eventPrivat from '../collezioni/eventPrivat.mjs';
import { jest } from '@jest/globals';

describe('POST /api/v2//api/v2/EventiPrivati', () => {

  var UsersSpy;
  var UsersFSpy;
  var EventPrSSpy;

  // create a valid token
  var token;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "1234", 3600);
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      if (criterias == '1234') {
        return { _id: '1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'], save: function () { } }
      }
    });
    UsersFSpy = jest.spyOn(Users, 'find').mockImplementation(criterias => {
      if (criterias.email.$eq == 'gg.aa@gmail.com') {
        return [{ _id: '123', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] }]

      }
      if (criterias.email.$eq == 'gg.tt@gmail.com') {
        return [{ _id: '1237676', nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] }]

      }
      return [];
    });
    EventPrSSpy = jest.spyOn(eventPrivat.prototype, 'save').mockImplementation(criterias => { return { id: "345678" }; });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    UsersSpy = null;
    UsersFSpy = null;
    EventPrSSpy = null;
    token = null;
  });

  it("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso l'utente invita un utente con un'email associata a nessun utente nel sistema", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        descrizione: "p",
        categoria: "Altro",
        eventPic: '1',
        nomeAtt: "Evento",
        luogoEv: [{
          data: "11-11-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }, {
          data: "11-12-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }],
        ElencoEmailInviti: ['gg.uu@gmail.com']
      }).expect('Content-Type', /json/).expect(404, { error: "email non trovata" });
  });

  it("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica un formato di data sbagliato", async () => {
    await request(app).post('/api/v2/EventiPrivati')
      .set('x-access-token', token).send({
        descrizione: "p",
        categoria: "Viaggio",
        eventPic: '1',
        nomeAtt: "Evento",
        luogoEv: [{
          data: "11-11-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }, {
          data: "13-12-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }],
        ElencoEmailInviti: ['gg.tt@gmail.com']
      })
      .expect('Content-Type', /json/)
      .expect(400, { error: "Campo vuoto o indefinito o non del formato corretto." });
  });

  it("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso il campo 'nome attività' non è specificato", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        descrizione: "p",
        categoria: "Spettacolo",
        eventPic: '1',
        luogoEv: [{
          data: "11-11-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }, {
          data: "11-12-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }],
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, { error: "Campo vuoto o indefinito o non del formato corretto." });
  });

  it("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso in cui si ha email ripetute nell'elenco delle email degli utenti invitati", async () => {
    await request(app).post('/api/v2/EventiPrivati')
      .set('x-access-token', token).send({
        descrizione: "p",
        categoria: "Sport",
        eventPic: '1',
        nomeAtt: "Evento",
        luogoEv: [{
          data: "11-11-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }, {
          data: "11-12-2050",
          ora: "11:33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }],
        ElencoEmailInviti: ['gg.tt@gmail.com', 'gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, { error: "Campo vuoto o indefinito o non del formato corretto." });
  });

  it("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso di formato dell'ora passata non valido", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        descrizione: "p",
        categoria: "Sport",
        eventPic: '1',
        nomeAtt: "Evento",
        luogoEv: [{
          data: "11-11-2050",
          ora: "11-33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }, {
          data: "11-12-2050",
          ora: "11-33",
          indirizzo: "via panini",
          civNum: "12",
          cap: 27036,
          citta: "Bologna",
          provincia: "BO"
        }],
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, { error: "Ora non valida." });
  });
});
