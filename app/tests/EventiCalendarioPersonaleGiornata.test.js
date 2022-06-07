const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('../app');

describe('GET /api/v2/eventiCalendarioPersonale/:data', () => {

  
  let eventsPubSpy;
  let eventsPerSpy;
  let eventsPrivSpy;
  

  beforeAll( () => {
    const eventPublic = require('../collezioni/eventPublic');
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation((criterias) => {
      return [
        {_id:'9876543', data: '05/11/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234']},
        {_id:'987653', data: '05/11/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['2222','1234']},
        {_id:'9878456846784568', data: '05/12/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evet', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['2222','1234']}
      ]
    });
    const eventPersonal = require('../collezioni/eventPersonal');
    eventsPerSpy = jest.spyOn(eventPersonal, 'find').mockImplementation((criterias) => {
      if(criterias.organizzatoreID == '2222'){
        return [
       {_id:'797569', data: '05/11/2010',  ora:'11:33', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '2222'}
        ]


      }
      return []
    });
    const eventPrivate = require('../collezioni/eventPrivat');
    eventsPrivSpy = jest.spyOn(eventPrivate, 'find').mockImplementation((criterias) => {
      return [
        {_id:'75975947',data: '05/11/2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1111', partecipantiID: ['1234','2222'], invitatiID: ['2323']},
        {_id:'785478458',data: '05/11/2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '412341234123', partecipantiID: ['1234','1111'], invitatiID: ['2323']}
      ]
    });
  });

  afterAll(async () => {
    eventsPubSpy.mockRestore();
    eventsPerSpy.mockRestore();
    eventsPrivSpy.mockRestore();
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
  
  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, nel caso ci siano eventi pubblici o privati per la data passata a cui l'utente non si è iscritto o creato, oppure ci siano eventi personali creati dall'utente per quella data", async () => {
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale/05-11-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(200).expect({eventi: [ {
          id: 'pers',
          idevent: '797569',
          self: '/api/v2/EventiPersonali/797569',
          name: 'Piscina',
          category: 'svago'
        },
        {
          id: 'pub',
          idevent: '987653',
          self: '/api/v2/EventiPubblici/987653',
          name: 'Event',
          category: 'svago'
        },
        {
          id: 'priv',
          idevent: '75975947',
          self: '/api/v2/EventiPrivati/75975947',
          name: 'Eventt',
          category: 'operazione'
        }
], data: '05/11/2010'});
  });

  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di formato errato", async () => {
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale/05112010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404).expect({error: "Non esiste alcun evento programmato per la giornata selezionata."});
  });

  test("GET /api/v2/eventiCalendarioPersonale/:data da autenticati, quindi con token valido, indicando una data di cui non esiste alcun evento pubblico o privato per la data passata a cui l'utente non si è iscritto o creato, oppure non esiste alcun evento personale creato dall'utente per quella data", async () => {
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale/05-13-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404).expect({error: "Non esiste alcun evento programmato per la giornata selezionata."});
  });

  



  
  

  });