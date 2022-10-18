import request from 'supertest';
import app from '../app.js';

describe('GET /api/v2/CsrfToken', () => {
    test('GET /api/v2/CsrfToken dovrebbe restituire 200', async () => {
        await request(app).get('/api/v2/CsrfToken').expect(200);
    })
});