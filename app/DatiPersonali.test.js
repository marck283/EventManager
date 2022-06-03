const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2/Utenti/me', () => {

  let UtenteSpy;

  beforeAll( () => {
    const Utente = require('./collezioni/utenti.js');
    UtenteSpy = jest.spyOn(Utente, 'findById').mockImplementation((criterias) => {
      if(criterias == "2222"){
        return {_id:'2222',nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}  
      }
    });
  });

  afterAll(async () => {
    UtenteSpy.mockRestore();
  });

 
  
  test('GET /api/v2/Utenti/me da autenticati, quindi con token valido', async () => {
    var payload = {
      email: "gg.ee@gmail.com",
      id: "2222"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
      const response = await request(app).get('/api/v2/Utenti/me').
      set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(200).expect({nome: 'Carlo',
              email: 'gg.aa@gmail.com',
              tel: '3452345664567',
              url: '/api/v2/Utenti/2222',
              password: '756756747'});
  });

  test('GET /api/v2/Utenti/me da non autenticati, quindi con un token non valido', async () => {
    var token = '345678';
    const response = await request(app).get('/api/v2/Utenti/me').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(401).expect({success: false,
        message: 'fallita autenticazione'});
  });

});

