import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import Utente from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('GET /api/v2/Utenti/me', () => {

  let UtenteSpy;

  beforeAll( () => {
    UtenteSpy = jest.spyOn(Utente, 'findById').mockImplementation(criterias => {
      if(criterias == "2222"){
        return {_id:'2222',nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}  
      }
    });
  });

  afterAll(() => {
    UtenteSpy.mockRestore();
    UtenteSpy = null;
  });

  it('GET /api/v2/Utenti/me da autenticati, quindi con token valido', async () => {
      await request(app).get('/api/v2/Utenti/me').
      set('x-access-token', createToken("gg.ee@gmail.com", "2222", 3600)).
      expect('Content-Type', /json/).
      expect(200, {nome: 'Carlo',
              email: 'gg.aa@gmail.com',
              tel: '3452345664567',
              url: '/api/v2/Utenti/2222',
              password: '756756747'});
  });

  it('GET /api/v2/Utenti/me da non autenticati, quindi con un token non valido', async () => {
    await request(app).get('/api/v2/Utenti/me').
    set('x-access-token', '345678').
    expect('Content-Type', /json/).
    expect(401, {success: false, message: 'fallita autenticazione'});
  });
});
