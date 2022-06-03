const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2/eventiCalendarioPersonale', () => {

 
  let eventsPubSpy;
  let eventsPerSpy;
  let eventsPrivSpy;

  beforeAll( () => {
    const eventPublic = require('./collezioni/eventPublic.js');
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation((criterias) => {
      return [
        {_id:'9876543', data: '05/11/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234']},
        {_id:'987653', data: '05/11/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '123', partecipantiID: ['2222','1234']}
      ]
    });
    const eventPersonal = require('./collezioni/eventPersonal.js');
    eventsPerSpy = jest.spyOn(eventPersonal, 'find').mockImplementation((criterias) => {
      if(criterias.organizzatoreID == '2222'){
        return [
        {_id:'797569', data: '05/11/2010',  ora:'11:33', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '2222'},
        ]


      }else{
        return []
      }
          });
    const eventPrivate = require('./collezioni/eventPrivat.js');
    eventsPrivSpy = jest.spyOn(eventPrivate, 'find').mockImplementation((criterias) => {
      return [
        {_id:'75975947',data: '05/11/2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1111', partecipantiID: ['1111','1234','2222'], invitatiID: ['2323']},
        {_id:'785478458',data: '05/11/2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '2222', partecipantiID: ['2222','1234','1111'], invitatiID: ['2323']}
      ]
    });
  });

  afterAll(async () => {
    eventsPubSpy.mockRestore();
    eventsPerSpy.mockRestore();
    eventsPrivSpy.mockRestore();
  });

 
  

  test("GET /api/v2/eventiCalendarioPersonale da autenticati, quindi con token valido, nel caso ci siano eventi pubblici o privati che l'utente si è iscritto o creato, oppure ci siano eventi personali che l'utente ha creato ", async () => {
      // create a valid token
    var payload = {
      email: "gg.ee@gmail.com",
      id: "2222"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "False"}).
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(200).expect({eventi: [{id: "pers",
                    idevent:'797569',
                    self: "/api/v2/EventiPersonali/797569",
                    name: "Piscina",
                    category: "svago"},{id: "pub",
                    idevent:'987653',
                    self: "/api/v2/EventiPubblici/987653",
                    name: "Event",
                    category: "svago"},{id: "priv",
                    idevent:'75975947',
                    self: "/api/v2/EventiPrivati/75975947",
                    name: "Eventt",
                    category: "operazione"},{id: "priv",
                    idevent:'785478458',
                    self: "/api/v2/EventiPrivati/785478458",
                    name: "Eventt",
                    category: "operazione"}]});
  });

  test("GET /api/v2/eventiCalendarioPersonale da autenticati, quindi con token valido, nel caso non ci siano eventi pubblici o privati che l'utente si è iscritto o creato, e non ci siano eventi personali che l'utente ha creato ", async () => {
    var payload2 = {
      email: "gg.ee@gmail.com",
      id: "2222464646"
    }

    var options2 = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token2 = jwt.sign(payload2, process.env.SUPER_SECRET, options2);
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "False"}).
    set('x-access-token', token2).
    expect('Content-Type', /json/).
    expect(404).expect({error:"Non esiste alcun evento programmato."});
  });






  

  
  

  });