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
  it('GET: 200 and object containing object of available endpoints', () => {
    return request(app)
      .get('/api/')
      .expect(200)
      .then(res => {
        const { endpoints } = res.body;
        expect(endpoints).to.be.an('array');
        expect(endpoints[0]).to.contain.keys('path', 'methods');
      });
  });
  it('GET: 404 and "Route not found" message when non-existent route', () => {
    return request(app)
      .get('/api/rewards')
      .expect(404)
      .then(err => {
        expect(err.body.msg).to.equal('Route not found');
      });
  });
  it('status: 405 and "Method not allowed" message', () => {
    const invalidMethods = ['patch', 'put', 'delete', 'post'];
    const methodPromises = invalidMethods.map(method => {
      return request(app)
        [method]('/api')
        .expect(405)
        .then(res => {
          expect(res.body.msg).to.equal('Method not allowed');
        });
    });
    return Promise.all(methodPromises);
  });
  describe('/topics', () => {
    it('GET: 200 and object containing array of topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(res => {
          const { topics } = res.body;
          expect(topics).to.be.an('array');
          expect(topics[0]).to.contain.keys('slug', 'description');
          expect(topics).to.be.length(3);
        });
    });
    it('status: 405 and "Method not allowed" message', () => {
      const invalidMethods = ['patch', 'put', 'delete', 'post'];
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
            const { user } = res.body;
            expect(user).to.contain.keys('username', 'name', 'avatar_url');
            expect(user.username).to.equal('lurker');
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
        const invalidMethods = ['patch', 'post', 'put', 'delete'];
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
    it('GET: 200 and object containing array of all articles sorted by created_at in desc order when no queries', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles).to.be.an('array');
          expect(articles[0]).to.contain.keys(
            'author',
            'title',
            'article_id',
            'topic',
            'created_at',
            'votes',
            'comment_count'
          );
          expect(articles).to.have.length(12);
          expect(articles).to.be.sortedBy('created_at', {
            descending: true
          });
        });
    });
    it('GET: 200 and object containing array of ascending sorted articles when sort_by & order queries provided', () => {
      return request(app)
        .get('/api/articles?sort_by=article_id&order=asc')
        .expect(200)
        .then(res => {
          expect(res.body.articles).to.be.sortedBy('article_id');
        });
    });
    it('GET: 200 and object containing only articles by specific user when author query provided', () => {
      return request(app)
        .get('/api/articles?author=butter_bridge')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles[0].author).to.equal('butter_bridge');
          expect(articles).to.have.length(3);
        });
    });
    it('GET: 200 and object containing on articles on specific topic when topic query provided', () => {
      return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles[0].topic).to.equal('mitch');
          expect(articles).to.have.length(11);
        });
    });
    it('GET: 200 and object containing articles on specific topic and by specific user when author and topic query both provided', () => {
      return request(app)
        .get('/api/articles?author=rogersop&topic=mitch')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles[0].topic).to.equal('mitch');
          expect(articles[0].author).to.equal('rogersop');
          expect(articles).to.have.length(2);
        });
    });
    it('GET: 200 and object containing empty array when topic query has no associated articles', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles).to.be.an('array');
          expect(articles).to.have.length(0);
        });
    });
    it('GET: 200 and object containing empty array when author query has no associated articles', () => {
      return request(app)
        .get('/api/articles?author=lurker')
        .expect(200)
        .then(res => {
          const { articles } = res.body;
          expect(articles).to.be.an('array');
          expect(articles).to.have.length(0);
        });
    });
    it('GET: 400 and "Invalid input" message when attempting to sort_by a column which does not exist', () => {
      return request(app)
        .get('/api/articles?sort_by=beethoven')
        .expect(400)
        .then(err => {
          expect(err.body.msg).to.equal('Invalid input');
        });
    });
    it('GET: 404 and "Invalid Username" message when author in query does not exist', () => {
      return request(app)
        .get('/api/articles?author=beethoven')
        .expect(404)
        .then(err => {
          expect(err.body.msg).to.equal('Invalid Username');
        });
    });
    it('GET: 404 and "Topic does not exist" message when topic in query does not exist', () => {
      return request(app)
        .get('/api/articles?topic=beethoven')
        .expect(404)
        .then(err => {
          expect(err.body.msg).to.equal('Topic does not exist');
        });
    });
    it('status: 405 and "Method not allowed" message', () => {
      const invalidMethods = ['patch', 'put', 'post', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/articles')
          .expect(405)
          .then(res => {
            expect(res.body.msg).to.equal('Method not allowed');
          });
      });
      return Promise.all(methodPromises);
    });
    describe('/:article_id', () => {
      it('GET: 200 and object containing correct article properties, including comment count', () => {
        return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(res => {
            const { article } = res.body;
            expect(article.article_id).to.equal(1);
            expect(article.comment_count).to.equal('13');
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
            const { article } = res.body;
            expect(article).to.contain.keys(
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'author',
              'created_at'
            );
            expect(article.article_id).to.equal(2);
            expect(article.votes).to.equal(-10);
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
        const invalidMethods = ['put', 'post', 'delete'];
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
        it('GET: 200 and object containing array of comments sorted by created_at in desc order when no queries', () => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(res => {
              const { comments } = res.body;
              expect(comments).to.be.an('array');
              expect(comments[0]).to.contain.keys(
                'comment_id',
                'author',
                'votes',
                'created_at',
                'body'
              );
              expect(comments).to.be.sortedBy('created_at', {
                descending: true
              });
              expect(comments).to.be.length(13);
            });
        });
        it('GET: 200 and object containing array of comments that are sorted by specified column and order', () => {
          return request(app)
            .get('/api/articles/1/comments?sort_by=author&order=asc')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.sortedBy('author');
            });
        });
        it('GET: 200 and object containing empty array when article_id has no associated comments', () => {
          return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(res => {
              const { comments } = res.body;
              expect(comments).to.be.an('array');
              expect(comments).to.have.length(0);
            });
        });
        it('GET: 404 and "Article ID does not exist" message when non-existent article_id is provided', () => {
          return request(app)
            .get('/api/articles/99/comments')
            .expect(404)
            .then(err => {
              expect(err.body.msg).to.equal('Article ID does not exist');
            });
        });
        it('GET: 400 and "Bad request" message when invalid article_id', () => {
          return request(app)
            .get('/api/articles/blue/comments')
            .expect(400)
            .then(err => {
              expect(err.body.msg).to.equal('Bad request');
            });
        });
        it('GET: 200 and object containing array of comments sorted by created_at in desc when invalid queries', () => {
          return request(app)
            .get('/api/articles/1/comments?sort=author')
            .expect(200)
            .then(res => {
              expect(res.body.comments).to.be.sortedBy('created_at', {
                descending: true
              });
            });
        });
        it('POST: 200 and object containing the posted comment', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({ username: 'rogersop', body: 'rather good' })
            .expect(201)
            .then(res => {
              const { comment } = res.body;
              expect(comment).to.contain.keys(
                'article_id',
                'author',
                'body',
                'comment_id',
                'created_at',
                'votes'
              );
              expect(comment.article_id).to.equal(1);
              expect(comment.author).to.equal('rogersop');
              expect(comment.votes).to.equal(0);
              expect(comment.body).to.equal('rather good');
            });
        });
        it('POST: 404 and "Not found" message when non-existent article_id is provided', () => {
          return request(app)
            .post('/api/articles/99/comments')
            .send({ username: 'rogersop', body: 'rather good' })
            .expect(404)
            .then(err => {
              expect(err.body.msg).to.equal('Not found');
            });
        });
        it('POST: 400 and "Bad request" message when invalid article_id', () => {
          return request(app)
            .post('/api/articles/blue/comments')
            .send({ username: 'rogersop', body: 'rather good' })
            .expect(400)
            .then(err => {
              expect(err.body.msg).to.equal('Bad request');
            });
        });
        it('POST 400 and "Invalid input" message when username or body is a null value', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({ username: null, body: 'good' })
            .expect(400)
            .then(err => {
              expect(err.body.msg).to.equal('Invalid input');
            });
        });
        it('POST: 400 and "Invalid input" message when invalid columns provided', () => {
          return request(app)
            .post('/api/articles/1/comments')
            .send({ name: 'rogersop', body: 'rather good' })
            .expect(400)
            .then(err => {
              expect(err.body.msg).to.equal('Invalid input');
            });
        });
        it('status: 405 "Method not allowed" message', () => {
          const invalidMethods = ['patch', 'put', 'delete'];
          const methodPromises = invalidMethods.map(method => {
            return request(app)
              [method]('/api/articles/1/comments')
              .expect(405)
              .then(res => {
                expect(res.body.msg).to.equal('Method not allowed');
              });
          });
          return Promise.all(methodPromises);
        });
      });
    });
  });
  describe('/comments', () => {
    describe('/:comment_id', () => {
      it('PATCH: 200 and object containing comment with updated vote count', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: 10 })
          .expect(200)
          .then(res => {
            const { comment } = res.body;
            expect(comment.comment_id).to.equal(1);
            expect(comment).to.contain.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            );
            expect(comment.votes).to.equal(26);
          });
      });
      it('PATCH: 404 and "Comment ID does not exist" message when non-existent comment_id provided', () => {
        return request(app)
          .patch('/api/comments/99')
          .send({ inc_votes: 10 })
          .expect(404)
          .then(err => {
            expect(err.body.msg).to.equal('Comment ID does not exist');
          });
      });
      it('PATCH: 400 and "Bad request" message when comment_id is invalid type', () => {
        return request(app)
          .patch('/api/comments/blue')
          .send({ inc_votes: 5 })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Bad request');
          });
      });
      it('PATCH: 400 and "Invalid input" message when inc_votes key is missing', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ votes: 5 })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Invalid input');
          });
      });
      it('PATCH: 400 and "Invalid input" message when inc_votes value is wrong type', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: 'blue' })
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Invalid input');
          });
      });
      it('DELETE: 204', () => {
        return request(app)
          .delete('/api/comments/1')
          .expect(204);
      });
      it('DELETE: 404 and "Comment ID does not exist" message when non-existent comment_id provided', () => {
        return request(app)
          .delete('/api/comments/999')
          .expect(404)
          .then(err => {
            expect(err.body.msg).to.equal('Comment ID does not exist');
          });
      });
      it('DELETE: 400 and "Bad request" message when comment_id is invalid', () => {
        return request(app)
          .delete('/api/comments/blue')
          .expect(400)
          .then(err => {
            expect(err.body.msg).to.equal('Bad request');
          });
      });
      it('status: 405 and "Method not allowed" message', () => {
        const invalidMethods = ['get', 'post', 'put'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/comments/2')
            .expect(405)
            .then(res => {
              expect(res.body.msg).to.equal('Method not allowed');
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
});
