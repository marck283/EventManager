import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';

describe('POST /api/v2//api/v2/EventiPrivati', () => {

  let UsersSpy;
  let UsersFSpy;
  let UsersSSpy;
  let EventPrSSpy;

  beforeAll( () => {
    const Users = require('../collezioni/utenti.mjs').default;
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      if(criterias == '1234') {
        return {_id:'1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543'], save: function(){}}
      }
    });
    UsersFSpy = jest.spyOn(Users, 'find').mockImplementation(criterias => {
      if(criterias.email.$eq == 'gg.aa@gmail.com') {
        return [{_id:'123',nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      if(criterias.email.$eq == 'gg.tt@gmail.com') {
        return [{_id:'1237676',nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      return [];
    });
    const Inviti = require('../collezioni/invit.mjs').default;
    const eventPrivat = require('../collezioni/eventPrivat.mjs').default;
    InvitiSspy = jest.spyOn(Inviti.prototype, 'save').mockImplementation(criterias => {});
    UsersSSpy = jest.spyOn(Users.prototype, 'save').mockImplementation(criterias => {});
    EventPrSSpy = jest.spyOn(eventPrivat.prototype, 'save').mockImplementation(criterias => { return {id: "345678"}; });
  });

  afterAll(async () => {
    UsersSpy.mockRestore();
    UsersFSpy.mockRestore();
    InvitiSspy.mockRestore();
    UsersSSpy.mockRestore();
    EventPrSSpy.mockRestore();
  });

  // create a valid token
  const token = createToken("gg.ee@gmail.com", "1234", 3600);

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso l'utente invita un utente con un'email associata a nessun utente nel sistema", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Altro",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.uu@gmail.com']
      }).expect('Content-Type', /json/).expect(404, {error: "email non trovata"});
  });


  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica un formato di data sbagliato", async () => {
    await request(app).post('/api/v2/EventiPrivati')
      .set('x-access-token', token).send({
        data: ["11-11-2050","13-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Viaggio",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      })
      .expect('Content-Type', /json/)
      .expect(400, {error: "Data o ora non valida."});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica un giorno non disponibile", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2010","11-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Manifestazione",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(403, {error: "giorno o ora non disponibile"});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si indica giornate ripetute", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050","11-11-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Spettacolo",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, {error: "date ripetute"});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso il campo durata non è del formato corretto", async () => {
    await request(app)
    .post('/api/v2/EventiPrivati')
    .set('x-access-token', token)
      .send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11:33",
        durata: "tre",
        categoria: "Spettacolo",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      })
      .expect('Content-Type', /json/)
      .expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso il campo 'nome attività' non è specificato", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Spettacolo",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
    
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso il campo dell'elenco degli invitati non è specificato", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Sport",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        }}).expect('Content-Type', /json/).expect(400, {error: "Campo vuoto o indefinito o non del formato corretto."});
  });


  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso in cui si ha email ripetute nell'elenco delle email degli utenti invitati", async () => {
    await request(app).post('/api/v2/EventiPrivati')
      .set('x-access-token', token).send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Sport",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com','gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, {error: "email ripetute"});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso di formato dell'ora passata non valido", async () => {
    await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050","11-12-2050"],
        ora: "11-33",
        durata: 3,
        categoria: "Sport",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      }).expect('Content-Type', /json/).expect(400, {error: "Data o ora non valida."});
  });

  test("POST /api/v2//api/v2/EventiPrivati da autenticati, quindi con token valido, nel caso si passano correttamente tutti i campi", async () => {
    expect.assertions(2);
    const response = await request(app).post('/api/v2/EventiPrivati').
      set('x-access-token', token).send({
        data: ["11-11-2050"],
        ora: "11:33",
        durata: 3,
        categoria: "Sport",
        nomeAtt: "Evento",
        luogoEv: {
          indirizzo: "via panini",
          citta: "Bologna"
        },
        ElencoEmailInviti: ['gg.tt@gmail.com']
      });
      expect(response.statusCode).toBe(201);
      expect(response.header.location).toBe('/api/v2/EventiPrivati/345678');
  });
});
