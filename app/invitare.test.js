const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./app');

describe('/api/v2//api/v2/EventiPubblici', () => {

  let eventsPubSpy;
  let UsersSpy;
  let UsersFSpy;
  let Invitispy;
  let InvitiSspy;

  beforeAll( () => {
    const eventPublic = require('./collezioni/eventPublic.js');
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation((criterias) => {
      if(criterias == '9876543'){
        return {_id:'9876543', data: '05/11/2023',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '1234', partecipantiID: ['1234','12365']}

      }

      if(criterias == '987654'){
        return {_id:'987654', data: '05/11/2010',  ora: '11:33', durata: 2, maxPers: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: {indirizzo: 'via rossi', citta: 'Trento'}, organizzatoreID: '12365', partecipantiID: ['12365']}

      }

      

    });
    const Users = require('./collezioni/utenti.js');
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation((criterias) => {
      if(criterias == '1234'){
        return {_id:'1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}
      }
      if(criterias == '12365'){
        return {_id:'12365', nome: 'Carlo', email: 'gg.et@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['987654'] , EventiIscrtto: ['987654']}
      }
    });
    UsersFSpy = jest.spyOn(Users, 'find').mockImplementation((criterias) => {
      if(criterias.email == 'gg.aa@gmail.com'){
        return [{_id:'123',nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      if(criterias.email == 'gg.tt@gmail.com'){
        return [{_id:'1237676',nome: 'Carlo', email: 'gg.tt@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: [] , EventiIscrtto: []}]

      }
      if(criterias.email == 'gg.et@gmail.com'){
        return [{_id:'12365', nome: 'Carlo', email: 'gg.et@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['987654'] , EventiIscrtto: ['987654','9876543']}]

      }
      if(criterias.email == 'gg.ee@gmail.com'){
        return [{_id:'1234', nome: 'Carlo', email: 'gg.ee@gmail.com', tel: '34564567', password: '23456789765', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}]

      }
      return [];
    });
    const Inviti = require('./collezioni/invit.js');
    Invitispy = jest.spyOn(Inviti, 'find').mockImplementation((criterias) => {
      if(criterias.utenteid == '12345'){
        return [{_id:'43534',utenteid:'12345',  eventoid: '9876543', tipoevent: 'pub'}];

      }
      if(criterias.utenteid == '1237676'){
        return [{_id:'43534',utenteid:'1237676',  eventoid: '9876543', tipoevent: 'pub'}];

      }
      return [];
    });
    InvitiSspy = jest.spyOn(Inviti.prototype, 'save').mockImplementation((criterias) => { return {id:'43534',utenteid:'123',  eventoid: '9876543', tipoevent: 'pub'}; });
  });

  afterAll(async () => {
    eventsPubSpy.mockRestore();
    UsersSpy.mockRestore();
    UsersFSpy.mockRestore();
    Invitispy.mockRestore();
    InvitiSspy.mockRestore();

  });

 
  
  
  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente", async () => {
      // create a valid token
    expect.assertions(2);
    var payload = {
      email: "gg.ee@gmail.com",
      id: "1234"
    }

    var options = {
      expiresIn: 3600 // expires in 24 hours
    }
    var id = "9876543";
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    const response = await request(app).post('/api/v2/EventiPubblici/'+id+'/Inviti').
    set('x-access-token', token).send({email: 'gg.aa@gmail.com'});
    expect(response.statusCode).toBe(201);
    expect(response.header.location).toBe('/api/v2/EventiPubblici/9876543/Inviti/43534');
    
  });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email passata è di un'altro utente che è già stato invitato per quell'evento", async () => {
        // create a valid token
      var payload2 = {
        email: "gg.ee@gmail.com",
        id: "1234"
      }

      var options2 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id2 = "9876543";
      var token = jwt.sign(payload2,process.env.SUPER_SECRET, options2);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id2+'/Inviti').
      set('x-access-token', token).send({email: 'gg.tt@gmail.com'}).expect('Content-Type', /json/).expect(403).expect({error: "L'utente con quella email è già invitato a quell'evento"});
      
      
    });


  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente abbia organizzato l'evento e l'email non è passata", async () => {
        // create a valid token
      var payload3 = {
        email: "gg.ee@gmail.com",
        id: "1234"
      }

      var options3 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id3 = "9876543";
      var token = jwt.sign(payload3,process.env.SUPER_SECRET, options3);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id3+'/Inviti').
      set('x-access-token', token).expect('Content-Type', /json/).expect(400).expect({error: "Campo vuoto o indefinito"});
      
      
    });


  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente non sia organizzatore dell'evento", async () => {
        // create a valid token
      var payload4 = {
        email: "gg.et@gmail.com",
        id: "123"
      }

      var options4 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id4 = "9876543";
      var token = jwt.sign(payload4,process.env.SUPER_SECRET, options4);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id4+'/Inviti').
      set('x-access-token', token).send({email: 'gg.ee@gmail.com'}).expect('Content-Type', /json/).expect(403).expect({error: "L'utente non può invitare ad un evento che non è suo"});
      
      
    });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente associato all'email passata sia già partecipante all'evento", async () => {
        // create a valid token
      var payload5 = {
        email: "gg.ee@gmail.com",
        id: "1234"
      }

      var options5 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id5 = "9876543";
      var token = jwt.sign(payload5,process.env.SUPER_SECRET, options5);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id5+'/Inviti').
      set('x-access-token', token).send({email: 'gg.et@gmail.com'}).expect('Content-Type', /json/).expect(403).expect({error: "L'utente con quella email è già partecipante all'evento"});
      
      
    });

  test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'evento non sia disponibile", async () => {
        // create a valid token
      var payload6 = {
        email: "gg.et@gmail.com",
        id: "12365"
      }

      var options6 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id6 = "987654";
      var token1 = jwt.sign(payload6,process.env.SUPER_SECRET, options6);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id6+'/Inviti').
      set('x-access-token', token1).send({email: 'gg.aa@gmail.com'}).expect('Content-Type', /json/).expect(403).expect({error: "evento non disponibile"});
      
      
    });

    test("POST /api/v2//api/v2/EventiPubblici/:id/Inviti da autenticati, quindi con token valido, nel caso l'utente indica la sua email per l'invito", async () => {
      // create a valid token
      var payload7 = {
        email: "gg.ee@gmail.com",
        id: "1234"
      }

      var options7 = {
        expiresIn: 3600 // expires in 24 hours
      }
      var id7 = "9876543";
      var token1 = jwt.sign(payload7,process.env.SUPER_SECRET, options7);
      const response = await request(app).post('/api/v2/EventiPubblici/'+id7+'/Inviti').
      set('x-access-token', token1).send({email: 'gg.ee@gmail.com'}).expect('Content-Type', /json/).expect(403).expect({error: "L'utente non può auto invitarsi"});
      
      
    });









  

  
  

  });