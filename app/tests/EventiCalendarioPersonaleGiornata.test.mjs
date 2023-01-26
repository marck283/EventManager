import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import { jest } from '@jest/globals';

describe('GET /api/v2/eventiCalendarioPersonale/:data', () => {


  let eventsPubSpy, eventsPubSpyGen;
  let eventsPerSpy, eventsPerSpyGen;
  let eventsPrivSpy, eventsPrivSpyGen;
  let userSpy;
  var d, h;

  // create a valid token
  var token;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "2222", 3600);
    d = '2010-05-11';
    h = '11:33';
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation(criterias => {
      switch (criterias) {
        case "9876543": {
          return {
            id: '9876543',
            durata: 2,
            categoria: 'svago',
            nomeAtt: 'Evento',
            luogoEv: [{
              indirizzo: 'via rossi',
              citta: 'Trento',
              data: d,
              ora: h,
              maxPers: 2,
              partecipantiID: ['1234']
            }],
            organizzatoreID: '1234'
          };
        }
        case "987653": {
          return {
            id: '987653',
            durata: 2,
            categoria: 'svago',
            nomeAtt: 'Event',
            luogoEv: [{
              indirizzo: 'via rossi',
              citta: 'Trento',
              data: d,
              ora: h,
              maxPers: 2,
              partecipantiID: ['2222', '1234']
            }],
            organizzatoreID: '1234'
          };
        }
        case "9878456846784568": {
          return {
            id: '9878456846784568',
            durata: 2,
            categoria: 'svago',
            nomeAtt: 'Evet',
            luogoEv: [{
              indirizzo: 'via rossi',
              citta: 'Trento',
              data: d,
              ora: h,
              maxPers: 2,
              partecipantiID: ['2222', '1234']
            }],
            organizzatoreID: '1234'
          };
        }
        default: {
          return undefined;
        }
      }
    });

    eventsPerSpy = jest.spyOn(eventPersonal, 'findById').mockImplementation(criterias => {
      if (criterias == "797569") {
        return {
          id: '797569',
          dataOra: [new Date('2010-05-11T11:33:00.000Z')],
          durata: 4,
          categoria: 'svago',
          nomeAtt: 'Piscina',
          luogoEv: {
            indirizzo: 'via rossi',
            citta: 'Trento'
          },
          organizzatoreID: '2222'
        };
      }
      return undefined;
    });

    eventsPrivSpy = jest.spyOn(eventPrivate, 'findById').mockImplementation(criterias => {
      switch (criterias) {
        case "75975947": {
          return {
            id: '75975947',
            durata: 4,
            categoria: 'operazione',
            nomeAtt: 'Eventt',
            luogoEv: [{
              indirizzo: 'via rossi',
              civNum: '1',
              cap: '38121',
              citta: 'Trento',
              provincia: 'TN',
              data: d,
              ora: h,
              partecipantiID: ['1234', '2222'],
              invitatiID: ['2323']
            }],
            organizzatoreID: '1111',
          };
        }
        case "785478458": {
          return {
            id: '785478458',
            dataOra: [new Date('2010-05-11T11:33:00.000Z')],
            durata: 4,
            categoria: 'operazione',
            nomeAtt: 'Eventt',
            luogoEv: [{
              indirizzo: 'via rossi',
              civNum: '1',
              cap: '38121',
              citta: 'Trento',
              provincia: 'TN',
              data: d,
              ora: h,
              partecipantiID: ['1234', '2222'],
              invitatiID: ['2323']
            }],
            organizzatoreID: '412341234123',
            partecipantiID: ['1234', '1111'],
            invitatiID: ['2323']
          };
        }

        default: {
          return undefined;
        }
      }
    });

    userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
      if (criterias === '2222') {
        return {
          _id: '2222',
          nome: 'Giovanni',
          profilePic: '',
          email: 'gg.ee@gmail.com',
          tel: '',
          password: '',
          salt: '',
          EventiCreati: ['797569'],
          EventiIscrtto: ['9878456846784568', '987653', '75975947']
        };
      }
      return {};
    })
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    eventsPubSpyGen = null;
    eventsPerSpy = null;
    eventsPerSpyGen = null;
    eventsPrivSpy = null;
    eventsPrivSpyGen = null;
    token = null;
    userSpy = null;
  });

  /*it("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, nel caso ci siano eventi pubblici o privati per la data passata a cui l'utente non si è iscritto o creato, oppure ci siano eventi personali creati dall'utente per quella data", async () => {
    const result = await request(app).get('/api/v2/eventiCalendarioPersonale/05-11-2010').
      set('x-access-token', token)
      .expect('Content-Type', /json/);
    expect(result.statusCode).toBe(200);
    expect(result.body).toStrictEqual({
      eventi: [{
        id: "pub",
        idevent: '9878456846784568',
        self: '/api/v2/EventiPubblici/9878456846784568',
        name: 'Evet',
        category: 'svago',
        luogoEv: [{
          indirizzo: 'via rossi',
          citta: 'Trento',
          data: d,
          ora: h,
          maxPers: 2,
          numPostiRimanenti: 0,
          partecipantiID: ['2222', '1234']
        }]
      },
      {
        id: 'pub',
        idevent: '987653',
        self: '/api/v2/EventiPubblici/987653',
        name: 'Event',
        category: 'svago',
        luogoEv: [{
          indirizzo: 'via rossi',
          citta: 'Trento',
          data: d,
          ora: h,
          maxPers: 2,
          numPostiRimanenti: 0,
          partecipantiID: ['2222', '1234']
        }]
      },
      {
        id: 'priv',
        idevent: '75975947',
        self: '/api/v2/EventiPrivati/75975947',
        name: 'Eventt',
        category: 'operazione',
        luogoEv: [{
          indirizzo: 'via rossi',
          civNum: '1',
          cap: '38121',
          citta: 'Trento',
          provincia: 'TN',
          data: d,
          ora: h,
          partecipantiID: ['1234', '2222'],
          invitatiID: ['2323'],
          numPostiRimanenti: 0
        }]
      }], data: '2010-05-11T22:00:00.000Z'
    });
  });*/

  it("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di formato errato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale/05112010').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(400, { error: "Data non valida" });
  });

  it("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di cui non esiste alcun evento pubblico o privato per la data passata a cui l'utente non si è iscritto o creato, oppure non esiste alcun evento personale creato dall'utente per quella data", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale/05-13-2010').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(404, { error: "Non esiste alcun evento programmato per la giornata selezionata." });
  });
});
