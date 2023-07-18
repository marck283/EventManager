import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import Users from '../collezioni/utenti.mjs';
import Inviti from '../collezioni/invit.mjs';
import {jest} from '@jest/globals';

describe('POST /api/v2//api/v2/EventiPubblici/:id/Inviti', () => {

  var eventsPubSpy;
  var UsersSpy;
  var UsersFSpy;
  var Invitispy;
  var InvitiSspy;
  var token, token1, token2, token3;
  var id, id1;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "1234", 3600);
    token1 = createToken("gg.et@gmail.com", "123", 3600);
    token2 = createToken("gg.et@gmail.com", "12365", 3600);
    token3 = createToken("gg.ee@gmail.com", "12345", 3600);
    id = "9876543";
    id1 = "987654";
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation(criterias => {
      if (criterias == '9876543') {
        return { _id: '9876543', data: ['11-05-2023'], ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['1234', '12365'] }
      }

      if (criterias == '987654') {
        return { _id: '987654', data: ['11-05-2010'], ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '12365', partecipantiID: ['12365'] }
      }
    });
    
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      switch(criterias) {
        case '123': {
          return { _id: '123', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] };
        }
        case '1237676': {
          return { _id: '1237676', nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] };
        }
        case '12365': {
          return { _id: '12365', nome: 'Carlo', email: 'gg.et@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['987654'], EventiIscrtto: ['987654', '9876543'] };
        }
        case '1234': {
          return { _id: '1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] };
        }
        case '12345': {
          return { _id: '12345', nome: 'Carlo', email: 'gg.ea@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] };
        }
      }
    });
    UsersFSpy = jest.spyOn(Users, 'find').mockImplementation(criterias => {
      if (criterias.email.$eq == 'gg.aa@gmail.com') {
        return [{ _id: '123', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] }]
      }
      if (criterias.email.$eq == 'gg.tt@gmail.com') {
        return [{ _id: '1237676', nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [], EventiIscrtto: [] }]
      }
      if (criterias.email.$eq == 'gg.et@gmail.com') {
        return [{ _id: '12365', nome: 'Carlo', email: 'gg.et@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['987654'], EventiIscrtto: ['987654', '9876543'] }]
      }
      if (criterias.email.$eq == 'gg.ee@gmail.com') {
        return [{ _id: '1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] }]
      }
      if(criterias.email.$eq == 'gg.ea@gmail.com') {
        return [{ _id: '12345', nome: 'Carlo', email: 'gg.ea@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] }];
      }
      return [];
    });
    
    Invitispy = jest.spyOn(Inviti, 'find').mockImplementation(criterias => {
      if (criterias.utenteid == '12345') {
        return [{ _id: '43534', utenteid: '12345', eventoid: '9876543', tipoevent: 'pub' }];
      }
      if (criterias.utenteid == '1237676') {
        return [{ _id: '43534', utenteid: '1237676', eventoid: '9876543', tipoevent: 'pub' }];
      }
      return [];
    });
    InvitiSspy = jest.spyOn(Inviti.prototype, 'save').mockImplementation(criterias => {
      return { id: '43534', utenteid: '123', eventoid: '9876543', tipoevent: 'pub' };
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    UsersSpy = null;
    UsersFSpy = null;
    Invitispy = null;
    InvitiSspy = null;
    token = null;
    token1 = null;
    token2 = null;
    id = null;
    id1 = null;
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente non ancora invitato o partecipante a quell'evento", async () => {
    expect.assertions(2);
    const response = await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.aa@gmail.com' });
    expect(response.statusCode).toBe(201);
    expect(response.header.location).toBe('/api/v2/EventiPubblici/9876543/Inviti/43534');
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente che è già stato invitato per quell'evento", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.tt@gmail.com' }).expect('Content-Type', /json/).expect(403, { error: "L'utente con quella email è già invitato a quell'evento" });
  });


  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email non è passata", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti').
      set('x-access-token', token).expect('Content-Type', /json/).expect(400, { error: "Campo vuoto o indefinito" });
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente non sia organizzatore dell'evento", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti').
      set('x-access-token', token1).send({ email: 'gg.ee@gmail.com' }).expect('Content-Type', /json/).expect(403, { error: "L'utente non può invitare ad un evento che non è suo" });
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente associato all'email passata sia già partecipante all'evento", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id1 + '/Inviti').
      set('x-access-token', token3).send({ email: 'gg.et@gmail.com' }).expect('Content-Type', /json/).expect(403, { error: "evento non disponibile" });
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'evento non sia disponibile", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id1 + '/Inviti').
      set('x-access-token', token2).send({ email: 'gg.aa@gmail.com' }).expect('Content-Type', /json/).expect(403, { error: "evento non disponibile" });
  });

  it("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente indica la sua stessa email per l'invito", async () => {
    await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti')
      .set('x-access-token', token).send({ email: 'gg.ee@gmail.com' }).expect('Content-Type', /json/)
      .expect(403, { error: "L'utente non può auto invitarsi" });
  });
});
