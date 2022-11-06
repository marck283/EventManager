import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import User from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('GET /api/v2/eventiCalendarioPubblico/:data', () => {

  
  let eventsPubSpy;
  let userSpy;
  
  // create a valid token
  var token;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "2222", 3600);
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      return [
        {id:'9876543', data: '05-11-2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: []},
        {id:'987653', data: '05-11-2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['2222']},
        {id:'9878456846784568', data: '05-12-2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evet', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['2222']}
      ]
    });
    userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
      if(criterias == '1234') {
        return {
          nome: 'Giovanna',
          profilePic: '',
          email: 'gg.ea@gmail.com',
          tel: '',
          password: '',
          salt: '',
          EventiCreati: ['9876543', '987653', '9878456846784568'],
          EventiIscrtto: []
        };
      }
      return {};
    })
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    userSpy = null;
    token = null;
  });
  
  test("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, nel caso ci siano eventi pubblici per la data passata a cui l'utente non si è iscritto o creato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico/05-11-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(200, {eventi: [{id: "pub",
                    idevent:'9876543',
                    self: "/api/v2/EventiPubblici/9876543",
                    name: "Evento",
                    category: "svago", orgName: "Giovanna"}], data: '05-11-2010'});
  });

  test("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, indicando una data di formato errato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico/05112010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404, {error: "Non esiste alcun evento legato alla risorsa richiesta."});
  });

  test("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, indicando una data di cui non esiste nessun evento pubblico a cui l'utente non si è iscritto o creato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico/05-13-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404, {error: "Non esiste alcun evento legato alla risorsa richiesta."});
  });
});