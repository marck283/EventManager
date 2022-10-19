import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import EventPublic from '../collezioni/eventPublic.mjs';

describe('PATCH /api/v2/EventiPubblici/idEvento', () => {
    
    let eventPublicSpy;
    let eventSaveSpy;
    
    beforeAll( () => {
        eventPublicSpy = jest.spyOn(EventPublic, 'findById').mockImplementation(criterias => {
            if(criterias == '67890'){
                return {
                    _id: '67890',
                    data: '12/12/2023',
                    ora: '06:37',
                    durata: 1,
                    maxPers: 2,
                    categoria: 'svago',
                    nomeAtt: 'Test',
                    luogoEv: {indirizzo: 'Via Enrico Fermi', citta: 'Venezia'},
                    organizzatoreID: '2222',
                    partecipantiID: ['2222', '1111'],
                    save: function () {
                        
                    }
                };
            }
        });
        
        eventSaveSpy = jest.spyOn(EventPublic.prototype, 'save').mockImplementation(criterias => {
            return {
                //Vuoto perché inutilizzato
            }
        });
        
    });
    
    afterAll(async () => {
        eventPublicSpy.mockRestore();
        eventSaveSpy.mockRestore();
    });
    
    var token = createToken("gg.ee@gmail.com", "2222", 3600);
    
    test('PATCH /api/v2/EventiPubblici/idEvento con utente non organizzatore dovrebbe restituire 403', async() => {
        
        await request(app).patch('/api/v2/EventiPubblici/'+'67890').
        set('x-access-token', createToken("aa.bb@gmail.com", "1111", 3600))
        .expect('Content-Type', /json/).expect(403).expect({error: "Non sei autorizzato a modificare, terminare od annullare l'evento."});
        
    });
    
    test('PATCH /api/v2/EventiPubblici/idEvento effettuata con successo dovrebbe restituire 200', async() => {
        
        const response = await request(app).patch('/api/v2/EventiPubblici/'+'67890').
        set('x-access-token', token).
        send({nomeAtt: "Test2", categoria: "svago", luogoEv: {indirizzo: "Via panini", citta: "Bologna"}, maxPers: 10});
        expect(response.statusCode).toBe(200);
        expect(response.header.location).toBe('/api/v2/EventiPubblici/'+'67890');
        
    });
});
