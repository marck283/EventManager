const request = require('supertest');
const createToken = require('../tokenCreation.js');
const app = require('../app.js');

describe('GET /api/v2/eventiCalendarioPubblico', () => {


  let eventsPubSpy;


  beforeAll(() => {
    const eventPublic = require('../collezioni/eventPublic.js');
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      return [
        { id: '9876543', data: '05/11/2010', ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['1234'], recensioni: [] },
        { id: '987653', data: '05/11/2010', ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['2222', '1234'], recensioni: [] }
      ]
    });
  });

  afterAll(async () => {
    eventsPubSpy.mockRestore();
  });

  test("GET /api/v2/eventiCalendarioPubblico da autenticati, quindi con token valido, nel caso ci siano eventi pubblici a cui l'utente non si è iscritto o creato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico').
      set('x-access-token', createToken("gg.ee@gmail.com", "2222", 3600)).
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