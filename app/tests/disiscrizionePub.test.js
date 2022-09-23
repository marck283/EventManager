const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app.js');

describe('DELETE /api/v2/EventiPubblici/idEvento/Iscrizioni/idIscr', () => {
    
    let eventPublicSpy;
    let userSpy;
    let bigliettoSpy;
    let eventSaveSpy;
    let userSaveSpy
    let bigliettoDeleteOneSpy;
    
    beforeAll( () => {
        
        const eventPublic = require('../collezioni/eventPublic.js');
        eventPublicSpy = jest.spyOn(eventPublic, 'findById').mockImplementation(criterias => {
            if(criterias == '6543'){
                return {
                    _id: '6543',
                    data: '12/12/2022',
                    ora: '06:37',
                    durata: 1,
                    maxPers: 3,
                    categoria: 'svago',
                    nomeAtt: 'Test',
                    luogoEv: {indirizzo: 'Via Enrico Fermi', citta: 'Venezia'},
                    organizzatoreID: '3333',
                    partecipantiID: ['3333', '4444', '2222'],
                    save: function () {
                        
                    }
                };
            }
        });
        
        const Users = require('../collezioni/utenti.js');
        userSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
            if(criterias == '2222'){
                return {
                    _id: '2222',
                    nome: 'Mario',
                    email: 'gg.ee@gmail.com',
                    tel: '',
                    password: '12345',
                    EventiCreati: [],
                    EventiIscrtto: ['6543'],
                    save: function () {
                        
                    }
                };
            }
        });
        
        const biglietti = require('../collezioni/biglietti.js');
        bigliettoSpy = jest.spyOn(biglietti, 'findById').mockImplementation(criterias => {
            if(criterias == '1111'){
                return {
                    _id: '1111',
                    eventoid: '6543',
                    utenteid: '2222',
                    qr: '64646464',
                    tipoevento: 'pub',
                    save: function () {
                        
                    }
                };
            }
        });
        
        eventSaveSpy = jest.spyOn(eventPublic.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
        userSaveSpy = jest.spyOn(Users.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
        bigliettoDeleteOneSpy = jest.spyOn(biglietti, 'deleteOne').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
    });
    
    afterAll(async () => {
        eventPublicSpy.mockRestore();
        userSpy.mockRestore();
        bigliettoSpy.mockRestore();
        eventSaveSpy.mockRestore();
        userSaveSpy.mockRestore();
        bigliettoDeleteOneSpy.mockRestore();
    });
    
    var payload = {
        email: "gg.ee@gmail.com",
        id: "2222"
    }
    var options = {
        expiresIn: 3600 // expires in 24 hours
    }
    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    
    test('DELETE /api/v2/EventiPubblici/idEvento/Iscrizioni/idIscr con idIscr inesistente dovrebbe restituire 404', async() => {
        
        await request(app).delete('/api/v2/EventiPubblici/'+'6543'+'/Iscrizioni/'+'0000').
        set('x-access-token', token).expect('Content-Type', /json/).expect(404).expect({error: "Non corrisponde alcuna iscrizione all'ID specificato."});
        
    });
    
    test('DELETE /api/v2/EventiPubblici/idEvento/Iscrizioni/idIscr effettuato con successo dovrebbe restituire 204', async() => {
        
        await request(app).delete('/api/v2/EventiPubblici/'+'6543'+'/Iscrizioni/'+'1111').
        set('x-access-token', token).expect(204);
        
    });
});
