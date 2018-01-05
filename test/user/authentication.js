import chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';

import app from '../../server';

const server = supertest.agent(app),
  { expect } = chai;

after((done) => {
  mongoose.connection.db.dropDatabase(done);
});
describe('Signup API', () => {
  it('should allow a user to signup and return a token', (done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'JohnSnow',
        email: 'johnsnoww@example.com',
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

describe('Signin API', () => {
  before((done) => {
    server
      .post('/api/auth/signup')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        name: 'janedoe',
        email: 'janedoe@example.com',
        password: 'johnpassword',
      })
      .end(() => {
        done();
      });
  });

  it('should allow a user to signin and return a token', (done) => {
    server
      .post('/api/auth/login')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        email: 'janedoe@example.com',
        password: 'johnpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.status).to.equal('Success');
        expect(res.body.message).to.equal('User logged in');
        expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
  it('should return 401 for invalid email', (done) => {
    server
      .post('/api/auth/login')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        email: 'wrongemail@example.com',
        password: 'johnpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Incorrect email or password');
        done();
      });
  });
  it('should return 401 for wrong password', (done) => {
    server
      .post('/api/auth/login')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send({
        email: 'johndoe@example.com',
        password: 'wrongpassword',
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Incorrect email or password');
        done();
      });
  });
  it('should return 400 for incomplete login details', (done) => {
    server
      .post('/api/auth/login')
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.status).to.equal('Fail');
        expect(res.body.message).to.equal('Incomplete login details');
        done();
      });
  });
});
