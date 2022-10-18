/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const app     = require('../app.js');

test('app module should be defined', () => {
  expect(app).toBeDefined();
});

test('GET / should return 200', () => {
  return request(app)
    .get('/')
    .expect(200);
});