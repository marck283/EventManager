const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app.js');

describe('POST /api/v2/authentications', () => {
    
    let userFindOneSpy;
    
    beforeAll( () => {
        
        const Utente = require('../collezioni/utenti.js');
        userFindOneSpy = jest.spyOn(Utente, 'findOne').mockImplementation((criterias) => {
            
            if(criterias.email == 'marco.villa@gmail.com'){
                return {
                    exec: function(){
                        return {
                            _id: '2222',
                            nome: 'Marco Villa',
                            email: 'marco.villa@gmail.com',
                            tel: '',
                            password: '9cf424861daba32c865a346f7b2bc1ac4b0b7500a9cb98f414ec4fa92f09f21f9062af866c264349071c17e49558f2fcdbb659e478b7b1f96f3872db72d6e02c',
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
        send({email: 'marco.villa@gmail.com', password: 'abcd'}).
        expect('Content-Type', /json/).expect(403).expect({success: false, message: 'Autenticazione fallita. Password sbagliata.'});
        
    });
    
    test('POST /api/v2/authentications effettuata con successo dovrebbe restituire 200', async() => {
        
        await request(app).post('/api/v2/authentications').
        send({email: 'marco.villa@gmail.com', password: '9cf424861daba32c865a346f7b2bc1ac4b0b7500a9cb98f414ec4fa92f09f21f9062af866c264349071c17e49558f2fcdbb659e478b7b1f96f3872db72d6e02c'}).
        expect('Content-Type', /json/).expect(200);
        
    });
    
});
