const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app.js');

describe('POST /api/v2/authentications', () => {
    
    let userFindOneSpy;
    
    beforeAll( () => {
        
        const Utente = require('../collezioni/utenti.js');
        userFindOneSpy = jest.spyOn(Utente, 'findOne').mockImplementation((criterias) => {
            
            if(criterias.email == 'gg.ee@gmail.com'){
                return {
                    exec: function(){
                        return {
                            _id: '2222',
                            nome: 'Mario',
                            email: 'gg.ee@gmail.com',
                            tel: '',
                            password: '12345',
                            EventiCreati: [],
                            EventiIscrtto: []
                        }
                    }
                };
            }
        });
    
    });
    
    afterAll(async () => {
        userFindOneSpy.mockRestore();
    });
    
    test('POST /api/v2/authentications con password sbagliata dovrebbe restituire 403', async() => {
        
        await request(app).post('/api/v2/authentications').
        send({email: 'gg.ee@gmail.com', password: 'abcd'}).
        expect('Content-Type', /json/).expect(403).expect({success: false, message: 'Autenticazione fallita. Password sbagliata.'});
        
    });
    
    test('POST /api/v2/authentications effettuata con successo dovrebbe restituire 200', async() => {
        
        await request(app).post('/api/v2/authentications').
        send({email: 'gg.ee@gmail.com', password: '12345'}).
        expect('Content-Type', /json/).expect(200);
        
    });
    
});
