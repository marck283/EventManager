import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';

describe('POST /api/v2//api/v2/EventiPubblici/:id/Inviti', () => {

  let eventsPubSpy;
  let UsersSpy;
  let UsersFSpy;
  let Invitispy;
  let InvitiSspy;

  beforeAll(() => {
    const eventPublic = require('../collezioni/eventPublic.mjs').default;
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation(criterias => {
      if (criterias == '9876543') {
        return { _id: '9876543', data: ['11-05-2023'], ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234', partecipantiID: ['1234', '12365'] }
      }

      if (criterias == '987654') {
        return { _id: '987654', data: ['11-05-2010'], ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '12365', partecipantiID: ['12365'] }
      }
    });
    const Users = require('../collezioni/utenti.mjs').default;
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      if (criterias == '1234') {
        return { _id: '1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] }
      }
      if (criterias == '12365') {
        return { _id: '12365', nome: 'Carlo', email: 'gg.et@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['987654'], EventiIscrtto: ['987654'] }
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
      return [];
    });
    const Inviti = require('../collezioni/invit.mjs').default;
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

  afterAll(async () => {
    eventsPubSpy.mockRestore();
    UsersSpy.mockRestore();
    UsersFSpy.mockRestore();
    Invitispy.mockRestore();
    InvitiSspy.mockRestore();
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente non ancora invitato o partecipante a quell'evento", async () => {
    // create a valid token
    expect.assertions(2);
    var id = "9876543";
    var token = createToken("gg.ee@gmail.com", "1234", 3600);
    const response = await request(app).post('/api/v2/EventiPubblici/' + id + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.aa@gmail.com' });
    expect(response.statusCode).toBe(201);
    expect(response.header.location).toBe('/api/v2/EventiPubblici/9876543/Inviti/43534');
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente che è già stato invitato per quell'evento", async () => {
    var id2 = "9876543";
    var token = createToken("gg.ee@gmail.com", "1234", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id2 + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.tt@gmail.com' }).expect('Content-Type', /json/).expect(403).expect({ error: "L'utente con quella email è già invitato a quell'evento" });
  });


  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email non è passata", async () => {
    var id3 = "9876543";
    var token = createToken("gg.ee@gmail.com", "1234", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id3 + '/Inviti').
      set('x-access-token', token).expect('Content-Type', /json/).expect(400).expect({ error: "Campo vuoto o indefinito" });
  });


  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente non sia organizzatore dell'evento", async () => {
    var id4 = "9876543";
    var token = createToken("gg.et@gmail.com", "123", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id4 + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.ee@gmail.com' }).expect('Content-Type', /json/).expect(403).expect({ error: "L'utente non può invitare ad un evento che non è suo" });
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente associato all'email passata sia già partecipante all'evento", async () => {
    var id5 = "9876543";
    var token = createToken("gg.ee@gmail.com", "1234", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id5 + '/Inviti').
      set('x-access-token', token).send({ email: 'gg.et@gmail.com' }).expect('Content-Type', /json/).expect(403).expect({ error: "L'utente con quella email è già partecipante all'evento" });
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'evento non sia disponibile", async () => {
    var id6 = "987654";
    var token1 = createToken("gg.et@gmail.com", "12365", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id6 + '/Inviti').
      set('x-access-token', token1).send({ email: 'gg.aa@gmail.com' }).expect('Content-Type', /json/).expect(403).expect({ error: "evento non disponibile" });
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente indica la sua stessa email per l'invito", async () => {
    var id7 = "9876543";
    var token1 = createToken("gg.ee@gmail.com", "1234", 3600);
    await request(app).post('/api/v2/EventiPubblici/' + id7 + '/Inviti')
      .set('x-access-token', token1).send({ email: 'gg.ee@gmail.com' }).expect('Content-Type', /json/)
      .expect(403)
      .expect({ error: "L'utente non può auto invitarsi" });
  });
});
