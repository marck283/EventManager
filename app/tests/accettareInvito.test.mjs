import request from 'supertest';
import app from '../app.mjs';
import createToken from '../tokenCreation.mjs';
import EventPrivat from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('POST /api/v2/EventiPrivati/idEvento/Iscrizioni', () => {
    
    var eventPrivatSpy;
    var userSpy;
    var token;
    
    beforeAll( () => {
        token = createToken("gg.ee@gmail.com", "2222", 3600);
        jest.useFakeTimers();
        eventPrivatSpy = jest.spyOn(EventPrivat, 'findById').mockImplementation(criterias => {
            if(criterias == '6543') {
                return {
                    _id: '6543',
                    data: [new Date().toISOString().split('T')[0].split('-').reverse().join('-')],
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
            if(criterias == '5555') {
                return {
                    _id: '5555',
                    nome: 'Mario',
                    email: 'gg.ee1@gmail.com',
                    tel: '',
                    password: '12345',
                    EventiCreati: [],
                    EventiIscrtto: [],
                    save: function () {
                        
                    }
                };
            }
        });
        
    });
    
    afterAll(() => {
        jest.clearAllTimers();
        jest.restoreAllMocks();
        eventPrivatSpy = null;
        userSpy = null;
        token = null;
    });
    
    it('POST /api/v2/EventiPrivati/idEvento/Iscrizioni con utente non invitato dovrebbe restituire 403', async() => {
        
        await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni')
        .set('x-access-token', createToken("aa.bb@gmail.com", "5555", 3600))
        .expect('Content-Type', /json/).expect(403, {error: "L'utente non è stato invitato a questo evento"});
        
    });
    
    it('POST /api/v2/EventiPrivati/idEvento/Iscrizioni effettuata con successo dovrebbe restituire 201', async() => {
        
        const response = await request(app).post('/api/v2/EventiPrivati/6543/Iscrizioni').set('x-access-token', token);
        expect(response.statusCode).toBe(201);
        expect(response.header.location).toBe('/api/v2/EventiPrivati/6543/Iscrizioni/');
        
    });
});
