import request from 'supertest';
import app from '../app.mjs';
import Utente from '../collezioni/utenti.mjs';

describe('POST /api/v2/Utenti', () => {
    
    let userFindOneSpy;
    let userSaveSpy;
    
    beforeAll( () => {
        userFindOneSpy = jest.spyOn(Utente, 'findOne').mockImplementation(criterias => {
            if(criterias.email.$eq == 'gg.ee@gmail.com') {
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
        });

        userSaveSpy = jest.spyOn(Utente.prototype, 'save').mockImplementation(criterias => {
            return {
                id: '1111',
                nome: 'Fabio',
                email: 'gg.ee@gmail.com',
                password: 'abcd',
                tel: '',
            }
        });
    
    });
    
    afterAll(async () => {
        userFindOneSpy.mockRestore();
        userSaveSpy.mockRestore();
    });
    
    test('POST /api/v2/Utenti con email già registrata dovrebbe restituire 409', async() => {
        
        await request(app).post('/api/v2/Utenti').
        send({nome: 'Mario', email: 'gg.ee@gmail.com', pass: 'abcd', tel: '', csrfToken: 'i0sPzta9-9U1pYkEY2iVQd6krhh9vc6SQzKc'}).
        expect(409, {error: "L'email inserita corrisponde ad un profilo già creato."});
        
    });
    
    test('POST /api/v2/Utenti ', async() => {
        
        const response = await request(app).post('/api/v2/Utenti').
        send({nome: 'Fabio', email: 'aa.bb@gmail.com', pass: 'abcd', tel: '', csrfToken: 'i0sPzta9-9U1pYkEY2iVQd6krhh9vc6SQzKc'});
        expect(response.statusCode).toBe(201);
        expect(response.header.location).toBe('/api/v2/Utenti/1111');
        
    });
    
});
