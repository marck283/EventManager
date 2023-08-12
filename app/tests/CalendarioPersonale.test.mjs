import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('GET /api/v2/eventiCalendarioPersonale', () => {

 
  let eventsPubSpy;
  let eventsPerSpy;
  let eventsPrivSpy;
  let userSpy;
  var d, h;

  beforeAll( () => {
    const recensione = "2345";
    d = '2010-05-11';
    h = '11:33';
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      var res = [];
      if(criterias.$or == [{"luogoEv.partecipantiID": {$in: ["2222"]}}, {"organizzatoreID": {$eq: "2222"}}]) {
        res.push([
          {id:'987653', durata: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: d, ora: h, maxPers: 2, partecipantiID: ['2222','1234']}], organizzatoreID: '123', recensioni: [recensione]}
        ]);
      }
      return res;
    });
    eventsPerSpy = jest.spyOn(eventPersonal, 'find').mockImplementation(criterias => {
      if(criterias.organizzatoreID.$eq == '2222') {
        return [
        {id:'797569', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: '2010-05-11', ora: '11:33'}], organizzatoreID: '2222'},
        ];
      } else {
        return []
      }
    });
    eventsPrivSpy = jest.spyOn(eventPrivate, 'find').mockImplementation(criterias => {
      var res = [];
      if(criterias.$or == [{"luogoEv.partecipantiID": {$in: ["2222"]}}, {"organizzatoreID": {$eq: "2222"}}]) {
        res.push([
          {id:'75975947', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: '2010-05-11', ora: '11:33', partecipantiID: ['1111','1234','2222'], invitatiID: ['2323']}], organizzatoreID: '1111'},
          {id:'785478458', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: '2010-05-11', ora: '11:33', partecipantiID: ['2222','1234','1111'], invitatiID: ['2323']}], organizzatoreID: '2222'}
        ]);
      }
      return res;
    });
    userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
      if(criterias.id === '2222') {
        return [{
          nome: 'Giovanni',
          profilePic: '',
          email: 'gg.ee@gmail.com',
          tel: '',
          password: '',
          salt: '',
          EventiCreati: ['797569'],
          EventiIscrtto: ['9878456846784568', '987653', '75975947']
        }];
      }
      return [];
    })
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    eventsPerSpy = null;
    eventsPrivSpy = null;
    userSpy = null;
    d = null;
    h = null;
  });

  it("GET /api/v2/eventiCalendarioPersonale da autenticati, quindi con token valido, nel caso ci siano eventi pubblici o privati a cui l'utente si è iscritto o creato, oppure ci siano eventi personali che l'utente ha creato ", async () => {
    // create a valid token
    const response = await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "true"}).
    set('x-access-token', createToken("gg.ee@gmail.com", "2222", 3600)).
    expect('Content-Type', /json/);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({eventi: [{
        id: "pers",
        idevent:'797569',
        self: "/api/v2/EventiPersonali/797569",
        name: "Piscina",
        category: "svago",
        durata: 4,
        luogoEv: [{
          indirizzo: 'via rossi',
          citta: 'Trento',
          data: '2010-05-11',
          ora: '11:33'
        }]
      }]
    });
  });

  it("GET /api/v2/eventiCalendarioPersonale da autenticati, quindi con token valido, nel caso non ci siano eventi pubblici o privati che l'utente si è iscritto o creato, e non ci siano eventi personali che l'utente ha creato ", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "false"}).
    set('x-access-token', createToken("gg.ee@gmail.com", "2223", 3600)).
    expect('Content-Type', /json/).
    expect(404, {error:"Non esiste alcun evento programmato."});
  });
});
