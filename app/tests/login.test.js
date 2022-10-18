import request from 'supertest';
import app from '../app.js';

describe('POST /api/v2/authentications', () => {
    
    let userFindOneSpy;
    
    beforeAll( () => {
        
        const Utente = require('../collezioni/utenti.js');
        jest.setTimeout(8000);
        userFindOneSpy = jest.spyOn(Utente, 'findOne').mockImplementation(criterias => {
            
            if(criterias.email.$eq == 'marco.villa@gmail.com') {
                return {
                    _id: '62e1667818bfa6ca7793fdeb',
                    nome: 'Marco Villa',
                    email: 'marco.villa@gmail.com',
                    tel: '',
                    password: 'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26',
                    EventiCreati: [],
                    EventiIscrtto: []
                };
            }
        });
    
    });
    
    afterAll(async () => {
        userFindOneSpy.mockRestore();
    });
    
    test('POST /api/v2/authentications con password sbagliata dovrebbe restituire 403', async() => {
        
        await request(app).post('/api/v2/authentications').
        send({email: 'marco.villa@gmail.com', password: 'abcd', csrfToken: 'i0sPzta9-9U1pYkEY2iVQd6krhh9vc6SQzKc'})
        .expect(403, {success: false, message: 'Autenticazione fallita. Password sbagliata.'});
        
    });
});
