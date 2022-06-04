const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('../app');

describe('GET /api/v2/Utenti/me/Iscrizioni', () => {

  let eventsBigliettSpy;
  let UsersSpy;
  let eventsPubSpy;
  let eventsPrivSpy;

  beforeAll( () => {
    const Biglietto = require('../collezioni/biglietti.js');
    eventsBigliettSpy = jest.spyOn(Biglietto, 'find').mockImplementation((criterias) => {
      if(criterias.utenteid == "2222"){
        return [
          {_id: "76767676",eventoid: "0987654", utenteid: "2222", qr: "gy89yv9tw4yt989hhwhw589wy8ytv", tipoevento: "pub"},
          {_id: "7676777777676",eventoid: "09887754", utenteid: "2222", qr: "gy89yv9tw4yt989hhwhw589wy6666668ytv", tipoevento: "priv"}
        ]
      }
      return [];
    });
    const Utente = require('../collezioni/utenti.js');
    UsersSpy = jest.spyOn(Utente, 'findById').mockImplementation((criterias) => {
      if(criterias == '1234'){
        return {_id:'1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['0987654','09887754'] , EventiIscrtto: ['9876543']}
      }
      if(criterias == '2222'){
        return {_id:'2222', nome: 'Andrea', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: [] , EventiIscrtto: ['0987654','09887754']}
      }

    });
    const eventPublic = require('../collezioni/eventPublic.js');
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation((criterias) => {
      if(criterias == '0987654'){
        return {_id:'0987654', data: '05/11/2050',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234']}
      }
      
    });
    const eventPrivat = require('../collezioni/eventPrivat.js');
    eventsPrivSpy = jest.spyOn(eventPrivat, 'findById').mockImplementation((criterias) => {
     if(criterias == '09887754'){
        return {_id:'09887754', data: '05/11/2050',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234']}
      }
    });
    
  });

  afterAll(async () => {
    eventsBigliettSpy.mockRestore();
    eventsPubSpy.mockRestore();
    eventsPrivSpy.mockRestore();
    UsersSpy.mockRestore();
  });

 
  

  test("GET /api/v2/Utenti//me/Iscrizioni da autenticati, quindi con token valido, nel caso l'utente ha delle iscrizioni valide associate", async () => {
      // create a valid token
    var payload = {
      email: "gg.ee@gmail.com",
      id: "2222"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).get('/api/v2/Utenti//me/Iscrizioni').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(200).expect([{ eventoUrl: "/api/v2/EventiPubblici/0987654",eventoid: "0987654",utenteUrl: "/api/v2/Utenti/2222",utenteid: "2222",
                        nomeUtente: "Andrea",
                        nomeOrg: "Carlo",
                        nomeAtt: "Evento",
                        tipoevento: "pub",
                        img: "gy89yv9tw4yt989hhwhw589wy8ytv",
                        bigliettoid: "76767676",
                        bigliettoUrl: "/api/v2/Iscrizioni/76767676" },{ eventoUrl: "/api/v2/EventiPrivati/09887754",
                        eventoid: "09887754",
                        utenteUrl: "/api/v2/Utenti/2222",
                        utenteid: "2222",
                        nomeUtente: "Andrea",
                        nomeOrg: "Carlo",
                        nomeAtt: "Evento",
                        tipoevento: "priv",
                        img: "gy89yv9tw4yt989hhwhw589wy6666668ytv",
                        bigliettoid: "7676777777676",
                        bigliettoUrl: "/api/v2/Iscrizioni/7676777777676" }]);
  });

  test("GET /api/v2/Utenti//me/Iscrizioni da autenticati, quindi con token valido, nel caso l'utente non è associato ad nessuna iscrizione", async () => {
      // create a valid token
    var payload2 = {
      email: "gg.vv@gmail.com",
      id: "111111111111"
    }

    var options2 = {
      expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload2, process.env.SUPER_SECRET, options2);
    const response = await request(app).get('/api/v2/Utenti//me/Iscrizioni').
    set('x-access-token', token).
    expect('Content-Type', /json/).
    expect(404).expect({ error: "Non ci sono biglietti per questo utente"});
  });

});