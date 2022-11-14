import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import { jest } from '@jest/globals';

describe('GET /api/v2/eventiCalendarioPersonale/:data', () => {


  let eventsPubSpy;
  let eventsPerSpy;
  let eventsPrivSpy;
  let userSpy;

  // create a valid token
  var token;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "2222", 3600);
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => 
      [
        { id: '9876543', dataOra: [new Date('2010-05-11T11:33:00.000Z')], durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['1234'] },
        { id: '987653', dataOra: [new Date('2010-05-11T11:33:00.000Z')], durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['2222', '1234'] },
        { id: '9878456846784568', dataOra: [new Date('2010-05-11T11:33:00.000Z')], durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evet', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['2222', '1234'] }
      ]
    );

    eventsPerSpy = jest.spyOn(eventPersonal, 'find').mockImplementation(criterias => {
      if (criterias.organizzatoreID == '2222') {
        return [
          { id: '797569', dataOra: [new Date('2010-05-11T11:33:00.000Z')], durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '2222' }
        ]
      }
      return [];
    });

    eventsPrivSpy = jest.spyOn(eventPrivate, 'find').mockImplementation(criterias => [
      {
        id: '75975947',
        dataOra: [new Date('2010-05-11T11:33:00.000Z')],
        durata: 4,
        categoria: 'operazione',
        nomeAtt: 'Eventt',
        luogoEv: {
          indirizzo: 'via rossi',
          citta: 'Trento'
        },
        organizzatoreID: '1111',
        partecipantiID: ['1234', '2222'],
        invitatiID: ['2323']
      }, {
        id: '785478458',
        dataOra: [new Date('2010-05-11T11:33:00.000Z')],
        durata: 4,
        categoria: 'operazione',
        nomeAtt: 'Eventt',
        luogoEv: {
          indirizzo: 'via rossi',
          citta: 'Trento'
        },
        organizzatoreID: '412341234123',
        partecipantiID: ['1234', '1111'],
        invitatiID: ['2323']
      }]);

      userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
        if(criterias.id === '2222') {
          return [{
            nome: 'Giovanni',
            profilePic: '',
            email: 'gg.ee@gmail.com',
            tel: '',
            password: '',
            salt: '',
            EventiCreati: ['797569'],
            EventiIscrtto: ['9878456846784568', '987653', '75975947']
          }];
        }
        return [];
      })
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    eventsPerSpy = null;
    eventsPrivSpy = null;
    token = null;
    userSpy = null;
  });

  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, nel caso ci siano eventi pubblici o privati per la data passata a cui l'utente non si è iscritto o creato, oppure ci siano eventi personali creati dall'utente per quella data", async () => {
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale/05-11-2010').
      set('x-access-token', token).
      expect('Content-Type', /json/);
      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        eventi: [{
          id: "pers",
          idevent: '797569',
          name: 'Piscina',
          self: '/api/v2/EventiPersonali/797569',
          category: 'svago',
          dataOra: ['2010-05-11T11:33:00.000Z']
        },
        {
          id: 'pub',
          idevent: '987653',
          self: '/api/v2/EventiPubblici/987653',
          name: 'Event',
          category: 'svago',
          dataOra: ['2010-05-11T11:33:00.000Z']
        },
        {
          id: "pub",
          idevent: '9878456846784568',
          self: '/api/v2/EventiPubblici/9878456846784568',
          name: 'Evet',
          category: 'svago',
          dataOra: ['2010-05-11T11:33:00.000Z']
        },
        {
          id: 'priv',
          idevent: '75975947',
          self: '/api/v2/EventiPrivati/75975947',
          name: 'Eventt',
          category: 'operazione',
          dataOra: ['2010-05-11T11:33:00.000Z']
        }], data: '05-11-2010'
      });
  });

  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di formato errato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale/05112010').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(404, { error: "Non esiste alcun evento programmato per la giornata selezionata." });
  });

  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di cui non esiste alcun evento pubblico o privato per la data passata a cui l'utente non si è iscritto o creato, oppure non esiste alcun evento personale creato dall'utente per quella data", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale/05-13-2010').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(404, { error: "Non esiste alcun evento programmato per la giornata selezionata." });
  });
});
