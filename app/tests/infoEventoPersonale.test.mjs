import request from 'supertest';
import createToken from '../tokenCreation.mjs';
import app from '../app.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import Users from '../collezioni/utenti.mjs';
import {jest} from '@jest/globals';

describe('GET /api/v2/EventiPersonali/:id', () => {

  let eventsPerSpy;
  let UsersSpy;
  var token;

  beforeAll(() => {
    token = createToken("gg.ee@gmail.com", "2222", 3600);
    eventsPerSpy = jest.spyOn(eventPersonal, 'findById').mockImplementation(criterias => {
      if (criterias == '9876543') {
        return { _id: '9876543', data: '05/11/2010', ora: '11:33', durata: 4, categoria: 'svago', nomeAtt: 'Piscina', luogoEv: { indirizzo: 'via rossi', citta: 'Trento' }, organizzatoreID: '1234' }
      }

    });
    UsersSpy = jest.spyOn(Users, 'findById').mockImplementation(criterias => {
      if (criterias == '1234') {
        return { _id: '1234', nome: 'Carlo', email: 'gg.aa@gmail.com', tel: '3452345664567', password: '756756747', EventiCreati: ['9876543'], EventiIscrtto: ['9876543'] }
      }
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    eventsPerSpy = null;
    UsersSpy = null;
    token = null;
  });

  test('GET /api/v2/EventiPersonali/:id nel caso di evento esistente', async () => {
    await request(app).get('/api/v2/EventiPersonali/9876543').set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(200, {
        nomeAtt: 'Piscina',
        categoria: 'svago',
        data: '05/11/2010',
        ora: '11:33',
        durata: 4,
        luogoEv: { indirizzo: 'via rossi', citta: 'Trento' },
        organizzatore: 'Carlo'
      });
  });

  test('GET /api/v2/EventoPersonali/:id nel caso di evento non esistente', async () => {
    await request(app).get('/api/v2/EventiPersonali/34567876543').set('x-access-token', token).
      expect('Content-Type', /json/).
      expect(404, { error: "Non esiste nessun evento con l'id selezionato" });
  });
});
