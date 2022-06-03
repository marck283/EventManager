const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2/EventiPrivati/:id', () => {

  let eventsPrivSpy;
  let UsersSpy;

  beforeAll( () => {
    const eventPrivat = require('./collezioni/eventPrivat.js');
    eventsPrivSpy = jest.spyOn(eventPrivat, 'findById').mockImplementation((criterias) => {
      if(criterias == '9876543'){
        return {_id:'9876543',data: '05/11/2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1111', partecipantiID: ['1111','1234','2222'], invitatiID: ['2323']}
     }

    });
    const Users = require('./collezioni/utenti.js');
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation((criterias) => {
      if(criterias == '1111'){
        return {_id:'1111', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}
     }
     if(criterias == '1234'){
        return {_id:'1234', nome: 'Giacomo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: ['9876543']}
     }
     if(criterias == '2222'){
        return {_id:'2222', nome: 'Silvio', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: ['9876543']}
     }
     if(criterias == '2323'){
        return {_id:'2323', nome: 'Federico', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}
     }

    });

  });

  afterAll(async () => {
    eventsPrivSpy.mockRestore();
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
 
  
  test('GET /api/v2/EventiPrivati/:id nel caso di evento esistente', async () => {
      const response = await request(app).get('/api/v2/EventiPrivati/9876543').set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(200).expect({nomeAtt: 'Eventt',
            categoria: 'operazione',
            data: '05/11/2010',
            ora: '11:33',
            durata: 4,
            luogoEv: {indirizzo: 'via rossi', citta: 'Trento'},
            organizzatore: 'Carlo',
            partecipanti: ['Carlo','Giacomo','Silvio'],
            invitati: ['Federico']});
  });

  test('GET /api/v2/EventoPubblico/:id nel caso di evento non esistente', async () => {
    const response = await request(app).get('/api/v2/EventiPrivati/34567876543').set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404).expect({error: "Non esiste nessun evento con l'id selezionato"});
  });

});
