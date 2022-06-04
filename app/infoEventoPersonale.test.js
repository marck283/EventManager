const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2/EventiPersonali/:id', () => {

  let eventsPerSpy;
  let UsersSpy;

  beforeAll( () => {
    const eventPersonal = require('./collezioni/eventPersonal.js');
    eventsPerSpy = jest.spyOn(eventPersonal, 'findById').mockImplementation((criterias) => {
      if(criterias == '9876543'){
        return {_id:'9876543', data: '05/11/2010',  ora:'11:33', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234'}
     }

    });
    const Users = require('./collezioni/utenti.js');
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation((criterias) => {
      if(criterias == '1234'){
        return {_id:'1234', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}
     }


    });

  });

  afterAll(async () => {
    eventsPerSpy.mockRestore();
    UsersSpy.mockRestore();
  });

  var payload = {
    email: "gg.ee@gmail.com",
    id: "2222"
  }

  var options = {
    expiresIn: 3600 // expires in 24 hours
  }
  var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

 
  
  test('GET /api/v2/EventiPersonali/:id nel caso di evento esistente', async () => {
      const response = await request(app).get('/api/v2/EventiPersonali/9876543').set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(200).expect({nomeAtt: 'Piscina',
            categoria: 'svago',
            data: '05/11/2010',
            ora: '11:33',
            durata: 4,
            luogoEv: {indirizzo: 'via rossi', citta: 'Trento'},
            organizzatore: 'Carlo'});
  });

  test('GET /api/v2/EventoPersonali/:id nel caso di evento non esistente', async () => {
    const response = await request(app).get('/api/v2/EventiPersonali/34567876543').set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404).expect({error: "Non esiste nessun evento con l'id selezionato"});
  });

});
