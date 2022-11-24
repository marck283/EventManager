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
  var d, h;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "2222", 3600);
    d = '05-11-2010';
    h = '11:33';
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      return [
        {id:'9876543', durata: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: d, ora: h, maxPers: 2, partecipantiID: []}], organizzatoreID: '1234'},
        {id:'987653', durata: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: d, ora: h, maxPers: 2, partecipantiID: ['2222']}], organizzatoreID: '1234'},
        {id:'9878456846784568', durata: 2, categoria: 'svago', nomeAtt: 'Evet', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: d, ora: h, maxPers: 2, partecipantiID: ['2222']}], organizzatoreID: '1234'}
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
    d = null;
    h = null;
  });
  
  it("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, nel caso ci siano eventi pubblici per la data passata a cui l'utente non si è iscritto o creato", async () => {
    const response = await request(app).get('/api/v2/eventiCalendarioPubblico/05-11-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      eventi: [{
          id: 'pub',
          idevent: '9876543',
          luogoEv:[{
            citta: "Trento",
            data: "05-11-2010",
            indirizzo: "via rossi",
            maxPers: 2,
            numPostiRimanenti: 2,
            ora: "11:33",
          }],
          self: '/api/v2/EventiPubblici/9876543',
          name: 'Evento',
          category: 'svago',
          orgName: 'Giovanna'
        }],
      data: '05-11-2010'
    });
  });

  it("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, indicando una data di formato errato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico/05112010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404, {error: "Non esiste alcun evento legato alla risorsa richiesta."});
  });

  it("GET /api/v2/eventiCalendarioPubblico/:data da autenticati, quindi con token valido, indicando una data di cui non esiste nessun evento pubblico a cui l'utente non si è iscritto o creato", async () => {
    await request(app).get('/api/v2/eventiCalendarioPubblico/05-13-2010').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404, {error: "Non esiste alcun evento legato alla risorsa richiesta."});
  });
});