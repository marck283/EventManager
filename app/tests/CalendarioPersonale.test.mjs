import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';

describe('GET /api/v2/eventiCalendarioPersonale', () => {

 
  let eventsPubSpy;
  let eventsPerSpy;
  let eventsPrivSpy;

  beforeAll( () => {
    const recensione = "2345";
    eventsPubSpy = jest.spyOn(eventPublic, 'find').mockImplementation(criterias => {
      return [
        {id:'9876543', data: '05-11-2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234'], recensioni: [recensione]},
        {id:'987653', data: '05-11-2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Event', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '123', partecipantiID: ['2222','1234'], recensioni: [recensione]}
      ]
    });
    eventsPerSpy = jest.spyOn(eventPersonal, 'find').mockImplementation(criterias => {
      if(criterias.organizzatoreID.$eq == '2222') {
        return [
        {id:'797569', data: '05-11-2010',  ora:'11:33', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '2222', recensioni: [recensione]},
        ];
      } else {
        return []
      }
    });
    eventsPrivSpy = jest.spyOn(eventPrivate, 'find').mockImplementation(criterias => {
      return [
        {id:'75975947',data: '05-11-2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1111', partecipantiID: ['1111','1234','2222'], invitatiID: ['2323'], recensioni: [recensione]},
        {id:'785478458',data: '05-11-2010',  ora: '11:33', durata: 4, categoria: 'operazione', nomeAtt: 'Eventt', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '2222', partecipantiID: ['2222','1234','1111'], invitatiID: ['2323'], recensioni: [recensione]}
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
    await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "False"}).
    set('x-access-token', createToken("gg.ee@gmail.com", "2222", 3600)).
    expect('Content-Type', /json/).
    expect(200).expect({eventi: [
      {id: "pers",
        idevent:'797569',
        self: "/api/v2/EventiPersonali/797569",
        name: "Piscina",
        category: "svago"}]
    });
  });

  test("GET /api/v2/eventiCalendarioPersonale da autenticati, quindi con token valido, nel caso non ci siano eventi pubblici o privati che l'utente si è iscritto o creato, e non ci siano eventi personali che l'utente ha creato ", async () => {
    await request(app).get('/api/v2/eventiCalendarioPersonale').query({passato: "False"}).
    set('x-access-token', createToken("gg.ee@gmail.com", "2223", 3600)).
    expect('Content-Type', /json/).
    expect(404).expect({error:"Non esiste alcun evento programmato."});
  });
});
