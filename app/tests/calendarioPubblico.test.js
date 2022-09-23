const request = require('supertest');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app = require('../app.js');

describe('GET /api/v2/eventiCalendarioPubblico', () => {


  let eventsPubSpy;


  beforeAll(() => {
    const eventPublic = require('../collezioni/eventPublic.js');
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      return [
        { _id: '9876543', data: '05/11/2010', ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['1234'] },
        { _id: '987653', data: '05/11/2010', ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['2222', '1234'] }
      ]
    });
  });

  afterAll(async () => {
    eventsPubSpy.mockRestore();
  });

  // create a valid token
  var payload = {
    email: "gg.ee@gmail.com",
    id: "2222"
  }

  var options = {
    expiresIn: 3600 // expires in 24 hours
  }
  var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

  test("GET /api/v2/eventiCalendarioPubblico da autenticati, quindi con token valido, nel caso ci siano eventi pubblici a cui l'utente non si è iscritto o creato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(200).expect({
        eventi: [{
          id: "pub",
          idevent: '9876543',
          self: "/api/v2/EventiPubblici/9876543",
          name: "Evento",
          category: "svago"
        }]
      });
  });



  test('GET /api/v2/eventiCalendarioPubblico da non autenticati, quindi con token non valido, nel caso ci siano eventi pubblici', async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico').
      set('x-access-token', '').
      expect('Content-Type', /json/).
      expect(200).expect({
        eventi: [{
          id: "pub",
          idevent: '9876543',
          self: "/api/v2/EventiPubblici/9876543",
          name: "Evento",
          category: "svago"
        }, {
          id: "pub",
          idevent: '987653',
          self: "/api/v2/EventiPubblici/987653",
          name: "Event",
          category: "svago"
        }]
      });
  });
});