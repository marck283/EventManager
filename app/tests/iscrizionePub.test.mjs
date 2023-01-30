import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import EventPublic from '../collezioni/eventPublic.mjs';
import User from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('POST /api/v2/EventiPubblici/idEvento/Iscrizioni', () => {
    
    let eventPublicSpy;
    let UsersSpy;
    var token;
    
    beforeAll(() => {
        token = createToken("gg.ee@gmail.com", "2222", 3600);
        eventPublicSpy = jest.spyOn(EventPublic, 'findById').mockImplementation(criterias => {
            console.log(criterias == '67890');
            if (criterias == '67890') {
                return {
                    _id: '67890',
                    durata: 1,
                    categoria: 'svago',
                    nomeAtt: 'Test',
                    luogoEv: [{
                        indirizzo: 'Via Enrico Fermi',
                        citta: 'Venezia',
                        data: '12-12-2023',
                        ora: '06:37',
                        maxPers: 2,
                        partecipantiID: ['628f8b448031650249b5d6bb', '628e8c29d108a0e2094d364b']
                    }],
                    organizzatoreID: '628f8b448031650249b5d6bb',
                };
            }
        });
        
        UsersSpy = jest.spyOn(User, 'findById').mockImplementation(criterias => {
            if(criterias == '2222') {
                return {
                    nome: 'Giovanni',
                    profilePic: '',
                    email: 'gg.ee@gmail.com',
                    tel: '',
                    password: '',
                    salt: '',
                    EventiCreati: ['797569'],
                    EventiIscrtto: ['9878456846784568', '987653', '75975947']
                };
            }
        });
    });
    
    afterAll(() => {
        eventPublicSpy.mockRestore();
        eventPublicSpy = null;
        UsersSpy = null;
        token = null;
    });
    
    it('POST /api/v2/EventiPubblici/idEvento/Iscrizioni con id inesistente dovrebbe restituire 404', async () => {
        
        await request(app).post('/api/v2/EventiPubblici/12345/Iscrizioni').
        set('x-access-token', token)
        .send({
            data: '12-12-2023',
            ora: '06:37'
        })
        .expect('Content-Type', /json/).expect(404, {error: "Non esiste nessun evento con l'id selezionato"});
        
    });
    
    it('POST /api/v2/EventiPubblici/idEvento/Iscrizioni con posti pieni dovrebbe restituire 403', async () => {
        
        await request(app).post('/api/v2/EventiPubblici/67890/Iscrizioni').
        set('x-access-token', token).expect('Content-Type', /json/)
        .send({
            data: '12-12-2023',
            ora: '06:37'
        })
        .expect(403, {error: "Limite massimo di partecipanti raggiunto per questo evento."});
        
    });
});
