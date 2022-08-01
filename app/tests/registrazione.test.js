const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app.mjs').default;

describe('POST /api/v2/Utenti', () => {
    
    let userFindOneSpy;
    let userSaveSpy;
    
    beforeAll( () => {
        
        const Utente = require('../collezioni/utenti.js');
        userFindOneSpy = jest.spyOn(Utente, 'findOne').mockImplementation((criterias) => {
            
            if(criterias.email == 'gg.ee@gmail.com'){
                return {
                    _id: '2222',
                    nome: 'Mario',
                    email: 'gg.ee@gmail.com',
                    tel: '',
                    password: '12345',
                    EventiCreati: [],
                    EventiIscrtto: [],
                    save: function(){
                        
                    }
                };
            }
            
            userSaveSpy = jest.spyOn(Utente.prototype, 'save').mockImplementation( (criterias) => {
                return {
                    id: '1111',
                    nome: 'Fabio',
                    email: 'gg.ee@gmail.com',
                    password: 'abcd',
                    tel: '',
                }
            });
        });
    
    });
    
    afterAll(async () => {
        userFindOneSpy.mockRestore();
        userSaveSpy.mockRestore();
    });
    
    test('POST /api/v2/Utenti con email già registrata dovrebbe restituire 409', async() => {
        
        await request(app).post('/api/v2/Utenti').
        send({nome: 'Mario', email: 'gg.ee@gmail.com', pass: 'abcd', tel: ''}).
        expect(409).expect({error: "L'email inserita corrisponde ad un profilo già creato."});
        
    });
    
    test('POST /api/v2/Utenti ', async() => {
        
        const response = await request(app).post('/api/v2/Utenti').
        send({nome: 'Fabio', email: 'aa.bb@gmail.com', pass: 'abcd', tel: ''});
        expect(response.statusCode).toBe(201);
        expect(response.header.location).toBe('/api/v2/Utenti/1111');
        
    });
    
});
