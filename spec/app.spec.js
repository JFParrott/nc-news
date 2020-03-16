process.env.NODE_ENV = 'test';
const chai = require('chai');
const { expect } = chai;
const chaiSorted = require('chai-sorted');
const connection = require('../db/connection');
const request = require('supertest');
const app = require('../app');

chai.use(chaiSorted);

describe('/api', () => {
  beforeEach(() => {
    return connection.seed.run();
  });
  after(() => {
    connection.destroy();
  });
  describe('/topics', () => {
    it('GET: 200 and object containing array of topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(res => {
          expect(res.body.topics).to.be.an('array');
          expect(res.body.topics[0]).to.contain.keys('slug', 'description');
        });
    });
  });
  describe('/users', () => {
    describe('/:username', () => {
      it("GET: 200 and object containing specified user's information", () => {
        return request(app)
          .get('/api/users/lurker')
          .expect(200)
          .then(res => {
            expect(res.body).to.eql({
              user: {
                username: 'lurker',
                name: 'do_nothing',
                avatar_url:
                  'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
              }
            });
          });
      });
    });
  });
});
