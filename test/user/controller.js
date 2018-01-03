import chai from 'chai';
import supertest from 'supertest';
import app from '../../server';

const server = supertest.agent(app),
  { expect } = chai;

describe('Signup API', () => {
  it('should allow a user to signup and return a token', (done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'JohnSnow',
        email: 'johnsnow@example.com',
        password: 'johnpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.status).to.equal('Success');
        expect(res.body.message).to.equal('User created');
        expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
  it('should return 400 for invalid name', (done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'John#$',
        email: 'johndoe@example.com',
        password: 'johnpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Name must be atleast 6 alphanumeric characters');
        done();
      });
  });
  it('should return 400 for invalid email', (done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'JohnDoe',
        email: 'johndoeexample.com',
        password: 'johnpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Invalid email address format');
        done();
      });
  });
  it('should return 400 for invalid password', (done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'JohnSnow',
        email: 'johndoe@example.com',
        password: 'john',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Password must be atleat 6 characters');
        done();
      });
  });
});
