const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app.js');

describe('POST /api/v2/EventiPrivati/idEvento/Iscrizioni', () => {
    
    let eventPrivatSpy;
    let userSpy;
    let eventSaveSpy;
    let userSaveSpy;
    let bigliettoSaveSpy;
    
    beforeAll( () => {
        jest.useFakeTimers();
        const EventPrivat = require('../collezioni/eventPrivat.js');
        eventPrivatSpy = jest.spyOn(EventPrivat, 'findById').mockImplementation(criterias => {
            if(criterias == '6543') {
                return {
                    _id: '6543',
                    data: ['12-12-2023'],
                    ora: '06:37',
                    durata: 1,
                    categoria: 'svago',
                    nomeAtt: 'Test',
                    luogoEv: {indirizzo: 'Via Enrico Fermi', citta: 'Venezia'},
                    organizzatoreID: '3333',
                    partecipantiID: ['3333', '4444'],
                    invitatiID: ['0000', '1111', '2222'],
                    save: function () {
                        
                    }
                };
            }
        });
        
        const User = require('../collezioni/utenti.js');
        userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
            if(criterias == '2222'){
                return {
                    _id: '2222',
                    nome: 'Mario',
                    email: 'gg.ee@gmail.com',
                    tel: '',
                    password: '12345',
                    EventiCreati: [],
                    EventiIscrtto: [],
                    save: function () {
                        
                    }
                };
            }
        });
        
        const Biglietti = require('../collezioni/biglietti.js');
        
        eventSaveSpy = jest.spyOn(EventPrivat.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
        userSaveSpy = jest.spyOn(User.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
        bigliettoSaveSpy = jest.spyOn(Biglietti.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
    });
    
    afterAll(async () => {
        eventPrivatSpy.mockRestore();
        userSpy.mockRestore();
        eventSaveSpy.mockRestore();
        userSaveSpy.mockRestore();
        bigliettoSaveSpy.mockRestore();
    });
    
    var payload = {
        email: "gg.ee@gmail.com",
        id: "2222"
    }
    var options = {
        expiresIn: 3600
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    
    test('POST /api/v2/EventiPrivati/idEvento/Iscrizioni con utente non invitato dovrebbe restituire 403', async() => {
        
        await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni').
        set('x-access-token', jwt.sign({email: "aa.bb@gmail.com", id: "5555"}, process.env.SUPER_SECRET, {expiresIn: 3600})).expect('Content-Type', /json/).expect(403).expect({error: "Non sei invitato a questo evento"});
        
    });
    
    test('POST /api/v2/EventiPrivati/idEvento/Iscrizioni effettuata con successo dovrebbe restituire 201', async() => {
        
        const response = await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni').set('x-access-token', token);
        expect(response.statusCode).toBe(201);
        expect(response.header.location).toBe('/api/v2/EventiPrivati/6543/Iscrizioni/'+'');
        
    });
    
});
