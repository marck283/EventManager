import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import EventPublic from '../collezioni/eventPublic.mjs';
import {jest} from '@jest/globals';

describe('POST /api/v2/EventiPubblici/idEvento/Iscrizioni', () => {
    
    let eventPublicSpy;
    var token;
    
    beforeAll(() => {
        token = createToken("gg.ee@gmail.com", "2222", 3600);
        eventPublicSpy = jest.spyOn(EventPublic, 'findById').mockImplementation(criterias => {
            if(criterias == '67890') {
                return {
                    _id: '67890',
                    data: ['12-12-2023'],
                    ora: '06:37',
                    durata: 1,
                    maxPers: 2,
                    categoria: 'svago',
                    nomeAtt: 'Test',
                    luogoEv: {indirizzo: 'Via Enrico Fermi', citta: 'Venezia'},
                    organizzatoreID: '628f8b448031650249b5d6bb',
                    partecipantiID: ['628f8b448031650249b5d6bb', '628e8c29d108a0e2094d364b']
                };
            }
        });
    });
    
    afterAll(() => {
        eventPublicSpy.mockRestore();
        eventPublicSpy = null;
        token = null;
    });
    
    it('POST /api/v2/EventiPubblici/idEvento/Iscrizioni con id inesistente dovrebbe restituire 404', async () => {
        
        await request(app).post('/api/v2/EventiPubblici/12345/Iscrizioni').
        set('x-access-token', token).expect('Content-Type', /json/).expect(404, {error: "Non esiste nessun evento con l'id selezionato"});
        
    });
    
    it('POST /api/v2/EventiPubblici/idEvento/Iscrizioni con posti pieni dovrebbe restituire 403', async () => {
        
        await request(app).post('/api/v2/EventiPubblici/67890/Iscrizioni').
        set('x-access-token', token).expect('Content-Type', /json/).expect(403, {error: "Non spazio nell'evento"});
        
    });
});
