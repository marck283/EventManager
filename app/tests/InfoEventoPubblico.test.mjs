import request from 'supertest';
import app from '../app.mjs';
import eventPublic from '../collezioni/eventPublic.mjs';
import Users from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('GET /api/v2/EventiPubblici/:id', () => {

  let eventsPubSpy;
  let UsersSpy;

  beforeAll(() => {
    eventsPubSpy = jest.spyOn(eventPublic, 'findById').mockImplementation(criterias => {
      if(criterias == '9876543') {
        return {_id:'9876543', durata: 2, categoria: 'svago', nomeAtt: 'Evento', luogoEv: [{indirizzo: 'via rossi', citta: 'Trento', data: '05/11/2010',  ora: '11:33', maxPers: 2, partecipantiID: ['1234']}], organizzatoreID: '1234'}
     }

    });
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      if(criterias == '1234') {
        return {_id:'1234', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: ['9876543'] , EventiIscrtto: ['9876543']}
     }

    });

  });

  afterAll(async () => {
    jest.restoreAllMocks();
    eventsPubSpy = null;
    UsersSpy = null;
  });
  
  it('GET /api/v2/EventiPubblici/:id nel caso di evento esistente', async () => {
      await request(app).get('/api/v2/EventiPubblici/9876543').
      expect('Content-Type', /json/).
      expect(200, {
        nomeAtt: 'Evento',
        categoria: 'svago',
        durata: 2,
        luogoEv: [{
            indirizzo: 'via rossi',
            citta: 'Trento',
            data: '05/11/2010',
            ora: '11:33',
            maxPers: 2,
            partecipantiID: ['1234']
          }],
        organizzatore: 'Carlo'
      });
  });

  it('GET /api/v2/EventiPubblici/:id nel caso di evento non esistente', async () => {
    await request(app).get('/api/v2/EventiPubblici/34567876543').
    expect('Content-Type', /json/).
    expect(404, {error: "Non esiste nessun evento con l'id selezionato"});
  });
});
