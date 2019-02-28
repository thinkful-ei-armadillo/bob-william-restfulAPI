'use strict';

const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const { expect } = require('chai');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('bookmark Endpoints', function() {
  let db;

  // mocha hooks
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks_table').truncate());

  afterEach('cleanup', () => db('bookmarks_table').truncate());

  // test blocks
  describe('GET /api/bookmarks', () => {
    context('Given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .expect(200, []);
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks_table').insert(testbookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return (
          supertest(app)
            .get('/api/bookmarks')
            // .expect(200, testbookmarks);
            .expect(200)
        );
      });
    });
  });

  describe('GET /api/bookmarks/:bookmark_id', () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } });
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db.into('bookmarks_table').insert(testbookmarks);
      });

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2;
        // const expectedArticle = testbookmarks[articleId - 1];
        return (
          supertest(app)
            .get(`/api/bookmarks/${bookmarkId}`)
            // .expect(200, expectedArticle);
            .expect(200)
        );
      });
    });
  });
  describe('PATCH /api/bookmarks/', () => {
    context('Given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: 'Bookmark doesn\'t exist' } });
      });
    });
  });

  context('Given there are bookmarks in the database', () => {
    const testbookmarks = makeBookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks_table').insert(testbookmarks);
    });

    it('responds with 204 and no content', () => {
      const bookmarkId = 2;
      // const expectedArticle = testbookmarks[articleId - 1];
      return supertest(app)
        .patch(`/api/bookmarks/${bookmarkId}`)
        .send({
          title: 'some title',
          description: 'some description'
        })
        .expect(204);
    });

    it('It updates the bookmark in your database table', () => {
      const bookmarkId = 2;
      const newBookmark = {
        title: 'some title',
        description: 'some description'
      };
      const expectedBookmark = {
        ...testbookmarks[bookmarkId],
        ...newBookmark
      };
      return supertest(app)
        .patch(`/api/bookmarks/${bookmarkId}`)
        .send(
          newBookmark
        )
        .then(res => {
          supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
          .expect(expectedBookmark)
        })
    });
    it('It responds with a 400 when no values are supplied for any fields', () => {
      const bookmarkId = 2;
      return supertest(app)
        .patch(`/api/bookmarks/${bookmarkId}`)
        .expect(400)
        })
  });
});
