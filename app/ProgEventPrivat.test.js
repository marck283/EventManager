const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2//api/v2/EventiPrivati', () => {

  let UsersSpy;
  let UsersFSpy;

  beforeAll( () => {
    const Users = require('./collezioni/utenti.js');
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation((criterias) => {
      if(criterias == '1234'){
        return {_id:'1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}
      }
    });
    UsersFSpy = jest.spyOn(Users, 'find').mockImplementation((criterias) => {
      if(criterias.email == 'gg.aa@gmail.com'){
        return [{_id:'123',nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      if(criterias.email == 'gg.tt@gmail.com'){
        return [{_id:'1237676',nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      return [];
    });
    /**const Inviti = require('./collezioni/invit.js');
    Invitispy = jest.spyOn(Inviti, 'find').mockImplementation((criterias) => {
      if(criterias.utenteid == '12345'){
        return [{_id:'43534',utenteid:'12345',  eventoid: '9876543', tipoevent: 'pub'}];

      }
      if(criterias.utenteid == '1237676'){
        return [{_id:'43534',utenteid:'1237676',  eventoid: '9876543', tipoevent: 'pub'}];

      }
      return [];
    });*/
    //InvitiSspy = jest.spyOn(Inviti.prototype, 'save').mockImplementation((criterias) => { return {id:'43534',utenteid:'123',  eventoid: '9876543', tipoevent: 'pub'}; });
  });

  afterAll(async () => {
    UsersSpy.mockRestore();
    UsersFSpy.mockRestore();

  });

 
  

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso l'utente invita un utente con un'email che non esiste", async () => {
      // create a valid token
    var payload = {
      email: "gg.ee@gmail.com",
      id: "1234"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({data: "11/11/2050,11/12/2050", ora: "11:33", durata: 3,categoria: "svago", nomeAtt: "Evento", luogoEv: {indirizzo: "via panini", citta: "Bologna"}, ElencoEmailInviti: ['gg.uu@gmail.com']}).expect('Content-Type', /json/).expect(404).expect({error: "un email di un utente da invitare non è corretto"});
    
  });


  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica un formato di data sbagliato", async () => {
      // create a valid token
    var payload = {
      email: "gg.ee@gmail.com",
      id: "1234"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({data: "11-11-2050,11-12-2050", ora: "11:33", durata: 3,categoria: "svago", nomeAtt: "Evento", luogoEv: {indirizzo: "via panini", citta: "Bologna"}, ElencoEmailInviti: ['gg.tt@gmail.com']}).expect('Content-Type', /json/).expect(400).expect({error: "formato data non valido"});
    
  });


  /**test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica un formato di data sbagliato", async () => {
      // create a valid token
    var payload = {
      email: "gg.ee@gmail.com",
      id: "1234"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({data: "11-11-2050,11-12-2050", ora: "11:33", durata: 3,categoria: "svago", nomeAtt: "Evento", luogoEv: {indirizzo: "via panini", citta: "Bologna"}, ElencoEmailInviti: ['gg.tt@gmail.com']}).expect('Content-Type', /json/).expect(400).expect({error: "formato data non valido"});
    
  });*/

  






  

  
  

  });