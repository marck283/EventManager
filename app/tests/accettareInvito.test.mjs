import request from 'supertest';
import app from '../app.mjs';
import createToken from '../tokenCreation.mjs';
import EventPrivat from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import Biglietti from '../collezioni/biglietti.mjs';

describe('POST /api/v2/EventiPrivati/idEvento/Iscrizioni', () => {
    
    var eventPrivatSpy;
    var userSpy;
    var eventSaveSpy;
    var userSaveSpy;
    var bigliettoSaveSpy;
    var timeout;
    var token;
    
    beforeAll( () => {
        token = createToken("gg.ee@gmail.com", "2222", 3600);
        jest.useFakeTimers();
        timeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => {
            return {
                unref: jest.fn()
            }
        });
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
        
        userSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
            if(criterias == '2222') {
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
        jest.useRealTimers();
        jest.clearAllTimers();
        timeout.mockRestore();
        timeout.unref;
        eventPrivatSpy.mockRestore();
        userSpy.mockRestore();
        eventSaveSpy.mockRestore();
        userSaveSpy.mockRestore();
        bigliettoSaveSpy.mockRestore();
        eventPrivatSpy = null;
        userSpy = null;
        eventSaveSpy = null;
        userSaveSpy = null;
        bigliettoSaveSpy = null;
        token = null;
    });
    
    test('POST /api/v2/EventiPrivati/idEvento/Iscrizioni con utente non invitato dovrebbe restituire 403', async() => {
        
        await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni')
        .set('x-access-token', createToken("aa.bb@gmail.com", "5555", 3600))
        .expect('Content-Type', /json/).expect(403, {error: "Non sei invitato a questo evento"});
        
    });
    
    test('POST /api/v2/EventiPrivati/idEvento/Iscrizioni effettuata con successo dovrebbe restituire 201', async() => {
        
        const response = await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni').set('x-access-token', token);
        expect(response.statusCode).toBe(201);
        expect(response.header.location).toBe('/api/v2/EventiPrivati/6543/Iscrizioni/'+'');
        
    });
    
});
