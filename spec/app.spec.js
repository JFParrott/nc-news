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
  it('GET: 404 and "Route not found" message when non-existent route', () => {
    return request(app)
      .get('/api/rewards')
      .expect(404)
      .then(err => {
        expect(err.body.msg).to.equal('Route not found');
      });
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
    it('status: 405 and "Method not allowed" message', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/topics')
          .expect(405)
          .then(res => {
            expect(res.body.msg).to.equal('Method not allowed');
          });
      });
      return Promise.all(methodPromises);
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
      it('GET: 404 and "Invalid Username" message when non-existent username provided', () => {
        return request(app)
          .get('/api/users/bob')
          .expect(404)
          .then(err => {
            expect(err.body.msg).to.equal('Invalid Username');
          });
      });
      it('status: 405 and "Method not allowed" message', () => {
        const invalidMethods = ['patch', 'put', 'delete'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/users/1')
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal('Method not allowed');
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
  describe('/articles', () => {
    describe('/:article_id', () => {
      it('GET: 200 and object containing correct article properties, including comment count', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(res => {
            expect(res.body.article).to.eql({
              article_id: 1,
              title: 'Living in the shadow of a great man',
              body: 'I find this existence challenging',
              votes: 100,
              topic: 'mitch',
              author: 'butter_bridge',
              created_at: '2018-11-15T12:21:54.171Z',
              comment_count: 13
            });
          });
      });
      it('GET: 404 and "Article ID does not exist" message when non-existent article_id provided', () => {
        return request(app)
          .get('/api/articles/99')
          .expect(404)
          .then(err => {
            expect(err.body.msg).to.equal('Article ID does not exist');
          });
      });
      it('GET: 400 and "Bad request" message when article_id is invalid type', () => {
        return request(app)
          .get('/api/articles/fish')
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Bad request');
          });
      });
      it('PATCH: 200 and object containing updated vote count', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: -10 })
          .expect(200)
          .then(res => {
            expect(res.body.article).to.eql({
              article_id: 2,
              title: 'Sony Vaio; or, The Laptop',
              body:
                'Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.',
              votes: -10,
              topic: 'mitch',
              author: 'icellusedkars',
              created_at: '2014-11-16T12:21:54.171Z'
            });
          });
      });
      it('PATCH: 404 and "Article ID does not exist" message when non-existent article_id provided', () => {
        return request(app)
          .patch('/api/articles/99')
          .send({ inc_votes: 5 })
          .expect(404)
          .then(err => {
            expect(err.body.msg).to.equal('Article ID does not exist');
          });
      });
      it('PATCH: 400 and "Bad request" message when article_id is invalid type', () => {
        return request(app)
          .patch('/api/articles/fish')
          .send({ inc_votes: 10 })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Bad request');
          });
      });
      it('PATCH: 400 and "Invalid input" message when missing required inc_votes key', () => {
        return request(app)
          .patch('/api/articles/3')
          .send({ votes: 5 })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Invalid input');
          });
      });
      it('PATCH: 400 and "Invalid input" message when inc_votes value is not a number', () => {
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 'blue' })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Invalid input');
          });
      });
      it('status: 405 and "Method not allowed" message', () => {
        const invalidMethods = ['put', 'delete'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/articles/1')
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal('Method not allowed');
            });
        });
        return Promise.all(methodPromises);
      });
      describe('/comments', () => {
        it('GET: 200 and object of comments associated to provided article_id', () => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.an('array');
              expect(res.body.comments[0]).to.contain.keys(
                'comment_id',
                'author',
                'votes',
                'created_at',
                'body'
              );
            });
        });
      });
    });
  });
});
